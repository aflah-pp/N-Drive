import time

import requests
from django.conf import settings
from django.db.models import Prefetch
from django.http import FileResponse, HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import EncryptedChatSession, Folder, Package, Transaction, UserFile
from .serializers import (
    FolderSerializer,
    PackageSerializer,
    UpdateUserSerializer,
    UserFileSerializer,
    UserRegisterSerializer,
    UserSerializer,
)
from .services import AccountService, AIService, FileService, FolderService, PackageService, PaymentService

STABLE_HORDE_URL = settings.STABLE_HORDE_URL
API_KEY = settings.API_KEY
GOOGLE_API_KEY = settings.GOOGLE_API_KEY


@api_view(["POST"])
def register_user(request):
    serializer = UserRegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user, token = AccountService.create(serializer.validated_data)

    return Response(
        {
            "message": "User Created SuccessFully",
            "user": UserSerializer(user).data,
            "token": token,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_self(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response({"user": serializer.data})


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user(request):
    serializer = UpdateUserSerializer(user=request.date, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    return Response(
        {"message": "User Updated SuccessFully", "user": UserSerializer(user).data}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_package_details(request):
    packages = Package.objects.filter(is_active=True)
    serializer = PackageSerializer(packages, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """
    Step 1: User selects a package → backend creates a Transaction
    Returns a mock payment link with payment status.
    """
    user = request.user
    package_id = request.data.get("package_id")

    result = PaymentService.initiate(user=user, package_id=package_id)

    return Response({"status": "Completed", "result": result}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def payment_status(request):
    order_id = request.data.get("order_id")
    payment_status = request.data.get("status")

    if not payment_status:
        payment_status = "failed"

    user = request.user

    if not order_id:
        return Response({"error": "Missing order_id "}, status=400)

    try:
        result = PaymentService.status(user=user, orderId=order_id, payment_status=payment_status)
        return Response({"status": "Completed", "result": result}, status=status.HTTP_200_OK)

    except Transaction.DoesNotExist:
        return Response({"error": "Transaction not found"}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_storage(request):
    user = request.user
    # All folders
    folders = Folder.objects.prefetch_related(
        Prefetch("files", queryset=UserFile.objects.filter(user=user, is_deleted=False))
    ).filter(user=user, is_deleted=False)
    # Files directly in root directory
    root_files = UserFile.objects.filter(user=user, parent_folder__isnull=True, is_deleted=False)

    folder_serializer = FolderSerializer(folders, many=True, context={"request": request})
    file_serializer = UserFileSerializer(root_files, many=True, context={"request": request})

    return Response({"folders": folder_serializer.data, "files": file_serializer.data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_storage_usage(request):
    user = request.user
    result = PackageService.storage_usage(user=user)
    return Response({"message": "Success", "result": result}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    user = request.user

    uploaded_file = request.FILES.get("file")
    folder_id = request.data.get("folder_id")

    if not uploaded_file:
        return Response({"error": "No file provided"}, status=400)

    user_file = FileService.upload_file(user=user, uploaded_file=uploaded_file, folder_id=folder_id)

    serializer = UserFileSerializer(user_file, context={"request": request})
    return Response({"message": "File uploaded successfully", "file": serializer.data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_folder(request):
    user = request.user
    folder_name = request.data.get("name")
    folder = FolderService.create_folder(user=user, name=folder_name)
    if isinstance(folder, ValueError):
        return Response({"error": "Name is Required"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = FolderSerializer(folder, context={"request": request})
    return Response({"message": "Folder created", "folder": serializer.data})


@api_view(["GET"])
def download_folder(request, unique_link):
    result = FolderService.download_folder(unique_link=unique_link)

    if isinstance(result, LookupError):
        return Response({"error": "Folder Not Found"}, status=status.HTTP_404_NOT_FOUND)
    if isinstance(result, ValueError):
        return Response({"error": "No files Found in this Folder."}, status=status.HTTP_400_BAD_REQUEST)
    zip_buffer, folder = result

    response = HttpResponse(zip_buffer, content_type="application/zip")
    response["Content-Disposition"] = f'attachment; filename="{folder.name}.zip"'
    return response


@api_view(["GET"])
def download_file(request, unique_link):
    result = FileService.download_file(unique_link=unique_link)
    if isinstance(result, LookupError):
        return Response({"error": "File Not Found"}, status=status.HTTP_404_NOT_FOUND)

    file_handle, file_obj = result
    response = FileResponse(file_handle, content_type="application/octet-stream")
    response["Content-Disposition"] = f'attachment; filename="{file_obj.filename}"'
    return response


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_item(request):
    user = request.user
    folder_id = request.data.get("folder_id")
    file_id = request.data.get("file_id")

    # Delete Folder and its files if have any.
    if folder_id:
        FolderService.delete_folder(user=user, folder_id=folder_id)
        if isinstance(folder_id, LookupError):
            return Response({"error": "Folder not Found"})
        return Response({"message": "Folder and its files deleted successfully"})

    # Delete Single File
    if file_id:
        FileService.delete_file(user=user, file_id=file_id)
        if isinstance(file_id, LookupError):
            return Response({"error": "File not Found"})
        return Response({"message": "File deleted successfully"})

    return Response({"error": "Provide either folder_id or file_id"}, status=400)


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

    modelId = "gemini-3.6-flash"
    # model_id = "gemini-3.8-flash"

    try:
        result = AIService.send_message(user=user, message=message, modelId=modelId)
        reply, conversation = result
        return Response({"reply": reply, "conversation": conversation}, status=200)

    except Exception as e:
        return Response({"error": f"Google SDK Exception: {e!s}"}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_image(request):
    user = request.user
    prompt = request.data.get("prompt")

    if not prompt:
        return Response({"error": "Prompt required"}, status=400)

    package = getattr(user, "package", None)
    if not package or not getattr(package, "image_gen_enabled", False):
        return Response({"error": "Image generation not enabled for your package"}, status=403)

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
        session, created = AIService.save_session(user=user, conversation=conversation)

        try:
            old_conversation = AIService.get_conversation(session=session)
        except Exception:
            old_conversation = []

        merged_conversation = old_conversation + conversation
        AIService.save_conversation(session=session, conversation=merged_conversation)

        return Response({"message": "Chat saved successfully", "created": created}, status=200)

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

        data = AIService.get_conversation(session=chat)
        return Response({"conversation": data}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def reset_chat_session(request):
    """Reset the user's chat session"""
    user = request.user
    AIService.reset_session(user=user)
    return Response({"message": "Chat session reset"}, status=200)
