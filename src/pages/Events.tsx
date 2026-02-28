import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, ExternalLink, Loader2, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AIAssistant from "@/components/AIAssistant";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { apiGetEvents, type Event } from "@/lib/api";

export default function Events() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: apiGetEvents,
  });

  return (
    <>
      <Helmet>
        <title>Events and Workshops | Calm Lily</title>
        <meta
          name="description"
          content="In-person workshops and events in Balham, South West London. Feed Your Brain, Free Your Brain and more."
        />
      </Helmet>

      <SiteHeader />

      <section className="py-20 bg-gradient-to-br from-accent/30 via-white to-lily-blush/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h1 className="text-4xl sm:text-5xl font-cormorant font-bold text-foreground mb-4">
              Events and Workshops
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              In-person gatherings in Balham, South West London. Practical,
              science-led sessions designed for real people with real challenges.
              Concessions available.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : events && events.length > 0 ? (
            <StaggerContainer className="space-y-6">
              {events.map((event: Event) => (
                <StaggerItem
                  key={event.id}
                  className="rounded-2xl border border-border/60 bg-card p-6 hover:shadow-card-hover transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-cormorant font-bold text-foreground mb-2">
                        {event.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary" />
                          {new Date(event.date).toLocaleDateString("en-GB", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary" />
                          {event.start_time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-primary" />
                          {event.location}
                        </span>
                        {event.spots_remaining != null && event.spots_remaining > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-primary" />
                            {event.spots_remaining} spots remaining
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-cormorant font-bold text-primary mb-3">
                        {event.price}
                      </p>
                      <a
                        href={event.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
                      >
                        Book Tickets
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No upcoming events at the moment. Follow me on LinkedIn to stay updated.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Recurring events */}
      <section className="py-16 bg-accent/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-cormorant font-bold text-foreground mb-8 text-center">
              Recurring Event Series
            </h2>
          </AnimatedSection>
          <StaggerContainer className="grid md:grid-cols-2 gap-6">
            <StaggerItem className="bg-white rounded-2xl p-6 border border-border/60">
              <h3 className="text-xl font-cormorant font-bold text-foreground mb-2">
                Feed Your Brain
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Nervous system and metabolism reset for stress, fatigue and focus.
                Includes somatic practices, mindful eating exercises, guided
                relaxation and metabolic weight reset hypnotherapy. Attendees
                receive recordings enhanced with binaural beats to continue the
                work at home.
              </p>
              <p className="text-xs text-muted-foreground">
                Balham, SW12 | Monthly | Concessions available
              </p>
            </StaggerItem>
            <StaggerItem className="bg-white rounded-2xl p-6 border border-border/60">
              <h3 className="text-xl font-cormorant font-bold text-foreground mb-2">
                Free Your Brain: Lifeguard for Addictions
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                A practical, in-person workshop to reduce cravings, break habit
                loops, understand the brain science behind addiction and learn
                tools you can use immediately. Covers alcohol, sugar, screen
                dependency and behavioural patterns.
              </p>
              <p className="text-xs text-muted-foreground">
                Balham, SW12 | Quarterly | Concessions available
              </p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <SiteFooter />
      <AIAssistant />
    </>
  );
}
