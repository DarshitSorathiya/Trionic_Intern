"use client";

import React, { useState } from "react";
import type { User, SupportedLanguage } from "@trionic/shared";
import { toast } from "@/hooks/use-toast";
import { Settings, Globe, Bell, Loader2, Save } from "lucide-react";

interface PreferencesSectionProps {
  initialUser: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

const LANGUAGES: { value: SupportedLanguage; label: string; nativeLabel: string }[] = [
  { value: "en", label: "English", nativeLabel: "English" },
  { value: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { value: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  { value: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { value: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
];

export function PreferencesSection({ initialUser, onUpdateUser }: PreferencesSectionProps) {
  const [language, setLanguage] = useState<SupportedLanguage>(initialUser.default_language || "en");
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    productUpdates: false,
    securityAlerts: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ default_language: language }),
      });

      if (!res.ok) {
        throw new Error("Failed to save preferences");
      }

      const updatedUser = (await res.json()) as User;
      onUpdateUser(updatedUser);

      toast({
        title: "Preferences Saved",
        description: "Your language and notification settings have been updated.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Save Failed",
        description: "Something went wrong while saving your preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Settings className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Application Preferences</h2>
          <p className="text-xs text-slate-400">Manage localization options and system notifications.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <label htmlFor="languageSelect" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Globe className="size-4 text-slate-400" />
            Default Language
          </label>
          <div className="relative">
            <select
              id="languageSelect"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              disabled={isSaving}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:border-slate-700 focus:ring-4 focus:ring-slate-700/20 select-none appearance-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-slate-950 text-slate-100 py-2">
                  {lang.label} ({lang.nativeLabel})
                </option>
              ))}
            </select>
            {/* Custom arrow icon */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Changing this updates the default language for generated documents. Supported Indic scripts are styled for maximum readability.
          </p>
        </div>

        {/* Notifications Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Bell className="size-4 text-slate-400" />
            Notification Settings
          </div>

          <div className="space-y-3.5">
            {/* Toggle 1: Email Notifications */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-900 bg-slate-950/30">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200">Email Notifications</span>
                <p className="text-[10px] text-slate-500">Receive critical account alerts via email.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.emailNotifications}
                onClick={() => toggleNotification("emailNotifications")}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  notifications.emailNotifications ? "bg-indigo-600" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.emailNotifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Product Updates */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-900 bg-slate-950/30">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200">Product Updates</span>
                <p className="text-[10px] text-slate-500">Get notified when new features or draft templates launch.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.productUpdates}
                onClick={() => toggleNotification("productUpdates")}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  notifications.productUpdates ? "bg-indigo-600" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.productUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Security Alerts */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-900 bg-slate-950/30">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200">Security Alerts</span>
                <p className="text-[10px] text-slate-500">Immediate warnings about login events and password changes.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.securityAlerts}
                onClick={() => toggleNotification("securityAlerts")}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  notifications.securityAlerts ? "bg-indigo-600" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.securityAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
