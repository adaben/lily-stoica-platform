"""Authentication views: register, login (JWT), me, logout."""
import logging
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from ..serializers import RegisterSerializer, UserSerializer

logger = logging.getLogger("core")
User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Register a new client account and return JWT tokens."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)
    logger.info("New registration: %s", user.email)

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Authenticate with email/password and return JWT tokens."""
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return Response(
            {"detail": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.check_password(password):
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"detail": "This account has been deactivated."},
            status=status.HTTP_403_FORBIDDEN,
        )

    refresh = RefreshToken.for_user(user)
    logger.info("Login: %s", user.email)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_me(request):
    """Return the current authenticated user."""
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """Blacklist the refresh token (client should also clear local storage)."""
    refresh_token = request.data.get("refresh")
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass  # token may already be blacklisted or invalid
    return Response({"detail": "Logged out."})
