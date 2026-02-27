import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  Loader2,
  XCircle,
  CheckCircle2,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  Sparkles,
  ArrowRight,
  FileText,
  Headphones,
  BookMarked,
} from "lucide-react";
import { format, isAfter } from "date-fns";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import {
  apiGetMyBookings,
  apiCancelBooking,
  apiGetBlogPosts,
  apiGetResources,
  apiGetEvents,
  type Booking,
  type BlogPost,
  type Resource,
  type Event,
} from "@/lib/api";

const statusColours: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

const resourceIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4" />,
  audio: <Headphones className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  guide: <BookMarked className="w-4 h-4" />,
  link: <ArrowRight className="w-4 h-4" />,
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: bookingsData, isLoading: bookingsLoading, refetch } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: apiGetMyBookings,
  });

  const { data: blogData } = useQuery({
    queryKey: ["dashboard-blog"],
    queryFn: () => apiGetBlogPosts(1),
  });

  const { data: resourcesData } = useQuery({
    queryKey: ["dashboard-resources"],
    queryFn: () => apiGetResources(),
  });

  const { data: eventsData } = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: apiGetEvents,
  });

  const bookings = bookingsData?.results || [];
  const upcomingBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const latestPosts: BlogPost[] = (blogData?.results || []).slice(0, 3);
  const latestResources: Resource[] = (resourcesData || []).slice(0, 4);
  const upcomingEvents: Event[] = (eventsData || [])
    .filter((e: Event) => e.is_active && isAfter(new Date(e.date), new Date()))
    .slice(0, 2);

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    try {
      await apiCancelBooking(id);
      toast.success("Session cancelled.");
      refetch();
    } catch {
      toast.error("Could not cancel. Please try again.");
    }
  };

  return (
    <>
      <Helmet>
        <title>My Space | Calm Lily</title>
      </Helmet>

      <SiteHeader />

      {/* ── Hero greeting ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/30 to-lily-blush/20 py-10 sm:py-14">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="text-sm text-primary font-medium">{getGreeting()}</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-cormorant font-bold text-foreground">
            Welcome back, {user?.first_name}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Your personal space to track sessions, explore resources and stay on top of your
            well-being journey.
          </p>
        </div>
      </section>

      {/* ── Stats grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Upcoming",
              value: upcomingBookings.length,
              icon: <CalendarClock className="w-5 h-5 text-amber-600" />,
              bg: "bg-amber-50 border-amber-200/60",
            },
            {
              label: "Completed",
              value: completedBookings.length,
              icon: <CalendarCheck className="w-5 h-5 text-green-600" />,
              bg: "bg-green-50 border-green-200/60",
            },
            {
              label: "Resources",
              value: (resourcesData || []).length,
              icon: <BookOpen className="w-5 h-5 text-violet-600" />,
              bg: "bg-violet-50 border-violet-200/60",
            },
            {
              label: "Blog Posts",
              value: blogData?.count || 0,
              icon: <FileText className="w-5 h-5 text-blue-600" />,
              bg: "bg-blue-50 border-blue-200/60",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl border p-4 flex flex-col items-center text-center shadow-sm ${s.bg}`}
            >
              <div className="mb-2">{s.icon}</div>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main content area ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* ── Upcoming sessions ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-cormorant font-bold text-foreground">Upcoming Sessions</h2>
            <Link
              to="/book"
              className="text-sm text-primary font-medium hover:text-primary/80 flex items-center gap-1"
            >
              Book new <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map((booking: Booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-border/60 p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-cormorant font-bold text-foreground capitalize">
                        {booking.session_type.replace("_", " ")} session
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColours[booking.status] || ""}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {booking.slot
                          ? format(new Date(booking.slot.date), "EEEE d MMMM yyyy")
                          : "TBC"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {booking.slot
                          ? `${booking.slot.start_time} – ${booking.slot.end_time}`
                          : "TBC"}
                      </span>
                    </div>
                    {booking.notes && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                        {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {booking.status === "confirmed" && booking.video_room_id && (
                      <Link
                        to={`/session/${booking.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </Link>
                    )}
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-border/60">
              <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4 text-sm">No upcoming sessions.</p>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
              >
                Book Your First Session
              </Link>
            </div>
          )}
        </div>

        {/* ── Two-column: Resources + Blog ── */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Resources */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-cormorant font-bold text-foreground">Resources</h2>
              <Link
                to="/resources"
                className="text-sm text-primary font-medium hover:text-primary/80 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {latestResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {latestResources.map((res) => (
                  <Link
                    key={res.id}
                    to={`/resources/${res.slug}`}
                    className="bg-white rounded-xl border border-border/60 p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                        {resourceIcons[res.resource_type] || <BookOpen className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
                        {res.resource_type}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {res.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {res.description}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border/60 p-6 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Resources coming soon.</p>
              </div>
            )}
          </div>

          {/* Latest blog */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-cormorant font-bold text-foreground">Latest Articles</h2>
              <Link
                to="/blog"
                className="text-sm text-primary font-medium hover:text-primary/80 flex items-center gap-1"
              >
                Read more <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {latestPosts.length > 0 ? (
              <div className="space-y-3">
                {latestPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="flex gap-4 bg-white rounded-xl border border-border/60 p-4 hover:shadow-md transition-shadow group"
                  >
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-2 inline-block">
                        {post.reading_time} min read
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border/60 p-6 text-center">
                <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No articles yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Upcoming events ── */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-cormorant font-bold text-foreground">Upcoming Events</h2>
              <Link
                to="/events"
                className="text-sm text-primary font-medium hover:text-primary/80 flex items-center gap-1"
              >
                All events <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-xl border border-border/60 p-5 shadow-sm"
                >
                  <h3 className="text-base font-cormorant font-bold text-foreground mb-1">
                    {evt.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {format(new Date(evt.date), "d MMM yyyy")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {evt.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {evt.description}
                  </p>
                  {evt.ticket_url && (
                    <a
                      href={evt.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary font-medium hover:text-primary/80"
                    >
                      Get tickets &rarr;
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Completed sessions ── */}
        {completedBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-cormorant font-bold text-foreground mb-4">
              Past Sessions
            </h2>
            <div className="space-y-3">
              {completedBookings.slice(0, 5).map((booking: Booking) => (
                <div
                  key={booking.id}
                  className="bg-white/70 rounded-xl border border-border/40 p-4 flex items-center gap-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {booking.session_type.replace("_", " ")} session
                    </span>
                    <span className="text-xs text-muted-foreground ml-3">
                      {booking.slot
                        ? format(new Date(booking.slot.date), "d MMM yyyy")
                        : ""}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">
                    completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className="flex flex-wrap gap-3 pt-2 pb-4">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
          >
            <CalendarClock className="w-4 h-4" />
            Book a Session
          </Link>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground text-sm font-medium rounded-full hover:bg-accent/50 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Browse Resources
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground text-sm font-medium rounded-full hover:bg-accent/50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Read Blog
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
