/**
 * tracing/index.ts
 * Owner: Umrania Yug (Tracing / observability layer)
 *
 * Public API for the tracing module.
 * Persists AgentTrace records to Supabase `agent_traces` table.
 */

import type { AgentTrace } from "@trionic/shared";
import { redactPII } from "./tracer.js";
import { createClient } from "@supabase/supabase-js";

let supabaseAdmin: ReturnType<typeof createClient> | null = null;
let warnedMissingTraceEnv = false;

function getSupabaseAdmin(): ReturnType<typeof createClient> | null {
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  supabaseAdmin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return supabaseAdmin;
}

export { Tracer } from "./tracer.js";
export { buildTrace, buildErrorTrace, redactPII } from "./tracer.js";
export type { TraceInput, TraceHandle, EndOptions } from "./tracer.js";

/**
 * Persist a trace to Supabase agent_traces table.
 * Uses supabaseAdmin (service role) — bypasses RLS.
 * PII is redacted before any Sentry error logging.
 * Full content is saved to DB as-is.
 */
export async function persistTrace(
  trace: AgentTrace,
  context?: {
    user_id?: string;
    document_id?: string;
  }
): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      if (!warnedMissingTraceEnv) {
        const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
        const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
        const reason = !hasUrl
          ? "missing SUPABASE URL"
          : !hasServiceKey
            ? "missing SUPABASE_SERVICE_ROLE_KEY"
            : "credentials unavailable";
        console.warn(`[Trace] Trace persistence disabled (${reason}) — trace log skipped`);
        warnedMissingTraceEnv = true;
      }
      console.log(
        `[Trace] agent=${trace.agent}` +
        ` model=${trace.model}` +
        ` tokens=${trace.tokens_in}+${trace.tokens_out}` +
        ` cost=$${trace.cost_usd.toFixed(6)}` +
        ` latency=${trace.latency_ms}ms` +
        ` status=${trace.status}`
      );
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const rawUserId = context?.user_id ?? trace.session_id ?? "00000000-0000-0000-0000-000000000000";
    const user_id = uuidRegex.test(rawUserId) ? rawUserId : "00000000-0000-0000-0000-000000000000";

    const rawDocId = context?.document_id ?? trace.session_id ?? null;
    const document_id = (rawDocId && uuidRegex.test(rawDocId)) ? rawDocId : null;

    const { error } = await (supabaseAdmin as any)
      .from("agent_traces")
      .insert({
        user_id,
        document_id,
        agent_name:        trace.agent as "planner" | "classifier" | "drafter" | "citator" | "reviewer" | "translator",
        llm_provider:      trace.model.split("-")[0],   // e.g. "claude", "gpt", "gemini"
        model_name:        trace.model,
        prompt_tokens:     trace.tokens_in,
        completion_tokens: trace.tokens_out,
        cost_usd:          trace.cost_usd,
        latency_ms:        trace.latency_ms,
        // The DB trace_status enum only allows 'ok' | 'error' | 'timeout'.
        // A "rejected" outcome (citator/reviewer blocked the draft) is NOT a
        // success — map it to "error" so it never reads as "ok", and preserve
        // the precise outcome in metadata.agent_status for the dashboard.
        status:            trace.status === "ok" ? "ok" : "error",
        error_msg:         trace.error_message ?? null,
        doc_type:          trace.doc_type ?? null,
        metadata: {
          agent_status: trace.status,
          cited_nodes: trace.cited_nodes,
          session_id:  trace.session_id,
          timestamp:   trace.timestamp,
          parent_trace_id:  trace.parent_trace_id,
        },
      });

    if (error) throw error;

    console.log(
      `[Trace] agent=${trace.agent}` +
      ` model=${trace.model}` +
      ` tokens=${trace.tokens_in}+${trace.tokens_out}` +
      ` cost=$${trace.cost_usd.toFixed(6)}` +
      ` latency=${trace.latency_ms}ms` +
      ` status=${trace.status}`
    );

  } catch (err) {
    // Redact PII before Sentry
    const safeMessage = redactPII(
      err instanceof Error ? err.message : String(err)
    );
    console.error("[Trace] Failed to persist trace:", safeMessage);
    // TODO: Sentry.captureException(new Error(safeMessage))
  }
}