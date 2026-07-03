"use client";

import React from "react";
import { useToastStore } from "@/hooks/use-toast";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const isSuccess = t.variant === "success";
        const isDestructive = t.variant === "destructive";

        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5",
              isSuccess
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-100"
                : isDestructive
                ? "bg-rose-950/90 border-rose-500/30 text-rose-100"
                : "bg-slate-900/90 border-slate-800 text-slate-100"
            )}
            role="alert"
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle2 className="size-5 text-emerald-400" />
              ) : isDestructive ? (
                <AlertTriangle className="size-5 text-rose-400" />
              ) : (
                <Info className="size-5 text-sky-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && (
                <h4 className="text-sm font-semibold tracking-tight">{t.title}</h4>
              )}
              <p className="text-xs leading-relaxed text-opacity-90">{t.description}</p>
            </div>

            <button
              onClick={() => dismissToast(t.id)}
              className="shrink-0 rounded-lg p-1 text-inherit opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Close notification"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
