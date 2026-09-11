import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField

from shared.models import AuditMixin

from .utils.upload_path import user_upload_path


class Package(models.Model):
    name = models.CharField(max_length=20)
    max_upload_size = models.BigIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    chat_enabled = models.BooleanField(default=False)
    image_gen_enabled = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    phone = PhoneNumberField(region="IN")
    package = models.ForeignKey(
        Package,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.get_full_name() or self.username


class Folder(AuditMixin):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="folders",
    )
    name = models.CharField(max_length=255)
    unique_link = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
    )

    def __str__(self):
        return self.name


class UserFile(AuditMixin):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="files",
    )
    file = models.FileField(upload_to=user_upload_path)
    filename = models.CharField(max_length=255)
    size = models.BigIntegerField(
        default=0,
        editable=False,
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    parent_folder = models.ForeignKey(
        Folder,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="files",
    )
    unique_link = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
    )

    def __str__(self):
        return self.filename


class Transaction(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    package = models.ForeignKey(
        Package,
        on_delete=models.CASCADE,
    )
    ref = models.CharField(
        max_length=100,
        unique=True,
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.package.name} - {self.status}"


class EncryptedChatSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    conversation_encrypted = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}'s chat"

