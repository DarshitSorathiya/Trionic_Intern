"use client";

import type { AuditTrace } from "@/hooks/use-audit-trails";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mapDbDocTypeToLabel } from "./metrics-cards";

interface AuditTableProps {
  traces: AuditTrace[];
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

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 4,
});

export function AuditTable({ traces }: AuditTableProps) {
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ok":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "timeout":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "error":
      default:
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-950/80 border-b border-slate-800">
            <TableRow>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider">
                Timestamp
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider">
                User
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider">
                Agent
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider">
                Doc Type
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider">
                Model
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider text-right">
                Tokens
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider text-right">
                Latency
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider text-right">
                Cost (USD)
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider text-center">
                Citations
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider">
                Language
              </TableHead>
              <TableHead className="text-slate-400 font-semibold py-3 px-4 text-xs tracking-wider">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-800/60">
            {traces.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="py-10 text-center text-slate-500 text-xs italic"
                >
                  No matching audit trail traces found.
                </TableCell>
              </TableRow>
            ) : (
              traces.map((trace) => {
                const docType = trace.document?.doc_type || "other";
                const lang = trace.document?.language || "en";
                const modelStr = `${trace.llm_provider}/${trace.model_name}`;

                return (
                  <TableRow
                    key={trace.id}
                    className="hover:bg-slate-800/20 border-slate-800/40 transition-colors"
                  >
                    <TableCell className="py-3 px-4 text-slate-300 font-mono text-xs whitespace-nowrap">
                      {formatTimestamp(trace.created_at)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-200 text-xs font-medium max-w-[150px] truncate">
                      {trace.user ? trace.user.display_name || trace.user.email : "Unknown"}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold border border-slate-700/50 uppercase tracking-wider text-[10px]">
                        {trace.agent_name}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-300 text-xs">
                      {mapDbDocTypeToLabel(docType)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-300 text-xs font-mono">
                      {modelStr}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-300 text-xs font-mono text-right">
                      {(trace.prompt_tokens + trace.completion_tokens).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-300 text-xs font-mono text-right">
                      {trace.latency_ms >= 1000 ? `${(trace.latency_ms / 1000).toFixed(1)}s` : `${trace.latency_ms}ms`}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-200 text-xs font-mono text-right">
                      {CURRENCY_FORMATTER.format(trace.cost_usd)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-300 text-xs text-center">
                      {trace.cited_node_ids?.length > 0 ? (
                        <span className="font-semibold text-indigo-400">
                          {trace.cited_node_ids.length}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-300 text-xs">
                      {LANGUAGE_LABELS[lang] || lang}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(
                          trace.status
                        )}`}
                      >
                        {trace.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
