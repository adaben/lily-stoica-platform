"""Admin settings views."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import SystemConfiguration
from ..serializers import SystemConfigurationSerializer
from ..permissions import IsAdmin


@api_view(["GET"])
@permission_classes([AllowAny])
def public_settings(request):
    """Public feature flags (no auth required)."""
    config = SystemConfiguration.load()
    return Response({
        "beta_mode": config.beta_mode,
        "blog_enabled": config.blog_enabled,
        "events_enabled": config.events_enabled,
        "booking_enabled": config.booking_enabled,
        "lead_magnet_enabled": config.lead_magnet_enabled,
    })


@api_view(["GET"])
@permission_classes([IsAdmin])
def get_settings(request):
    """Get current system settings (admin only)."""
    config = SystemConfiguration.load()
    return Response(SystemConfigurationSerializer(config).data)


@api_view(["PATCH"])
@permission_classes([IsAdmin])
def update_settings(request):
    """Update system settings (admin only)."""
    config = SystemConfiguration.load()
    serializer = SystemConfigurationSerializer(config, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
