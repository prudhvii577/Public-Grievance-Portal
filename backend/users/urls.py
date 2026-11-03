from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    ChangePasswordView,
    AdminUserManagementView,
    AdminUserDetailView,
    OfficerListView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('admin/users/', AdminUserManagementView.as_view(), name='admin_users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('officers/', OfficerListView.as_view(), name='officer_list'),
]
