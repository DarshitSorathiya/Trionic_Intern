"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DangerZone() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [verificationText, setVerificationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationText !== "DELETE") return;

    setIsDeleting(true);

    // TODO: Connect to Supabase Auth Admin API or Custom Edge Function to delete account
    // Example:
    // const { error } = await supabase.rpc('delete_user_account');
    // if (!error) router.push('/sign-in');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsDeleting(false);
    setIsConfirming(false);
    setVerificationText("");
    alert("Account deletion requested (this is a frontend placeholder).");
  };

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 space-y-6 max-w-2xl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-6 text-destructive shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
          <p className="text-xs text-muted-foreground leading-normal">
            Permanently delete your account and all associated workspace documents, search history, and settings. This action is irreversible.
          </p>
        </div>
      </div>

      {!isConfirming ? (
        <div className="pt-2 border-t border-destructive/20">
          <Button
            variant="destructive"
            onClick={() => setIsConfirming(true)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-1.5 size-4" />
            Delete Account
          </Button>
        </div>
      ) : (
        <form 
          onSubmit={handleDeleteAccount} 
          className="space-y-4 pt-4 border-t border-destructive/20 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="space-y-2">
            <label 
              htmlFor="delete-confirm" 
              className="text-xs font-semibold text-destructive block"
            >
              To confirm, type <span className="underline font-bold">DELETE</span> in the box below:
            </label>
            <input
              id="delete-confirm"
              type="text"
              required
              value={verificationText}
              onChange={(e) => setVerificationText(e.target.value)}
              disabled={isDeleting}
              placeholder="Type DELETE"
              className="w-full sm:max-w-xs px-3 py-2 rounded-lg border border-destructive/30 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="submit"
              variant="destructive"
              disabled={verificationText !== "DELETE" || isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting account...
                </>
              ) : (
                "Permanently Delete My Account"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => {
                setIsConfirming(false);
                setVerificationText("");
              }}
              className="w-full sm:w-auto hover:bg-muted dark:hover:bg-muted/50 border-input bg-background"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
