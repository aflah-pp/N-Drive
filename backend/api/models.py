import uuid

from cloudinary.models import CloudinaryField
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
from phonenumber_field.modelfields import PhoneNumberField
from simple_history.models import HistoricalRecords

from shared.models import AuditMixin, CreatedByMixin


class Package(models.Model):
    """Package Model defining how many days & how much storage and other function within price would be allowed"""

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
    """User Model to store detail of Authenticated User"""

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    phone = PhoneNumberField(region="IN")

    def __str__(self):
        return self.get_full_name() or self.username


class Subscription(models.Model):
    """Model connecting user and package which is active[Recorded by Transaction Service]"""

    class SubscriptionStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        EXPIRED = "Expired", "Expired"
        ON_QUEUE = "ON_QUEUE", "On Queue"

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="subscriptions"
    )
    package = models.ForeignKey(Package, on_delete=models.PROTECT)
    active_from = models.DateField()
    active_to = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE,
    )

    def __str__(self):
        return f"{self.user.get_full_name()}'s Subscription - {self.status}"


class Transaction(CreatedByMixin):
    """Model to Store Transaction Done by an User"""

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
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="transactions"
    )
    package = models.ForeignKey(
        Package,
        on_delete=models.PROTECT,
    )
    subscription = models.ForeignKey(
        Subscription, on_delete=models.PROTECT, null=True, blank=True
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
    file = CloudinaryField(resource_type="auto", folder="user_files")
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
    """model to store encrypted chat session"""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    conversation_encrypted = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}'s chat"


class GeneratedImage(CreatedByMixin):
    """model to store ai generated image by an user"""

    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    image_url = models.ImageField(upload_to="generated/")

    def __str__(self):
        return f"{self.user.get_full_name()}'s image @{self.created_at}"


class Support(CreatedByMixin):
    """Model to store the support question asked by users."""

    class StatusChoice(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        CLOSED = "CLOSED", "Closed"

    ticket_id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    slug = models.SlugField(unique=True)
    subject = models.CharField(max_length=120)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=StatusChoice.choices,
        default=StatusChoice.ACTIVE,
    )
    updated_at = models.DateTimeField(auto_now=True)
    visible_to_community = models.BooleanField(
        default=False,
        help_text="Whether this support is visible to the entire community or only to admins.",
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.subject)
        super().save(*args, **kwargs)

    def __str__(self):
        who = (
            (self.created_by.get_full_name() or self.created_by.username)
            if self.created_by
            else "unknown"
        )
        return f"Support {self.ticket_id} by {who}"


class SupportReply(CreatedByMixin):
    """Reply given to users who asked a question on support."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(
        Support, on_delete=models.CASCADE, related_name="replies"
    )
    body = models.TextField()
    is_admin = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Reply {self.id} on ticket {self.ticket_id}"


class Notification(CreatedByMixin):
    class ActionType(models.TextChoices):
        CREATED = "created", "Created"
        UPDATED = "updated", "Updated"
        DELETED = "deleted", "Deleted"
        SHARED = "shared", "Shared"
        COMMENTED = "commented", "Commented"

    action = models.CharField(max_length=20, choices=ActionType.choices)
    target = models.CharField(
        max_length=255,
        help_text="Short label for the object this notification refers to.",
    )
    target_url = models.CharField(
        max_length=500,
        blank=True,
        help_text="Optional deep link to the referenced object.",
    )
    from_user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications_sent",
    )
    to_user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["to_user", "is_read"]),
            models.Index(fields=["to_user", "-created_at"]),
        ]

    def __str__(self):
        actor = (
            (self.from_user.get_full_name() or self.from_user.username)
            if self.from_user
            else "system"
        )
        return f"{actor} {self.action} {self.target} → {self.to_user}"
