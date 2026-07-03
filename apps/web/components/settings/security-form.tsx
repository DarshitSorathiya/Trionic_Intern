"use client";

import React, { useState } from "react";
import { Loader2, ShieldCheck, Laptop, Smartphone, KeyRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  type: "desktop" | "mobile";
}

const initialSessions: ActiveSession[] = [
  {
    id: "session-1",
    device: "MacBook Pro (16-inch)",
    browser: "Chrome 124.0.0",
    ip: "192.168.1.12",
    location: "Mumbai, India",
    lastActive: "Active now",
    isCurrent: true,
    type: "desktop",
  },
  {
    id: "session-2",
    device: "iPhone 15 Pro",
    browser: "Safari 17.4",
    ip: "103.88.22.41",
    location: "Delhi, India",
    lastActive: "2 hours ago",
    isCurrent: false,
    type: "mobile",
  },
];

export function SecurityForm() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Form states for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Sessions state
  const [sessions, setSessions] = useState<ActiveSession[]>(initialSessions);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    setIsChangingPassword(true);

    // TODO: Connect to Supabase Auth password update
    // Example:
    // const { error } = await supabase.auth.updateUser({ password: newPassword });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsChangingPassword(false);
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);

    // TODO: Revoke specific session token using Supabase admin / public RPC client flow
    await new Promise((resolve) => setTimeout(resolve, 600));

    setSessions(sessions.filter((s) => s.id !== sessionId));
    setRevokingId(null);
  };

  const handleSignOutAllDevices = async () => {
    setIsSigningOutAll(true);

    // TODO: Connect global sign out
    // Example:
    // const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Retain only the current active session in the mock list
    setSessions(sessions.filter((s) => s.isCurrent));
    setIsSigningOutAll(false);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* 1. Change Password Section */}
      <div className="rounded-lg border border-border p-6 bg-card text-card-foreground">
        <div className="flex items-center gap-2 mb-6">
          <KeyRound className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Change Password</h2>
            <p className="text-xs text-muted-foreground">
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && (
            <div className="text-xs font-semibold text-destructive bg-destructive/10 p-3 rounded-lg">
              {passwordError}
            </div>
          )}

          <div className="space-y-2">
            <label 
              htmlFor="current-password" 
              className="text-sm font-semibold text-foreground block"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isChangingPassword}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="new-password" 
              className="text-sm font-semibold text-foreground block"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isChangingPassword}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="confirm-password" 
              className="text-sm font-semibold text-foreground block"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isChangingPassword}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="w-full sm:w-auto"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>

            {passwordSuccess && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 animate-in fade-in duration-200">
                <ShieldCheck className="size-4" />
                Password updated successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. Active Devices / Sessions Section */}
      <div className="rounded-lg border border-border p-6 bg-card text-card-foreground">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-foreground">Active Sessions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Devices and platforms currently signed into your account.
            </p>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="xs"
              disabled={isSigningOutAll}
              onClick={handleSignOutAllDevices}
              className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:text-destructive shrink-0"
            >
              {isSigningOutAll ? (
                <Loader2 className="size-3 animate-spin mr-1" />
              ) : (
                <LogOut className="size-3 mr-1" />
              )}
              Sign out all other devices
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No active sessions found.
            </div>
          ) : (
            sessions.map((session) => {
              const Icon = session.type === "desktop" ? Laptop : Smartphone;
              return (
                <div
                  key={session.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-background"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary text-primary shrink-0">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground leading-none">
                          {session.device}
                        </span>
                        {session.isCurrent && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.browser} • {session.ip}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={revokingId === session.id}
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      {revokingId === session.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        "Revoke"
                      )}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
