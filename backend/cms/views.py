from datetime import timedelta
from decimal import Decimal

from django.apps import apps
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.db.models import Count, Q, Sum
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from api.models import (
    EncryptedChatSession,
    Folder,
    Package,
    Subscription,
    Transaction,
    UserFile,
)
from cms.utils import safe_delete

from .forms import (
    CustomUserForm,
    PackageForm,
    SubscriptionForm,
    TransactionForm,
)

User = get_user_model()


@staff_member_required
def dashboard(request):
    now = timezone.now()
    last_30 = now - timedelta(days=30)
    last_7 = now - timedelta(days=7)

    total_revenue = Transaction.objects.filter(status="completed").aggregate(t=Sum("amount"))["t"] or Decimal("0")
    revenue_30d = Transaction.objects.filter(status="completed", created_at__gte=last_30).aggregate(t=Sum("amount"))[
        "t"
    ] or Decimal("0")
    revenue_7d = Transaction.objects.filter(status="completed", created_at__gte=last_7).aggregate(t=Sum("amount"))[
        "t"
    ] or Decimal("0")

    revenue_by_package = (
        Transaction.objects.filter(status="completed")
        .values("package__name")
        .annotate(total=Sum("amount"), count=Count("id"))
        .order_by("-total")
    )

    txn_status = (
        Transaction.objects.values("status").annotate(count=Count("id"), total=Sum("amount")).order_by("status")
    )

    total_users = User.objects.count()
    new_users_30d = User.objects.filter(date_joined__gte=last_30).count()
    active_users_30d = User.objects.filter(last_login__gte=last_30).count()

    active_subs = Subscription.objects.filter(status="ACTIVE").count()
    expired_subs = Subscription.objects.filter(status="EXPIRED").count()
    queued_subs = Subscription.objects.filter(status="ON_QUEUE").count()

    ending_soon = Subscription.objects.filter(
        status="ACTIVE",
        active_to__lte=(now + timedelta(days=7)).date(),
        active_to__gte=now.date(),
    ).select_related("user", "package")

    total_files = UserFile.objects.filter(is_deleted=False).count()
    total_storage = UserFile.objects.filter(is_deleted=False).aggregate(t=Sum("size"))["t"] or 0
    total_folders = Folder.objects.filter(is_deleted=False).count()

    total_packages = Package.objects.count()
    active_packages = Package.objects.filter(is_active=True).count()
    total_chat_sessions = EncryptedChatSession.objects.count()

    top_spenders = (
        Transaction.objects.filter(status="completed")
        .values("user__username", "user__email", "user__id")
        .annotate(total_spent=Sum("amount"), txn_count=Count("id"))
        .order_by("-total_spent")[:5]
    )

    monthly_revenue = []
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        total = Transaction.objects.filter(
            status="completed",
            created_at__gte=month_start,
            created_at__lt=month_end,
        ).aggregate(t=Sum("amount"))["t"] or Decimal("0")
        monthly_revenue.append({"month": month_start.strftime("%b %Y"), "total": float(total)})

    max_monthly = max([m["total"] for m in monthly_revenue] + [1])

    context = {
        "total_revenue": total_revenue,
        "revenue_30d": revenue_30d,
        "revenue_7d": revenue_7d,
        "revenue_by_package": revenue_by_package,
        "txn_status": txn_status,
        "total_users": total_users,
        "new_users_30d": new_users_30d,
        "active_users_30d": active_users_30d,
        "active_subs": active_subs,
        "expired_subs": expired_subs,
        "queued_subs": queued_subs,
        "ending_soon": ending_soon,
        "total_files": total_files,
        "total_storage": total_storage,
        "total_folders": total_folders,
        "total_packages": total_packages,
        "active_packages": active_packages,
        "total_chat_sessions": total_chat_sessions,
        "top_spenders": top_spenders,
        "monthly_revenue": monthly_revenue,
        "max_monthly": max_monthly,
    }
    return render(request, "dashboard.html", context)


@staff_member_required
def audit_log(request):
    model_name = request.GET.get("model", "")
    action = request.GET.get("action", "")
    date_range = request.GET.get("range", "30")

    records = []
    auditable_models = []

    for model in apps.get_models():
        if hasattr(model, "history"):
            auditable_models.append(model.__name__)

    if auditable_models:
        for model in apps.get_models():
            if not hasattr(model, "history"):
                continue
            if model_name and model.__name__.lower() != model_name.lower():
                continue
            qs = model.history.all().select_related("history_user")
            if action:
                qs = qs.filter(history_type=action)
            if date_range and date_range != "all":
                since = timezone.now() - timedelta(days=int(date_range))
                qs = qs.filter(history_date__gte=since)
            records.extend(list(qs[:100]))

        records.sort(key=lambda r: r.history_date, reverse=True)

    paginator = Paginator(records, 30)
    page_obj = paginator.get_page(request.GET.get("page", 1))

    context = {
        "page_obj": page_obj,
        "auditable_models": sorted(set(auditable_models)),
        "selected_model": model_name,
        "selected_action": action,
        "selected_range": date_range,
        "has_history": bool(auditable_models),
    }
    return render(request, "audit/audit_log.html", context)


@staff_member_required
def user_list(request):
    q = request.GET.get("q", "")
    users = User.objects.all().order_by("-date_joined")

    if q:
        users = users.filter(
            Q(username__icontains=q)
            | Q(email__icontains=q)
            | Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
            | Q(phone__icontains=q)
        )

    users = users.annotate(
        sub_count=Count("subscriptions", distinct=True),
        file_count=Count("files", distinct=True),
    )

    paginator = Paginator(users, 25)
    page_obj = paginator.get_page(request.GET.get("page", 1))
    return render(request, "users/list.html", {"page_obj": page_obj, "q": q})


@staff_member_required
def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)
    context = {
        "user_obj": user,
        "subscriptions": user.subscriptions.select_related("package"),
        "transactions": user.transactions.select_related("package")[:20],
        "files": user.files.filter(is_deleted=False)[:20],
        "folders": user.folders.filter(is_deleted=False),
        "total_spent": user.transactions.filter(status="completed").aggregate(t=Sum("amount"))["t"] or 0,
    }
    return render(request, "users/detail.html", context)


@staff_member_required
def user_create(request):
    if request.method == "POST":
        form = CustomUserForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "User created.")
            return redirect("cms:user_list")
    else:
        form = CustomUserForm()
    return render(request, "users/form.html", {"form": form, "title": "Create User"})


@staff_member_required
def user_update(request, pk):
    user = get_object_or_404(User, pk=pk)
    if request.method == "POST":
        form = CustomUserForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, "User updated.")
            return redirect("cms:user_list")
    else:
        form = CustomUserForm(instance=user)
    return render(request, "users/form.html", {"form": form, "title": "Edit User"})


@staff_member_required
def user_delete(request, pk):
    user = get_object_or_404(User, pk=pk)
    if request.method == "POST":
        return safe_delete(request, user, "cms:user_list", "User")
    return render(
        request,
        "partials/confirm_delete.html",
        {
            "object": user,
            "type": "User",
            "cancel_url": "cms:user_list",
        },
    )


@staff_member_required
def package_list(request):
    packages = Package.objects.annotate(
        sub_count=Count("subscription", distinct=True),
        txn_count=Count("transaction", distinct=True),
    ).order_by("-is_active", "name")
    return render(request, "packages/list.html", {"packages": packages})


@staff_member_required
def package_create(request):
    if request.method == "POST":
        form = PackageForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Package created.")
            return redirect("cms:package_list")
    else:
        form = PackageForm()
    return render(request, "packages/form.html", {"form": form, "title": "Create Package"})


@staff_member_required
def package_update(request, pk):
    pkg = get_object_or_404(Package, pk=pk)
    if request.method == "POST":
        form = PackageForm(request.POST, instance=pkg)
        if form.is_valid():
            form.save()
            messages.success(request, "Package updated.")
            return redirect("cms:package_list")
    else:
        form = PackageForm(instance=pkg)
    return render(request, "packages/form.html", {"form": form, "title": "Edit Package"})


@staff_member_required
def package_delete(request, pk):
    pkg = get_object_or_404(Package, pk=pk)
    if request.method == "POST":
        return safe_delete(request, pkg, "cms:package_list", "Package")
    return render(
        request,
        "partials/confirm_delete.html",
        {
            "object": pkg,
            "type": "Package",
            "cancel_url": "cms:package_list",
        },
    )


@staff_member_required
def subscription_list(request):
    q = request.GET.get("q", "")
    status = request.GET.get("status", "")
    subs = Subscription.objects.select_related("user", "package").order_by("-created_at")

    if q:
        subs = subs.filter(
            Q(user__username__icontains=q) | Q(user__email__icontains=q) | Q(package__name__icontains=q)
        )
    if status:
        subs = subs.filter(status=status)

    paginator = Paginator(subs, 25)
    page_obj = paginator.get_page(request.GET.get("page", 1))
    return render(
        request,
        "subscriptions/list.html",
        {
            "page_obj": page_obj,
            "q": q,
            "status": status,
            "statuses": Subscription.SubscriptionStatus.choices,
        },
    )


@staff_member_required
def subscription_create(request):
    if request.method == "POST":
        form = SubscriptionForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Subscription created.")
            return redirect("cms:subscription_list")
    else:
        form = SubscriptionForm()
    return render(request, "subscriptions/form.html", {"form": form, "title": "Create Subscription"})


@staff_member_required
def subscription_update(request, pk):
    sub = get_object_or_404(Subscription, pk=pk)
    if request.method == "POST":
        form = SubscriptionForm(request.POST, instance=sub)
        if form.is_valid():
            form.save()
            messages.success(request, "Subscription updated.")
            return redirect("cms:subscription_list")
    else:
        form = SubscriptionForm(instance=sub)
    return render(request, "subscriptions/form.html", {"form": form, "title": "Edit Subscription"})


@staff_member_required
def subscription_delete(request, pk):
    sub = get_object_or_404(Subscription, pk=pk)
    if request.method == "POST":
        return safe_delete(request, sub, "cms:subscription_list", "Subscription")
    return render(
        request,
        "partials/confirm_delete.html",
        {
            "object": sub,
            "type": "Subscription",
            "cancel_url": "cms:subscription_list",
        },
    )


@staff_member_required
def transaction_list(request):
    q = request.GET.get("q", "")
    status = request.GET.get("status", "")
    date_range = request.GET.get("range", "30")

    txns = Transaction.objects.select_related("user", "package", "subscription").order_by("-created_at")

    if q:
        txns = txns.filter(
            Q(ref__icontains=q)
            | Q(user__username__icontains=q)
            | Q(user__email__icontains=q)
            | Q(package__name__icontains=q)
        )
    if status:
        txns = txns.filter(status=status)
    if date_range and date_range != "all":
        since = timezone.now() - timedelta(days=int(date_range))
        txns = txns.filter(created_at__gte=since)

    completed_total = txns.filter(status="completed").aggregate(t=Sum("amount"))["t"] or 0

    paginator = Paginator(txns, 25)
    page_obj = paginator.get_page(request.GET.get("page", 1))

    return render(
        request,
        "transactions/list.html",
        {
            "page_obj": page_obj,
            "q": q,
            "status": status,
            "date_range": date_range,
            "completed_total": completed_total,
            "statuses": Transaction.STATUS_CHOICES,
        },
    )


@staff_member_required
def transaction_create(request):
    if request.method == "POST":
        form = TransactionForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Transaction created.")
            return redirect("cms:transaction_list")
    else:
        form = TransactionForm()
    return render(request, "transactions/form.html", {"form": form, "title": "Create Transaction"})


@staff_member_required
def transaction_update(request, pk):
    txn = get_object_or_404(Transaction, pk=pk)
    if request.method == "POST":
        form = TransactionForm(request.POST, instance=txn)
        if form.is_valid():
            form.save()
            messages.success(request, "Transaction updated.")
            return redirect("cms:transaction_list")
    else:
        form = TransactionForm(instance=txn)
    return render(request, "transactions/form.html", {"form": form, "title": "Edit Transaction"})


@staff_member_required
def transaction_delete(request, pk):
    txn = get_object_or_404(Transaction, pk=pk)
    if request.method == "POST":
        return safe_delete(request, txn, "cms:transaction_list", "Transaction")
    return render(
        request,
        "partials/confirm_delete.html",
        {
            "object": txn,
            "type": "Transaction",
            "cancel_url": "cms:transaction_list",
        },
    )


@staff_member_required
def file_list(request):
    q = request.GET.get("q", "")
    files = UserFile.objects.filter(is_deleted=False).select_related("user", "parent_folder").order_by("-uploaded_at")

    if q:
        files = files.filter(Q(filename__icontains=q) | Q(user__username__icontains=q))

    total_size = files.aggregate(t=Sum("size"))["t"] or 0

    paginator = Paginator(files, 25)
    page_obj = paginator.get_page(request.GET.get("page", 1))
    return render(
        request,
        "files/file_list.html",
        {"page_obj": page_obj, "q": q, "total_size": total_size},
    )


@staff_member_required
def file_delete(request, pk):
    f = get_object_or_404(UserFile, pk=pk)
    if request.method == "POST":
        return safe_delete(request, f, "cms:file_list", "File")
    return render(
        request,
        "partials/confirm_delete.html",
        {
            "object": f,
            "type": "File",
            "cancel_url": "cms:file_list",
        },
    )


@staff_member_required
def folder_list(request):
    q = request.GET.get("q", "")
    folders = Folder.objects.filter(is_deleted=False).select_related("user").order_by("name")
    if q:
        folders = folders.filter(Q(name__icontains=q) | Q(user__username__icontains=q))

    paginator = Paginator(folders, 25)
    page_obj = paginator.get_page(request.GET.get("page", 1))
    return render(request, "files/folder_list.html", {"page_obj": page_obj, "q": q})


@staff_member_required
def folder_delete(request, pk):
    folder = get_object_or_404(Folder, pk=pk)
    if request.method == "POST":
        return safe_delete(request, folder, "cms:folder_list", "Folder")
    return render(
        request,
        "partials/confirm_delete.html",
        {
            "object": folder,
            "type": "Folder",
            "cancel_url": "cms:folder_list",
        },
    )
