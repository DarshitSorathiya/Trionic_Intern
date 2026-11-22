"use strict";
/**
 * tracing/tracer.ts
 * Owner: Umrania Yug (Tracing / observability layer)
 *
 * Core tracing logic. Builds an AgentTrace object from a completed LLM response.
 * Does NOT do I/O — pure transformation. The index.ts handles Supabase persistence.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracer = void 0;
exports.buildTrace = buildTrace;
exports.buildErrorTrace = buildErrorTrace;
exports.redactPII = redactPII;
/**
 * Build a fully-typed AgentTrace from a completed LLM response.
 * All agents should call this after every LLM call before returning.
 */
function buildTrace(input) {
    return {
        agent: input.agent,
        model: input.llmResponse.model,
        tokens_in: input.llmResponse.tokens_in,
        tokens_out: input.llmResponse.tokens_out,
        cost_usd: input.llmResponse.cost_usd,
        latency_ms: input.llmResponse.latency_ms,
        cited_nodes: input.cited_nodes,
        status: input.status,
        timestamp: new Date().toISOString(),
        session_id: input.session_id,
        error_message: input.error_message,
    };
}
/**
 * Build an error trace when an agent fails before even reaching the LLM.
 */
function buildErrorTrace(agent, error, session_id) {
    const message = error instanceof Error ? error.message : String(error);
    return {
        agent,
        model: "unknown",
        tokens_in: 0,
        tokens_out: 0,
        cost_usd: 0,
        latency_ms: 0,
        cited_nodes: [],
        status: "error",
        timestamp: new Date().toISOString(),
        session_id,
        error_message: message,
    };
}
// ─── PII Redaction ────────────────────────────────────────────────────────────
/**
 * Scrub PII from a string before it goes to Sentry logs.
 * Full content is still saved to DB — this is ONLY for error logging.
 */
function redactPII(input) {
    return input
        // Aadhaar (12-digit number with optional spaces)
        .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[AADHAAR REDACTED]")
        // PAN card (e.g. ABCDE1234F)
        .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, "[PAN REDACTED]")
        // Indian phone numbers
        .replace(/(\+91[\s-]?|0)?[6-9]\d{9}/g, "[PHONE REDACTED]")
        // Email addresses
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL REDACTED]")
        // Dates (DD/MM/YYYY or YYYY-MM-DD)
        .replace(/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/g, "[DOB REDACTED]")
        // Credit/debit card numbers (16 digits)
        .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[CARD REDACTED]");
}
// ─── Tracer Class ─────────────────────────────────────────────────────────────
/**
 * Tracer — start/end API for timing and recording agent calls.
 *
 * Usage in every agent:
 *   const handle = Tracer.start("planner", session_id);
 *   const llmResponse = await router.call(...);
 *   const trace = handle.end({ llmResponse, cited_nodes: [], status: "ok" });
 *   await persistTrace(trace);
 */
class Tracer {
    /**
     * Start timing an agent call.
     *
     * @param agent      - Agent name e.g. "planner", "drafter"
     * @param session_id - Optional session ID for RLS scoping
     * @param doc_type   - Optional document type from runAgentChain context
     * @param parent_trace_id - Optional parent trace ID for nested calls
     */
    static start(agent, session_id, doc_type, parent_trace_id) {
        const startTime = Date.now();
        return {
            end(options) {
                const latency_ms = Date.now() - startTime;
                return {
                    agent,
                    model: options.llmResponse.model,
                    tokens_in: options.llmResponse.tokens_in,
                    tokens_out: options.llmResponse.tokens_out,
                    cost_usd: options.llmResponse.cost_usd,
                    latency_ms,
                    cited_nodes: options.cited_nodes,
                    status: options.status,
                    timestamp: new Date().toISOString(),
                    session_id,
                    error_message: options.error_message,
                    parent_trace_id,
                    doc_type,
                };
            },
        };
    }
    /**
     * Query agent_traces for a document and return cost/token/latency summary.
     * Used by @Ayush5112006's cost dashboard.
     *
     * @param document_id - The document UUID to summarise
     */
    static async summary(document_id) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
        const { data, error } = await supabase
            .from("agent_traces")
            .select("model_name, prompt_tokens, completion_tokens, cost_usd, latency_ms")
            .eq("document_id", document_id);
        if (error)
            throw new Error(`Tracer.summary failed: ${error.message}`);
        if (!data || data.length === 0) {
            return {
                total_tokens: 0,
                total_cost_usd: 0,
                p95_latency_ms: 0,
                model_breakdown: {},
            };
        }
        // Calculate totals
        const total_tokens = data.reduce((sum, row) => sum + (row.prompt_tokens ?? 0) + (row.completion_tokens ?? 0), 0);
        const total_cost_usd = data.reduce((sum, row) => sum + (row.cost_usd ?? 0), 0);
        // Calculate p95 latency
        const latencies = data
            .map((row) => row.latency_ms ?? 0)
            .sort((a, b) => a - b);
        const p95Index = Math.floor(latencies.length * 0.95);
        const p95_latency_ms = latencies[p95Index] ?? 0;
        // Build model breakdown
        const model_breakdown = {};
        for (const row of data) {
            const model = row.model_name ?? "unknown";
            if (!model_breakdown[model]) {
                model_breakdown[model] = { tokens: 0, cost: 0 };
            }
            model_breakdown[model].tokens +=
                (row.prompt_tokens ?? 0) + (row.completion_tokens ?? 0);
            model_breakdown[model].cost += row.cost_usd ?? 0;
        }
        return {
            total_tokens,
            total_cost_usd,
            p95_latency_ms,
            model_breakdown,
        };
    }
}
exports.Tracer = Tracer;
//# sourceMappingURL=tracer.js.map