import os

from django.utils.text import slugify


def user_upload_path(instance, filename):
    name, ext = os.path.splitext(filename)
    safe_name = slugify(name)
    filename = f"{safe_name}{ext}"
    if instance.parent_folder:
        return f"user_{instance.user.id}/{instance.parent_folder.id}/{filename}"
    return f"user_{instance.user.id}/{filename}"
