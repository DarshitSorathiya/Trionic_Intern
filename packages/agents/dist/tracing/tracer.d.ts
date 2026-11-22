/**
 * tracing/tracer.ts
 * Owner: Umrania Yug (Tracing / observability layer)
 *
 * Core tracing logic. Builds an AgentTrace object from a completed LLM response.
 * Does NOT do I/O — pure transformation. The index.ts handles Supabase persistence.
 */
import type { AgentTrace, PageIndexNodeId } from "@trionic/shared";
import type { LLMResponse } from "../router/index.js";
export interface TraceInput {
    /** Name of the agent that ran. */
    agent: string;
    /** LLM response returned by the router. */
    llmResponse: LLMResponse;
    /** PageIndex node IDs cited in this output (empty [] for planner/classifier). */
    cited_nodes: PageIndexNodeId[];
    /** Terminal status for this step. */
    status: AgentTrace["status"];
    /** Optional session/user ID for RLS scoping. */
    session_id?: string;
    /** Error message if status is "error" or "rejected". */
    error_message?: string;
}
/**
 * Build a fully-typed AgentTrace from a completed LLM response.
 * All agents should call this after every LLM call before returning.
 */
export declare function buildTrace(input: TraceInput): AgentTrace;
/**
 * Build an error trace when an agent fails before even reaching the LLM.
 */
export declare function buildErrorTrace(agent: string, error: unknown, session_id?: string): AgentTrace;
/**
 * Scrub PII from a string before it goes to Sentry logs.
 * Full content is still saved to DB — this is ONLY for error logging.
 */
export declare function redactPII(input: string): string;
/**
 * What you pass to handle.end() when the agent finishes
 */
export interface EndOptions {
    /** LLM response from the router */
    llmResponse: LLMResponse;
    /** PageIndex node IDs cited in this output (empty [] for planner/classifier). */
    cited_nodes: PageIndexNodeId[];
    /** Terminal status for this step. */
    status: AgentTrace["status"];
    /** Error message if status is "error" or "rejected". */
    error_message?: string;
}
/**
 * The object returned by Tracer.start()
 * You call handle.end() when the agent finishes
 */
export interface TraceHandle {
    end(options: EndOptions): AgentTrace;
}
/**
 * Tracer — start/end API for timing and recording agent calls.
 *
 * Usage in every agent:
 *   const handle = Tracer.start("planner", session_id);
 *   const llmResponse = await router.call(...);
 *   const trace = handle.end({ llmResponse, cited_nodes: [], status: "ok" });
 *   await persistTrace(trace);
 */
export declare class Tracer {
    /**
     * Start timing an agent call.
     *
     * @param agent      - Agent name e.g. "planner", "drafter"
     * @param session_id - Optional session ID for RLS scoping
     * @param doc_type   - Optional document type from runAgentChain context
     * @param parent_trace_id - Optional parent trace ID for nested calls
     */
    static start(agent: string, session_id?: string, doc_type?: AgentTrace["doc_type"], parent_trace_id?: string): TraceHandle;
    /**
     * Query agent_traces for a document and return cost/token/latency summary.
     * Used by @Ayush5112006's cost dashboard.
     *
     * @param document_id - The document UUID to summarise
     */
    static summary(document_id: string): Promise<{
        total_tokens: number;
        total_cost_usd: number;
        p95_latency_ms: number;
        model_breakdown: Record<string, {
            tokens: number;
            cost: number;
        }>;
    }>;
}
//# sourceMappingURL=tracer.d.ts.map