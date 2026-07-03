"use client";

import type { AuditFilters as AuditFiltersType } from "@/hooks/use-audit-trails";
import { mapDbDocTypeToLabel } from "./metrics-cards";

interface AuditFiltersProps {
  filters: AuditFiltersType;
  onChange: (filters: AuditFiltersType) => void;
  uniqueUsers: { id: string; email: string; display_name: string | null }[];
  uniqueModels: string[];
}

const DOCUMENT_TYPES = [
  "petition",
  "notice",
  "agreement",
  "complaint",
  "other",
];

export function AuditFilters({
  filters,
  onChange,
  uniqueUsers,
  uniqueModels,
}: AuditFiltersProps) {
  const handleChange = (key: keyof AuditFiltersType, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClear = () => {
    onChange({
      user_id: "all",
      doc_type: "all",
      model: "all",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* User filter */}
        <div className="space-y-1.5">
          <label htmlFor="user-filter" className="text-xs font-semibold text-slate-400">
            User
          </label>
          <select
            id="user-filter"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none focus:border-slate-700 transition duration-200"
            value={filters.user_id}
            onChange={(e) => handleChange("user_id", e.target.value)}
          >
            <option value="all">All Users</option>
            {uniqueUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.display_name || user.email}
              </option>
            ))}
          </select>
        </div>

        {/* Document Type filter */}
        <div className="space-y-1.5">
          <label htmlFor="doc-type-filter" className="text-xs font-semibold text-slate-400">
            Document Type
          </label>
          <select
            id="doc-type-filter"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none focus:border-slate-700 transition duration-200"
            value={filters.doc_type}
            onChange={(e) => handleChange("doc_type", e.target.value)}
          >
            <option value="all">All Document Types</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {mapDbDocTypeToLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Model filter */}
        <div className="space-y-1.5">
          <label htmlFor="model-filter" className="text-xs font-semibold text-slate-400">
            Model
          </label>
          <select
            id="model-filter"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none focus:border-slate-700 transition duration-200"
            value={filters.model}
            onChange={(e) => handleChange("model", e.target.value)}
          >
            <option value="all">All Models</option>
            {uniqueModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <label htmlFor="start-date" className="text-xs font-semibold text-slate-400">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none focus:border-slate-700 transition duration-200 [color-scheme:dark]"
            value={filters.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label htmlFor="end-date" className="text-xs font-semibold text-slate-400">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl py-2 px-3 text-xs outline-none focus:border-slate-700 transition duration-200 [color-scheme:dark]"
            value={filters.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
