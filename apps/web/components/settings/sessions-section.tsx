"use client";

import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Shield, Laptop, Monitor, LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SessionsSection() {
  const [isRevoking, setIsRevoking] = useState(false);
  const [otherDevicesCleared, setOtherDevicesCleared] = useState(false);

  const handleSignOutOtherDevices = async () => {
    setIsRevoking(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "others" });

      if (error) {
        throw error;
      }

      setOtherDevicesCleared(true);
      toast({
        title: "Sessions Revoked",
        description: "Successfully signed out from all other devices.",
        variant: "success",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not revoke other sessions. Please try again.";
      console.error("Failed to revoke other sessions:", message);
      toast({
        title: "Action Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Shield className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Active Sessions</h2>
          <p className="text-xs text-slate-400">Track and manage your current signed-in devices.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Session</span>

          {/* Current Session details */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
              <Laptop className="size-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">Chrome on macOS</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active now
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-0.5">
                <p>IP Address: 103.88.22.41</p>
                <p>Location: Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Other Sessions details */}
        {!otherDevicesCleared && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Other Active Devices</span>
            
            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/20 opacity-70">
              <div className="p-2.5 bg-slate-800 text-slate-400 rounded-lg shrink-0">
                <Monitor className="size-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-300">Safari on iPhone 15</span>
                  <span className="text-[10px] text-slate-500">2 hours ago</span>
                </div>
                <div className="text-xs text-slate-400 space-y-0.5">
                  <p>IP Address: 192.168.1.104</p>
                  <p>Location: New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 gap-4 border-t border-slate-900">
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
            If you notice any unfamiliar activity, revoke all other active sessions immediately to keep your account secure.
          </p>
          <button
            type="button"
            onClick={handleSignOutOtherDevices}
            disabled={isRevoking || otherDevicesCleared}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-850/40 text-slate-200 disabled:text-slate-500 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-700 disabled:cursor-not-allowed shrink-0"
          >
            {isRevoking ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Revoking...</span>
              </>
            ) : (
              <>
                <LogOut className="size-4" />
                <span>Sign Out Of All Other Devices</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
