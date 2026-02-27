import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Brain } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/25 group-hover:to-primary/10 transition-all shadow-sm">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="leading-tight">
              <span className="block text-xl font-cormorant font-bold text-foreground tracking-wide">
                Calm Lily
              </span>
              <span className="block text-[9px] font-inter text-muted-foreground uppercase tracking-[0.25em]">
                by LiLy Stoica
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA / auth */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === "admin" ? "/admin" : "/dashboard"}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {user?.role === "admin" ? "Admin" : "My Sessions"}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link
              to="/book"
              className="inline-flex items-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors shadow-sm"
            >
              Book a Session
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t">
            <nav className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                    location.pathname === link.href
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t mt-2 pt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={user?.role === "admin" ? "/admin" : "/dashboard"}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 text-sm font-medium text-foreground"
                    >
                      {user?.role === "admin" ? "Admin" : "My Sessions"}
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="px-3 py-2.5 text-sm text-left text-muted-foreground"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-foreground"
                  >
                    Sign in
                  </Link>
                )}
                <Link
                  to="/book"
                  onClick={() => setMobileOpen(false)}
                  className="mx-3 text-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full"
                >
                  Book a Session
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
