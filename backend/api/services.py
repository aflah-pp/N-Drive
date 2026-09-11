import json
import math
import os
import time
import uuid
import zipfile
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

from .models import EncryptedChatSession, Folder, Package, Transaction, UserFile


class AccountService:
    pass


class PackageService:
    pass


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
        transaction = Transaction.objects.get(ref__startswith=tx_ref)
        package = transaction.package

        if payment_status == "success":
            transaction.status = "completed"
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
        package = user.package

        if not package:
            raise ValueError("You have no Active Package")
        if uploaded_file.size > package.max_upload_size:
            raise ValueError(
                f"File too large.Max Size for {package.name} is {package.max_upload_size / (1024 * 1024):.2f} mb"
            )
        total_used = sum(file.size for file in user.files.all())

        if total_used + uploaded_file.size > package.max_upload_size:
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
