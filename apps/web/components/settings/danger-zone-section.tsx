"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { DeleteAccountDialog } from "./delete-account-dialog";

export function DangerZoneSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="bg-rose-950/10 border border-rose-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:border-rose-500/40">
      <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4 mb-6">
        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-rose-300">Danger Zone</h2>
          <p className="text-xs text-rose-400/80">Critical actions that can result in irreversible data loss.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-200">Delete My Account</h4>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Permanently erase all your document records, generation history, settings, and billing metadata. This action cannot be undone.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-550/30 text-rose-300 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 active:scale-95 shrink-0"
        >
          <Trash2 className="size-4" />
          <span>Delete My Account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteAccountDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </section>
  );
}
