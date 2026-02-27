import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Target,
  CheckCircle2,
  PauseCircle,
  Clock,
  Calendar,
  Plus,
  Loader2,
  StickyNote,
  Trash2,
  BarChart3,
  Sparkles,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import {
  apiGetMyBookings,
  apiGetMyGoals,
  apiCreateGoal,
  apiUpdateGoal,
  apiDeleteGoal,
  apiGetMyNotes,
  apiCreateNote,
  apiDeleteNote,
  type Goal,
  type SessionNote,
  type Booking,
} from "@/lib/api";

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  active: { icon: <Target className="w-4 h-4" />, color: "text-primary bg-primary/10", label: "Active" },
  completed: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600 bg-green-50", label: "Completed" },
  paused: { icon: <PauseCircle className="w-4 h-4" />, color: "text-amber-600 bg-amber-50", label: "Paused" },
};

export default function Progress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["my-goals"],
    queryFn: apiGetMyGoals,
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["my-notes"],
    queryFn: apiGetMyNotes,
  });

  const { data: bookingsData } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: apiGetMyBookings,
  });

  const bookings: Booking[] = bookingsData?.results || [];
  const completedSessions = bookings.filter((b) => b.status === "completed");
  const activeGoals = goals.filter((g: Goal) => g.status === "active");
  const completedGoals = goals.filter((g: Goal) => g.status === "completed");

  // Goal dialog
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDesc, setGoalDesc] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [goalSaving, setGoalSaving] = useState(false);

  // Note dialog
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) return;
    setGoalSaving(true);
    try {
      await apiCreateGoal({
        title: goalTitle,
        description: goalDesc,
        target_date: goalDate || null,
      });
      queryClient.invalidateQueries({ queryKey: ["my-goals"] });
      toast.success("Goal created.");
      setShowGoalDialog(false);
      setGoalTitle("");
      setGoalDesc("");
      setGoalDate("");
    } catch {
      toast.error("Could not create goal.");
    } finally {
      setGoalSaving(false);
    }
  };

  const handleUpdateGoalStatus = async (goal: Goal, newStatus: string) => {
    try {
      await apiUpdateGoal(goal.id, {
        status: newStatus as Goal["status"],
        progress: newStatus === "completed" ? 100 : goal.progress,
      });
      queryClient.invalidateQueries({ queryKey: ["my-goals"] });
      toast.success(`Goal marked as ${newStatus}.`);
    } catch {
      toast.error("Could not update goal.");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await apiDeleteGoal(id);
      queryClient.invalidateQueries({ queryKey: ["my-goals"] });
      toast.success("Goal deleted.");
    } catch {
      toast.error("Could not delete goal.");
    }
  };

  const handleCreateNote = async () => {
    if (!noteContent.trim()) return;
    setNoteSaving(true);
    try {
      await apiCreateNote({ title: noteTitle, content: noteContent });
      queryClient.invalidateQueries({ queryKey: ["my-notes"] });
      toast.success("Note saved.");
      setShowNoteDialog(false);
      setNoteTitle("");
      setNoteContent("");
    } catch {
      toast.error("Could not save note.");
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      await apiDeleteNote(id);
      queryClient.invalidateQueries({ queryKey: ["my-notes"] });
      toast.success("Note deleted.");
    } catch {
      toast.error("Could not delete note.");
    }
  };

  const isLoading = goalsLoading || notesLoading;

  return (
    <>
      <Helmet>
        <title>My Progress | Calm Lily</title>
      </Helmet>

      <SiteHeader />

      {/* ── Header ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/30 to-lily-blush/20 py-10 sm:py-14">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <p className="text-sm text-primary font-medium">Progress Tracker</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-cormorant font-bold text-foreground">
            Your Journey, {user?.first_name}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Track your goals, reflect on your sessions and celebrate how far you've come.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Sessions", value: completedSessions.length, icon: <Calendar className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50 border-blue-200/60" },
            { label: "Active Goals", value: activeGoals.length, icon: <Target className="w-5 h-5 text-primary" />, bg: "bg-primary/5 border-primary/20" },
            { label: "Completed Goals", value: completedGoals.length, icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, bg: "bg-green-50 border-green-200/60" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 flex flex-col items-center text-center shadow-sm ${s.bg}`}>
              <div className="mb-2">{s.icon}</div>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* ── Goals ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-cormorant font-bold text-foreground">My Goals</h2>
              <button
                onClick={() => setShowGoalDialog(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Goal
              </button>
            </div>

            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((goal: Goal) => {
                  const cfg = statusConfig[goal.status] || statusConfig.active;
                  return (
                    <div
                      key={goal.id}
                      className="bg-white rounded-xl border border-border/60 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                          <h3 className="text-base font-semibold text-foreground">{goal.title}</h3>
                        </div>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                      )}

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium text-foreground">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {goal.target_date && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Target: {format(new Date(goal.target_date), "d MMM yyyy")}
                          </span>
                        )}
                        <div className="flex-1" />
                        {goal.status === "active" && (
                          <>
                            <button
                              onClick={() => handleUpdateGoalStatus(goal, "completed")}
                              className="text-green-600 hover:text-green-700 font-medium"
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() => handleUpdateGoalStatus(goal, "paused")}
                              className="text-amber-600 hover:text-amber-700 font-medium"
                            >
                              Pause
                            </button>
                          </>
                        )}
                        {goal.status === "paused" && (
                          <button
                            onClick={() => handleUpdateGoalStatus(goal, "active")}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            Resume
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-border/60">
                <Target className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-4">No goals yet. Set your first coaching goal!</p>
                <button
                  onClick={() => setShowGoalDialog(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Goal
                </button>
              </div>
            )}
          </div>

          {/* ── Session history ── */}
          {completedSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-cormorant font-bold text-foreground mb-4">Session History</h2>
              <div className="relative pl-6 border-l-2 border-primary/20 space-y-4">
                {completedSessions.map((b: Booking) => (
                  <div key={b.id} className="relative">
                    <div className="absolute -left-[calc(1.5rem+5px)] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                    <div className="bg-white rounded-xl border border-border/60 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground capitalize">
                          {b.session_type.replace("_", " ")} session
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {b.slot ? format(new Date(b.slot.date), "d MMM yyyy") : ""}
                        </span>
                      </div>
                      {b.notes && (
                        <p className="text-xs text-muted-foreground">{b.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Notes & Reflections ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-cormorant font-bold text-foreground">Notes &amp; Reflections</h2>
              <button
                onClick={() => setShowNoteDialog(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-foreground text-sm font-medium rounded-full hover:bg-accent/50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Note
              </button>
            </div>

            {notes.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {notes.map((note: SessionNote) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-xl border border-border/60 p-4 shadow-sm group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-violet-500 flex-shrink-0" />
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                          {note.title || "Untitled"}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{note.content}</p>
                    <span className="text-[10px] text-muted-foreground/60 mt-2 inline-block">
                      {format(new Date(note.created_at), "d MMM yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-border/60">
                <StickyNote className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Write down your thoughts after each session.
                </p>
              </div>
            )}
          </div>

          {/* ── Quick actions ── */}
          <div className="flex flex-wrap gap-3 pt-2 pb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground text-sm font-medium rounded-full hover:bg-accent/50 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Back to Dashboard
            </Link>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              <Calendar className="w-4 h-4" /> Book Next Session
            </Link>
          </div>
        </section>
      )}

      {/* ── Goal dialog ── */}
      {showGoalDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl border border-border/60 shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-cormorant font-bold text-foreground">New Goal</h3>
              <button onClick={() => setShowGoalDialog(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. Manage stress better"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Target Date (optional)</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowGoalDialog(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={goalSaving || !goalTitle.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {goalSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Note dialog ── */}
      {showNoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl border border-border/60 shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-cormorant font-bold text-foreground">New Note</h3>
              <button onClick={() => setShowNoteDialog(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. Session reflection"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Your thoughts</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Write about what you discussed, how you feel, key takeaways..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowNoteDialog(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                disabled={noteSaving || !noteContent.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {noteSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </>
  );
}
