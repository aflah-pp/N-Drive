# cms/utils.py
from django.contrib import messages
from django.db.models import ProtectedError
from django.shortcuts import redirect, render


def safe_delete(request, obj, redirect_url, type_label):
    """
    Attempts to delete an object

    - On success: adds success messege.
    - On ProtectedError: renders a page listing the protected relations.

    Returns an HttpResponse (redirect or rendered page).
    """
    try:
        obj.delete()
        messages.success(request, f"{type_label} deleted successfully.")
        return redirect(redirect_url)

    except ProtectedError as e:
        protected_objects = list(e.protected_objects)

        grouped = {}
        for p in protected_objects:
            model_name = p.__class__.__name__
            grouped.setdefault(model_name, []).append(p)

        messages.error(
            request,
            f"Cannot delete this {type_label} — it is referenced by " f"{len(protected_objects)} protected record(s).",
        )

        return render(
            request,
            "partials/protected_error.html",
            {
                "object": obj,
                "type": type_label,
                "grouped": grouped,
                "total_protected": len(protected_objects),
                "back_url": redirect_url,
            },
        )
