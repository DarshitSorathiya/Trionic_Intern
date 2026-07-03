"use client";

import React, { useState } from "react";
import type { User } from "@trionic/shared";
import { toast } from "@/hooks/use-toast";
import { User as UserIcon, Mail, Loader2, Save } from "lucide-react";

interface ProfileSectionProps {
  initialUser: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

export function ProfileSection({ initialUser, onUpdateUser }: ProfileSectionProps) {
  const [displayName, setDisplayName] = useState(initialUser.display_name || "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation check
    if (!displayName.trim()) {
      setError("Display Name cannot be empty");
      return;
    }
    if (displayName.trim().length < 2) {
      setError("Display Name must be at least 2 characters");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ display_name: displayName }),
      });

      if (!res.ok) {
        throw new Error("Failed to save display name");
      }

      const updatedUser = (await res.json()) as User;
      onUpdateUser(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile details have been saved successfully.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Save Failed",
        description: "Something went wrong while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <UserIcon className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Profile Details</h2>
          <p className="text-xs text-slate-400">Update your public identity and profile credentials.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="displayName" className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
            Display Name
          </label>
          <div className="relative">
            <input
              id="displayName"
              type="text"
              className={`w-full bg-slate-950/80 border ${
                error ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-800 focus:border-slate-700 focus:ring-slate-700/20"
              } rounded-xl py-3 pl-4 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition duration-200 focus:ring-4`}
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSaving}
              aria-invalid={!!error}
              aria-describedby={error ? "displayName-error" : undefined}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <UserIcon className="size-4" />
            </div>
          </div>
          {error && (
            <p id="displayName-error" className="text-xs text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-300">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              className="w-full bg-slate-950/40 border border-slate-900 rounded-xl py-3 pl-4 pr-10 text-sm text-slate-500 select-none cursor-not-allowed outline-none"
              value={initialUser.email}
              readOnly
              disabled
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-600">
              <Mail className="size-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Your email is managed by account security settings and cannot be changed here.
          </p>
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
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
