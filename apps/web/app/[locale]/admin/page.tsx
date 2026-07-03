"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { MetricsCards } from "@/components/admin/metrics-cards";
import { useAdminMetrics } from "@/hooks/use-admin-metrics";
import { Loader2, AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const { metrics, loading, error } = useAdminMetrics();

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="View cohort metrics, drafts breakdown, and total LLM budget details."
    >
      <div className="space-y-6 mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
            <Loader2 className="size-6 animate-spin text-indigo-500" />
            <p className="text-xs text-slate-500 font-medium">Loading metrics...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm">
            <AlertCircle className="size-5 shrink-0" />
            <span>Failed to load admin metrics: {error}</span>
          </div>
        ) : metrics ? (
          <MetricsCards
            totalDrafts={metrics.totalDrafts}
            draftsByType={metrics.draftsByType}
            draftsByLanguage={metrics.draftsByLanguage}
            totalLlmCostThisMonth={metrics.totalLlmCostThisMonth}
          />
        ) : (
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
            No metrics data available.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
