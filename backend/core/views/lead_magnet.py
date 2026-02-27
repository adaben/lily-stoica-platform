"""Lead magnet views."""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import LeadMagnetEntry
from ..serializers import LeadMagnetSerializer
from ..utils.email_utils import send_lead_magnet_delivery

logger = logging.getLogger("core")


@api_view(["POST"])
@permission_classes([AllowAny])
def submit_lead_magnet(request):
    """Submit email for the free nervous system reset recording."""
    serializer = LeadMagnetSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # Avoid duplicates
    email = serializer.validated_data["email"].lower()
    existing = LeadMagnetEntry.objects.filter(email=email).first()
    if existing:
        return Response({"detail": "You are already subscribed."})

    entry = serializer.save(email=email)
    logger.info("New lead magnet entry: %s", entry.email)

    send_lead_magnet_delivery(entry)
    entry.delivered = True
    entry.save()

    return Response({"detail": "Success. Check your inbox."}, status=status.HTTP_201_CREATED)
