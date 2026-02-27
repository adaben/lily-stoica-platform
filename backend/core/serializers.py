"""Serializers for the LiLy Stoica platform."""
import html
import bleach
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from .models import (
    BookingSlot, Booking, Testimonial, BlogPost, Event,
    LeadMagnetEntry, ContactMessage, AIUsageLog, VideoRoomEvent,
    VideoSignal, SystemConfiguration, ResourceCategory, Resource,
)

User = get_user_model()

ALLOWED_TAGS = ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"]


def _clean(value: str) -> str:
    """Sanitise user-provided text."""
    if not value:
        return value
    return html.unescape(bleach.clean(value, tags=ALLOWED_TAGS, strip=True))


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    consent_data = serializers.BooleanField(required=True)
    consent_terms = serializers.BooleanField(required=True)

    class Meta:
        model = User
        fields = [
            "email", "password", "first_name", "last_name",
            "phone", "concerns", "how_heard",
            "consent_data", "consent_terms",
        ]

    def validate_consent_data(self, value):
        if not value:
            raise serializers.ValidationError("You must consent to data processing.")
        return value

    def validate_consent_terms(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the terms of use.")
        return value

    def validate_concerns(self, value):
        return _clean(value)

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data["consent_date"] = timezone.now()
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "phone",
            "role", "concerns", "how_heard", "date_joined",
        ]
        read_only_fields = ["id", "email", "role", "date_joined"]


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]


# ---------------------------------------------------------------------------
# Bookings
# ---------------------------------------------------------------------------
class BookingSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingSlot
        fields = "__all__"


class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField()
    slot = BookingSlotSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "client", "client_name", "slot", "session_type",
            "status", "notes", "video_room_id", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "client", "client_name", "status", "video_room_id", "created_at", "updated_at"]


class CreateBookingSerializer(serializers.Serializer):
    slot_id = serializers.IntegerField()
    session_type = serializers.ChoiceField(choices=["discovery", "standard", "intensive"])
    notes = serializers.CharField(required=False, default="", allow_blank=True)

    def validate_slot_id(self, value):
        try:
            slot = BookingSlot.objects.get(pk=value, is_available=True)
        except BookingSlot.DoesNotExist:
            raise serializers.ValidationError("This slot is no longer available.")
        return value

    def validate_notes(self, value):
        return _clean(value)


# ---------------------------------------------------------------------------
# Testimonials
# ---------------------------------------------------------------------------
class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"


# ---------------------------------------------------------------------------
# Blog
# ---------------------------------------------------------------------------
class BlogPostListSerializer(serializers.ModelSerializer):
    reading_time = serializers.ReadOnlyField()
    featured_image_url = serializers.ReadOnlyField()

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt", "featured_image_url",
            "tags", "author_name", "is_pinned", "view_count",
            "reading_time", "published_at", "created_at",
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    reading_time = serializers.ReadOnlyField()
    featured_image_url = serializers.ReadOnlyField()

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt", "content",
            "featured_image_url", "tags", "author_name",
            "is_published", "is_pinned", "view_count", "reading_time",
            "seo_title", "seo_description",
            "published_at", "created_at", "updated_at",
        ]


class AdminBlogPostSerializer(serializers.ModelSerializer):
    reading_time = serializers.ReadOnlyField()
    featured_image_url = serializers.ReadOnlyField()

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt", "content",
            "featured_image", "featured_image_url", "tags",
            "author", "author_name", "is_published", "is_pinned",
            "view_count", "reading_time",
            "seo_title", "seo_description",
            "published_at", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "view_count", "reading_time", "created_at", "updated_at"]

    def validate_title(self, value):
        return _clean(value)

    def validate_excerpt(self, value):
        return _clean(value)


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------
class EventSerializer(serializers.ModelSerializer):
    spots_remaining = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = "__all__"


# ---------------------------------------------------------------------------
# Lead magnet
# ---------------------------------------------------------------------------
class LeadMagnetSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadMagnetEntry
        fields = ["first_name", "email", "consent"]

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("You must consent to receive the resource.")
        return value


# ---------------------------------------------------------------------------
# Contact
# ---------------------------------------------------------------------------
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["name", "email", "phone", "message"]

    def validate_message(self, value):
        return _clean(value)


# ---------------------------------------------------------------------------
# AI
# ---------------------------------------------------------------------------
class AIChatSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000)
    conversation_id = serializers.CharField(required=False, default="", allow_blank=True)


class AIUsageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIUsageLog
        fields = ["id", "prompt", "response", "tokens_used", "created_at"]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Video
# ---------------------------------------------------------------------------
class VideoSignalSendSerializer(serializers.Serializer):
    type = serializers.CharField(max_length=30)
    payload = serializers.CharField()


class VideoSignalSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoSignal
        fields = ["id", "signal_type", "payload", "created_at"]


class VideoRoomEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoRoomEvent
        fields = "__all__"


# ---------------------------------------------------------------------------
# System configuration
# ---------------------------------------------------------------------------
class SystemConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfiguration
        fields = "__all__"
        read_only_fields = ["id"]


# ---------------------------------------------------------------------------
# Resources
# ---------------------------------------------------------------------------
class ResourceCategorySerializer(serializers.ModelSerializer):
    resource_count = serializers.SerializerMethodField()

    class Meta:
        model = ResourceCategory
        fields = ["id", "name", "slug", "description", "icon", "order", "resource_count"]

    def get_resource_count(self, obj):
        return obj.resources.filter(is_published=True).count()


class ResourceSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            "id", "title", "slug", "description", "category", "category_name",
            "resource_type", "file", "external_url", "thumbnail",
            "content", "is_published", "is_premium", "download_count",
            "created_at", "updated_at",
        ]

    def get_category_name(self, obj):
        return obj.category.name if obj.category else ""


class AdminResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = "__all__"
        read_only_fields = ["id", "download_count", "created_at", "updated_at"]
