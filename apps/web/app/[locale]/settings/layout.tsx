import React from "react";
import { Metadata } from "next";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export const metadata: Metadata = {
  title: "Settings — Trionic AI Adalat",
  description: "Manage your profile, preferences, and account security options.",
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* settings view title (always visible) */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          System settings
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Configure profile details, regional preferences, and security access.
        </p>
      </div>

      {/* Main settings content flex split */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 pt-4 border-t border-border">
        {/* Sidebar Navigation */}
        <SettingsSidebar />

        {/* Content Pane */}
        <main className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
