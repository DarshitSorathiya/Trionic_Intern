"use client";

import React, { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { AlertOctagon, X, Loader2 } from "lucide-react";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not delete account. Please try again.')
      }

      toast({
        title: "Account Scheduled for Deletion",
        description: "Your account deletion request has been submitted successfully.",
        variant: "success",
      });
      onClose();
    } catch {
      toast({
        title: "Delete Failed",
        description: "Could not request account deletion. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content Card */}
      <div
        ref={overlayRef}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 transition-all duration-300 transform scale-100 opacity-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Close Icon */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        {/* Warning Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl shrink-0">
            <AlertOctagon className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 id="modal-title" className="text-lg font-bold text-slate-100 leading-none">
              Delete Account
            </h3>
            <p className="text-xs text-slate-400">
              Confirm your request to delete your Trionic Adalat account.
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="mt-4 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
          <p className="font-semibold mb-1">Warning: This action cannot be undone.</p>
          <p>
            Deleting your account will permanently purge all drafted documents, generation history, settings, and active sessions from our system.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-slate-200 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/10 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 active:scale-95"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Account</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
