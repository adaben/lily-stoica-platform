import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, Clock, Video, Loader2, XCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { apiGetMyBookings, apiCancelBooking, type Booking } from "@/lib/api";

const statusColours: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: apiGetMyBookings,
  });

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
        <title>My Sessions | Calm Lily</title>
      </Helmet>

      <SiteHeader />

      <section className="py-16 bg-accent/20 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-cormorant font-bold text-foreground mb-2">
            Welcome, {user?.first_name}
          </h1>
          <p className="text-muted-foreground mb-8">
            Manage your upcoming and past sessions below.
          </p>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : data?.results && data.results.length > 0 ? (
            <div className="space-y-4">
              {data.results.map((booking: Booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-border/60 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-cormorant font-bold text-foreground capitalize">
                        {booking.session_type.replace("_", " ")} session
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColours[booking.status] || ""}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {booking.slot ? format(new Date(booking.slot.date), "EEEE d MMMM yyyy") : "TBC"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {booking.slot ? `${booking.slot.start_time} - ${booking.slot.end_time}` : "TBC"}
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
                        Join Session
                      </Link>
                    )}
                    {(booking.status === "pending" || booking.status === "confirmed") && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                    {booking.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-border/60">
              <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No sessions yet.</p>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
              >
                Book Your First Session
              </Link>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
