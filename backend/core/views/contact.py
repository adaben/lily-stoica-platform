"""Contact form views."""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..serializers import ContactMessageSerializer
from ..utils.email_utils import send_contact_notification

logger = logging.getLogger("core")


@api_view(["POST"])
@permission_classes([AllowAny])
def submit_contact(request):
    """Submit a contact form message."""
    serializer = ContactMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    message = serializer.save()
    logger.info("New contact message from %s", message.email)
    send_contact_notification(message)
    return Response({"detail": "Message sent. We will be in touch within 24 hours."}, status=status.HTTP_201_CREATED)
