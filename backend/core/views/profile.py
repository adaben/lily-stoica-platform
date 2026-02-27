"""Profile views: update profile, change password."""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..serializers import UserSerializer, ProfileUpdateSerializer, ChangePasswordSerializer

logger = logging.getLogger("core")


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update the current user's profile fields."""
    serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    logger.info("Profile updated: %s", request.user.email)
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change the current user's password."""
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    if not request.user.check_password(serializer.validated_data["current_password"]):
        return Response(
            {"detail": "Current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    request.user.set_password(serializer.validated_data["new_password"])
    request.user.save()
    logger.info("Password changed: %s", request.user.email)
    return Response({"detail": "Password changed successfully."})
