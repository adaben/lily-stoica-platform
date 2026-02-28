import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Calendar, Settings, Loader2, Clock,
  Brain, Bell, FileText, CalendarDays,
  Plus, Pencil, Trash2, Eye, EyeOff, Pin, BookOpen, X,
  Repeat, Video, FlaskConical, Gift, Upload,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  apiGetAllBookings, apiConfirmBooking, apiCreateSlot,
  apiGetAdminSlots, apiDeleteSlot, apiCreateRecurringSlots,
  apiGetSettings, apiUpdateSettings, apiTestGemini,
  apiAdminGetBlogPosts, apiAdminCreateBlogPost, apiAdminUpdateBlogPost,
  apiAdminDeleteBlogPost, apiAdminToggleBlogPost,
  apiAdminGetEvents, apiAdminCreateEvent, apiAdminUpdateEvent, apiAdminDeleteEvent,
  apiAdminGetResources, apiAdminCreateResource, apiAdminUpdateResource, apiAdminDeleteResource,
  apiGetResourceCategories,
  type Booking, type BlogPost, type Event, type Resource, type ResourceCategory, type BookingSlot,
} from "@/lib/api";

type Tab = "bookings" | "schedule" | "blog" | "events" | "resources" | "settings";
const VALID_TABS: Tab[] = ["bookings", "schedule", "blog", "events", "resources", "settings"];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    return p && VALID_TABS.includes(p as Tab) ? (p as Tab) : "bookings";
  });

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Calm Lily</title>
      </Helmet>

      <SiteHeader />

      <section className="py-10 bg-accent/20 min-h-[80vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-cormorant font-bold text-foreground mb-6">
            Admin Dashboard
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border/60 pb-2 overflow-x-auto">
            {([
              { key: "bookings", icon: Calendar, label: "Bookings" },
              { key: "schedule", icon: Clock, label: "Schedule" },
              { key: "blog", icon: FileText, label: "Blog" },
              { key: "events", icon: CalendarDays, label: "Events" },
              { key: "resources", icon: BookOpen, label: "Resources" },
              { key: "settings", icon: Settings, label: "Settings" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  tab === t.key ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {tab === "bookings" && <BookingsPanel />}
          {tab === "schedule" && <SchedulePanel />}
          {tab === "blog" && <BlogPanel />}
          {tab === "events" && <EventsPanel />}
          {tab === "resources" && <ResourcesPanel />}
          {tab === "settings" && <SettingsPanel />}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function BookingsPanel() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: apiGetAllBookings,
  });

  const handleConfirm = async (id: number) => {
    try {
      await apiConfirmBooking(id);
      toast.success("Booking confirmed.");
      refetch();
    } catch {
      toast.error("Could not confirm booking.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const bookings = data?.results || [];

  return (
    <div className="space-y-3">
      {bookings.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center">No bookings yet.</p>
      ) : (
        bookings.map((b: Booking) => (
          <div key={b.id} className="bg-white rounded-xl border border-border/60 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{b.client_name}</p>
              <p className="text-xs text-muted-foreground">
                {b.session_type} | {b.slot ? format(new Date(b.slot.date), "d MMM yyyy") : "TBC"}{" "}
                {b.slot ? `${b.slot.start_time}-${b.slot.end_time}` : ""}
              </p>
              {b.notes && <p className="text-xs text-muted-foreground mt-1">{b.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                b.status === "confirmed" ? "bg-green-100 text-green-800" :
                b.status === "pending" ? "bg-amber-100 text-amber-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {b.status}
              </span>
              {b.status === "pending" && (
                <button
                  onClick={() => handleConfirm(b.id)}
                  className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                >
                  Confirm
                </button>
              )}
              {b.status === "confirmed" && b.video_room_id && (
                <Link
                  to={`/session/${b.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join
                </Link>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function SchedulePanel() {
  const qc = useQueryClient();
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["admin-slots"],
    queryFn: apiGetAdminSlots,
  });

  // Single slot creation state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [sessionType, setSessionType] = useState("standard");
  const [loading, setLoading] = useState(false);

  // Recurring slot creation state
  const [showRecurring, setShowRecurring] = useState(false);
  const [rStartDate, setRStartDate] = useState("");
  const [rEndDate, setREndDate] = useState("");
  const [rWeekdays, setRWeekdays] = useState<number[]>([]);
  const [rStartTime, setRStartTime] = useState("09:00");
  const [rEndTime, setREndTime] = useState("10:00");
  const [rSessionType, setRSessionType] = useState("standard");
  const [rLoading, setRLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const slots = slotsData?.results || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCreateSlot({
        date,
        start_time: startTime,
        end_time: endTime,
        session_type: sessionType,
        is_available: true,
      });
      toast.success("Slot created.");
      setDate("");
      qc.invalidateQueries({ queryKey: ["admin-slots"] });
    } catch {
      toast.error("Could not create slot.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await apiDeleteSlot(id);
      toast.success("Slot deleted.");
      qc.invalidateQueries({ queryKey: ["admin-slots"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not delete slot.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleWeekday = (day: number) => {
    setRWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleRecurringCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rWeekdays.length === 0) {
      toast.error("Select at least one weekday.");
      return;
    }
    setRLoading(true);
    try {
      const res = await apiCreateRecurringSlots({
        start_date: rStartDate,
        end_date: rEndDate,
        weekdays: rWeekdays,
        start_time: rStartTime,
        end_time: rEndTime,
        session_type: rSessionType,
      });
      toast.success(`${res.created_count} slot(s) created.`);
      setRStartDate("");
      setREndDate("");
      setRWeekdays([]);
      qc.invalidateQueries({ queryKey: ["admin-slots"] });
    } catch {
      toast.error("Could not create recurring slots.");
    } finally {
      setRLoading(false);
    }
  };

  const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const SESSION_LABELS: Record<string, string> = {
    discovery: "Discovery",
    standard: "Standard",
    intensive: "Intensive",
  };

  return (
    <div className="space-y-8">
      {/* ── Existing Slots List ── */}
      <div className="bg-white rounded-2xl border border-border/60 p-6">
        <h2 className="text-xl font-cormorant font-bold text-foreground mb-4">
          Upcoming Slots
        </h2>
        {slotsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : slots.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">
            No upcoming slots. Create one below.
          </p>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {slots.map((slot: BookingSlot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border/40 bg-accent/10 hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(slot.date), "EEE d MMM yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                      {" · "}
                      <span className="capitalize">{SESSION_LABELS[slot.session_type] || slot.session_type}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      slot.is_available
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {slot.is_available ? "Available" : "Booked"}
                  </span>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    disabled={deletingId === slot.id}
                    title={slot.is_available ? "Delete slot" : "Cannot delete booked slot"}
                    className="p-1.5 text-muted-foreground hover:text-red-600 disabled:opacity-40 transition-colors rounded-lg hover:bg-red-50"
                  >
                    {deletingId === slot.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Single Slot Creation ── */}
        <div className="bg-white rounded-2xl border border-border/60 p-6">
          <h2 className="text-xl font-cormorant font-bold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Single Slot
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="discovery">Discovery call</option>
                <option value="standard">Standard session</option>
                <option value="intensive">Intensive session</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Slot
            </button>
          </form>
        </div>

        {/* ── Recurring Slot Creation ── */}
        <div className="bg-white rounded-2xl border border-border/60 p-6">
          <button
            type="button"
            onClick={() => setShowRecurring(!showRecurring)}
            className="flex items-center gap-2 text-xl font-cormorant font-bold text-foreground mb-4 w-full text-left"
          >
            <Repeat className="w-5 h-5 text-primary" />
            Recurring Slots
            <span className="ml-auto text-sm font-sans font-normal text-primary">
              {showRecurring ? "Hide" : "Show"}
            </span>
          </button>

          {showRecurring && (
            <form onSubmit={handleRecurringCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">From</label>
                  <input
                    type="date"
                    value={rStartDate}
                    onChange={(e) => setRStartDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">To</label>
                  <input
                    type="date"
                    value={rEndDate}
                    onChange={(e) => setREndDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Weekdays</label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleWeekday(idx)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        rWeekdays.includes(idx)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Start</label>
                  <input
                    type="time"
                    value={rStartTime}
                    onChange={(e) => setRStartTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">End</label>
                  <input
                    type="time"
                    value={rEndTime}
                    onChange={(e) => setREndTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                <select
                  value={rSessionType}
                  onChange={(e) => setRSessionType(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="discovery">Discovery call</option>
                  <option value="standard">Standard session</option>
                  <option value="intensive">Intensive session</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={rLoading || rWeekdays.length === 0}
                className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Recurring Slots
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Resources Panel                                                        */
/* ──────────────────────────────────────────────────────────────────────── */
function ResourcesPanel() {
  const qc = useQueryClient();
  const { data: resources = [], isLoading } = useQuery({ queryKey: ["admin-resources"], queryFn: apiAdminGetResources });
  const { data: categories = [] } = useQuery({ queryKey: ["resource-categories"], queryFn: apiGetResourceCategories });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState("guide");
  const [categoryId, setCategoryId] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setResourceType("guide");
    setCategoryId("");
    setExternalUrl("");
    setContent("");
    setIsPremium(false);
    setIsPublished(true);
    setFile(null);
    setShowForm(false);
  };

  const openEdit = (r: Resource) => {
    setEditId(r.id);
    setTitle(r.title);
    setSlug(r.slug);
    setDescription(r.description);
    setResourceType(r.resource_type);
    setCategoryId(r.category ? String(r.category) : "");
    setExternalUrl(r.external_url);
    setContent(r.content);
    setIsPremium(r.is_premium);
    setIsPublished(r.is_published);
    setFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("slug", slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
      fd.append("description", description);
      fd.append("resource_type", resourceType);
      if (categoryId) fd.append("category", categoryId);
      fd.append("external_url", externalUrl);
      fd.append("content", content);
      fd.append("is_premium", String(isPremium));
      fd.append("is_published", String(isPublished));
      if (file) fd.append("file", file);

      if (editId) {
        await apiAdminUpdateResource(editId, fd);
        toast.success("Resource updated.");
      } else {
        await apiAdminCreateResource(fd);
        toast.success("Resource created.");
      }
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      resetForm();
    } catch {
      toast.error("Could not save resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await apiAdminDeleteResource(id);
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      toast.success("Resource deleted.");
    } catch {
      toast.error("Could not delete resource.");
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{resources.length} resource(s)</p>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Resource
        </button>
      </div>

      {/* Resource list */}
      <div className="space-y-2">
        {resources.map((r: Resource) => (
          <div key={r.id} className="bg-white rounded-xl border border-border/60 p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-semibold text-foreground truncate">{r.title}</h4>
                <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{r.resource_type}</span>
                {r.is_premium && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Premium</span>}
                {!r.is_published && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Draft</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{r.description}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-accent"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit form dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl border border-border/60 shadow-lg w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-cormorant font-bold text-foreground">
                {editId ? "Edit Resource" : "New Resource"}
              </h3>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Slug</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated if empty" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Type</label>
                  <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
                    <option value="guide">Written Guide</option>
                    <option value="pdf">PDF</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background">
                    <option value="">None</option>
                    {categories.map((c: ResourceCategory) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Content (for guides)</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">External URL</label>
                <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">File upload</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="rounded" />
                  Premium (login required)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="rounded" />
                  Published
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={resetForm} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPanel() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: apiGetSettings,
  });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAI, setSavingAI] = useState(false);

  /* email fields */
  const [emailTestMode, setEmailTestMode] = useState<boolean>(true);
  const [testRecipient, setTestRecipient] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [emailFrom, setEmailFrom] = useState("hello@lilystoica.com");

  /* AI fields */
  const [aiEnabled, setAiEnabled] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [aiSystemPrompt, setAiSystemPrompt] = useState("");
  const [aiMaxTokens, setAiMaxTokens] = useState(512);

  /* beta mode */
  const [betaMode, setBetaMode] = useState(true);
  const [savingBeta, setSavingBeta] = useState(false);

  /* lead magnet */
  const [lmEnabled, setLmEnabled] = useState(false);
  const [lmTitle, setLmTitle] = useState("");
  const [lmDesc, setLmDesc] = useState("");
  const [lmButtonText, setLmButtonText] = useState("");
  const [lmEmailSubject, setLmEmailSubject] = useState("");
  const [lmEmailBody, setLmEmailBody] = useState("");
  const [lmFile, setLmFile] = useState<File | null>(null);
  const [lmCurrentFile, setLmCurrentFile] = useState("");
  const [savingLm, setSavingLm] = useState(false);

  const [loaded, setLoaded] = useState(false);

  /* sync server → local state once */
  if (settings && !loaded) {
    setEmailTestMode(settings.email_test_mode as boolean ?? true);
    setTestRecipient((settings.email_test_recipient as string) ?? "");
    setResendKey((settings.resend_api_key as string) ?? "");
    setEmailFrom((settings.email_from as string) ?? "hello@lilystoica.com");
    setAiEnabled(settings.ai_enabled as boolean ?? false);
    setGeminiKey((settings.gemini_api_key as string) ?? "");
    setAiSystemPrompt((settings.ai_system_prompt as string) ?? "");
    setAiMaxTokens((settings.ai_max_tokens as number) ?? 512);
    setBetaMode(settings.beta_mode as boolean ?? true);
    setLmEnabled(settings.lead_magnet_enabled as boolean ?? false);
    setLmTitle((settings.lead_magnet_title as string) ?? "");
    setLmDesc((settings.lead_magnet_description as string) ?? "");
    setLmButtonText((settings.lead_magnet_button_text as string) ?? "");
    setLmEmailSubject((settings.lead_magnet_email_subject as string) ?? "");
    setLmEmailBody((settings.lead_magnet_email_body as string) ?? "");
    setLmCurrentFile((settings.lead_magnet_file as string) ?? "");
    setLoaded(true);
  }

  const handleTestAI = async () => {
    setTesting(true);
    try {
      const res = await apiTestGemini();
      toast.success(`AI: ${res.message}`);
    } catch {
      toast.error("AI connection failed.");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      await apiUpdateSettings({
        email_test_mode: emailTestMode,
        email_test_recipient: testRecipient,
        resend_api_key: resendKey,
        email_from: emailFrom,
      });
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Email settings saved.");
    } catch {
      toast.error("Could not save email settings.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* ── Beta Mode ── */}
      <div className="bg-white rounded-2xl border border-border/60 p-6">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-cormorant font-bold text-foreground">Beta Mode</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          When enabled, quick-login test cards are shown on the sign-in page.
          Disable this before official launch.
        </p>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={betaMode}
              onClick={() => setBetaMode(!betaMode)}
              className={`relative w-11 h-6 rounded-full transition-colors ${betaMode ? "bg-amber-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${betaMode ? "translate-x-5" : ""}`} />
            </button>
            <span className="text-sm font-medium text-foreground">
              {betaMode
                ? <span className="text-amber-600 font-semibold">Beta ON — test logins visible</span>
                : <span className="text-green-700">Production — test logins hidden</span>
              }
            </span>
          </label>

          <button
            onClick={async () => {
              setSavingBeta(true);
              try {
                await apiUpdateSettings({ beta_mode: betaMode });
                qc.invalidateQueries({ queryKey: ["admin-settings"] });
                toast.success(betaMode ? "Beta mode enabled." : "Beta mode disabled — production ready.");
              } catch {
                toast.error("Could not update beta mode.");
              } finally {
                setSavingBeta(false);
              }
            }}
            disabled={savingBeta}
            className="px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {savingBeta && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save
          </button>
        </div>
      </div>

      {/* ── Lead Magnet ── */}
      <div className="bg-white rounded-2xl border border-border/60 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-cormorant font-bold text-foreground">Lead Magnet</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Free resource offered on the homepage in exchange for an email.
          Configure the content, the file to deliver, and the email subscribers receive.
        </p>

        {/* Enable / disable toggle */}
        <label className="flex items-center gap-3 mb-5 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={lmEnabled}
            onClick={() => setLmEnabled(!lmEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${lmEnabled ? "bg-primary" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${lmEnabled ? "translate-x-5" : ""}`} />
          </button>
          <span className="text-sm font-medium text-foreground">
            Lead magnet {lmEnabled ? <span className="text-green-700 font-semibold">(Visible)</span> : <span className="text-gray-500">(Hidden)</span>}
          </span>
        </label>

        <div className="space-y-3">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Section title</label>
            <input
              type="text"
              value={lmTitle}
              onChange={(e) => setLmTitle(e.target.value)}
              placeholder="Free Nervous System Reset Audio"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={lmDesc}
              onChange={(e) => setLmDesc(e.target.value)}
              rows={3}
              placeholder="Leave your details and receive a guided relaxation recording..."
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>
          {/* Button text */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Button text</label>
            <input
              type="text"
              value={lmButtonText}
              onChange={(e) => setLmButtonText(e.target.value)}
              placeholder="Send Me the Recording"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">File to deliver</label>
            {lmCurrentFile && (
              <p className="text-xs text-muted-foreground mb-1.5">
                Current: <span className="font-medium text-foreground">{lmCurrentFile.split("/").pop()}</span>
              </p>
            )}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
              <Upload className="w-4 h-4" />
              {lmFile ? lmFile.name : "Choose file…"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => setLmFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="text-[11px] text-muted-foreground mt-1">Audio, PDF, or any downloadable file. Sent to subscribers via email link.</p>
          </div>

          <hr className="border-border/50" />

          {/* Email subject */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email subject</label>
            <input
              type="text"
              value={lmEmailSubject}
              onChange={(e) => setLmEmailSubject(e.target.value)}
              placeholder="Your free Nervous System Reset recording"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {/* Email body */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email body</label>
            <textarea
              value={lmEmailBody}
              onChange={(e) => setLmEmailBody(e.target.value)}
              rows={4}
              placeholder="Thank you for your interest…"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
            <p className="text-[11px] text-muted-foreground mt-1">The download link/button is added automatically after this text.</p>
          </div>
        </div>

        <button
          onClick={async () => {
            setSavingLm(true);
            try {
              const fd = new FormData();
              fd.append("lead_magnet_enabled", String(lmEnabled));
              fd.append("lead_magnet_title", lmTitle);
              fd.append("lead_magnet_description", lmDesc);
              fd.append("lead_magnet_button_text", lmButtonText);
              fd.append("lead_magnet_email_subject", lmEmailSubject);
              fd.append("lead_magnet_email_body", lmEmailBody);
              if (lmFile) fd.append("lead_magnet_file", lmFile);
              await apiUpdateSettings(fd as unknown as Record<string, unknown>);
              qc.invalidateQueries({ queryKey: ["admin-settings"] });
              toast.success("Lead magnet settings saved.");
            } catch {
              toast.error("Could not save lead magnet settings.");
            } finally {
              setSavingLm(false);
            }
          }}
          disabled={savingLm}
          className="mt-4 w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {savingLm && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Lead Magnet Settings
        </button>
      </div>

      {/* ── Email / Resend ── */}
      <div className="bg-white rounded-2xl border border-border/60 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-cormorant font-bold text-foreground">Email &amp; Resend</h2>
        </div>

        {/* test mode toggle */}
        <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={emailTestMode}
            onClick={() => setEmailTestMode(!emailTestMode)}
            className={`relative w-11 h-6 rounded-full transition-colors ${emailTestMode ? "bg-primary" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailTestMode ? "translate-x-5" : ""}`} />
          </button>
          <span className="text-sm font-medium text-foreground">
            Email test mode {emailTestMode ? <span className="text-amber-600 font-semibold">(ON)</span> : <span className="text-green-700">(OFF — live)</span>}
          </span>
        </label>
        {emailTestMode && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            All outgoing emails are redirected to the test recipient below.
            No real clients will receive emails.
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Test recipient email
            </label>
            <input
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Resend API key
            </label>
            <input
              type="password"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              placeholder="re_xxxxxxxxx"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              From email
            </label>
            <input
              type="email"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <button
          onClick={handleSaveEmail}
          disabled={saving}
          className="mt-4 w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Email Settings
        </button>
      </div>

      {/* ── AI Assistant ── */}
      <div className="bg-white rounded-2xl border border-border/60 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-cormorant font-bold text-foreground">AI Assistant (Vertex AI)</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Uses Gemini 2.0 Flash via Google Cloud Vertex AI. The API key is a Vertex AI key for the <code className="text-xs bg-muted px-1 rounded">perennix-experiments</code> project.
        </p>

        {/* AI Enabled toggle */}
        <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={aiEnabled}
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${aiEnabled ? "bg-primary" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${aiEnabled ? "translate-x-5" : ""}`} />
          </button>
          <span className="text-sm font-medium text-foreground">
            AI Assistant {aiEnabled ? <span className="text-green-700 font-semibold">(ON)</span> : <span className="text-gray-500">(OFF)</span>}
          </span>
        </label>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Vertex AI / Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              System Prompt
            </label>
            <textarea
              value={aiSystemPrompt}
              onChange={(e) => setAiSystemPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              placeholder="You are Lily's virtual assistant..."
            />
            <p className="text-[11px] text-muted-foreground mt-1">Instructions given to the AI before every user message.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Max Output Tokens
            </label>
            <input
              type="number"
              value={aiMaxTokens}
              onChange={(e) => setAiMaxTokens(Math.max(50, Math.min(4096, parseInt(e.target.value) || 512)))}
              min={50}
              max={4096}
              className="w-32 px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-[11px] text-muted-foreground mt-1">50 – 4096. Higher values = longer responses, more cost.</p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={async () => {
              setSavingAI(true);
              try {
                await apiUpdateSettings({
                  ai_enabled: aiEnabled,
                  gemini_api_key: geminiKey,
                  ai_system_prompt: aiSystemPrompt,
                  ai_max_tokens: aiMaxTokens,
                });
                qc.invalidateQueries({ queryKey: ["admin-settings"] });
                toast.success("AI settings saved.");
              } catch {
                toast.error("Could not save AI settings.");
              } finally {
                setSavingAI(false);
              }
            }}
            disabled={savingAI}
            className="flex-1 py-2.5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {savingAI && <Loader2 className="w-4 h-4 animate-spin" />}
            Save AI Settings
          </button>
          <button
            onClick={handleTestAI}
            disabled={testing || !geminiKey}
            className="px-4 py-2.5 text-sm border border-primary text-primary rounded-full hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {testing && <Loader2 className="w-4 h-4 animate-spin" />}
            Test Connection
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Blog Management Panel ──────────────────────────────────────────────── */

function BlogPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: apiAdminGetBlogPosts,
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", tags: "",
    is_published: false, is_pinned: false,
    seo_title: "", seo_description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ title: "", excerpt: "", content: "", tags: "", is_published: false, is_pinned: false, seo_title: "", seo_description: "" });
    setImageFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
      is_published: post.is_published,
      is_pinned: post.is_pinned ?? false,
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
    });
    setEditId(post.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("excerpt", form.excerpt);
      fd.append("content", form.content);
      fd.append("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));
      fd.append("is_published", String(form.is_published));
      fd.append("is_pinned", String(form.is_pinned));
      fd.append("seo_title", form.seo_title);
      fd.append("seo_description", form.seo_description);
      if (imageFile) fd.append("featured_image", imageFile);

      if (editId) {
        await apiAdminUpdateBlogPost(editId, fd);
        toast.success("Article updated.");
      } else {
        await apiAdminCreateBlogPost(fd);
        toast.success("Article created.");
      }
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      resetForm();
    } catch {
      toast.error("Could not save article.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article permanently?")) return;
    try {
      await apiAdminDeleteBlogPost(id);
      toast.success("Article deleted.");
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
    } catch {
      toast.error("Could not delete article.");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await apiAdminToggleBlogPost(id);
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success("Status toggled.");
    } catch {
      toast.error("Could not toggle status.");
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const posts: BlogPost[] = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-cormorant font-bold text-foreground">Blog Articles ({data?.count || 0})</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border/60 p-6 space-y-4">
          <h3 className="text-lg font-cormorant font-bold">{editId ? "Edit Article" : "New Article"}</h3>
          <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <textarea placeholder="Content (HTML)" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={8} required className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="text" placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="SEO title (optional override)" value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="text" placeholder="SEO description (optional override)" value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Featured Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} className="rounded" /> Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm((f) => ({ ...f, is_pinned: e.target.checked }))} className="rounded" /> Pinned
            </label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl border border-border/60 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                {post.is_pinned && <Pin className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {post.published_at ? format(new Date(post.published_at), "d MMM yyyy") : "Draft"} | {post.view_count} views | {Array.isArray(post.tags) ? post.tags.join(", ") : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.is_published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                {post.is_published ? "Published" : "Draft"}
              </span>
              <button onClick={() => handleToggle(post.id)} title="Toggle publish" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                {post.is_published ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button onClick={() => openEdit(post)} title="Edit" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(post.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Events Management Panel ────────────────────────────────────────────── */

function EventsPanel() {
  const qc = useQueryClient();
  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: apiAdminGetEvents,
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", date: "", start_time: "10:00", end_time: "12:00",
    location: "", is_online: false, ticket_url: "", price: "0", max_spots: "0", is_published: true,
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ title: "", description: "", date: "", start_time: "10:00", end_time: "12:00", location: "", is_online: false, ticket_url: "", price: "0", max_spots: "0", is_published: true });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (ev: Event) => {
    setForm({
      title: ev.title, description: ev.description, date: ev.date,
      start_time: ev.start_time || "", end_time: ev.end_time || "",
      location: ev.location, is_online: ev.is_online,
      ticket_url: ev.ticket_url, price: String(ev.price),
      max_spots: String(ev.max_spots), is_published: ev.is_published,
    });
    setEditId(ev.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title, description: form.description, date: form.date,
        start_time: form.start_time, end_time: form.end_time || null,
        location: form.location, is_online: form.is_online,
        ticket_url: form.ticket_url, price: form.price,
        max_spots: parseInt(form.max_spots) || 0, is_published: form.is_published,
      };
      if (editId) {
        await apiAdminUpdateEvent(editId, payload);
        toast.success("Event updated.");
      } else {
        await apiAdminCreateEvent(payload);
        toast.success("Event created.");
      }
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      resetForm();
    } catch {
      toast.error("Could not save event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    try {
      await apiAdminDeleteEvent(id);
      toast.success("Event deleted.");
      qc.invalidateQueries({ queryKey: ["admin-events"] });
    } catch {
      toast.error("Could not delete event.");
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-cormorant font-bold text-foreground">Events ({(events as Event[])?.length || 0})</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border/60 p-6 space-y-4">
          <h3 className="text-lg font-cormorant font-bold">{editId ? "Edit Event" : "New Event"}</h3>
          <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} required className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start time</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} required className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End time</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="grid grid-cols-3 gap-4">
            <input type="text" placeholder="Ticket URL" value={form.ticket_url} onChange={(e) => setForm((f) => ({ ...f, ticket_url: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="text" placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="number" placeholder="Max spots (0=unlimited)" value={form.max_spots} onChange={(e) => setForm((f) => ({ ...f, max_spots: e.target.value }))} className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} className="rounded" /> Published
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {(events as Event[])?.map((ev) => (
          <div key={ev.id} className="bg-white rounded-xl border border-border/60 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{ev.title}</p>
              <p className="text-xs text-muted-foreground">{ev.date} | {ev.location || "Online"} | {ev.price === "0.00" ? "Free" : `£${ev.price}`}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
              <button onClick={() => handleDelete(ev.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
