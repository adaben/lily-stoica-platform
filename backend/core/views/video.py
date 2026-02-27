"""Video room views with HTTP-polling signalling (no WebSocket)."""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Booking, VideoRoomEvent, VideoSignal
from ..serializers import VideoSignalSendSerializer, VideoSignalSerializer

logger = logging.getLogger("core")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_video_room(request, booking_id):
    """Get or verify the video room for a booking."""
    try:
        booking = Booking.objects.get(pk=booking_id)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

    # Only the client or an admin can access
    if booking.client != request.user and request.user.role != "admin":
        return Response({"detail": "Not authorised."}, status=status.HTTP_403_FORBIDDEN)

    if booking.status != "confirmed":
        return Response(
            {"detail": "This session is not yet confirmed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({
        "room_id": booking.video_room_id,
        "booking_id": booking.pk,
        "session_type": booking.session_type,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def log_video_event(request, room_id):
    """Log a video room event (join/leave)."""
    event_type = request.data.get("event_type", "joined")
    VideoRoomEvent.objects.create(
        room_id=room_id,
        user=request.user,
        event_type=event_type,
    )
    return Response({"detail": "Event logged."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def signal_send(request, room_id):
    """Send a WebRTC signalling message to the room."""
    serializer = VideoSignalSendSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    VideoSignal.objects.create(
        room_id=room_id,
        sender=request.user,
        signal_type=serializer.validated_data["type"],
        payload=serializer.validated_data["payload"],
    )
    return Response({"detail": "Signal sent."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def signal_poll(request, room_id):
    """Poll for unconsumed signalling messages in this room (excluding own)."""
    signals = VideoSignal.objects.filter(
        room_id=room_id,
        consumed=False,
    ).exclude(sender=request.user)

    data = VideoSignalSerializer(signals, many=True).data

    # Mark as consumed
    signals.update(consumed=True)

    return Response(data)
