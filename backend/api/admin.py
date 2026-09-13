from django.contrib import admin

from .models import CustomUser, EncryptedChatSession, Folder, Package, Subscription, Transaction, UserFile


class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "email",
    )
    ordering = ("id",)
    list_per_page = 5
    list_display_links = (
        "id",
        "full_name",
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

    @admin.display(description="Full name")
    def full_name(self, obj):
        return obj.get_full_name()


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
admin.site.register([Transaction, Subscription])
admin.site.register(EncryptedChatSession)
