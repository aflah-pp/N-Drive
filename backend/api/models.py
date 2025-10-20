import uuid
import os, json
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from cryptography.fernet import Fernet
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField


FERNET_KEY = settings.FERNET_KEY
CIPHER = Fernet(FERNET_KEY)


def get_default_package():
    package = Package.objects.order_by("id").first()
    return package.id if package else None


def user_upload_path(instance, filename):
    name, ext = os.path.splitext(filename)
    safe_name = slugify(name)
    filename = f"{safe_name}{ext}"
    if instance.parent_folder:
        return f"user_{instance.user.id}/{instance.parent_folder.id}/{filename}"
    return f"user_{instance.user.id}/{filename}"


class Package(models.Model):
    name = models.CharField(max_length=20)
    max_upload_size = models.BigIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    chat_enabled = models.BooleanField(default=False)
    image_gen_enabled = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = PhoneNumberField(region="IN")

    package = models.ForeignKey(
        Package,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        default=get_default_package,
    )

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return self.name or self.username


class Folder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="folders"
    )
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    unique_link = models.UUIDField(default=uuid.uuid4, unique=True)

    def __str__(self):
        return self.name


class UserFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="files"
    )
    file = models.FileField(upload_to=user_upload_path)
    filename = models.CharField(max_length=255)
    size = models.BigIntegerField(default=0, editable=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    parent_folder = models.ForeignKey(
        Folder, on_delete=models.CASCADE, null=True, blank=True, related_name="files"
    )
    unique_link = models.UUIDField(default=uuid.uuid4, unique=True)

    def save(self, *args, **kwargs):
        if self.file:
            self.filename = self.file.name
            try:
                self.size = self.file.size
            except Exception:
                self.size = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.filename


class Transaction(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    ref = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {self.package.name} - {self.status}"


class EncryptedChatSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    conversation_encrypted = models.BinaryField()
    created_at = models.DateTimeField(default=timezone.now)

    def set_conversation(self, conversation):
        """Save a Python list/dict conversation."""
        data = json.dumps(conversation).encode()
        self.conversation_encrypted = CIPHER.encrypt(data)
        self.save()

    def get_conversation(self):
        """Return decrypted conversation as Python list/dict."""
        data = CIPHER.decrypt(self.conversation_encrypted)
        return json.loads(data.decode())

    def __str__(self):
        return f"{self.user.name}'s chat"
