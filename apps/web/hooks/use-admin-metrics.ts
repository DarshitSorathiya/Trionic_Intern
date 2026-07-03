import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DocumentType, SupportedLanguage } from "@trionic/shared";

export interface AdminMetrics {
  totalDrafts: number;
  draftsByType: Record<string, number>;
  draftsByLanguage: Record<string, number>;
  totalLlmCostThisMonth: number;
}

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      // 1. Fetch all documents for doc_type and language breakdown
      const { data: docs, error: docsError } = await supabase
        .from("documents")
        .select("doc_type, language");

      if (docsError) {
        throw new Error(docsError.message);
      }

      // 2. Fetch agent traces for the current month to compute LLM cost
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: traces, error: tracesError } = await supabase
        .from("agent_traces")
        .select("cost_usd")
        .gte("created_at", startOfMonth.toISOString());

      if (tracesError) {
        throw new Error(tracesError.message);
      }

      // 3. Process and aggregate metrics
      const docsData = docs ?? [];
      const tracesData = traces ?? [];

      const totalDrafts = docsData.length;
      const draftsByType = docsData.reduce((acc: Record<string, number>, doc: any) => {
        acc[doc.doc_type] = (acc[doc.doc_type] || 0) + 1;
        return acc;
      }, {});

      const draftsByLanguage = docsData.reduce((acc: Record<string, number>, doc: any) => {
        acc[doc.language] = (acc[doc.language] || 0) + 1;
        return acc;
      }, {});

      const totalLlmCostThisMonth = tracesData.reduce((sum: number, trace: any) => sum + (trace.cost_usd || 0), 0);

      setMetrics({
        totalDrafts,
        draftsByType,
        draftsByLanguage,
        totalLlmCostThisMonth,
      });
    } catch (err) {
      console.error("Error in useAdminMetrics:", err);
      setError(err instanceof Error ? err.message : "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
}
