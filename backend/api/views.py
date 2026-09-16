import time

import requests
from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import EncryptedChatSession, Folder, Package, Transaction, UserFile
from .serializers import (
    FolderSerializer,
    PackageSerializer,
    SubscriptionSerializer,
    UpdateUserSerializer,
    UserFileSerializer,
    UserRegisterSerializer,
    UserSerializer,
)
from .services import AccountService, AIService, BinService, FileService, FolderService, PackageService, PaymentService

STABLE_HORDE_URL = settings.STABLE_HORDE_URL
API_KEY = settings.API_KEY
GOOGLE_API_KEY = settings.GOOGLE_API_KEY


@api_view(["POST"])
def register_user(request):
    """User Registration

    Args:
        request (Request): DRF request containing username, first_name, last_name, email, phone,
                           password, and password2.

    Returns:
        Response: A response containing the created user's details and
        authentication tokens.
        Example:
            {
                    "message": "User Created SuccessFully",
                    "user" {
                        "username":"user123",
                        "full_name":"user123 hello",
                        "email":"user123@mail.com",
                        "phone":"+91XXXXXXXXXX"
                        }
                    "token" : {
                        "access":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                        "refresh":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    }
                }
    """

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
    """Authenticated User's Data

    Args:
        request (Request): DRF request containing User token

    Returns:
        Response: A response containing the authenticated user's details.
        Example:
                {
                    "user": {
                            "username":"user123",
                            "full_name":"user123 hello",
                            "email":"user123@mail.com",
                            "phone":"+91XXXXXXXXXX"
                            }
                    "subscription": {
                        "package":{
                            "id":1,
                            "name":"Pro Tier,
                            "plan_validity":28,
                            "max_upload_size":90000000,
                            "price":210.50,
                            "chat_enabled":True,
                            "image_gen_enabled":False,
                            "description":{
                                "chat-ai enabled",
                                "storage more than free tier"
                                },
                        "active_from":"2026-10-01",
                        "active_to":"2026-10-29",
                        "status":"ACTIVE",
                        "created_at":"2026-09-14T05:12:13Z"
                        }
                    }
    """

    user = request.user
    user_serializer = UserSerializer(user)
    active_sub = AccountService.get_active_sub(user=user)
    subscription_data = SubscriptionSerializer(active_sub).data if active_sub else None
    return Response({"user": {**user_serializer.data, "subscription": subscription_data}})


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user(request):
    """Update Details of Authenticated User

    Args:
        request (Request):  DRF request containing  any of username, first_name, last_name, email, phone,

    Returns:
        Response: A response containing the updated user's full details.
        Example:
            {
                "message": "User Updated SuccessFully"
                "user": {
                        "username":"user123",
                        "full_name":"user123 hello",
                        "email":"user123@mail.com",
                        "phone":"+91XXXXXXXXXX"
                        }
                "subscription": {
                    "package":{
                        "id":1,
                        "name":"Pro Tier,
                        "plan_validity":28,
                        "max_upload_size":90000000,
                        "price":210.50,
                        "chat_enabled":True,
                        "image_gen_enabled":False,
                        "description":{
                            "chat-ai enabled",
                            "storage more than free tier"
                            },
                    "active_from":"2026-10-01",
                    "active_to":"2026-10-29",
                    "status":"ACTIVE",
                    "created_at":"2026-09-14T05:12:13Z"
                    }
                }
    """

    serializer = UpdateUserSerializer(user=request.date, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    return Response(
        {"message": "User Updated SuccessFully", "user": UserSerializer(user).data}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_package_details(request):
    """Get All Packages Details

    Args:
        request (Request):  DRF request containing  User Auth token.


    Returns:
        Response: A response containing all Package's full details.
        Example:
            [{
                "id":1,
                "name":"Pro Tier,
                "plan_validity":28,
                "max_upload_size":90000000,
                "price":210.50,
                "chat_enabled":True,
                "image_gen_enabled":False,
                "description":{
                    "chat-ai enabled",
                    "storage more than free tier"
                    },

            },
               {
                 "id":2,
                "name":"Pro Max Tier,
                "plan_validity":28,
                "max_upload_size":9000000000,
                "price":510.50,
                "chat_enabled":True,
                "image_gen_enabled":True,
                "description":{
                    "chat-ai enabled",
                    "Img Gen enabled",
                    "storage more than free tier"
                    },
                }
            ]

    """

    packages = Package.objects.filter(is_active=True)
    serializer = PackageSerializer(packages, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """Initiates Mock Payment

    Args:
        request (Request):  DRF request containing  User Auth token.

    Returns:
        Response: A response containing Mock Payment Link with Payment status.
        Example :
            {
                "status": "Completed",
                "result": {
                    "message": "Order Successfully Purchased,Thank You",
                    "payment_link": /payment?order_id={ORD828379}&amount={210.50},
                    "order_id": ORD828379,
                    "amount": 210.50,
                    "package": "Pro Tier",
                }
            }
    """
    user = request.user
    package_id = request.data.get("package_id")

    result = PaymentService.initiate(user=user, package_id=package_id)

    return Response({"status": "Completed", "result": result}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def payment_status(request):
    """Initiates Mock Payment

    Args:
        request (Request):  DRF request containing  User Auth token and Params orderId and payment_status.

    Returns:
        Response: A response containing Mock Payment Payment status.
        Example :
            {
                "status": "Completed",
                "result": {
                    "order_id": ORD828379,
                    "status": COMPLETED,
                    "redirect_url": "/payment-status?order_id={ORD828379}&status=success",
                    "message": "Payment Completed",
                }
            }
    """

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
def get_user_transactions(request):
    user = request.user
    transactions = PaymentService.user_transactions(user=user)
    return Response(
        {"message": "Transactions fetched Successfully", "transactions": transactions}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_invoice(request, transaction_id):
    user = request.user
    transaction = get_object_or_404(Transaction, id=transaction_id)
    result, invoice_id = PaymentService.invoice_gen(user=user, transaction=transaction)
    if not result:
        return Response({"error": "Could not generate receipt PDF"}, status=status.HTTP_400_BAD_REQUEST)

    response = HttpResponse(result, content_type="application/pdf")
    filename = f"Invoice_{invoice_id}.pdf"

    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_storage(request):
    """Returns Users all Files and Folders uploaded to N-drive,filtered by not soft deleted"""
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
def get_bin_storage(request):
    """Returns Users all Files and Folders in Bin(Soft Deleted)"""

    user = request.user
    folders = Folder.objects.prefetch_related(
        Prefetch("files", queryset=UserFile.objects.filter(user=user, is_deleted=True))
    ).filter(user=user, is_deleted=True)
    root_files = UserFile.objects.filter(user=user, parent_folder__isnull=True, is_deleted=True)

    folder_serializer = FolderSerializer(folders, many=True, context={"request": request})
    file_serializer = UserFileSerializer(root_files, many=True, context={"request": request})

    return Response({"deleted_folders": folder_serializer.data, "deleted_files": file_serializer.data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def restore_bin_item(request, item_type, item_id):
    """Restores Users files or Folders from Bin making it no Deleted"""
    user = request.user
    BinService.restore_item(user=user, item_type=item_type, item_id=item_id)
    return Response({"message": "Item Restored Successfully"}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def restore_bin(request):
    """Restores Users Entire  Bin making it no Deleted"""

    user = request.user
    folders = Folder.objects.prefetch_related(
        Prefetch("files", queryset=UserFile.objects.filter(user=user, is_deleted=True))
    ).filter(user=user, is_deleted=True)
    root_files = UserFile.objects.filter(user=user, parent_folder__isnull=True, is_deleted=True)
    BinService.restore(folders=folders, files=root_files)

    return Response({"message": "Bin has been Restored"}, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@transaction.atomic
@permission_classes([IsAuthenticated])
def clear_bin(request):
    """Clears Users Bin making it Deleted From Database itself"""

    user = request.user
    folders = Folder.objects.prefetch_related(
        Prefetch("files", queryset=UserFile.objects.filter(user=user, is_deleted=True))
    ).filter(user=user, is_deleted=True)
    root_files = UserFile.objects.filter(user=user, parent_folder__isnull=True, is_deleted=True)

    folders.delete()
    root_files.delete()
    return Response({"message": "All items in Bin is cleared."}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_storage_usage(request):
    """Gets Authenticated users total storage(as package if he has subscribed to any package ,else 250MB),used storage and percentage"""

    user = request.user
    result = PackageService.storage_usage(user=user)
    return Response({"message": "Success", "result": result}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    """Upload Files to N Drive"""

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
    """Create Folders in N Drive"""

    user = request.user
    folder_name = request.data.get("name")
    folder = FolderService.create_folder(user=user, name=folder_name)
    if isinstance(folder, ValueError):
        return Response({"error": "Name is Required"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = FolderSerializer(folder, context={"request": request})
    return Response({"message": "Folder created", "folder": serializer.data})


@api_view(["GET"])
def download_folder(request, unique_link):
    """Download Folders From N Drive In Zip Format, Only work if the selected Folder have any files"""

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
    """Download Files From N Drive"""

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
    """Delete Files or Folders From N Drive (Soft Delete)"""

    user = request.user
    folder_id = request.data.get("folder_id")
    file_id = request.data.get("file_id")

    if folder_id:
        FolderService.delete_folder(user=user, folder_id=folder_id)
        if isinstance(folder_id, LookupError):
            return Response({"error": "Folder not Found"})
        return Response({"message": "Folder and its files deleted successfully"})

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
    AI CHAT:-
        user sends message -> checks whether if user have chat in his subscribed package or not-
        -> backend send that message and take reply from api key -> return message to frontend
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_image(request):
    """Image Generation:-
    user sends Prompt -> server checks whether if user have image generation in his subscribed package or not-
    -> backend send that prompt and take reply from api key -> return image to frontend"""
    user = request.user
    prompt = request.data.get("prompt")

    if not prompt:
        return Response({"error": "Prompt required"}, status=400)
    package = AccountService.get_active_package(user=user)
    if not package.image_gen_enabled:
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

        result_url = f"https://stablehorde.net/api/v2/generate/status/{prediction_id}"
        while True:
            r = requests.get(result_url, headers=headers)
            r_data = r.json()
            if r_data.get("done"):
                break
            time.sleep(2)

        images_b64 = r_data.get("generations", [{}])[0].get("img")
        if not images_b64:
            return Response({"error": "No image returned"}, status=500)

        AIService.img_save(user=user, images_b64=images_b64)

        return Response({"image_base64": images_b64})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_generated_images(request):
    """Returns List of AI generated Image By User"""
    user = request.user
    result = AIService.all_image(user=user)
    if not result:
        return Response({"error": "No generated image found"}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"message": "Image fetched successfully", "result": result}, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes({IsAuthenticated})
def delete_gen_img(request, img_id):
    """Delete single AI generated Image of User"""
    user = request.user
    AIService.delete_image(user=user, img_id=img_id)
    return Response({"message": "Image Deleted Successfully"}, status=status.HTTP_204_NO_CONTENT)
