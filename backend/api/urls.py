from django.urls import path

from . import views

urlpatterns = [
    # User Related
    path("register/", views.register_user, name="register_user"),
    path("update/", views.update_user, name="update_user"),
    path("self/", views.get_self, name="get_user"),
    # Package Related
    path("package/", views.get_package_details, name="package_details"),
    path("storage/", views.get_all_storage, name="get_full_storage"),
    path("storage/usage/", views.get_storage_usage, name="get_size_usage"),
    # Create , Upload and delete related
    path("file/upload/", views.upload_file, name="upload_file"),
    path("storage/delete/", views.delete_item, name="delete_f"),
    path("create/folder/", views.create_folder, name="folder_creation"),
    # Download related
    path(
        "storage/folders/download/<uuid:unique_link>/",
        views.download_folder,
        name="download_folder",
    ),
    path(
        "storage/files/download/<uuid:unique_link>/",
        views.download_file,
        name="download_file",
    ),
    # Payment Related
    path("payment/initiate/", views.initiate_payment, name="initiate-payment"),
    path("payment/status/", views.payment_status, name="payment-status"),
    # AI
    # chat
    path("chat/", views.chat_ai, name="ai-chat"),
    path("chat/save/", views.save_chat_session),
    path("chat/history/", views.get_chat_history),
    path("chat/reset/", views.reset_chat_session),
    # Img generation
    path("img/gen/", views.generate_image, name="img-generation"),
    path("img/all/", views.get_user_generated_images, name="all_image_generated"),
    path("img/<uuid:img_id>/", views.delete_gen_img, name="delete_image_generated"),
    # Bin related
    path("storage/bin/", views.get_bin_storage, name="get_full_bin_storage"),
    path("bin/restore/", views.restore_bin, name="restore_bin"),
    path("bin/restore/<str:item_type>/<uuid:item_id>/", views.restore_bin_item, name="restore_item_in_bin"),
    path("bin/clear/", views.clear_bin, name="clear_bin"),
]
