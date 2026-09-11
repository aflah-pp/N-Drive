from django.conf import settings
from django.db import models


class CreatedByMixin(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="+",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class UpdatedByMixin(models.Model):
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+", null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        abstract = True


class DeletedByMixin(models.Model):
    deleted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+", null=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True


class AuditMixin(CreatedByMixin, UpdatedByMixin, DeletedByMixin):
    class Meta:
        abstract = True
