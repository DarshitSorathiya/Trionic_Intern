"use client";

import React, { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
];

export function PreferencesForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Preference states
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedTheme, setSelectedTheme] = useState("system");
  
  // Notification states
  const [emailDigest, setEmailDigest] = useState(true);
  const [docAlerts, setDocAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    // TODO: Connect language settings change to translation provider or router updates
    // TODO: Connect theme settings change to ThemeProvider context
    // TODO: Connect notification toggles to Supabase user settings metadata table
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setIsSubmitting(false);
    setSuccess(true);
    
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* 1. Localization Settings */}
      <div className="rounded-lg border border-border p-6 space-y-6 bg-card text-card-foreground">
        <div>
          <h2 className="text-base font-semibold text-foreground">Language & Regional Preferences</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure default interface language and formatting settings.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="lang-select" 
              className="text-sm font-semibold text-foreground block"
            >
              System Language
            </label>
            <div className="relative">
              {/* Note on Indic script sizing: 
                  We use leading-relaxed and a text size of text-sm (14px) / md:text-base (16px) 
                  to ensure complex ligatures and character loops in Hindi/Gujarati/Tamil 
                  render clearly and do not overlap container boundaries. */}
              <select
                id="lang-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm md:text-base leading-relaxed tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {languages.map((lang) => (
                  <option 
                    key={lang.code} 
                    value={lang.code}
                    className="py-1 font-sans text-sm md:text-base"
                  >
                    {lang.name} — {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
            {/* Future i18n implementation hook note */}
            {/* TODO: Integrate next-intl / react-i18next provider here. 
                Dynamic script support requires switching directionality (RTL/LTR) 
                and loading language-specific fonts dynamically. */}
            <p className="text-xs text-muted-foreground mt-1">
              Select your language. Localized content adjusts spacing automatically.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Theme Selection */}
      <div className="rounded-lg border border-border p-6 space-y-6 bg-card text-card-foreground">
        <div>
          <h2 className="text-base font-semibold text-foreground">Interface Appearance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customize the look and feel of your app interface.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "light", label: "Light" },
            { id: "dark", label: "Dark" },
            { id: "system", label: "System" },
          ].map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme.id)}
              disabled={isSubmitting}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border text-sm font-medium transition-all ${
                selectedTheme === theme.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Notification Settings */}
      <div className="rounded-lg border border-border p-6 space-y-6 bg-card text-card-foreground">
        <div>
          <h2 className="text-base font-semibold text-foreground">Email Notifications</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Decide what updates you receive in your inbox.
          </p>
        </div>

        <div className="space-y-4 divider-y divider-border">
          {/* Email Digest Switch */}
          <div className="flex items-start justify-between gap-4 py-2">
            <div className="space-y-0.5">
              <label 
                htmlFor="digest-switch" 
                className="text-sm font-medium text-foreground block cursor-pointer select-none"
              >
                Daily Email Digest
              </label>
              <span className="text-xs text-muted-foreground block leading-relaxed">
                Receive a summary of recent document edits and unresolved review tasks.
              </span>
            </div>
            <button
              id="digest-switch"
              type="button"
              role="switch"
              aria-checked={emailDigest}
              disabled={isSubmitting}
              onClick={() => setEmailDigest(!emailDigest)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                emailDigest ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  emailDigest ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Document Alerts Switch */}
          <div className="flex items-start justify-between gap-4 py-2 border-t border-border pt-4">
            <div className="space-y-0.5">
              <label 
                htmlFor="doc-alerts-switch" 
                className="text-sm font-medium text-foreground block cursor-pointer select-none"
              >
                Activity Alerts
              </label>
              <span className="text-xs text-muted-foreground block leading-relaxed">
                Get notified instantly when someone comments or updates your filings.
              </span>
            </div>
            <button
              id="doc-alerts-switch"
              type="button"
              role="switch"
              aria-checked={docAlerts}
              disabled={isSubmitting}
              onClick={() => setDocAlerts(!docAlerts)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                docAlerts ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  docAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Security Alerts Switch */}
          <div className="flex items-start justify-between gap-4 py-2 border-t border-border pt-4">
            <div className="space-y-0.5">
              <label 
                htmlFor="sec-alerts-switch" 
                className="text-sm font-medium text-foreground block cursor-pointer select-none"
              >
                Security & Verification Alerts
              </label>
              <span className="text-xs text-muted-foreground block leading-relaxed">
                Critical updates about login attempts from new devices or password changes.
              </span>
            </div>
            <button
              id="sec-alerts-switch"
              type="button"
              role="switch"
              aria-checked={securityAlerts}
              disabled={isSubmitting}
              onClick={() => setSecurityAlerts(!securityAlerts)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                securityAlerts ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  securityAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving preferences...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>

        {success && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 animate-in fade-in duration-200">
            <Check className="size-4" />
            Preferences saved successfully
          </span>
        )}
      </div>
    </form>
  );
}
