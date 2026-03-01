import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Shield, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiGetPublicSettings } from "@/lib/api";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [betaMode, setBetaMode] = useState(false);

  useEffect(() => {
    apiGetPublicSettings()
      .then((s) => setBetaMode(s.beta_mode))
      .catch(() => setBetaMode(false));
  }, []);

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.first_name}.`);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setLoading(true);
    try {
      const user = await login(quickEmail, quickPass);
      toast.success(`Welcome back, ${user.first_name}.`);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      toast.error("Could not auto-login with test credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In | Calm Lily</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/30 via-white to-lily-blush/20 px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <img
                src="/logo-transparent.png"
                alt="Calm Lily"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <h1 className="text-3xl font-cormorant font-bold text-foreground">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage your sessions</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border/60 p-6 shadow-card space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            No account yet?{" "}
            <Link to="/register" className="text-primary font-medium hover:text-primary/80">
              Create one here
            </Link>
          </p>

          {/* ── Quick Test Access (beta only) ── */}
          {betaMode && (
          <div className="mt-8">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
                Beta — Test Accounts
              </p>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mb-3">
              These quick-login cards will be disabled at official launch.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickLogin("lily@lilystoica.com", "admin1234")}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-border/60 bg-white hover:border-primary hover:shadow-lg transition-all group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wide">Admin</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Full Dashboard</span>
              </button>

              <button
                onClick={() => handleQuickLogin("client@example.com", "client1234")}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-border/60 bg-white hover:border-violet-400 hover:shadow-lg transition-all group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">Client</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Coachee Space</span>
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
