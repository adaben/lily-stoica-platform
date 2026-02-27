import { useState } from "react";
import { apiSubmitLeadMagnet } from "@/lib/api";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function LeadMagnetForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Please confirm you are happy to receive emails.");
      return;
    }
    setLoading(true);
    try {
      await apiSubmitLeadMagnet({ email, first_name: firstName, consent });
      setSubmitted(true);
      toast.success("Check your inbox for the recording.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">Thank you, {firstName}.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your free recording is on its way to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <div>
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 rounded border-border text-primary focus:ring-primary/30"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree to receive the free recording and occasional updates from Lily Stoica.
          You can unsubscribe at any time.
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Send Me the Recording
      </button>
    </form>
  );
}
