"""Booking views: slots, create booking, my bookings, admin bookings."""
import uuid
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from ..models import BookingSlot, Booking
from ..serializers import BookingSlotSerializer, BookingSerializer, CreateBookingSerializer
from ..permissions import IsAdmin
from ..utils.email_utils import send_booking_confirmation
from ..utils.notification_service import notify_admin_new_booking

logger = logging.getLogger("core")


@api_view(["GET"])
@permission_classes([AllowAny])
def available_slots(request):
    """List available booking slots, optionally filtered by session_type."""
    queryset = BookingSlot.objects.filter(is_available=True)
    session_type = request.query_params.get("session_type")
    if session_type:
        queryset = queryset.filter(session_type=session_type)
    serializer = BookingSlotSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """Create a new booking for the authenticated client."""
    serializer = CreateBookingSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    slot = BookingSlot.objects.get(pk=serializer.validated_data["slot_id"])
    slot.is_available = False
    slot.save()

    booking = Booking.objects.create(
        client=request.user,
        slot=slot,
        session_type=serializer.validated_data["session_type"],
        notes=serializer.validated_data.get("notes", ""),
        video_room_id=f"lily-{uuid.uuid4().hex[:12]}",
    )

    logger.info("New booking #%d by %s", booking.pk, request.user.email)
    notify_admin_new_booking(booking)

    return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_bookings(request):
    """List the authenticated client's bookings."""
    bookings = Booking.objects.filter(client=request.user)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    """Cancel a booking (client can only cancel their own)."""
    try:
        booking = Booking.objects.get(pk=booking_id, client=request.user)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

    if booking.status in ("completed", "cancelled"):
        return Response({"detail": "This booking cannot be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

    booking.status = "cancelled"
    booking.save()

    # Free up the slot
    if booking.slot:
        booking.slot.is_available = True
        booking.slot.save()

    logger.info("Booking #%d cancelled by %s", booking.pk, request.user.email)
    return Response(BookingSerializer(booking).data)


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_all_bookings(request):
    """List all bookings (admin only)."""
    bookings = Booking.objects.select_related("client", "slot").all()
    serializer = BookingSerializer(bookings, many=True)
    return Response({"results": serializer.data})


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_confirm_booking(request, booking_id):
    """Confirm a pending booking (admin only)."""
    try:
        booking = Booking.objects.get(pk=booking_id)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

    booking.status = "confirmed"
    booking.save()

    send_booking_confirmation(booking)
    logger.info("Booking #%d confirmed by admin", booking.pk)

    return Response(BookingSerializer(booking).data)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_create_slot(request):
    """Create a new available slot (admin only)."""
    serializer = BookingSlotSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    slot = serializer.save()
    logger.info("New slot created: %s", slot)
    return Response(BookingSlotSerializer(slot).data, status=status.HTTP_201_CREATED)
