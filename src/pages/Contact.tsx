import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AIAssistant from "@/components/AIAssistant";
import { AnimatedSection } from "@/components/AnimatedSection";
import { apiSubmitContact } from "@/lib/api";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiSubmitContact({ name, email, phone, message });
      setSent(true);
      toast.success("Message sent. I will get back to you shortly.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact | Calm Lily</title>
        <meta name="description" content="Get in touch with LiLy Stoica for neurocoaching, hypnotherapy or event enquiries." />
        <link rel="canonical" href="https://calm-lily.co.uk/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Calm Lily" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:title" content="Contact | Calm Lily" />
        <meta property="og:description" content="Get in touch with LiLy Stoica for neurocoaching, hypnotherapy or event enquiries." />
        <meta property="og:url" content="https://calm-lily.co.uk/contact" />
        <meta property="og:image" content="https://calm-lily.co.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact | Calm Lily" />
        <meta name="twitter:description" content="Get in touch with LiLy Stoica for neurocoaching, hypnotherapy or event enquiries." />
        <meta name="twitter:image" content="https://calm-lily.co.uk/og-image.png" />
      </Helmet>

      <SiteHeader />

      <section className="py-20 bg-gradient-to-br from-accent/30 via-white to-lily-blush/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl sm:text-5xl font-cormorant font-bold text-foreground mb-4 text-center">
              Get in Touch
            </h1>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Whether you have a question about services, want to discuss a
              partnership or simply want to say hello.
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Contact info */}
            <AnimatedSection variant="slideLeft" className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Balham, South West London, SW12
                    <br />
                    In-person sessions and online available
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Email</h3>
                  <a href="mailto:hello@lilystoica.co.uk" className="text-sm text-primary">
                    hello@lilystoica.co.uk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Phone</h3>
                  <p className="text-sm text-muted-foreground">By appointment only</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-accent/40 mt-6">
                <p className="text-sm text-foreground font-medium mb-2">Response time</p>
                <p className="text-sm text-muted-foreground">
                  I aim to respond to all enquiries within 24 hours. For
                  urgent matters, please book a discovery call directly.
                </p>
              </div>
            </AnimatedSection>

            {/* Form */}
            <AnimatedSection variant="slideRight" className="lg:col-span-3">
              {sent ? (
                <div className="bg-white rounded-2xl border border-border/60 p-10 text-center">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-cormorant font-bold text-foreground mb-2">
                    Message Sent
                  </h2>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. I will be in touch shortly.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl border border-border/60 p-6 space-y-4"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Message
                  </button>
                </form>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>

      <SiteFooter />
      <AIAssistant />
    </>
  );
}
