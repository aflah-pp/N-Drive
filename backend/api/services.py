import json
import math
import os
import time
import uuid
import zipfile
from datetime import timedelta
from decimal import Decimal
from io import BytesIO

import requests
from cryptography.fernet import Fernet
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from google import genai
from google.genai import types
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, EncryptedChatSession, Folder, Package, Subscription, Transaction, UserFile

DEFAULT_USER_STORAGE = 250 * 1024 * 1024


class AccountService:

    @staticmethod
    def get_active_sub(*, user):
        subscription = (
            user.subscriptions.filter(status=Subscription.SubscriptionStatus.ACTIVE).select_related("package").first()
        )
        package = subscription.package if subscription else None
        return package

    @staticmethod
    def get_user_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}

    @staticmethod
    @transaction.atomic
    def create(validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()

        token = AccountService.get_user_tokens(user)
        return user, token


class PackageService:
    @staticmethod
    def bytes_to_mb(*, size_in_bytes):
        return round(size_in_bytes / (1024 * 1024), 2)

    @staticmethod
    def storage_usage(*, user):
        max_allowed_storage_bytes = DEFAULT_USER_STORAGE
        package = AccountService.get_active_sub(user=user)
        if package is not None:
            max_allowed_storage_bytes = package.max_upload_size
        total_used_bytes = sum(f.size for f in user.files.filter(is_deleted=False))

        remaining_bytes = max_allowed_storage_bytes - total_used_bytes
        remaining_bytes = max(remaining_bytes, 0)

        used_mb = PackageService.bytes_to_mb(size_in_bytes=total_used_bytes)
        remaining_mb = PackageService.bytes_to_mb(size_in_bytes=remaining_bytes)
        total_mb = PackageService.bytes_to_mb(size_in_bytes=max_allowed_storage_bytes)

        used_percentage = (
            round((total_used_bytes / max_allowed_storage_bytes) * 100, 2) if max_allowed_storage_bytes > 0 else 0
        )
        response = {
            "used_storage": f"{used_mb}Mb",
            "remaining_storage": f"{remaining_mb}Mb",
            "total_storage": f"{total_mb}Mb",
            "used_percentage": used_percentage,
        }
        return response


class PaymentService:
    @staticmethod
    @transaction.atomic
    def initiate(
        *,
        user,
        package_id,
    ):
        package = Package.objects.get(id=package_id)
        if not package:
            return ValueError("No package found")

        base_amount = Decimal(package.price)
        tax = base_amount * Decimal("0.03")
        total_amount = Decimal(math.ceil(base_amount + tax))

        tx_ref = str(uuid.uuid4())
        order_id = f"order_{tx_ref[:8]}"

        Transaction.objects.create(ref=tx_ref, user=user, package=package, amount=total_amount, status="pending")

        payment_link = f"/payment?order_id={order_id}&amount={total_amount}"

        response = {
            "message": "Order Successfully Purchased,Thank You",
            "payment_link": payment_link,
            "order_id": order_id,
            "amount": total_amount,
            "package": package.name,
        }
        return response

    @staticmethod
    @transaction.atomic
    def status(*, user, orderId, payment_status):
        tx_ref = orderId[6:]
        transaction = Transaction.objects.select_for_update().get(ref__startswith=tx_ref)
        if transaction.status in ["completed", "failed"]:
            return {
                "order_id": orderId,
                "status": transaction.status,
                "redirect_url": f"/payment-status?order_id={orderId}&status={transaction.status}",
                "message": f"Payment already processed as {transaction.status}",
            }
        package = transaction.package

        if payment_status == "success":
            active_sub_exists = Subscription.objects.filter(
                user=user, status=Subscription.SubscriptionStatus.ACTIVE
            ).exists()

            if active_sub_exists:
                subscription = Subscription.objects.get(user=user, status=Subscription.SubscriptionStatus.ACTIVE)
                active_from_date = subscription.active_to
                active_to_date = active_from_date + timedelta(days=package.plan_validity)

                sub = Subscription.objects.create(
                    user=user,
                    package=package,
                    active_from=active_from_date,
                    active_to=active_to_date,
                    status="ON_QUEUE",
                )
            else:
                active_to_date = timezone.now().date() + timedelta(days=package.plan_validity)

                sub = Subscription.objects.create(
                    user=user,
                    package=package,
                    active_from=timezone.now().date(),
                    active_to=active_to_date,
                    status="ACTIVE",
                )

            transaction.status = "completed"
            transaction.subscription = sub
            user.package = package
            user.save()

            success_url = f"/payment-status?order_id={orderId}&status=success"
        else:
            transaction.status = "failed"
            success_url = f"/payment-status?order_id={orderId}&status=failed"

        transaction.save()

        response = {
            "order_id": orderId,
            "status": transaction.status,
            "redirect_url": success_url,
            "message": f"Payment {transaction.status}",
        }
        return response


class FileService:
    @staticmethod
    @transaction.atomic()
    def upload_file(*, user, uploaded_file, folder_id=None):
        package = AccountService.get_active_sub(user=user)

        max_upload_size = package.max_upload_size if package is not None else DEFAULT_USER_STORAGE
        if uploaded_file.size > max_upload_size:
            raise ValueError(
                f"File too large.Max Size for {package.name if package is not None else "Free"} is {max_upload_size / (1024 * 1024):.2f} mb"
            )
        total_used = sum(file.size for file in user.files.all())

        if total_used + uploaded_file.size > max_upload_size:
            raise ValueError("You  exceeded your package allowed storage ")

        folder = None

        if folder_id:
            folder = Folder.objects.filter(id=folder_id, user=user).first()
            if not folder:
                raise LookupError("Folder not Found")

        return UserFile.objects.create(
            user=user,
            file=uploaded_file,
            filename=uploaded_file.name,
            size=uploaded_file.size,
            parent_folder=folder,
            created_by=user,
        )

    @staticmethod
    def download_file(*, unique_link):
        file_obj = UserFile.objects.filter(unique_link=unique_link).first()

        if not file_obj:
            return LookupError("File not Found")
        file_path = file_obj.file.path
        file_handle = open(file_path, "rb")
        return file_handle, file_obj

    @staticmethod
    @transaction.atomic
    def delete_file(*, user, file_id):
        file_obj = UserFile.objects.filter(id=file_id, user=user).first()

        if not file_obj:
            return LookupError("File not Found")

        # if file_obj and os.path.exists(file_obj.file.path):
        #     os.remove(file_obj.file.path)

        file_obj.is_deleted = True
        file_obj.deleted_at = timezone.now()
        file_obj.deleted_by = user
        file_obj.save(update_fields=["is_deleted", "deleted_by", "deleted_at"])


class FolderService:
    @staticmethod
    @transaction.atomic()
    def create_folder(*, user, name) -> Folder:
        name = name.strip()
        if not name:
            raise ValueError({"name is required"})
        return Folder.objects.create(user=user, name=name, created_by=user)

    @staticmethod
    def download_folder(*, unique_link):
        folder_obj = Folder.objects.filter(unique_link=unique_link).first()
        if not folder_obj:
            raise LookupError("Folder Not Found")

        file_in = folder_obj.files.all()

        if not file_in:
            raise ValueError("No files in this Folder")

        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for f in file_in:
                file_path = f.file.path
                filename = os.path.basename(file_path)
                zip_file.write(file_path, arcname=filename)
        zip_buffer.seek(0)

        return zip_buffer, folder_obj

    @staticmethod
    @transaction.atomic
    def delete_folder(*, user, folder_id) -> None:
        try:
            folder = Folder.objects.filter(id=folder_id, user=user).first()
        except Folder.DoesNotExist:
            raise ValueError("Folder Not Found")

        folder.files.all().update(deleted_by=user, deleted_at=timezone.now())

        folder.is_deleted = True
        folder.deleted_at = timezone.now()
        folder.deleted_by = user
        folder.save(update_fields=["is_deleted", "deleted_at", "deleted_by"])


class AIService:
    cipher = Fernet(settings.FERNET_KEY)

    @staticmethod
    def save_conversation(*, session, conversation):
        data = json.dumps(conversation).encode()
        session.conversation_encrypted = AIService.cipher.encrypt(data)
        session.save(update_fields=["conversation_encrypted"])

    @staticmethod
    def get_conversation(*, session):
        data = AIService.cipher.decrypt(session.conversation_encrypted)
        return json.loads(data.decode())

    @staticmethod
    def get_session(*, user):
        return EncryptedChatSession.objects.filter(user=user).first()

    @staticmethod
    @transaction.atomic
    def reset_session(*, user):
        EncryptedChatSession.objects.filter(user=user).delete()

    @staticmethod
    @transaction.atomic
    def save_session(*, user, conversation):
        session, created = EncryptedChatSession.objects.get_or_create(user=user)
        AIService.save_conversation(session=session, conversation=conversation)
        return session, created

    @staticmethod
    def send_message(*, user, message, modelId):
        package = user.package

        if not package or not package.chat_enabled:
            raise PermissionError({"Chat AI is not available for your package"})
        session = AIService.get_session(user=user)
        if session:
            try:
                conversation = AIService.get_conversation(session=session)
            except Exception:
                conversation = []
        else:
            conversation = []

        conversation = [
            item
            for item in conversation
            if isinstance(item, dict) and isinstance(item.get("role"), str) and isinstance(item.get("content"), str)
        ]
        conversation.append({"role": "user", "content": message})

        conversation = conversation[-15:]
        google_contents = []
        for item in conversation:
            role = "model" if item["role"] in ["assistant", "model"] else "user"
            google_contents.append(types.Content(role=role, parts=[types.Part.from_text(text=item["content"])]))

        client = genai.Client(api_key=settings.GOOGLE_API_KEY)

        response = client.models.generate_content(
            model=modelId,
            contents=google_contents,
            config=types.GenerateContentConfig(system_instruction="You are a Helpfull AI Assistant"),
        )
        reply = response.text
        if not reply:
            return Response("Ai returned and empty text response.")

        conversation.append({"role": "assistant", "content": reply})

        if session:
            AIService.save_conversation(session=session, conversation=conversation)
        else:
            session = EncryptedChatSession.objects.create(user=user)
            AIService.save_conversation(session=session, conversation=conversation)
        return reply, conversation

    @staticmethod
    def img_gen(*, user, prompt):
        package = user.package
        if not package.image_gen_enabled:
            return ValueError("You have no access to Image Generation")
        payload = {"prompt": prompt, "steps": 20, "cfg_scale": 7, "sampler_name": "k_euler", "nsfw": True}

        headers = {"apikey": settings.API_KEY, "Content-Type": "application/json"}

        response = requests.post(settings.STABLE_HORDE_URL, headers=headers, json=payload)
        if response.status_code not in [200, 202]:
            return {"error": f"stable Horde Api Error {response.status_code}", "details": response.text}

        data = response.json()
        prediction_id = data.get("id")

        if not prediction_id:
            return {"error": "No prediction ID returned"}

        result_url = f"https://stablehorde.net/api/v2/generate/status/{prediction_id}"
        while True:
            r = requests.get(result_url, headers=headers)
            r_data = r.json()
            if r_data.get("done"):
                break
            time.sleep(2)
        img_b64 = r_data.get("generations", [{}])[0].get("img")

        return img_b64


class BinService:
    pass
