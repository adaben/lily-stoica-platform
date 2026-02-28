"""AI assistant views using Gemini via Vertex AI."""
import hashlib
import logging
from datetime import timedelta
from typing import Optional

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from ..models import SystemConfiguration, AIUsageLog
from ..serializers import AIChatSerializer
from ..permissions import IsAdmin
from ..utils.gemini_service import call_gemini, test_connection

logger = logging.getLogger("core")

# Rate limits
RATE_PER_MINUTE = 5    # max requests per minute per IP/user
RATE_PER_DAY = 50      # max requests per day per IP/user


def _rate_key(request) -> str:
    """Return a consistent identifier for rate-limiting (user pk or IP hash)."""
    if request.user.is_authenticated:
        return f"user:{request.user.pk}"
    ip = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR", "")).split(",")[0].strip()
    ua = request.META.get("HTTP_USER_AGENT", "")
    return f"anon:{hashlib.sha256(f'{ip}:{ua}'.encode()).hexdigest()[:16]}"


def _check_rate_limit(request) -> Optional[dict]:
    """Return a 429 dict if rate-limited, else None."""
    key = _rate_key(request)
    now = timezone.now()

    # Per-minute check
    one_min_ago = now - timedelta(minutes=1)
    minute_count = AIUsageLog.objects.filter(session_id=key, created_at__gte=one_min_ago).count()
    if minute_count >= RATE_PER_MINUTE:
        return {"detail": "Rate limit exceeded. Please wait a moment before trying again.", "retry_after_seconds": 60}

    # Per-day check
    day_start = now - timedelta(hours=24)
    day_count = AIUsageLog.objects.filter(session_id=key, created_at__gte=day_start).count()
    if day_count >= RATE_PER_DAY:
        return {"detail": "Daily AI usage limit reached. Please try again tomorrow.", "retry_after_seconds": 3600}

    return None


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

    # Rate limiting
    rate_error = _check_rate_limit(request)
    if rate_error:
        return Response(rate_error, status=status.HTTP_429_TOO_MANY_REQUESTS)

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

    # Log usage (session_id used for anonymous rate-limiting key)
    AIUsageLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        session_id=_rate_key(request),
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
