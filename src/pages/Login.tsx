import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Brain } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <Helmet>
        <title>Sign In | Calm Lily</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/30 via-white to-lily-blush/20 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-cormorant font-bold text-foreground">LiLy Stoica</span>
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
        </div>
      </div>
    </>
  );
}
