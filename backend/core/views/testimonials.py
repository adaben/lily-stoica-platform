"""Testimonials views."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..models import Testimonial
from ..serializers import TestimonialSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def list_testimonials(request):
    """List published testimonials."""
    testimonials = Testimonial.objects.filter(is_published=True)
    featured = request.query_params.get("featured")
    if featured == "true":
        testimonials = testimonials.filter(is_featured=True)
    serializer = TestimonialSerializer(testimonials, many=True)
    return Response(serializer.data)
