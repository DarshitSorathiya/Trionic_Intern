"use client";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AuditFilters } from "@/components/admin/audit-filters";
import { AuditTable } from "@/components/admin/audit-table";
import { ExportButton } from "@/components/admin/export-button";
import { useAuditTrails } from "@/hooks/use-audit-trails";
import { Loader2, AlertCircle } from "lucide-react";

export default function AdminAuditPage() {
  const {
    filteredTraces,
    uniqueUsers,
    uniqueModels,
    filters,
    setFilters,
    loading,
    error,
  } = useAuditTrails();

  return (
    <AdminLayout
      title="Audit Logs"
      description="Chronological log of all LLM traces and generation history across the system."
    >
      <div className="space-y-6 mt-2">
        {/* Filters */}
        <AuditFilters
          filters={filters}
          onChange={setFilters}
          uniqueUsers={uniqueUsers}
          uniqueModels={uniqueModels}
        />

        {/* Header with count and Export button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            System Traces ({filteredTraces.length} found)
          </h2>
          <ExportButton startDate={filters.startDate} endDate={filters.endDate} />
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
            <Loader2 className="size-6 animate-spin text-indigo-500" />
            <p className="text-xs text-slate-500 font-medium">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm">
            <AlertCircle className="size-5 shrink-0" />
            <span>Failed to load audit trails: {error}</span>
          </div>
        ) : (
          <AuditTable traces={filteredTraces} />
        )}
      </div>
    </AdminLayout>
  );
}
