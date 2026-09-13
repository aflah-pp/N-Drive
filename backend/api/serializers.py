from rest_framework import serializers

from .models import CustomUser, EncryptedChatSession, Folder, Package, Subscription, UserFile


class MiniPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = [
            "id",
            "name",
            "plan_validity",
            "max_upload_size",
            "chat_enabled",
            "image_gen_enabled",
        ]


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = [
            "id",
            "name",
            "plan_validity",
            "max_upload_size",
            "price",
            "chat_enabled",
            "image_gen_enabled",
            "description",
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    package = MiniPackageSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ["package", "active_from", "active_to", "status", "created_at"]


class UserRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "password",
            "password2",
        ]
        extra_kwargs = {"password": {"write_only": True}, "email": {"required": True}}

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError("passwords are not matching")
        return attrs


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    subscription = SubscriptionSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "username",
            "full_name",
            "email",
            "phone",
            "subscription",
        ]


class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["username", "first_name", "last_name", "phone"]


class UserFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    unique_link_url = serializers.SerializerMethodField()

    class Meta:
        model = UserFile
        fields = [
            "id",
            "filename",
            "file_url",
            "unique_link",
            "unique_link_url",
            "size",
            "uploaded_at",
            "parent_folder",
        ]
        read_only_fields = [
            "id",
            "uploaded_at",
            "size",
            "file_url",
            "unique_link",
            "unique_link_url",
        ]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None

    def get_unique_link_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(f"files/download/{obj.unique_link}/")
        return None


class FolderSerializer(serializers.ModelSerializer):
    files = UserFileSerializer(many=True, read_only=True)
    unique_link_url = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ["id", "name", "created_at", "files", "unique_link", "unique_link_url"]
        read_only_fields = [
            "id",
            "created_at",
            "files",
            "unique_link",
            "unique_link_url",
        ]

    def get_unique_link_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(f"folders/download/{obj.unique_link}/")
        return None


class EncryptedChatSessionSerializer(serializers.ModelSerializer):
    conversation = serializers.SerializerMethodField()

    class Meta:
        model = EncryptedChatSession
        fields = ["id", "conversation", "created_at"]
