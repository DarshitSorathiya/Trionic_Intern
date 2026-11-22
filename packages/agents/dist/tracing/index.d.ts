/**
 * tracing/index.ts
 * Owner: Umrania Yug (Tracing / observability layer)
 *
 * Public API for the tracing module.
 * Persists AgentTrace records to Supabase `agent_traces` table.
 */
import type { AgentTrace } from "@trionic/shared";
export { Tracer } from "./tracer.js";
export { buildTrace, buildErrorTrace, redactPII } from "./tracer.js";
export type { TraceInput, TraceHandle, EndOptions } from "./tracer.js";
/**
 * Persist a trace to Supabase agent_traces table.
 * Uses supabaseAdmin (service role) — bypasses RLS.
 * PII is redacted before any Sentry error logging.
 * Full content is saved to DB as-is.
 */
export declare function persistTrace(trace: AgentTrace, context?: {
    user_id?: string;
    document_id?: string;
}): Promise<void>;
//# sourceMappingURL=index.d.ts.map