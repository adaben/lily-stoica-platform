"""Django admin configuration for the LiLy Stoica platform."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from import_export.admin import ImportExportModelAdmin

from .models import (
    User, BookingSlot, Booking, Testimonial, BlogPost, Event,
    LeadMagnetEntry, ContactMessage, AIUsageLog, VideoRoomEvent,
    VideoSignal, SystemConfiguration, ResourceCategory, Resource,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin, ImportExportModelAdmin):
    list_display = ("email", "first_name", "last_name", "role", "is_active", "date_joined")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal", {"fields": ("first_name", "last_name", "phone", "concerns", "how_heard")}),
        ("Role", {"fields": ("role",)}),
        ("Consent", {"fields": ("consent_data", "consent_terms", "consent_date")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "password1", "password2", "role"),
        }),
    )


@admin.register(BookingSlot)
class BookingSlotAdmin(ImportExportModelAdmin):
    list_display = ("date", "start_time", "end_time", "session_type", "is_available")
    list_filter = ("session_type", "is_available", "date")


@admin.register(Booking)
class BookingAdmin(ImportExportModelAdmin):
    list_display = ("id", "client", "session_type", "status", "created_at")
    list_filter = ("status", "session_type")
    search_fields = ("client__email", "client__first_name", "client__last_name")


@admin.register(Testimonial)
class TestimonialAdmin(ImportExportModelAdmin):
    list_display = ("name", "rating", "is_featured", "is_published", "created_at")
    list_filter = ("is_featured", "is_published")


@admin.register(BlogPost)
class BlogPostAdmin(ImportExportModelAdmin):
    list_display = ("title", "slug", "is_published", "is_pinned", "view_count", "published_at")
    list_filter = ("is_published", "is_pinned")
    search_fields = ("title", "content", "tags")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("view_count", "created_at", "updated_at")


@admin.register(Event)
class EventAdmin(ImportExportModelAdmin):
    list_display = ("title", "date", "start_time", "location", "is_online", "is_published")
    list_filter = ("is_online", "is_published")


@admin.register(LeadMagnetEntry)
class LeadMagnetEntryAdmin(ImportExportModelAdmin):
    list_display = ("first_name", "email", "delivered", "created_at")
    list_filter = ("delivered",)


@admin.register(ContactMessage)
class ContactMessageAdmin(ImportExportModelAdmin):
    list_display = ("name", "email", "is_read", "created_at")
    list_filter = ("is_read",)


@admin.register(AIUsageLog)
class AIUsageLogAdmin(admin.ModelAdmin):
    list_display = ("user", "tokens_used", "created_at")
    list_filter = ("created_at",)


@admin.register(VideoRoomEvent)
class VideoRoomEventAdmin(admin.ModelAdmin):
    list_display = ("room_id", "user", "event_type", "created_at")


@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = ("__str__", "ai_enabled", "email_test_mode")

    def has_add_permission(self, request):
        return not SystemConfiguration.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(ResourceCategory)
class ResourceCategoryAdmin(ImportExportModelAdmin):
    list_display = ("name", "slug", "order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Resource)
class ResourceAdmin(ImportExportModelAdmin):
    list_display = ("title", "resource_type", "category", "is_published", "is_premium", "download_count")
    list_filter = ("resource_type", "is_published", "is_premium", "category")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
