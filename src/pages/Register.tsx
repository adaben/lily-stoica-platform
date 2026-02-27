import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Brain } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    concerns: "",
    how_heard: "",
    consent_data: false,
    consent_terms: false,
  });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent_data || !form.consent_terms) {
      toast.error("Please confirm both consent boxes.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created successfully.");
      navigate("/dashboard");
    } catch {
      toast.error("Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account | Calm Lily</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/30 via-white to-lily-blush/20 px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-cormorant font-bold text-foreground">LiLy Stoica</span>
            </Link>
            <h1 className="text-3xl font-cormorant font-bold text-foreground">Create Your Account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Register to book sessions and manage your appointments
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border/60 p-6 shadow-card space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">First name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Last name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                What are you looking for help with? (optional)
              </label>
              <textarea
                value={form.concerns}
                onChange={(e) => update("concerns", e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Brief description of your main concerns..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                How did you hear about me? (optional)
              </label>
              <input
                type="text"
                value={form.how_heard}
                onChange={(e) => update("how_heard", e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. LinkedIn, event, referral"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consent_data}
                  onChange={(e) => update("consent_data", e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I consent to my personal data being processed for the purpose of providing coaching
                  and hypnotherapy services in accordance with the{" "}
                  <Link to="/privacy" className="text-primary" target="_blank">Privacy Policy</Link>.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consent_terms}
                  onChange={(e) => update("consent_terms", e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary" target="_blank">Terms of Use</Link>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
