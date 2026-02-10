import os
import uuid
import time
import math
import zipfile
import requests
from io import BytesIO
from decimal import Decimal
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from django.http import FileResponse, HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from .models import UserFile, Folder, Transaction, Package, EncryptedChatSession
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    UpdateUserSerializer,
    PackageSerializer,
    UserFileSerializer,
    FolderSerializer,
)


GROQ_API_KEY = settings.GROQ_API_KEY
GROQ_CHAT_URL = settings.GROQ_CHAT_URL
STABLE_HORDE_URL = settings.STABLE_HORDE_URL
API_KEY = settings.API_KEY


def get_user_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_self_name(request):
    return Response({"username": request.user.username})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_self_package(request):
    return Response({"package": request.user.package.name})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_self_package_permissions(request):
    return Response(
        {
            "chat": request.user.package.chat_enabled,
            "image": request.user.package.image_gen_enabled,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_package_details(request):
    packages = Package.objects.all()
    serializer = PackageSerializer(packages, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_self(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response({"user": serializer.data})


@api_view(["POST"])
def register_user(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token = get_user_tokens(user)
        return Response(
            {
                "message": "User Created SuccessFully",
                "user": serializer.data,
                "token": token,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    serializer = UpdateUserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User Updated", "user": serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    user = request.user
    package = user.package
    uploaded_file = request.FILES.get("file")
    folder_id = request.data.get("folder_id")

    if not uploaded_file:
        return Response({"error": "No file provided"}, status=400)

    # Logic for Checking single file size
    if uploaded_file.size > package.max_upload_size:
        return Response(
            {
                "error": f"File too large. Max size for {package.name} is {package.max_upload_size / (1024*1024)} MB"
            },
            status=400,
        )

    # Logic for Checking total storage quota
    total_used = sum(f.size for f in user.files.all())
    if total_used + uploaded_file.size > package.max_upload_size:
        return Response(
            {"error": "You exceeded your package storage limit"}, status=400
        )

    folder = None
    if folder_id:
        folder = Folder.objects.filter(id=folder_id, user=user).first()
        if not folder:
            return Response({"error": "Folder not found"}, status=404)

    user_file = UserFile.objects.create(
        user=user,
        file=uploaded_file,
        filename=uploaded_file.name,
        size=uploaded_file.size,
        parent_folder=folder,
    )

    serializer = UserFileSerializer(user_file, context={"request": request})
    return Response({"message": "File uploaded successfully", "file": serializer.data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_folder(request):
    user = request.user
    folder_name = request.data.get("name")
    if not folder_name:
        return Response({"error": "Folder name required"}, status=400)

    folder = Folder.objects.create(user=user, name=folder_name)
    serializer = FolderSerializer(folder, context={"request": request})
    return Response({"message": "Folder created", "folder": serializer.data})


@api_view(["GET"])
def download_folder(request, unique_link):
    folder = Folder.objects.filter(unique_link=unique_link).first()
    if not folder:
        return HttpResponse("Folder not found", status=404)

    files = folder.files.all()
    if not files.exists():
        return HttpResponse("No files in folder", status=404)

    # In-memory zip
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for f in files:
            file_path = f.file.path
            filename = os.path.basename(file_path)
            zip_file.write(file_path, arcname=filename)

    zip_buffer.seek(0)

    # Return zip file  as attachment
    response = HttpResponse(zip_buffer, content_type="application/zip")
    response["Content-Disposition"] = f'attachment; filename="{folder.name}.zip"'
    return response


@api_view(["GET"])
def download_file(request, unique_link):
    file_obj = UserFile.objects.filter(unique_link=unique_link).first()
    if not file_obj:
        return HttpResponse("File not found", status=404)

    file_path = file_obj.file.path
    file_handle = open(file_path, "rb")
    response = FileResponse(file_handle, content_type="application/octet-stream")
    response["Content-Disposition"] = f'attachment; filename="{file_obj.filename}"'
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_storage(request):
    user = request.user
    # All folders
    folders = Folder.objects.filter(user=user)
    # Files directly in root directory
    root_files = UserFile.objects.filter(user=user, parent_folder__isnull=True)

    folder_serializer = FolderSerializer(
        folders, many=True, context={"request": request}
    )
    file_serializer = UserFileSerializer(
        root_files, many=True, context={"request": request}
    )

    return Response({"folders": folder_serializer.data, "files": file_serializer.data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_storage_usage(request):
    user = request.user
    package = user.package

    # total used storage calculatin
    total_used_bytes = sum(f.size for f in user.files.all())

    # total allowed storage calculatin
    total_storage_bytes = getattr(package, "max_storage", package.max_upload_size)

    # Remaining storage calculatin
    remaining_bytes = total_storage_bytes - total_used_bytes
    remaining_bytes = max(remaining_bytes, 0)  # No negative value

    # Convert  bytes to MB
    def to_mb(size_bytes):
        return round(size_bytes / (1024 * 1024), 2)

    used_mb = to_mb(total_used_bytes)
    remaining_mb = to_mb(remaining_bytes)
    total_mb = to_mb(total_storage_bytes)

    used_percentage = (
        round((total_used_bytes / total_storage_bytes) * 100, 2)
        if total_storage_bytes > 0
        else 0
    )

    return Response(
        {
            "used_storage": f"{used_mb} MB",
            "remaining_storage": f"{remaining_mb} MB",
            "total_storage": f"{total_mb} MB",
            "used_percentage": used_percentage,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_item(request):
    user = request.user
    folder_id = request.data.get("folder_id")
    file_id = request.data.get("file_id")

    # Delete Folder and its files if have any.
    if folder_id:
        folder = Folder.objects.filter(id=folder_id, user=user).first()
        if not folder:
            return Response({"error": "Folder not found"}, status=404)

        # Delete files inside folder
        folder_files = folder.files.all()
        for f in folder_files:
            if f.file:
                if os.path.exists(f.file.path):
                    os.remove(f.file.path)
            f.delete()

        folder.delete()
        return Response({"message": "Folder and its files deleted successfully"})

    # Delete Single File
    if file_id:
        file_obj = UserFile.objects.filter(id=file_id, user=user).first()
        if not file_obj:
            return Response({"error": "File not found"}, status=404)

        if file_obj.file and os.path.exists(file_obj.file.path):
            os.remove(file_obj.file.path)
        file_obj.delete()
        return Response({"message": "File deleted successfully"})

    return Response({"error": "Provide either folder_id or file_id"}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """
    Step 1: User selects a package → backend creates a Transaction
    Returns a mock payment link with payment status.
    """
    package_id = request.data.get("package_id")

    try:
        package = Package.objects.get(id=package_id)
    except Package.DoesNotExist:
        return Response({"error": "Invalid package ID"}, status=404)

    total_amount = Decimal(package.price)
    tax = total_amount * Decimal("0.03")
    total_amount = Decimal(math.ceil(total_amount + tax))

    # Create transaction
    tx_ref = str(uuid.uuid4())
    order_id = f"order_{tx_ref[:8]}"

    Transaction.objects.create(
        ref=tx_ref,
        user=request.user,
        package=package,
        amount=total_amount,
        status="pending",
    )

    payment_link = (
        f"/payment?order_id={order_id}&amount={total_amount}"
    )

    return Response(
        {
            "payment_link": payment_link,
            "order_id": order_id,
            "amount": total_amount,
            "package": package.name,
            "message": "Payment initiated successfully",
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def payment_status(request):
    order_id = request.data.get("order_id")
    payment_status = request.data.get("status")  # status "success" or "failed"

    if not order_id or not payment_status:
        return Response({"error": "Missing order_id or status"}, status=400)

    try:
        tx_ref = order_id[6:]
        transaction = Transaction.objects.get(ref__startswith=tx_ref)
        user = request.user
        package = transaction.package

        if payment_status == "success":
            transaction.status = "completed"
            user.package = (
                package  # Assign  user the purchased package if transaction is success
            )
            user.save()
            success_url = f"http://localhost:5173/payment-status?order_id={order_id}&status=success"
        else:
            transaction.status = "failed"
            success_url = f"http://localhost:5173/payment-status?order_id={order_id}&status=failed"

        transaction.save()

        return Response(
            {
                "order_id": order_id,
                "status": transaction.status,
                "redirect_url": success_url,
                "message": f"Payment {transaction.status}",
            }
        )

    except Transaction.DoesNotExist:
        return Response({"error": "Transaction not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat_ai(request):
    """
    ` `View Logic for Chat ai .
    user sends messege > checks whether if user have chat in his package or not
    >backend send that message and take reply from api key > return message to frontend
    """
    user = request.user
    message = request.data.get("message")

    if not message:
        return Response({"error": "Message required"}, status=400)

    package = getattr(user, "package", None)
    if not package or not getattr(package, "chat_enabled", False):
        return Response({"error": "Chat AI not enabled for your package"}, status=403)

    model_id = (
        "llama-3.3-70b-versatile"
        if user.package.name.lower() == "pro"
        else "groq/compound-mini"
    )

    try:
        # Load existing conversation
        chat = EncryptedChatSession.objects.filter(user=user).first()
        if chat:
            try:
                conversation = chat.get_conversation()
            except Exception:
                conversation = []
        else:
            conversation = []

        # Clean invalid or malformed messages
        conversation = [
            m
            for m in conversation
            if isinstance(m, dict)
            and "role" in m
            and "content" in m
            and isinstance(m["role"], str)
            and isinstance(m["content"], str)
        ]

        # Append the new user message
        conversation.append({"role": "user", "content": message})

        # Limit history
        conversation = conversation[-15:]

        # Add system prompt once + user conversation
        messages = [
            {"role": "system", "content": "You are a helpful AI assistant."}
        ] + conversation

        # Send to ai
        payload = {"model": model_id, "messages": messages}
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        response = requests.post(GROQ_CHAT_URL, headers=headers, json=payload)
        if response.status_code != 200:
            return Response(
                {
                    "error": f"Groq API error {response.status_code}",
                    "details": response.text,
                },
                status=500,
            )

        data = response.json()
        reply = data["choices"][0]["message"]["content"]

        # Append reply and save conversation
        conversation.append({"role": "assistant", "content": reply})
        if chat:
            chat.set_conversation(conversation)
        else:
            chat = EncryptedChatSession.objects.create(user=user)
            chat.set_conversation(conversation)

        # Return AI reply
        return Response({"reply": reply, "conversation": conversation}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_image(request):
    user = request.user
    prompt = request.data.get("prompt")

    if not prompt:
        return Response({"error": "Prompt required"}, status=400)

    package = getattr(user, "package", None)
    if not package or not getattr(package, "image_gen_enabled", False):
        return Response(
            {"error": "Image generation not enabled for your package"}, status=403
        )

    try:
        payload = {
            "prompt": prompt,
            "steps": 20,
            "cfg_scale": 7,
            "sampler_name": "k_euler",
            "nsfw": True,
        }

        headers = {"apikey": API_KEY, "Content-Type": "application/json"}

        # generation request
        response = requests.post(STABLE_HORDE_URL, headers=headers, json=payload)
        if response.status_code not in [200, 202]:
            return Response(
                {
                    "error": f"Stable Horde API error {response.status_code}",
                    "details": response.text,
                },
                status=500,
            )

        data = response.json()
        prediction_id = data.get("id")
        if not prediction_id:
            return Response({"error": "No prediction ID returned"}, status=500)

        # Poll until image is ready
        result_url = f"https://stablehorde.net/api/v2/generate/status/{prediction_id}"
        while True:
            r = requests.get(result_url, headers=headers)
            r_data = r.json()
            if r_data.get("done"):
                break
            time.sleep(2)  # wait before polling again

        # Get base64 image
        images_b64 = r_data.get("generations", [{}])[0].get("img")
        if not images_b64:
            return Response({"error": "No image returned"}, status=500)

        # Return base64 image to frontend
        return Response({"image_base64": images_b64})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_chat_session(request):
    """Save or update the user's single chat session"""
    user = request.user
    conversation = request.data.get("conversation")

    if not conversation:
        return Response({"error": "conversation is required"}, status=400)

    try:
        # get existing chat or create a new one
        chat, created = EncryptedChatSession.objects.get_or_create(user=user)

        # merge old conversation with new one instead of overwriting
        try:
            old_conversation = chat.get_conversation()
        except Exception:
            old_conversation = []

        # merge both conversations
        merged_conversation = old_conversation + conversation
        chat.set_conversation(merged_conversation)

        return Response(
            {"message": "Chat saved successfully", "created": created}, status=200
        )

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_history(request):
    """Return the user's single saved chat session decrypted"""
    try:
        chat = EncryptedChatSession.objects.filter(user=request.user).first()
        if not chat:
            return Response({"conversation": []}, status=200)

        data = chat.get_conversation()
        return Response({"conversation": data}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def reset_chat_session(request):
    """Reset the user's chat session"""
    EncryptedChatSession.objects.filter(user=request.user).delete()
    return Response({"message": "Chat session reset"}, status=200)
