import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AIAssistant from "@/components/AIAssistant";
import { useAuth } from "@/hooks/useAuth";
import { apiGetAvailableSlots, apiCreateBooking, type BookingSlot } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";

const sessionTypes = [
  { value: "discovery", label: "Free Discovery Call", duration: "20 min", price: "Free" },
  { value: "standard", label: "Standard Session", duration: "60 min", price: "From £75" },
  { value: "intensive", label: "Intensive Session", duration: "90 min", price: "From £120" },
];

export default function BookSession() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("discovery");
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const { data: slots, isLoading } = useQuery({
    queryKey: ["slots", selectedType],
    queryFn: () => apiGetAvailableSlots(selectedType),
  });

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate("/register", {
        state: {
          pendingBooking: selectedSlot
            ? { slotId: selectedSlot.id, sessionType: selectedType, notes }
            : undefined,
        },
      });
      return;
    }
    if (!selectedSlot) return;
    setBooking(true);
    try {
      await apiCreateBooking(selectedSlot.id, selectedType, notes);
      setBooked(true);
      toast.success("Your session has been booked. Check your email for confirmation.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-cormorant font-bold text-foreground mb-2">
              Session Booked
            </h1>
            <p className="text-muted-foreground mb-6">
              You will receive a confirmation email shortly with details of your
              upcoming session. If you booked an online session, a secure video
              link will be sent before your appointment.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              View My Sessions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Book a Session | Calm Lily</title>
        <meta
          name="description"
          content="Book a free discovery call or schedule a neurocoaching, hypnotherapy or addiction recovery session with Lily Stoica."
        />
      </Helmet>

      <SiteHeader />

      <section className="py-20 bg-gradient-to-br from-accent/30 via-white to-lily-blush/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-cormorant font-bold text-foreground mb-2 text-center">
            Book a Session
          </h1>
          <p className="text-center text-muted-foreground mb-10">
            Choose your session type and select an available time.
          </p>

          {/* Session type selector */}
          <div className="grid sm:grid-cols-3 gap-3 mb-10">
            {sessionTypes.map((st) => (
              <button
                key={st.value}
                onClick={() => { setSelectedType(st.value); setSelectedSlot(null); }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedType === st.value
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 bg-white hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-medium text-foreground">{st.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{st.duration}</p>
                <p className="text-lg font-cormorant font-bold text-primary mt-2">{st.price}</p>
              </button>
            ))}
          </div>

          {/* Available slots */}
          <div className="bg-white rounded-2xl border border-border/60 p-6">
            <h2 className="text-xl font-cormorant font-bold text-foreground mb-4">
              Available Times
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : slots && slots.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    disabled={!slot.is_available}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      selectedSlot?.id === slot.id
                        ? "border-primary bg-primary/5"
                        : slot.is_available
                        ? "border-border/60 hover:border-primary/30"
                        : "border-border/30 opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(slot.date), "EEEE d MMMM")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {slot.start_time} - {slot.end_time}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No available slots at the moment. Please check back soon or contact me directly.
              </p>
            )}

            {/* Notes */}
            {selectedSlot && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Anything you would like me to know? (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder="Brief description of what you would like support with..."
                  />
                </div>

                {!isAuthenticated && (
                  <p className="text-sm text-muted-foreground bg-accent/40 p-3 rounded-lg">
                    You will need to create a free account to complete your booking.
                  </p>
                )}

                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  {isAuthenticated ? "Confirm Booking" : "Create Account and Book"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
      <AIAssistant />
    </>
  );
}
