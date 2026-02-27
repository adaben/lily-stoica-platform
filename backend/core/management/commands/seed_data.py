"""Seed demo data for the LiLy Stoica platform."""
import logging
from datetime import date, time, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from core.models import (
    BookingSlot, Testimonial, BlogPost, Event, SystemConfiguration,
    ResourceCategory, Resource,
)

logger = logging.getLogger("core")
User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with demo data for development."

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # Admin user
        admin_user = None
        if not User.objects.filter(email="lily@lilystoica.com").exists():
            admin_user = User.objects.create_superuser(
                email="lily@lilystoica.com",
                password="admin1234",
                first_name="LiLy",
                last_name="Stoica",
            )
            self.stdout.write(self.style.SUCCESS("  Created admin user: lily@lilystoica.com"))
        else:
            admin_user = User.objects.get(email="lily@lilystoica.com")

        # Demo client
        if not User.objects.filter(email="client@example.com").exists():
            User.objects.create_user(
                email="client@example.com",
                password="client1234",
                first_name="Jane",
                last_name="Doe",
                role="client",
                consent_data=True,
                consent_terms=True,
            )
            self.stdout.write(self.style.SUCCESS("  Created demo client: client@example.com"))

        # Booking slots (next 2 weeks)
        if not BookingSlot.objects.exists():
            today = date.today()
            for i in range(1, 15):
                d = today + timedelta(days=i)
                if d.weekday() < 5:  # weekdays only
                    BookingSlot.objects.create(
                        date=d, start_time=time(10, 0), end_time=time(11, 0),
                        session_type="standard",
                    )
                    BookingSlot.objects.create(
                        date=d, start_time=time(14, 0), end_time=time(15, 0),
                        session_type="standard",
                    )
                    BookingSlot.objects.create(
                        date=d, start_time=time(11, 0), end_time=time(11, 30),
                        session_type="discovery",
                    )
            self.stdout.write(self.style.SUCCESS("  Created booking slots"))

        # Testimonials
        if not Testimonial.objects.exists():
            testimonials = [
                {
                    "name": "Alex M.",
                    "role": "Neurocoaching Client",
                    "content": "Working with Lily completely changed how I respond to stress. After just a few sessions, I felt more grounded and in control than I had in years.",
                    "rating": 5,
                    "is_featured": True,
                },
                {
                    "name": "James R.",
                    "role": "Hypnotherapy Client",
                    "content": "I was sceptical about hypnotherapy at first, but Lily made me feel safe from the very first session. The results have been remarkable for my anxiety.",
                    "rating": 5,
                    "is_featured": True,
                },
                {
                    "name": "Sarah K.",
                    "role": "Workshop Attendee",
                    "content": "The Feed Your Brain workshop was incredibly insightful. Lily has a genuine gift for making complex neuroscience accessible and practical.",
                    "rating": 5,
                    "is_featured": True,
                },
            ]
            for t in testimonials:
                Testimonial.objects.create(**t)
            self.stdout.write(self.style.SUCCESS("  Created testimonials"))

        # Blog posts
        if not BlogPost.objects.exists():
            from django.utils import timezone
            BlogPost.objects.create(
                title="Understanding your nervous system: a beginner's guide",
                slug="understanding-your-nervous-system",
                excerpt="Your nervous system influences everything from your mood to your digestion. Here is what you need to know.",
                content="<p>The nervous system is one of the most fascinating and complex systems in the human body. Understanding how it works can transform how you manage stress, build resilience and navigate daily challenges.</p><p>In this guide, we explore the basics of the autonomic nervous system, the difference between the sympathetic (fight or flight) and parasympathetic (rest and digest) branches, and practical techniques you can use today to support regulation.</p><h2>The autonomic nervous system</h2><p>Your autonomic nervous system operates largely outside conscious control, regulating vital functions such as heart rate, digestion and breathing. It has two main branches: the sympathetic nervous system, which activates the body's fight-or-flight response, and the parasympathetic nervous system, which promotes rest, recovery and calm.</p><p>When these two branches are balanced, we feel grounded, present and able to respond flexibly to life's challenges. When they are out of balance, we may experience chronic stress, anxiety or a sense of being permanently on edge.</p><h2>Simple techniques for daily regulation</h2><p>There are several evidence-based techniques you can practise daily to support nervous system regulation:</p><ul><li><strong>Diaphragmatic breathing:</strong> Slow, deep breaths that engage the diaphragm activate the parasympathetic response.</li><li><strong>Cold exposure:</strong> Brief cold showers stimulate the vagus nerve and build stress resilience.</li><li><strong>Grounding exercises:</strong> The 5-4-3-2-1 method uses your senses to bring you back to the present moment.</li></ul>",
                author=admin_user,
                author_name="LiLy Stoica",
                tags=["neuroscience", "nervous system", "wellbeing", "beginners"],
                is_published=True,
                is_pinned=True,
                seo_title="Understanding Your Nervous System | Beginner's Guide to ANS",
                seo_description="Learn how your autonomic nervous system works and discover practical daily techniques for stress management and nervous system regulation.",
                published_at=timezone.now(),
            )
            BlogPost.objects.create(
                title="Five signs your nervous system needs attention",
                slug="five-signs-nervous-system-needs-attention",
                excerpt="Chronic fatigue, brain fog and irritability could be signs your nervous system is dysregulated.",
                content="<p>Many of us live in a state of chronic stress without even realising it. Here are five common signs that your nervous system may need some support.</p><h2>1. Chronic fatigue</h2><p>If you feel exhausted despite getting enough sleep, your body may be stuck in a state of sympathetic overdrive.</p><h2>2. Brain fog</h2><p>Difficulty concentrating, poor memory and mental cloudiness are classic signs of nervous system dysregulation.</p><h2>3. Irritability and emotional reactivity</h2><p>When your nervous system is overwhelmed, even small triggers can provoke outsized emotional responses.</p><h2>4. Digestive issues</h2><p>The gut-brain connection means that chronic stress directly impacts digestion, leading to bloating, IBS and other issues.</p><h2>5. Sleep disturbances</h2><p>Difficulty falling or staying asleep often indicates that your nervous system is struggling to shift into rest mode.</p>",
                author=admin_user,
                author_name="LiLy Stoica",
                tags=["nervous system", "stress", "mental health", "self-awareness"],
                is_published=True,
                seo_title="5 Signs Your Nervous System Needs Attention",
                seo_description="Chronic fatigue, brain fog and irritability could be signs of nervous system dysregulation. Learn to recognise the warning signs.",
                published_at=timezone.now() - timedelta(days=7),
            )
            BlogPost.objects.create(
                title="The neuroscience of addiction: what your brain is really doing",
                slug="neuroscience-of-addiction",
                excerpt="Addiction is not a moral failing. It is a complex brain condition involving dopamine, stress circuits and learned behaviour patterns.",
                content="<p>For decades, addiction was viewed through a moral lens. Modern neuroscience tells a very different story. Addiction involves profound changes in the brain's reward, motivation and memory circuits.</p><h2>The dopamine connection</h2><p>Dopamine is often called the 'pleasure chemical', but it is more accurately described as a molecule of motivation and anticipation. Addictive substances and behaviours hijack this system, creating powerful urges that override rational decision-making.</p><h2>Stress and the HPA axis</h2><p>Chronic stress activates the hypothalamic-pituitary-adrenal (HPA) axis, flooding the body with cortisol. This creates a feedback loop where substances or behaviours are used to manage the very stress they perpetuate.</p><h2>Hope and neuroplasticity</h2><p>The brain's remarkable ability to change, known as neuroplasticity, means that recovery is always possible. Through targeted interventions including hypnotherapy, neurocoaching and lifestyle changes, new neural pathways can be strengthened while old patterns weaken.</p>",
                author=admin_user,
                author_name="LiLy Stoica",
                tags=["addiction", "neuroscience", "recovery", "dopamine"],
                is_published=True,
                seo_title="The Neuroscience of Addiction | Understanding Your Brain",
                seo_description="Discover the neuroscience behind addiction, including the role of dopamine, stress and neuroplasticity in recovery.",
                published_at=timezone.now() - timedelta(days=14),
            )
            self.stdout.write(self.style.SUCCESS("  Created blog posts"))

        # Events – including real Panda's Coffee House event
        if not Event.objects.exists():
            Event.objects.create(
                title="Free your BRAIN - Lifeguard for Addictions",
                description=(
                    "Join Calm Lily Ltd for this free, compassionate workshop exploring the "
                    "neuroscience of addiction and practical strategies for recovery. "
                    "Whether you are personally affected or supporting someone who is, "
                    "this session offers evidence-based insights in a safe, non-judgemental "
                    "environment.\n\n"
                    "Light refreshments will be available at the venue."
                ),
                date=date(2026, 3, 7),  # Saturday 7 March 2026
                start_time=time(10, 30),
                end_time=time(12, 30),
                location="Panda's Coffee House, 84 Balham High Road, London SW12 9AG",
                is_online=False,
                ticket_url="https://www.eventbrite.co.uk/e/free-your-brain-lifeguard-for-addictions-tickets-1234567890",
                price=0,
                max_spots=25,
                is_published=True,
            )
            Event.objects.create(
                title="Feed Your Brain: Nutrition for Neurological Health",
                description=(
                    "Explore the connection between what you eat and how your brain functions. "
                    "Practical tips and evidence-based guidance for optimising your diet for "
                    "mental clarity and emotional balance."
                ),
                date=date(2026, 4, 18),
                start_time=time(18, 30),
                end_time=time(20, 0),
                location="Balham Library, London SW12",
                is_online=False,
                price=15,
                max_spots=20,
                is_published=True,
            )
            self.stdout.write(self.style.SUCCESS("  Created events"))

        # Resource categories and demo resources
        if not ResourceCategory.objects.exists():
            cat_guides = ResourceCategory.objects.create(
                name="Guides", slug="guides",
                description="Written guides and worksheets for self-study.",
                icon="BookOpen", order=1,
            )
            cat_audio = ResourceCategory.objects.create(
                name="Audio Recordings", slug="audio-recordings",
                description="Guided relaxation, hypnotherapy recordings and meditations.",
                icon="Headphones", order=2,
            )
            cat_tools = ResourceCategory.objects.create(
                name="Tools and Exercises", slug="tools-exercises",
                description="Practical exercises for nervous system regulation.",
                icon="FileText", order=3,
            )

            Resource.objects.create(
                title="Nervous System Reset: A 10-Minute Daily Practice",
                slug="nervous-system-reset",
                description="A simple but powerful 10-minute daily practice combining breathing, grounding and gentle movement to support nervous system regulation.",
                category=cat_guides,
                resource_type="guide",
                content="<h2>Your daily reset</h2><p>This practice can be done anywhere, at any time. All you need is ten minutes and a willingness to pause.</p><h3>Step 1: Grounding (2 minutes)</h3><p>Feel your feet on the floor. Notice five things you can see, four you can hear, three you can touch.</p><h3>Step 2: Breathing (5 minutes)</h3><p>Inhale for 4 counts, hold for 4, exhale for 6. The longer exhale activates your parasympathetic response.</p><h3>Step 3: Gentle movement (3 minutes)</h3><p>Slowly roll your head, stretch your arms overhead, and gently twist your torso from side to side.</p>",
                is_published=True,
            )
            Resource.objects.create(
                title="Understanding Your Stress Response (PDF Worksheet)",
                slug="stress-response-worksheet",
                description="A downloadable worksheet to help you identify your personal stress triggers and develop a personalised regulation toolkit.",
                category=cat_tools,
                resource_type="pdf",
                is_published=True,
            )
            Resource.objects.create(
                title="Guided Body Scan Relaxation",
                slug="guided-body-scan",
                description="A calming 15-minute guided body scan recording led by Lily to help release tension and promote deep relaxation.",
                category=cat_audio,
                resource_type="audio",
                is_published=True,
            )
            self.stdout.write(self.style.SUCCESS("  Created resource categories and resources"))

        # System config
        config = SystemConfiguration.load()
        if not config.resend_api_key:
            config.resend_api_key = "re_H8VLx8Ns_6ZwRYxLRCqtL6B8BLXHBixJN"
            config.email_test_mode = True
            config.email_test_recipient = "adaben@protonmail.com"
            config.email_from = "betatest-lily@perennix.io"
            config.save()
        self.stdout.write(self.style.SUCCESS("  System configuration initialised"))

        self.stdout.write(self.style.SUCCESS("Seed complete."))
