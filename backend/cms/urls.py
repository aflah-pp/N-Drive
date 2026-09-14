from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

app_name = "cms"

urlpatterns = [
    path("login/", auth_views.LoginView.as_view(template_name="login.html"), name="login"),
    path("logout/", auth_views.LogoutView.as_view(next_page="cms:login"), name="logout"),
    path("", views.dashboard, name="dashboard"),
    path("audit/", views.audit_log, name="audit_log"),
    path("users/", views.user_list, name="user_list"),
    path("users/create/", views.user_create, name="user_create"),
    path("users/<uuid:pk>/", views.user_detail, name="user_detail"),
    path("users/<uuid:pk>/edit/", views.user_update, name="user_update"),
    path("users/<uuid:pk>/delete/", views.user_delete, name="user_delete"),
    path("packages/", views.package_list, name="package_list"),
    path("packages/create/", views.package_create, name="package_create"),
    path("packages/<int:pk>/edit/", views.package_update, name="package_update"),
    path("packages/<int:pk>/delete/", views.package_delete, name="package_delete"),
    path("subscriptions/", views.subscription_list, name="subscription_list"),
    path("subscriptions/create/", views.subscription_create, name="subscription_create"),
    path("subscriptions/<int:pk>/edit/", views.subscription_update, name="subscription_update"),
    path("subscriptions/<int:pk>/delete/", views.subscription_delete, name="subscription_delete"),
    path("transactions/", views.transaction_list, name="transaction_list"),
    path("transactions/create/", views.transaction_create, name="transaction_create"),
    path("transactions/<uuid:pk>/edit/", views.transaction_update, name="transaction_update"),
    path("transactions/<uuid:pk>/delete/", views.transaction_delete, name="transaction_delete"),
    path("files/", views.file_list, name="file_list"),
    path("files/<uuid:pk>/delete/", views.file_delete, name="file_delete"),
    path("folders/", views.folder_list, name="folder_list"),
    path("folders/<uuid:pk>/delete/", views.folder_delete, name="folder_delete"),
]
