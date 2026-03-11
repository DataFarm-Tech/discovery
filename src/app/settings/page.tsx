"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import { getUserSettings, updateUserSettings } from "@/lib/settings";

export default function SettingsPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [savedEmailAlertsEnabled, setSavedEmailAlertsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in first!");
      router.push("/");
      return;
    }

    setUserName("Lucas");

    const fetchSettings = async () => {
      const result = await getUserSettings(token);
      if (!result.success) {
        toast.error(result.message || "Failed to load settings");
        return;
      }

      const alertsEnabled = Boolean(result.data?.alerts_enabled);
      setEmailAlertsEnabled(alertsEnabled);
      setSavedEmailAlertsEnabled(alertsEnabled);
    };

    fetchSettings();
  }, [router]);

  const handleEmailAlertsChange = (enabled: boolean) => {
    setEmailAlertsEnabled(enabled);
  };

  const handleApplySettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in first!");
      router.push("/");
      return;
    }

    setIsSaving(true);

    const result = await updateUserSettings(token, emailAlertsEnabled);
    if (!result.success) {
      toast.error(result.message || "Failed to update settings");
      setIsSaving(false);
      return;
    }

    setSavedEmailAlertsEnabled(emailAlertsEnabled);
    toast.success(
      emailAlertsEnabled ? "Email alerts enabled" : "Email alerts disabled",
    );
    setIsSaving(false);
  };

  const hasChanges = emailAlertsEnabled !== savedEmailAlertsEnabled;

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      <DashboardHeader
        userName={userName}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-auto w-full max-w-4xl">
          <section className="bg-gradient-to-br from-[#121829] to-[#0f1318] border border-[#00be64]/20 rounded-2xl p-8 hover:border-[#00be64]/40 transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <p className="text-gray-400 mt-2 text-sm">
                Manage your account preferences.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0b1320]/60 p-5">
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-white font-medium">Email alerts</p>
                  <p className="text-sm text-white/60 mt-1">
                    Receive important updates and notifications by email.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={emailAlertsEnabled}
                  disabled={isSaving}
                  onChange={(event) =>
                    handleEmailAlertsChange(event.target.checked)
                  }
                  className="h-5 w-5 rounded border-white/30 bg-transparent text-[#00be64] focus:ring-[#00be64]/70"
                />
              </label>

              <div className="mt-5 flex items-center justify-between">
                <p
                  className={`text-sm transition-opacity ${
                    hasChanges ? "text-amber-300 opacity-100" : "opacity-0"
                  }`}
                >
                  Unsaved changes
                </p>

                <button
                  type="button"
                  disabled={isSaving || !hasChanges}
                  onClick={handleApplySettings}
                  className="px-5 py-2 rounded-lg bg-[#00be64] text-[#0b1320] font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}