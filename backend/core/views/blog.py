"""Blog views – public listing/detail + admin CRUD + OG metadata."""
import os
from django.db.models import Q, F
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import BlogPost
from ..serializers import (
    BlogPostListSerializer, BlogPostDetailSerializer, AdminBlogPostSerializer,
)
from ..permissions import IsAdmin


# ── Public ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def list_blog_posts(request):
    """List published blog posts with pagination, tag filtering, search."""
    posts = BlogPost.objects.filter(is_published=True)

    # Tag filtering
    tag = request.query_params.get("tag")
    if tag:
        posts = posts.filter(tags__contains=tag)

    # Text search
    search = request.query_params.get("search")
    if search:
        posts = posts.filter(
            Q(title__icontains=search) |
            Q(excerpt__icontains=search) |
            Q(content__icontains=search)
        )

    page_size = 12
    page = int(request.query_params.get("page", 1))
    start = (page - 1) * page_size
    end = start + page_size
    total = posts.count()

    serializer = BlogPostListSerializer(posts[start:end], many=True)
    return Response({
        "results": serializer.data,
        "count": total,
        "page": page,
        "total_pages": (total + page_size - 1) // page_size,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def get_blog_post(request, slug):
    """Get a single blog post by slug. Increments view count."""
    try:
        post = BlogPost.objects.get(slug=slug, is_published=True)
    except BlogPost.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    # Increment view count
    BlogPost.objects.filter(pk=post.pk).update(view_count=F("view_count") + 1)
    post.refresh_from_db()

    return Response(BlogPostDetailSerializer(post).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_pinned_posts(request):
    """Return pinned / featured blog posts."""
    posts = BlogPost.objects.filter(is_published=True, is_pinned=True)[:5]
    return Response(BlogPostListSerializer(posts, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def blog_og_metadata(request, slug):
    """Return Open Graph metadata for a blog post (for SSR / link previews)."""
    try:
        post = BlogPost.objects.get(slug=slug, is_published=True)
    except BlogPost.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    site_url = request.build_absolute_uri("/").rstrip("/")
    return Response({
        "og:title": post.seo_title or post.title,
        "og:description": post.seo_description or post.excerpt,
        "og:image": post.featured_image_url if post.featured_image else "",
        "og:url": f"{site_url}/blog/{post.slug}",
        "og:type": "article",
        "og:site_name": "LiLy Stoica - Neurocoach and Hypnotherapist",
        "article:author": post.author_name,
        "article:published_time": post.published_at.isoformat() if post.published_at else "",
        "article:tag": post.tags,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def blog_tags(request):
    """Return a list of all unique tags used by published posts."""
    posts = BlogPost.objects.filter(is_published=True).values_list("tags", flat=True)
    tags_set = set()
    for tag_list in posts:
        if isinstance(tag_list, list):
            tags_set.update(tag_list)
    return Response(sorted(tags_set))


# ── Admin ───────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_blog_posts(request):
    """List all blog posts (published + drafts) for admin."""
    posts = BlogPost.objects.all()
    page_size = 50
    page = int(request.query_params.get("page", 1))
    start = (page - 1) * page_size
    end = start + page_size
    total = posts.count()

    serializer = AdminBlogPostSerializer(posts[start:end], many=True)
    return Response({
        "results": serializer.data,
        "count": total,
        "page": page,
        "total_pages": (total + page_size - 1) // page_size,
    })


@api_view(["POST"])
@permission_classes([IsAdmin])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_create_blog_post(request):
    """Create a new blog post."""
    data = request.data.copy()
    # Auto-generate slug from title
    if "slug" not in data or not data["slug"]:
        data["slug"] = slugify(data.get("title", ""))

    # Auto-set author
    if "author" not in data:
        data["author"] = str(request.user.pk)
    if "author_name" not in data:
        data["author_name"] = request.user.full_name

    # Auto-set published_at when publishing
    if data.get("is_published") in [True, "true", "True"] and not data.get("published_at"):
        data["published_at"] = timezone.now().isoformat()

    # Handle tags from JSON string
    import json
    if isinstance(data.get("tags"), str):
        try:
            data["tags"] = json.loads(data["tags"])
        except (json.JSONDecodeError, TypeError):
            pass

    serializer = AdminBlogPostSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAdmin])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def admin_blog_post_detail(request, post_id):
    """Get, update, or delete a blog post."""
    try:
        post = BlogPost.objects.get(pk=post_id)
    except BlogPost.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(AdminBlogPostSerializer(post).data)

    if request.method == "DELETE":
        # Clean up image file
        if post.featured_image:
            if os.path.isfile(post.featured_image.path):
                os.remove(post.featured_image.path)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH
    data = request.data.copy()

    # Auto-set published_at on first publish
    if data.get("is_published") in [True, "true", "True"] and not post.published_at:
        data["published_at"] = timezone.now().isoformat()

    import json
    if isinstance(data.get("tags"), str):
        try:
            data["tags"] = json.loads(data["tags"])
        except (json.JSONDecodeError, TypeError):
            pass

    serializer = AdminBlogPostSerializer(post, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdmin])
@parser_classes([MultiPartParser, FormParser])
def admin_upload_blog_image(request):
    """Upload an inline image for blog content. Returns the URL."""
    image = request.FILES.get("image")
    if not image:
        return Response({"detail": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

    from django.core.files.storage import default_storage
    path = default_storage.save(f"blog/inline/{image.name}", image)
    url = default_storage.url(path)
    return Response({"url": url}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_toggle_blog_post(request, post_id):
    """Toggle published state of a blog post."""
    try:
        post = BlogPost.objects.get(pk=post_id)
    except BlogPost.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    post.is_published = not post.is_published
    if post.is_published and not post.published_at:
        post.published_at = timezone.now()
    post.save()
    return Response({"is_published": post.is_published})
