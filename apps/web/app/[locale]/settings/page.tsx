"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { User } from "@trionic/shared";
import { ProfileSection } from "@/components/settings/profile-section";
import { PreferencesSection } from "@/components/settings/preferences-section";
import { SessionsSection } from "@/components/settings/sessions-section";
import { DangerZoneSection } from "@/components/settings/danger-zone-section";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    let isRedirecting = false;
    try {
      const res = await fetch("/api/users/me");
      if (res.status === 401) {
        isRedirecting = true;
        // Redirect unauthenticated user to login route
        window.location.href = "/auth/sign-in";
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load your system settings. Please try again.");
      }
      const data = (await res.json()) as User;
      setUser(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      if (!isRedirecting) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleUpdateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updatedFields,
      };
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-0 md:px-4 py-2 space-y-8 animate-in fade-in duration-300">
        {/* Loading Skeletons */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="size-9 bg-slate-800 rounded-xl animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-slate-800 rounded-lg w-1/4 animate-pulse" />
              <div className="h-3 bg-slate-800/60 rounded w-1/3 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded w-20 animate-pulse" />
              <div className="h-11 bg-slate-950/80 border border-slate-850 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded w-28 animate-pulse" />
              <div className="h-11 bg-slate-950/80 border border-slate-850 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="size-9 bg-slate-800 rounded-xl animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-slate-800 rounded-lg w-1/4 animate-pulse" />
              <div className="h-3 bg-slate-800/60 rounded w-1/3 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-slate-800 rounded w-24 animate-pulse" />
            <div className="h-11 bg-slate-950/80 border border-slate-850 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full max-w-4xl mx-auto px-0 md:px-4 py-2 animate-in fade-in duration-300">
        <div className="bg-rose-950/10 border border-rose-500/20 rounded-2xl p-8 shadow-xl backdrop-blur-sm text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">Failed to Load Settings</h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {error || "An error occurred while loading your profile data."}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchUser}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
          >
            <RefreshCw className="size-4" />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-0 md:px-4 py-2 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Profile Section */}
      <div id="profile">
        <ProfileSection initialUser={user} onUpdateUser={handleUpdateUser} />
      </div>

      {/* Preferences Section */}
      <div id="preferences">
        <PreferencesSection initialUser={user} onUpdateUser={handleUpdateUser} />
      </div>

      {/* Sessions Section */}
      <div id="sessions">
        <SessionsSection />
      </div>

      {/* Danger Zone Section */}
      <div id="danger-zone">
        <DangerZoneSection />
      </div>
    </div>
  );
}
