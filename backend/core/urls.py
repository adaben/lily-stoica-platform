"""URL routing for the core app."""
from django.urls import path
from .views import (
    health, auth, bookings, testimonials, blog, events,
    lead_magnet, contact, ai, video, settings, resources,
)

urlpatterns = [
    # Health
    path("", health.health_check, name="api-root"),
    path("health/", health.health_check, name="health-check"),

    # Auth
    path("auth/register/", auth.register, name="register"),
    path("auth/login/", auth.login, name="login"),
    path("auth/me/", auth.get_me, name="get-me"),
    path("auth/logout/", auth.logout, name="logout"),

    # Bookings (client)
    path("bookings/slots/", bookings.available_slots, name="available-slots"),
    path("bookings/create/", bookings.create_booking, name="create-booking"),
    path("bookings/mine/", bookings.my_bookings, name="my-bookings"),
    path("bookings/<int:booking_id>/cancel/", bookings.cancel_booking, name="cancel-booking"),

    # Bookings (admin)
    path("admin/bookings/", bookings.admin_all_bookings, name="admin-all-bookings"),
    path("admin/bookings/<int:booking_id>/confirm/", bookings.admin_confirm_booking, name="admin-confirm-booking"),
    path("admin/bookings/slots/create/", bookings.admin_create_slot, name="admin-create-slot"),

    # Testimonials
    path("testimonials/", testimonials.list_testimonials, name="list-testimonials"),

    # Blog (public)
    path("blog/", blog.list_blog_posts, name="list-blog-posts"),
    path("blog/tags/", blog.blog_tags, name="blog-tags"),
    path("blog/pinned/", blog.get_pinned_posts, name="pinned-blog-posts"),
    path("blog/<slug:slug>/", blog.get_blog_post, name="get-blog-post"),
    path("blog/<slug:slug>/og/", blog.blog_og_metadata, name="blog-og-metadata"),

    # Blog (admin)
    path("admin/blog/", blog.admin_list_blog_posts, name="admin-list-blog-posts"),
    path("admin/blog/create/", blog.admin_create_blog_post, name="admin-create-blog-post"),
    path("admin/blog/upload-image/", blog.admin_upload_blog_image, name="admin-upload-blog-image"),
    path("admin/blog/<uuid:post_id>/", blog.admin_blog_post_detail, name="admin-blog-post-detail"),
    path("admin/blog/<uuid:post_id>/toggle/", blog.admin_toggle_blog_post, name="admin-toggle-blog-post"),

    # Events (public)
    path("events/", events.list_events, name="list-events"),
    path("events/<int:event_id>/", events.get_event, name="get-event"),

    # Events (admin)
    path("admin/events/", events.admin_list_events, name="admin-list-events"),
    path("admin/events/create/", events.admin_create_event, name="admin-create-event"),
    path("admin/events/<int:event_id>/", events.admin_event_detail, name="admin-event-detail"),

    # Resources (public)
    path("resources/categories/", resources.list_resource_categories, name="list-resource-categories"),
    path("resources/", resources.list_resources, name="list-resources"),
    path("resources/<slug:slug>/", resources.get_resource, name="get-resource"),
    path("resources/<slug:slug>/download/", resources.track_resource_download, name="track-resource-download"),

    # Resources (admin)
    path("admin/resources/categories/", resources.admin_resource_categories, name="admin-resource-categories"),
    path("admin/resources/", resources.admin_resources, name="admin-resources"),
    path("admin/resources/<uuid:resource_id>/", resources.admin_resource_detail, name="admin-resource-detail"),

    # Lead magnet
    path("lead-magnet/", lead_magnet.submit_lead_magnet, name="submit-lead-magnet"),

    # Contact
    path("contact/", contact.submit_contact, name="submit-contact"),

    # AI
    path("ai/status/", ai.ai_status, name="ai-status"),
    path("ai/chat/", ai.ai_chat, name="ai-chat"),
    path("ai/test/", ai.test_gemini, name="test-gemini"),

    # Video
    path("video/room/<int:booking_id>/", video.get_video_room, name="get-video-room"),
    path("video/<str:room_id>/event/", video.log_video_event, name="log-video-event"),
    path("video/<str:room_id>/signal/send/", video.signal_send, name="signal-send"),
    path("video/<str:room_id>/signal/poll/", video.signal_poll, name="signal-poll"),

    # Settings (admin)
    path("settings/", settings.get_settings, name="get-settings"),
    path("settings/update/", settings.update_settings, name="update-settings"),
]
