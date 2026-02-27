"""Goals views: client CRUD + admin views."""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Goal
from ..serializers import GoalSerializer
from ..permissions import IsAdmin

logger = logging.getLogger("core")


# ── Client endpoints ────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def my_goals(request):
    """List or create goals for the current user."""
    if request.method == "GET":
        goals = Goal.objects.filter(client=request.user)
        return Response(GoalSerializer(goals, many=True).data)

    serializer = GoalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(client=request.user)
    logger.info("Goal created by %s: %s", request.user.email, serializer.data.get("title"))
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def my_goal_detail(request, goal_id):
    """Update or delete one of the current user's goals."""
    try:
        goal = Goal.objects.get(pk=goal_id, client=request.user)
    except Goal.DoesNotExist:
        return Response({"detail": "Goal not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        goal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = GoalSerializer(goal, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ── Admin endpoints ─────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_client_goals(request, client_id):
    """List goals for a specific client (admin only)."""
    goals = Goal.objects.filter(client_id=client_id)
    return Response(GoalSerializer(goals, many=True).data)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_create_goal(request):
    """Create a goal for a client (admin only)."""
    client_id = request.data.get("client")
    if not client_id:
        return Response({"detail": "client field is required."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = GoalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(client_id=client_id)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAdmin])
def admin_update_goal(request, goal_id):
    """Update a goal (admin only)."""
    try:
        goal = Goal.objects.get(pk=goal_id)
    except Goal.DoesNotExist:
        return Response({"detail": "Goal not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = GoalSerializer(goal, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
