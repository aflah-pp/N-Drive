from django import forms
from django.contrib.auth import get_user_model

from api.models import Folder, Package, Subscription, Transaction, UserFile

from .widgets import FeatureListWidget, HumanSizeField, HumanSizeWidget

User = get_user_model()


class CustomUserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "is_active",
            "is_staff",
            "is_superuser",
        ]

    def save(self, commit=True):
        user = super().save(commit=False)
        if not user.pk:
            user.set_password("changeme123") 
        if commit:
            user.save()
        return user


class PackageForm(forms.ModelForm):
    description = forms.JSONField(
        widget=FeatureListWidget(),
        required=False,
        help_text="Enter one feature per line. We'll convert it into structured JSON automatically.",
    )

    max_upload_size = HumanSizeField(
        widget=HumanSizeWidget(),
        required=True,
        help_text="Max file size a user can upload on this plan.",
    )

    class Meta:
        model = Package
        fields = "__all__"


class SubscriptionForm(forms.ModelForm):
    class Meta:
        model = Subscription
        fields = "__all__"
        widgets = {
            "active_from": forms.DateInput(attrs={"type": "date"}),
            "active_to": forms.DateInput(attrs={"type": "date"}),
        }


class TransactionForm(forms.ModelForm):
    class Meta:
        model = Transaction
        fields = ["user", "package", "subscription", "ref", "amount", "status"]


class FolderForm(forms.ModelForm):
    class Meta:
        model = Folder
        fields = ["user", "name"]


class UserFileForm(forms.ModelForm):
    class Meta:
        model = UserFile
        fields = ["user", "file", "filename", "parent_folder"]
