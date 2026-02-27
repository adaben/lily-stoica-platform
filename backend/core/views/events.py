"""Events views – public listing + admin CRUD."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import Event
from ..serializers import EventSerializer
from ..permissions import IsAdmin


@api_view(["GET"])
@permission_classes([AllowAny])
def list_events(request):
    """List published events."""
    events = Event.objects.filter(is_published=True)
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_event(request, event_id):
    """Get a single event by ID."""
    try:
        event = Event.objects.get(pk=event_id, is_published=True)
    except Event.DoesNotExist:
        return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(EventSerializer(event).data)


# ── Admin ───────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_events(request):
    """List all events for admin."""
    events = Event.objects.all()
    return Response(EventSerializer(events, many=True).data)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_create_event(request):
    """Create a new event."""
    serializer = EventSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAdmin])
def admin_event_detail(request, event_id):
    """Update or delete an event."""
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = EventSerializer(event, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
