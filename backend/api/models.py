import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from simple_history.models import HistoricalRecords

from shared.models import AuditMixin, CreatedByMixin

from .utils.upload_path import user_upload_path


class Package(models.Model):
    name = models.CharField(max_length=20, unique=True)
    plan_validity = models.PositiveIntegerField(
        default=28,
    )
    max_upload_size = models.BigIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    chat_enabled = models.BooleanField(default=False)
    image_gen_enabled = models.BooleanField(default=False)
    description = models.JSONField()
    is_active = models.BooleanField(default=True)
    is_free = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.is_free}"


class CustomUser(AbstractUser):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    phone = PhoneNumberField(region="IN")

    def __str__(self):
        return self.get_full_name() or self.username


class Subscription(models.Model):
    class SubscriptionStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        EXPIRED = "Expired", "Expired"
        ON_QUEUE = "ON_QUEUE", "On Queue"

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="subscriptions")
    package = models.ForeignKey(Package, on_delete=models.PROTECT)
    active_from = models.DateField()
    active_to = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=SubscriptionStatus.choices, default=SubscriptionStatus.ACTIVE)

    def __str__(self):
        return f"{self.user.get_full_name()}'s Subscription - {self.status}"


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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="transactions")
    package = models.ForeignKey(
        Package,
        on_delete=models.PROTECT,
    )
    subscription = models.ForeignKey(Subscription, on_delete=models.PROTECT, null=True, blank=True)

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

    history = HistoricalRecords()

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

    history = HistoricalRecords()

    def __str__(self):
        return self.filename


class EncryptedChatSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    conversation_encrypted = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}'s chat"


class GeneratedImage(CreatedByMixin):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    image_url = models.URLField()

    def __str__(self):
        return f"{self.user.get_full_name()}'s image @{self.created_at}"
