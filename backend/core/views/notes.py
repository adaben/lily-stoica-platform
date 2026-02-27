"""Session notes views: client CRUD."""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import SessionNote
from ..serializers import SessionNoteSerializer

logger = logging.getLogger("core")


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def my_notes(request):
    """List or create session notes for the current user."""
    if request.method == "GET":
        notes = SessionNote.objects.filter(client=request.user)
        return Response(SessionNoteSerializer(notes, many=True).data)

    serializer = SessionNoteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(client=request.user)
    logger.info("Note created by %s", request.user.email)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def my_note_detail(request, note_id):
    """Update or delete one of the current user's notes."""
    try:
        note = SessionNote.objects.get(pk=note_id, client=request.user)
    except SessionNote.DoesNotExist:
        return Response({"detail": "Note not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = SessionNoteSerializer(note, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
