"use client";

import { FileText, FileSpreadsheet, Globe, DollarSign } from "lucide-react";

interface MetricsCardsProps {
  totalDrafts: number;
  draftsByType: Record<string, number>;
  draftsByLanguage: Record<string, number>;
  totalLlmCostThisMonth: number;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  gu: "Gujarati",
  mr: "Marathi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  bn: "Bengali",
  pa: "Punjabi",
  ur: "Urdu",
};

export function mapDbDocTypeToLabel(type: string): string {
  const mapping: Record<string, string> = {
    petition: "RTI Application",
    notice: "Legal Notice",
    agreement: "NDA",
    complaint: "Consumer Complaint",
    // Frontend matching types
    rti_application: "RTI Application",
    legal_notice: "Legal Notice",
    nda: "NDA",
    consumer_complaint: "Consumer Complaint",
    cheque_bounce_notice: "Cheque Bounce Notice",
  };
  return mapping[type] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function MetricsCards({
  totalDrafts,
  draftsByType,
  draftsByLanguage,
  totalLlmCostThisMonth,
}: MetricsCardsProps) {
  // Sort types by count descending
  const sortedTypes = Object.entries(draftsByType).sort((a, b) => b[1] - a[1]);
  // Sort languages by count descending
  const sortedLanguages = Object.entries(draftsByLanguage).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Drafts */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80 flex flex-col justify-between min-h-[160px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Drafts</span>
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <FileText className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-slate-100">{totalDrafts}</div>
          <p className="text-xs text-slate-400 mt-1">Created drafts across all users</p>
        </div>
      </div>

      {/* Drafts by Document Type */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80 flex flex-col justify-between min-h-[160px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">By Doc Type</span>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <FileSpreadsheet className="size-5" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[90px] pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {sortedTypes.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No document types</span>
          ) : (
            sortedTypes.map(([type, count]) => (
              <div key={type} className="flex justify-between items-center text-xs">
                <span className="text-slate-300 truncate mr-2">{mapDbDocTypeToLabel(type)}</span>
                <span className="font-mono font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Drafts by Language */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80 flex flex-col justify-between min-h-[160px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">By Language</span>
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <Globe className="size-5" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[90px] pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {sortedLanguages.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No languages logged</span>
          ) : (
            sortedLanguages.map(([lang, count]) => (
              <div key={lang} className="flex justify-between items-center text-xs">
                <span className="text-slate-300 truncate mr-2">{LANGUAGE_LABELS[lang] || lang}</span>
                <span className="font-mono font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Total LLM Cost */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:border-slate-700/80 flex flex-col justify-between min-h-[160px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cost (This Month)</span>
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
            <DollarSign className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-slate-100">
            {CURRENCY_FORMATTER.format(totalLlmCostThisMonth)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Aggregated LLM API spend</p>
        </div>
      </div>
    </div>
  );
}
