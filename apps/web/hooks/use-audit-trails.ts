import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AuditTrace {
  id: string;
  created_at: string;
  agent_name: string;
  llm_provider: string;
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  latency_ms: number;
  status: string;
  error_msg: string | null;
  cited_node_ids: string[];
  user_id: string;
  user: {
    id: string;
    email: string;
    display_name: string | null;
  } | null;
  document_id: string | null;
  document: {
    id: string;
    title: string;
    doc_type: string;
    language: string;
  } | null;
}

export interface AuditFilters {
  user_id: string;
  doc_type: string;
  model: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export function useAuditTrails() {
  const [traces, setTraces] = useState<AuditTrace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AuditFilters>({
    user_id: "all",
    doc_type: "all",
    model: "all",
    startDate: "",
    endDate: "",
  });

  const fetchTraces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      // Fetch all agent traces with joined users and documents
      const { data, error: queryError } = await supabase
        .from("agent_traces")
        .select(`
          id,
          created_at,
          agent_name,
          llm_provider,
          model_name,
          prompt_tokens,
          completion_tokens,
          cost_usd,
          latency_ms,
          status,
          error_msg,
          metadata,
          user_id,
          users (
            id,
            email,
            display_name
          ),
          document_id,
          documents (
            id,
            title,
            doc_type,
            language
          )
        `)
        .order("created_at", { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      // Format response cleanly
      const formatted: AuditTrace[] = (data || []).map((t: any) => ({
        id: t.id,
        created_at: t.created_at,
        agent_name: t.agent_name,
        llm_provider: t.llm_provider,
        model_name: t.model_name,
        prompt_tokens: t.prompt_tokens || 0,
        completion_tokens: t.completion_tokens || 0,
        cost_usd: Number(t.cost_usd || 0),
        latency_ms: t.latency_ms || 0,
        status: t.status,
        error_msg: t.error_msg,
        cited_node_ids: t.metadata?.cited_nodes || [],
        user_id: t.user_id,
        user: t.users ? {
          id: t.users.id,
          email: t.users.email,
          display_name: t.users.display_name,
        } : null,
        document_id: t.document_id,
        document: t.documents ? {
          id: t.documents.id,
          title: t.documents.title,
          doc_type: t.documents.doc_type,
          language: t.documents.language,
        } : null,
      }));

      setTraces(formatted);
    } catch (err) {
      console.error("Error in useAuditTrails:", err);
      setError(err instanceof Error ? err.message : "Failed to load audit trails");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTraces();
  }, [fetchTraces]);

  // Extract unique users from traces
  const uniqueUsers = useMemo(() => {
    const usersMap = new Map<string, { id: string; email: string; display_name: string | null }>();
    traces.forEach((t) => {
      if (t.user) {
        usersMap.set(t.user.id, t.user);
      }
    });
    return Array.from(usersMap.values()).sort((a, b) => 
      (a.display_name || a.email).localeCompare(b.display_name || b.email)
    );
  }, [traces]);

  // Extract unique models from traces
  const uniqueModels = useMemo(() => {
    const modelsSet = new Set<string>();
    traces.forEach((t) => {
      modelsSet.add(`${t.llm_provider}/${t.model_name}`);
    });
    return Array.from(modelsSet).sort();
  }, [traces]);

  // Apply filtering logic client-side
  const filteredTraces = useMemo(() => {
    return traces.filter((t) => {
      // User filter
      if (filters.user_id !== "all" && t.user_id !== filters.user_id) {
        return false;
      }

      // Document Type filter
      if (filters.doc_type !== "all") {
        const docType = t.document?.doc_type || "other";
        if (docType !== filters.doc_type) {
          return false;
        }
      }

      // Model filter
      if (filters.model !== "all") {
        const modelKey = `${t.llm_provider}/${t.model_name}`;
        if (modelKey !== filters.model) {
          return false;
        }
      }

      // Date filters
      if (filters.startDate) {
        const traceDate = new Date(t.created_at).toISOString().slice(0, 10);
        if (traceDate < filters.startDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const traceDate = new Date(t.created_at).toISOString().slice(0, 10);
        if (traceDate > filters.endDate) {
          return false;
        }
      }

      return true;
    });
  }, [traces, filters]);

  return {
    traces,
    filteredTraces,
    uniqueUsers,
    uniqueModels,
    filters,
    setFilters,
    loading,
    error,
    refetch: fetchTraces,
  };
}
