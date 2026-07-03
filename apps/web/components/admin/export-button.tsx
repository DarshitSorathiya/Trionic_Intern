"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ExportButtonProps {
  startDate?: string;
  endDate?: string;
}

export function ExportButton({ startDate, endDate }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // 1. Determine date range (default to last 30 days if not specified)
      let fromDateStr = startDate;
      let toDateStr = endDate;

      if (!startDate) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        fromDateStr = thirtyDaysAgo.toISOString();
      } else {
        fromDateStr = new Date(startDate as string).toISOString();
      }

      if (!endDate) {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        toDateStr = now.toISOString();
      } else {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        toDateStr = end.toISOString();
      }

      // 2. Fetch the CSV download
      const params = new URLSearchParams({
        from: fromDateStr,
        to: toDateStr,
      });

      const res = await fetch(`/api/admin/audit-export?${params.toString()}`);

      if (!res.ok) {
        let errMsg = "Failed to export audit log CSV";
        try {
          const errData = await res.json();
          if (errData.message) errMsg = errData.message;
        } catch {
          // ignore parsing error
        }
        throw new Error(errMsg);
      }

      // 3. Trigger browser download of CSV blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-export-${fromDateStr.slice(0, 10)}-to-${toDateStr.slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "The audit log CSV has been downloaded successfully.",
        variant: "success",
      });
    } catch (err) {
      console.error("CSV Export failed:", err);
      toast({
        title: "Export Failed",
        description: err instanceof Error ? err.message : "Something went wrong while exporting the logs.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed active:scale-95"
    >
      {exporting ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="size-4" />
          <span>Export CSV</span>
        </>
      )}
    </button>
  );
}
