from rest_framework import serializers
from .models import CustomUser, Folder, UserFile, Package, EncryptedChatSession


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

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    package_name = serializers.CharField(source="package.name", read_only=True)
    chat = serializers.CharField(source="package.chat_enabled", read_only=True)
    max_storage = serializers.CharField(
        source="package.max_upload_size", read_only=True
    )
    img_gen = serializers.CharField(source="package.image_gen_enabled", read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "username",
            "name",
            "email",
            "phone",
            "package_name",
            "max_storage",
            "chat",
            "img_gen",
        ]


class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["username", "first_name", "last_name", "phone"]

        def update(self, instance, validated_data):
            for attr, value in validated_data.items():
                setattr(attr, instance, value)
            instance.save()
            return instance


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ["id", "name", "price"]


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

    def get_conversation(self, obj):
        try:
            return obj.get_conversation()
        except Exception:
            return []  # fallback in case of bad data
