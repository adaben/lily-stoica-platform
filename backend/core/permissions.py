"""Custom permissions for the LiLy Stoica platform."""
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only allow admin users or Django staff."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == "admin" or request.user.is_staff
