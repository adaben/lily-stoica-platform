"""Custom middleware for the LiLy Stoica platform."""
import logging
import time

logger = logging.getLogger("core")


class RequestLoggingMiddleware:
    """Log every request with timing, user and IP."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = time.time() - start

        user = getattr(request, "user", None)
        user_str = str(user) if user and user.is_authenticated else "anonymous"

        # Proxy-aware IP
        ip = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
        if not ip:
            ip = request.META.get("REMOTE_ADDR", "")

        logger.info(
            "%s %s %s %s %.3fs",
            request.method,
            request.get_full_path(),
            response.status_code,
            user_str,
            duration,
        )
        return response


class SecurityHeadersMiddleware:
    """Add security headers to every response."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["X-Content-Type-Options"] = "nosniff"
        response["X-Frame-Options"] = "DENY"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response["Permissions-Policy"] = "camera=(self), microphone=(self), geolocation=()"
        response["X-XSS-Protection"] = "1; mode=block"
        response["Cross-Origin-Opener-Policy"] = "same-origin"
        return response
