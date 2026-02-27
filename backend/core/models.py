"""
Core models for the LiLy Stoica platform.
Email-based custom User, booking system, blog, events, testimonials,
lead magnet, AI usage, video rooms, system configuration.
"""
import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class UserManager(BaseUserManager):
    """Custom user manager using email as the unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("An email address is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user with email-based authentication."""

    ROLE_CHOICES = [
        ("client", "Client"),
        ("admin", "Admin"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30, blank=True, default="")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="client")
    concerns = models.TextField(blank=True, default="", help_text="Initial concerns or goals shared at registration.")
    how_heard = models.CharField(max_length=200, blank=True, default="")

    # GDPR consent
    consent_data = models.BooleanField(default=False)
    consent_terms = models.BooleanField(default=False)
    consent_date = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


# ---------------------------------------------------------------------------
# Booking system
# ---------------------------------------------------------------------------
class BookingSlot(models.Model):
    """An available time slot created by the admin."""

    SESSION_TYPE_CHOICES = [
        ("discovery", "Discovery call"),
        ("standard", "Standard session"),
        ("intensive", "Intensive session"),
    ]

    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES, default="standard")
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.date} {self.start_time}-{self.end_time} ({self.session_type})"


class Booking(models.Model):
    """A client booking for a specific slot."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    slot = models.ForeignKey(BookingSlot, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")
    session_type = models.CharField(max_length=20, default="standard")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True, default="")
    video_room_id = models.CharField(max_length=100, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.pk} - {self.client.full_name} ({self.status})"

    @property
    def client_name(self):
        return self.client.full_name


# ---------------------------------------------------------------------------
# Testimonials
# ---------------------------------------------------------------------------
class Testimonial(models.Model):
    """Client testimonials displayed on the website."""

    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100, blank=True, default="", help_text="E.g. 'Client' or 'Workshop Attendee'")
    content = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.rating} stars"


# ---------------------------------------------------------------------------
# Blog
# ---------------------------------------------------------------------------
class BlogPost(models.Model):
    """Blog articles for the website."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    excerpt = models.TextField(blank=True, default="")
    content = models.TextField()
    featured_image = models.ImageField(upload_to="blog/featured/", blank=True, null=True)
    tags = models.JSONField(default=list, blank=True, help_text="List of tag strings")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="blog_posts"
    )
    author_name = models.CharField(max_length=100, default="LiLy Stoica")
    is_published = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False, help_text="Pin to top of blog listing")
    view_count = models.PositiveIntegerField(default=0)
    seo_title = models.CharField(max_length=300, blank=True, default="", help_text="Override browser tab title")
    seo_description = models.TextField(blank=True, default="", help_text="Override meta description")
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_pinned", "-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["-published_at"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["is_published", "-published_at"]),
        ]

    def __str__(self):
        return self.title

    @property
    def reading_time(self):
        """Estimate reading time in minutes based on ~200 words per minute."""
        import re
        word_count = len(re.findall(r"\w+", self.content))
        return max(1, round(word_count / 200))

    @property
    def featured_image_url(self):
        if self.featured_image:
            return self.featured_image.url
        return ""


# ---------------------------------------------------------------------------
# Resource Hub
# ---------------------------------------------------------------------------
class ResourceCategory(models.Model):
    """Categories for downloadable resources."""

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=50, blank=True, default="FileText", help_text="Lucide icon name")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "Resource categories"

    def __str__(self):
        return self.name


class Resource(models.Model):
    """Downloadable or linkable resource shared by Lily."""

    RESOURCE_TYPE_CHOICES = [
        ("pdf", "PDF Document"),
        ("audio", "Audio Recording"),
        ("video", "Video"),
        ("link", "External Link"),
        ("guide", "Written Guide"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField(blank=True, default="")
    category = models.ForeignKey(ResourceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="resources")
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES, default="guide")
    file = models.FileField(upload_to="resources/", blank=True, null=True)
    external_url = models.URLField(blank=True, default="")
    thumbnail = models.ImageField(upload_to="resources/thumbnails/", blank=True, null=True)
    content = models.TextField(blank=True, default="", help_text="Full content for written guides")
    is_published = models.BooleanField(default=True)
    is_premium = models.BooleanField(default=False, help_text="Require login to access")
    download_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------
class Event(models.Model):
    """Workshops, talks and events."""

    title = models.CharField(max_length=300)
    description = models.TextField()
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=300, blank=True, default="")
    is_online = models.BooleanField(default=False)
    ticket_url = models.URLField(blank=True, default="")
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_spots = models.PositiveIntegerField(default=0, help_text="0 = unlimited")
    spots_taken = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.title} - {self.date}"

    @property
    def spots_remaining(self):
        if self.max_spots == 0:
            return None
        return max(0, self.max_spots - self.spots_taken)


# ---------------------------------------------------------------------------
# Lead magnet
# ---------------------------------------------------------------------------
class LeadMagnetEntry(models.Model):
    """People who requested the free nervous system reset recording."""

    first_name = models.CharField(max_length=100)
    email = models.EmailField()
    consent = models.BooleanField(default=False)
    delivered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Lead magnet entries"

    def __str__(self):
        return f"{self.first_name} ({self.email})"


# ---------------------------------------------------------------------------
# Contact messages
# ---------------------------------------------------------------------------
class ContactMessage(models.Model):
    """Messages submitted via the contact form."""

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, default="")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Message from {self.name} ({self.created_at:%d/%m/%Y})"


# ---------------------------------------------------------------------------
# AI
# ---------------------------------------------------------------------------
class AIUsageLog(models.Model):
    """Tracks AI assistant usage per user or anonymous session."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="ai_usage"
    )
    session_id = models.CharField(max_length=100, blank=True, default="")
    prompt = models.TextField()
    response = models.TextField()
    tokens_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


# ---------------------------------------------------------------------------
# Video
# ---------------------------------------------------------------------------
class VideoRoomEvent(models.Model):
    """Audit trail for video session events."""

    EVENT_CHOICES = [
        ("joined", "Joined"),
        ("left", "Left"),
        ("reconnected", "Reconnected"),
    ]

    room_id = models.CharField(max_length=100)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="video_events"
    )
    event_type = models.CharField(max_length=20, choices=EVENT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class VideoSignal(models.Model):
    """HTTP-polling based WebRTC signalling messages."""

    room_id = models.CharField(max_length=100, db_index=True)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="signals_sent"
    )
    signal_type = models.CharField(max_length=30)
    payload = models.TextField()
    consumed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


# ---------------------------------------------------------------------------
# System configuration (singleton)
# ---------------------------------------------------------------------------
class SystemConfiguration(models.Model):
    """Singleton runtime settings for the platform."""

    # Email
    resend_api_key = models.CharField(max_length=200, blank=True, default="")
    email_from = models.EmailField(default="hello@lilystoica.com")
    email_test_mode = models.BooleanField(default=True, help_text="Redirect all emails to admin.")
    email_test_recipient = models.EmailField(blank=True, default="")

    # AI
    gemini_api_key = models.CharField(max_length=200, blank=True, default="")
    ai_enabled = models.BooleanField(default=False)
    ai_system_prompt = models.TextField(
        blank=True,
        default=(
            "You are Lily's virtual assistant on her neurocoaching and hypnotherapy website. "
            "Answer questions about services, booking, pricing and general wellbeing guidance. "
            "Be warm, professional and helpful. If someone describes a crisis, "
            "direct them to the Samaritans (116 123) or NHS 111. "
            "Do not provide medical diagnoses or treatment plans. "
            "Use British English throughout."
        ),
    )
    ai_max_tokens = models.PositiveIntegerField(default=512)

    # Feature flags
    blog_enabled = models.BooleanField(default=True)
    events_enabled = models.BooleanField(default=True)
    booking_enabled = models.BooleanField(default=True)
    lead_magnet_enabled = models.BooleanField(default=True)

    class Meta:
        verbose_name = "System configuration"
        verbose_name_plural = "System configuration"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "System configuration"
