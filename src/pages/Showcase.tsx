/**
 * Platform Showcase — Landscape PDF presentation for LiLy Stoica.
 *
 * Designed for the Digital Boost mentorship presentation.
 * Print → Save as PDF with "Landscape" orientation for best results.
 *
 * Authentication:
 *  - On mount, logs in as admin & client via /api/token/
 *  - Injects tokens into iframes via ?_st=TOKEN&_showcase=1
 */
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Loader2, Printer, Brain, Video, Bot,
  Shield, Users, Calendar, BookOpen, BarChart3, MessageSquare,
  Sparkles, Globe, Monitor, Layout, ChevronRight,
} from "lucide-react";

/* ── types ─────────────────────────────────────────────────────────────── */
interface DemoUser {
  role: string;
  email: string;
  password: string;
  colour: string;
  colourHex: string;
}

interface ShowcaseEntry {
  path: string;
  tab?: string;
  title: string;
  description: string;
  role: "public" | "admin" | "client";
  fullPage?: boolean;
  sectionLabel?: string;
  sectionIcon?: string;
}

/* ── config ────────────────────────────────────────────────────────────── */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ? "http://localhost:8000/api" : "/api");

const DEMO_USERS: DemoUser[] = [
  { role: "admin", email: "lily@lilystoica.com", password: "admin1234", colour: "bg-primary text-primary-foreground", colourHex: "#418F6C" },
  { role: "client", email: "client@example.com", password: "client1234", colour: "bg-secondary text-secondary-foreground", colourHex: "#D4937A" },
];

const PAGES: ShowcaseEntry[] = [
  /* ── Public Website ────────────────────────────────────────────────── */
  { sectionLabel: "Public Website", sectionIcon: "🌐", path: "/", title: "Homepage", description: "Landing page with hero, services overview, testimonials, AI assistant, and lead magnet form.", role: "public", fullPage: true },
  { path: "/about", title: "About LiLy", description: "Lily's story, qualifications (15+ certifications), career timeline, mission and values.", role: "public" },
  { path: "/services", title: "Services & Pricing", description: "Detailed service descriptions — Neurocoaching, Hypnotherapy, Addiction Recovery, Nervous System Reset, Stress & Burnout, Weight & Metabolism.", role: "public" },
  { path: "/book", title: "Book a Session", description: "Interactive booking flow — Discovery (free/20min), Standard (£75/60min), Intensive (£120/90min) with calendar slot selection.", role: "public" },
  { path: "/blog", title: "Blog", description: "Blog listing with search, tag filtering, and pagination. RSS-ready.", role: "public" },
  { path: "/events", title: "Events & Workshops", description: "Upcoming events and in-person workshops in Balham, South West London.", role: "public" },
  { path: "/resources", title: "Resource Library", description: "Categorised resources — PDFs, audio guides, videos, articles. Download tracking.", role: "public" },
  { path: "/contact", title: "Contact", description: "Contact form with phone, email, and enquiry submission.", role: "public" },

  /* ── Client Portal ─────────────────────────────────────────────────── */
  { sectionLabel: "Client Portal", sectionIcon: "👤", path: "/dashboard", title: "Client Dashboard", description: "Booking overview with status tracking (pending, confirmed, completed, cancelled), quick access to blog, resources and events.", role: "client" },
  { path: "/profile", title: "Client Profile", description: "Edit personal details, phone number, health concerns. Password management.", role: "client" },
  { path: "/progress", title: "Progress & Goals", description: "Goal setting and tracking, session notes review, progress visualisation with charts.", role: "client" },

  /* ── Admin Panel ───────────────────────────────────────────────────── */
  { sectionLabel: "Admin Panel", sectionIcon: "⚙️", path: "/admin", title: "Admin — Bookings", description: "View and manage all client bookings. Confirm, cancel, or complete sessions.", role: "admin" },
  { path: "/admin?tab=schedule", tab: "schedule", title: "Admin — Schedule", description: "Manage available time slots for each session type. Set recurring availability.", role: "admin" },
  { path: "/admin?tab=blog", tab: "blog", title: "Admin — Blog", description: "Create, edit, and publish blog posts with rich text, images, and tags.", role: "admin" },
  { path: "/admin?tab=events", tab: "events", title: "Admin — Events", description: "Create and manage events and workshops with dates, locations, and capacity.", role: "admin" },
  { path: "/admin?tab=resources", tab: "resources", title: "Admin — Resources", description: "Upload and manage client resources — PDFs, guides, audio, video. Category management.", role: "admin" },
  { path: "/admin?tab=settings", tab: "settings", title: "Admin — Settings", description: "Site configuration, Gemini AI integration test, platform settings.", role: "admin" },

  /* ── Video Conferencing ─────────────────────────────────────────────── */
  { sectionLabel: "Video Conferencing", sectionIcon: "📹", path: "", title: "Live Video Sessions", description: "WebRTC peer-to-peer video conferencing built into the platform. Camera/mic toggle, screen sharing, fullscreen mode, draggable PiP self-view, connection status indicators. Accessible directly from the dashboard for confirmed bookings.", role: "public" },

  /* ── AI Assistant ───────────────────────────────────────────────────── */
  { sectionLabel: "AI Assistant", sectionIcon: "🤖", path: "", title: "Gemini-Powered AI Chatbot", description: "Intelligent AI assistant trained exclusively on site content — services, pricing, qualifications, events. Rate-limited (5/min, 50/day). Admin-configurable system prompt, API key, and token limits. Accessible from every page via floating chat widget.", role: "public" },

  /* ── Legal ──────────────────────────────────────────────────────────── */
  { sectionLabel: "Legal & Compliance", sectionIcon: "📋", path: "/privacy", title: "Privacy Policy", description: "GDPR-compliant privacy policy covering data collection, processing, and user rights.", role: "public" },
  { path: "/terms", title: "Terms of Use", description: "Legal terms of service and acceptable use policy.", role: "public" },
];

/* ── component ─────────────────────────────────────────────────────────── */
export default function Showcase() {
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [authDone, setAuthDone] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  /* Auto-login each demo user */
  useEffect(() => {
    let cancelled = false;
    const loginAll = async () => {
      const results: Record<string, string> = {};
      for (let i = 0; i < DEMO_USERS.length; i++) {
        const u = DEMO_USERS[i];
        try {
          const res = await fetch(`${API_BASE}/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: u.email, password: u.password }),
          });
          if (res.ok) {
            const data = await res.json();
            results[u.role] = data.access;
          }
        } catch { /* skip */ }
      }
      if (!cancelled) {
        setTokens(results);
        setAuthDone(true);
      }
    };
    loginAll();
    return () => { cancelled = true; };
  }, []);

  /* Responsive scale */
  useEffect(() => {
    const measure = () => {
      if (wrapRef.current) {
        const w = wrapRef.current.offsetWidth;
        setScale(Math.min(w / 1400, 1));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const iframeUrl = (entry: ShowcaseEntry) => {
    if (!entry.path) return "";
    const token = entry.role === "admin" ? tokens.admin : entry.role === "client" ? tokens.client : "";
    const base = window.location.origin + entry.path;
    const sep = base.includes("?") ? "&" : "?";
    return token ? `${base}${sep}_st=${token}&_showcase=1` : `${base}${sep}_showcase=1`;
  };

  const roleBadge = (role: string) => {
    const u = DEMO_USERS.find(d => d.role === role);
    if (role === "public") return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-200 text-gray-700 uppercase tracking-wider">Public</span>;
    return <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${u?.colour || "bg-gray-300"}`}>{role}</span>;
  };

  const totalPages = PAGES.filter(p => p.sectionLabel).length + PAGES.length + 3; // sections + entries + cover + toc + closing

  return (
    <>
      <Helmet><title>Platform Showcase — LiLy Stoica</title></Helmet>

      <div ref={wrapRef} className="sc-wrap bg-white min-h-screen">

        {/* ── COVER PAGE ─────────────────────────────────────────────── */}
        <div className="sc-page sc-cover relative overflow-hidden flex flex-col items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg, #2D3340 0%, #418F6C 50%, #D4937A 100%)" }}>
          {/* Decorative circles */}
          <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-[-60px] right-[-100px] w-[350px] h-[350px] rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
            {/* Decorative top flourish */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-px bg-white/20" />
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/10">
                <img src="/logo-transparent.png" alt="Calm Lily" className="h-16 w-auto object-contain" />
              </div>
              <div className="w-20 h-px bg-white/20" />
            </div>

            <h1 className="text-6xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              LiLy Stoica
            </h1>
            <p className="text-2xl text-white/80 mb-1 font-light">Neurocoach &amp; Clinical Hypnotherapist</p>
            <p className="text-sm text-white/40 mb-10">CALM LILY LTD — Company No. 16832636</p>

            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="w-8 h-px bg-white/20" />
              <Sparkles className="w-4 h-4 text-white/30" />
              <div className="w-8 h-px bg-white/20" />
            </div>

            <h2 className="text-3xl font-semibold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Digital Platform Showcase</h2>
            <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              Complete coaching platform — website, booking system, client portal, admin panel, video conferencing &amp; resource library.
            </p>

            {/* Feature highlights instead of credentials */}
            <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto mb-12">
              {[
                { icon: Globe, label: "Website" },
                { icon: Calendar, label: "Bookings" },
                { icon: Users, label: "Client Portal" },
                { icon: Video, label: "Video Calls" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl px-3 py-4 border border-white/10">
                  <Icon className="w-5 h-5 text-white/70" />
                  <span className="text-[11px] text-white/50 font-medium">{label}</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-white/30 space-y-1">
              <p>Digital Boost Mentorship Programme</p>
              <p>28 February 2026</p>
            </div>
          </div>

          {/* Print button */}
          <button onClick={() => window.print()}
            className="no-print fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm rounded-lg transition-colors">
            <Printer className="w-4 h-4" /> Save as PDF
          </button>
        </div>

        {/* ── CONTEXT PAGE — Digital Boost ───────────────────────────── */}
        <div className="sc-page flex flex-col justify-center px-16 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-lily-charcoal" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Digital Boost Mentorship
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">The Project</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This platform was built as part of the <strong>Digital Boost</strong> mentorship programme, 
                  where experienced professionals volunteer their time to help small businesses with digital transformation.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong>Adam Benbrahim</strong> (Fractional CTO &amp; Software Architect) mentored 
                  <strong> LiLy Stoica</strong> (Neurocoach &amp; Hypnotherapist) to establish a complete 
                  online presence for her coaching practice, <em>CALM LILY LTD</em>.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The result is a fully custom, professional platform — designed, built, and deployed 
                  from scratch to serve Lily's clients and grow her practice.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Platform Highlights</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Globe, label: "Public Website", desc: "8 pages, SEO-ready" },
                    { icon: Calendar, label: "Booking System", desc: "3 session types, slots" },
                    { icon: Users, label: "Client Portal", desc: "Dashboard, progress, goals" },
                    { icon: Shield, label: "Admin Panel", desc: "6 management tabs" },
                    { icon: Video, label: "Video Calls", desc: "WebRTC peer-to-peer" },
                    { icon: BookOpen, label: "Resources", desc: "PDFs, audio, guides" },
                    { icon: BarChart3, label: "Analytics", desc: "Progress tracking" },
                    { icon: MessageSquare, label: "AI Assistant", desc: "Gemini-powered chat" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-2 bg-accent/50 rounded-lg p-2.5">
                      <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-lily-charcoal">{label}</p>
                        <p className="text-[10px] text-gray-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-semibold text-primary mt-6">Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {["React 18", "TypeScript", "Tailwind CSS", "shadcn/ui", "Django 4.2", "DRF", "PostgreSQL", "WebRTC", "Docker", "Nginx"].map(t => (
                    <span key={t} className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full border border-gray-200">{t}</span>
                  ))}
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* ── TABLE OF CONTENTS ──────────────────────────────────────── */}
        <div className="sc-page flex flex-col justify-center px-16 py-12">
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-8">
              <Layout className="w-7 h-7 text-primary" />
              <h2 className="text-3xl font-bold text-lily-charcoal" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Table of Contents
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
              {(() => {
                let pageNum = 4; // cover=1, context=2, toc=3
                let currentSection = "";
                return PAGES.map((entry, i) => {
                  const items: JSX.Element[] = [];
                  if (entry.sectionLabel && entry.sectionLabel !== currentSection) {
                    currentSection = entry.sectionLabel;
                    items.push(
                      <div key={`sec-${i}`} className="mt-3 mb-1">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {entry.sectionIcon} {entry.sectionLabel}
                        </span>
                      </div>
                    );
                  }
                  items.push(
                    <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-100 group">
                      <span className="text-[10px] text-gray-400 w-5 text-right">{pageNum}</span>
                      <div className="flex-1 flex items-center gap-2">
                        {roleBadge(entry.role)}
                        <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">{entry.title}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                    </div>
                  );
                  pageNum++;
                  return items;
                });
              })()}
            </div>

            <div className="mt-8 text-[10px] text-gray-400">
              Total pages: ~{totalPages} • Roles: Public, Admin (Lily), Client
            </div>
          </div>
        </div>

        {/* ── PAGE ENTRIES ────────────────────────────────────────────── */}
        {(() => {
          let currentSection = "";
          return PAGES.map((entry, i) => {
            const showSection = !!(entry.sectionLabel && entry.sectionLabel !== currentSection);
            if (entry.sectionLabel) currentSection = entry.sectionLabel;

            return (
              <div key={i}>
                {/* Section divider */}
                {showSection && (
                  <div className="sc-page sc-section-divider relative flex items-center justify-center overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #2D3340 0%, #418F6C 60%, #D4937A 100%)" }}>
                    {/* Decorative circles */}
                    <div className="absolute top-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full bg-white/5 blur-2xl" />
                    <div className="absolute bottom-[-40px] right-[-80px] w-[300px] h-[300px] rounded-full bg-white/5 blur-2xl" />
                    <div className="relative z-10 text-center text-white">
                      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <span className="text-4xl">{entry.sectionIcon}</span>
                      </div>
                      <h2 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {entry.sectionLabel}
                      </h2>
                      <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="w-12 h-px bg-white/20" />
                        <Sparkles className="w-4 h-4 text-white/30" />
                        <div className="w-12 h-px bg-white/20" />
                      </div>
                    </div>
                  </div>
                )}

              {/* Page entry */}
              <div className={`sc-page sc-entry ${entry.fullPage ? "sc-entry-full" : ""}`}>
                {/* Header bar */}
                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  {roleBadge(entry.role)}
                  <h3 className="text-lg font-bold text-lily-charcoal flex-1">{entry.title}</h3>
                  {entry.path && (
                    <code className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                      {entry.path}
                    </code>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{entry.description}</p>

                {/* Iframe or special content */}
                {entry.path ? (
                  <div className="sc-iframe-wrap rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shadow-sm">
                    {authDone ? (
                      <iframe
                        src={iframeUrl(entry)}
                        title={entry.title}
                        className="sc-iframe"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                      </div>
                    )}
                  </div>
                ) : entry.sectionLabel === "AI Assistant" ? (
                  /* AI Assistant description card */
                  <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-lg p-8 text-white">
                    <div className="text-center max-w-lg">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                        <Bot className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        AI-Powered Assistant
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-left mb-6">
                        {[
                          { icon: MessageSquare, label: "Floating Chat Widget" },
                          { icon: Brain, label: "Gemini 2.0 Flash" },
                          { icon: Shield, label: "Rate Limited (5/min)" },
                          { icon: BookOpen, label: "Site-Content Only" },
                        ].map(({ icon: Icon, label }) => (
                          <div key={label} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-sm">{label}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-white/60">
                        Vertex AI (Gemini) • Admin-configurable prompt &amp; API key • Markdown-rendered responses
                      </p>
                      <p className="text-xs text-white/40 mt-2">
                        Answers about services, pricing, qualifications — refuses off-topic queries
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Video conferencing description card */
                  <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-lg p-8 text-white">
                    <div className="text-center max-w-lg">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                        <Video className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        Built-in Video Conferencing
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-left mb-6">
                        {[
                          { icon: Video, label: "Camera & Mic Toggle" },
                          { icon: Monitor, label: "Screen Sharing" },
                          { icon: Layout, label: "Fullscreen Mode" },
                          { icon: Users, label: "Draggable Self-View" },
                        ].map(({ icon: Icon, label }) => (
                          <div key={label} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-sm">{label}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-white/60">
                        WebRTC peer-to-peer • HTTP polling signalling • No external dependencies
                      </p>
                      <p className="text-xs text-white/40 mt-2">
                        Accessible from dashboard → "Join Session" button on confirmed bookings
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
          });
        })()}

        {/* ── CLOSING PAGE ───────────────────────────────────────────── */}
        <div className="sc-page sc-cover relative overflow-hidden flex flex-col items-center justify-center text-white"
          style={{ background: "linear-gradient(135deg, #418F6C 0%, #2D3340 50%, #D4937A 100%)" }}>
          <div className="absolute top-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-white/5 blur-2xl" />

          <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10 text-center max-w-3xl mx-auto px-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-px bg-white/20" />
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/10">
                <img src="/logo-transparent.png" alt="Calm Lily" className="h-14 w-auto object-contain" />
              </div>
              <div className="w-16 h-px bg-white/20" />
            </div>

            <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Thank You
            </h2>
            <p className="text-xl text-white/60 mb-10 max-w-md mx-auto leading-relaxed">
              A complete digital platform for neurocoaching &amp; hypnotherapy.
            </p>

            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="w-8 h-px bg-white/20" />
              <Sparkles className="w-4 h-4 text-white/30" />
              <div className="w-8 h-px bg-white/20" />
            </div>

            <p className="text-lg text-white/50 font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              LiLy Stoica — CALM LILY LTD
            </p>
            <p className="text-sm text-white/30 mt-2">
              Digital Boost Mentorship Programme • February 2026
            </p>
          </div>
        </div>
      </div>

      {/* ── STYLES ───────────────────────────────────────────────────── */}
      <style>{`
        /* Base showcase layout — landscape A4 oriented */
        .sc-wrap {
          font-family: 'Inter', sans-serif;
        }

        .sc-page {
          width: 100%;
          min-height: 100vh;
          padding: 32px 48px;
          box-sizing: border-box;
          position: relative;
        }

        .sc-cover {
          padding: 0;
        }

        .sc-entry {
          display: flex;
          flex-direction: column;
        }

        /* Iframe container */
        .sc-iframe-wrap {
          flex: 1;
          position: relative;
          min-height: 500px;
        }

        .sc-iframe {
          width: 1400px;
          height: 900px;
          transform-origin: top left;
          transform: scale(${scale});
          border: none;
          background: white;
        }

        .sc-iframe-wrap {
          width: ${1400 * scale}px;
          height: ${900 * scale}px;
          overflow: hidden;
        }

        /* Section dividers */
        .sc-section-divider {
          min-height: 40vh;
        }

        /* Hide print button when printing */
        .no-print { }

        /* ── PRINT STYLES ──────────────────────────────────────────── */
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .sc-page {
            width: 100%;
            min-height: auto;
            height: 100vh;
            padding: 16px 24px;
            break-after: page;
            break-inside: avoid;
            overflow: hidden;
            page-break-after: always;
          }

          .sc-cover {
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .sc-section-divider {
            min-height: auto;
            height: 100vh;
          }

          .sc-iframe-wrap {
            width: 100% !important;
            height: auto !important;
            max-height: 70vh;
          }

          .sc-iframe {
            width: 1400px;
            height: 800px;
            transform: scale(0.65);
            transform-origin: top left;
          }
        }
      `}</style>
    </>
  );
}
