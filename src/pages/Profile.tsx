import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQueryClient } from "@tanstack/react-query";
import { User, Lock, Loader2, Save, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { apiUpdateProfile, apiChangePassword } from "@/lib/api";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  // Profile form
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [concerns, setConcerns] = useState(user?.concerns || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSaved(false);
    try {
      await apiUpdateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        concerns,
      });
      if (refreshUser) await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      setProfileSaved(true);
      toast.success("Profile updated.");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      toast.error("Could not update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    try {
      await apiChangePassword(currentPw, newPw);
      toast.success("Password changed successfully.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch {
      toast.error("Could not change password. Check your current password.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile | Calm Lily</title>
      </Helmet>

      <SiteHeader />

      <section className="py-12 bg-accent/20 min-h-[60vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-cormorant font-bold text-foreground mb-1">My Profile</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Manage your personal information and account security.
          </p>

          {/* ── Personal info ── */}
          <form
            onSubmit={handleProfileSave}
            className="bg-white rounded-2xl border border-border/60 p-6 shadow-card space-y-5 mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-cormorant font-bold text-foreground">Personal Information</h2>
                <p className="text-xs text-muted-foreground">
                  Member since{" "}
                  {user?.date_joined
                    ? new Date(user.date_joined).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="07xxx xxx xxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Goals &amp; Concerns
              </label>
              <textarea
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="What would you like to focus on in your coaching journey?"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {profileLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : profileSaved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {profileSaved ? "Saved" : "Save Changes"}
            </button>
          </form>

          {/* ── Change password ── */}
          <form
            onSubmit={handlePasswordChange}
            className="bg-white rounded-2xl border border-border/60 p-6 shadow-card space-y-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-cormorant font-bold text-foreground">Change Password</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-full hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Change Password
              </button>
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
