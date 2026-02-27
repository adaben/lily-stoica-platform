"""AI assistant views using Google Gemini."""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from ..models import SystemConfiguration, AIUsageLog
from ..serializers import AIChatSerializer
from ..permissions import IsAdmin
from ..utils.gemini_service import call_gemini, test_connection

logger = logging.getLogger("core")


@api_view(["GET"])
@permission_classes([AllowAny])
def ai_status(request):
    """Check whether the AI assistant is enabled."""
    config = SystemConfiguration.load()
    return Response({
        "enabled": config.ai_enabled and bool(config.gemini_api_key),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def ai_chat(request):
    """Send a message to the AI assistant and get a response."""
    config = SystemConfiguration.load()
    if not config.ai_enabled or not config.gemini_api_key:
        return Response(
            {"detail": "The AI assistant is currently unavailable."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    serializer = AIChatSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user_message = serializer.validated_data["message"]

    try:
        response_text, tokens = call_gemini(
            user_message=user_message,
            system_prompt=config.ai_system_prompt,
            api_key=config.gemini_api_key,
            max_tokens=config.ai_max_tokens,
        )
    except Exception as e:
        logger.error("Gemini API error: %s", str(e))
        return Response(
            {"detail": "The AI assistant encountered an error. Please try again."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    # Log usage
    AIUsageLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        prompt=user_message,
        response=response_text,
        tokens_used=tokens,
    )

    return Response({
        "message": response_text,
        "tokens_used": tokens,
    })


@api_view(["POST"])
@permission_classes([IsAdmin])
def test_gemini(request):
    """Test the Gemini AI connection (admin only)."""
    config = SystemConfiguration.load()
    if not config.gemini_api_key:
        return Response(
            {"detail": "No Gemini API key configured."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = test_connection(config.gemini_api_key)
        return Response({"message": result})
    except Exception as e:
        return Response(
            {"detail": f"Connection failed: {str(e)}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )
