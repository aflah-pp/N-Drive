from django.contrib import admin
from .models import (
    CustomUser,
    Package,
    Folder,
    UserFile,
    Transaction,
    EncryptedChatSession,
)


class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "email",
    )
    ordering = ("id",)
    list_per_page = 5
    list_display_links = (
        "id",
        "name",
        "email",
    )
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "phone",
                    "package",
                    "password",
                )
            },
        ),
    )
    add_fieldsets = (
        None,
        {
            "class": ("wide",),
            "fields": (
                "username",
                "email",
                "first_name",
                "last_name",
                "email",
                "phone",
                "password",
            ),
        },
    )


admin.site.register(CustomUser, CustomUserAdmin)


class PackageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
    )
    ordering = ("id",)
    list_per_page = 5
    list_display_links = (
        "id",
        "name",
    )
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "max_upload_size",
                    "chat_enabled",
                    "image_gen_enabled",
                    "price",
                )
            },
        ),
    )
    add_fieldsets = (
        None,
        {
            "class": ("wide",),
            "fields": (
                "name",
                "max_upload_size",
                "chat_enabled",
                "image_gen_enabled",
                "price",
            ),
        },
    )


admin.site.register(Package, PackageAdmin)


class FolderAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


admin.site.register(Folder, FolderAdmin)
admin.site.register(UserFile)
admin.site.register(Transaction)
admin.site.register(EncryptedChatSession)
