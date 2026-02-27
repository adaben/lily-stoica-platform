"""Resource hub views – public listing + admin CRUD."""
from django.db.models import F
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from ..models import ResourceCategory, Resource
from ..serializers import (
    ResourceCategorySerializer, ResourceSerializer, AdminResourceSerializer,
)
from ..permissions import IsAdmin


# ── Public ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def list_resource_categories(request):
    """List all resource categories with counts."""
    cats = ResourceCategory.objects.all()
    return Response(ResourceCategorySerializer(cats, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def list_resources(request):
    """List published resources, optionally filtered by category slug."""
    resources = Resource.objects.filter(is_published=True)
    category_slug = request.query_params.get("category")
    if category_slug:
        resources = resources.filter(category__slug=category_slug)

    search = request.query_params.get("search")
    if search:
        from django.db.models import Q
        resources = resources.filter(
            Q(title__icontains=search) | Q(description__icontains=search)
        )

    return Response(ResourceSerializer(resources, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_resource(request, slug):
    """Get a single resource by slug."""
    try:
        resource = Resource.objects.get(slug=slug, is_published=True)
    except Resource.DoesNotExist:
        return Response({"detail": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)

    # Check premium access
    if resource.is_premium and (not request.user or not request.user.is_authenticated):
        return Response({"detail": "Login required to access this resource."}, status=status.HTTP_403_FORBIDDEN)

    return Response(ResourceSerializer(resource).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def track_resource_download(request, slug):
    """Increment download count for a resource."""
    try:
        Resource.objects.filter(slug=slug, is_published=True).update(download_count=F("download_count") + 1)
    except Resource.DoesNotExist:
        pass
    return Response({"status": "ok"})


# ── Admin ───────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAdmin])
def admin_resource_categories(request):
    """List or create resource categories."""
    if request.method == "GET":
        cats = ResourceCategory.objects.all()
        return Response(ResourceCategorySerializer(cats, many=True).data)

    serializer = ResourceCategorySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAdmin])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_resources(request):
    """List or create resources."""
    if request.method == "GET":
        resources = Resource.objects.all()
        return Response(AdminResourceSerializer(resources, many=True).data)

    serializer = AdminResourceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAdmin])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_resource_detail(request, resource_id):
    """Update or delete a resource."""
    try:
        resource = Resource.objects.get(pk=resource_id)
    except Resource.DoesNotExist:
        return Response({"detail": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = AdminResourceSerializer(resource, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
