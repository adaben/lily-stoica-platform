"""Booking views: slots, create booking, my bookings, admin bookings."""
import uuid
import logging
from datetime import timedelta, datetime
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
    bookings = Booking.objects.filter(client=request.user).select_related("slot")
    serializer = BookingSerializer(bookings, many=True)
    return Response({"results": serializer.data})


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


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_slots(request):
    """List all future slots (admin only). Returns both available and booked."""
    from django.utils import timezone
    today = timezone.now().date()
    slots = BookingSlot.objects.filter(date__gte=today).order_by("date", "start_time")
    serializer = BookingSlotSerializer(slots, many=True)
    return Response({"results": serializer.data})


@api_view(["DELETE"])
@permission_classes([IsAdmin])
def admin_delete_slot(request, slot_id):
    """Delete a slot (admin only). Only if no active (pending/confirmed) booking."""
    try:
        slot = BookingSlot.objects.get(pk=slot_id)
    except BookingSlot.DoesNotExist:
        return Response({"detail": "Slot not found."}, status=status.HTTP_404_NOT_FOUND)

    active_booking = Booking.objects.filter(
        slot=slot, status__in=["pending", "confirmed"]
    ).exists()
    if active_booking:
        return Response(
            {"detail": "Cannot delete: an active booking is linked to this slot."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    slot.delete()
    logger.info("Slot #%d deleted by admin", slot_id)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_bulk_create_slots(request):
    """Create recurring slots over a date range (admin only).

    Expected payload:
    {
        "start_date": "2025-02-01",
        "end_date": "2025-03-01",
        "weekdays": [0, 2, 4],    # 0=Mon … 6=Sun
        "start_time": "09:00",
        "end_time": "10:00",
        "session_type": "standard"
    }
    """
    d = request.data
    required = ["start_date", "end_date", "weekdays", "start_time", "end_time", "session_type"]
    missing = [f for f in required if f not in d]
    if missing:
        return Response(
            {"detail": "Missing fields: %s" % ", ".join(missing)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        start = datetime.strptime(d["start_date"], "%Y-%m-%d").date()
        end = datetime.strptime(d["end_date"], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    weekdays = d["weekdays"]
    if not isinstance(weekdays, list) or not all(isinstance(w, int) and 0 <= w <= 6 for w in weekdays):
        return Response({"detail": "weekdays must be a list of ints 0-6."}, status=status.HTTP_400_BAD_REQUEST)

    if end < start:
        return Response({"detail": "end_date must be >= start_date."}, status=status.HTTP_400_BAD_REQUEST)

    if (end - start).days > 365:
        return Response({"detail": "Range cannot exceed 1 year."}, status=status.HTTP_400_BAD_REQUEST)

    created = []
    current = start
    while current <= end:
        if current.weekday() in weekdays:
            slot, was_created = BookingSlot.objects.get_or_create(
                date=current,
                start_time=d["start_time"],
                end_time=d["end_time"],
                session_type=d["session_type"],
                defaults={"is_available": True},
            )
            if was_created:
                created.append(slot)
        current += timedelta(days=1)

    logger.info("Bulk slot creation: %d slots created by admin", len(created))
    serializer = BookingSlotSerializer(created, many=True)
    return Response(
        {"created_count": len(created), "slots": serializer.data},
        status=status.HTTP_201_CREATED,
    )
