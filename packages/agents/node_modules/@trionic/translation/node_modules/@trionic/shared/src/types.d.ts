/**
 * packages/shared/src/types.ts
 * Cross-cutting TypeScript types consumed by ALL packages.
 * Owner: No single owner — changes require review from a repo manager (Dhruv / Sohil).
 *
 * Rule: NO side effects here. No SDK imports, no fetch calls, no React.
 */
/** Unique identifier for a node in a PageIndex act tree.
 *  Format: "<ACT_CODE>/<CHAPTER>/<SECTION>"
 *  Example: "ICA-1872/CH-VI/S-73"
 */
export type PageIndexNodeId = string;
/** Snapshot date of an indexed act version.
 *  Format: "YYYY-MM-DD"
 *  Example: "2024-12-01"
 */
export type SnapshotId = string;
/**
 * A single legal citation attached to a span of text in a draft.
 * The Citator-gatekeeper validates every Citation before the draft proceeds.
 */
export type Citation = {
    /** The PageIndex node this citation points to. Must be a real, validated node. */
    node_id: PageIndexNodeId;
    /** Which version/snapshot of the act this node belongs to. */
    snapshot_id: SnapshotId;
    /** Character offsets [start, end] in the draft text this citation covers. */
    span: [number, number];
};
/**
 * Audit record emitted by EVERY agent call.
 * Persisted to Supabase `agent_traces` table by packages/agents/src/tracing.
 * Shape here is the canonical contract — do NOT alter without repo manager review.
 */
export type AgentTrace = {
    /** Name of the agent that ran. e.g. "planner", "drafter", "citator" */
    agent: string;
    /** Fully-qualified model string resolved by the LLM Router.
     *  e.g. "claude-3-5-sonnet-20241022", "gemini-1.5-pro", "gpt-4o" */
    model: string;
    /** Number of prompt/input tokens consumed. */
    tokens_in: number;
    /** Number of completion/output tokens produced. */
    tokens_out: number;
    /** Estimated cost of this call in USD. */
    cost_usd: number;
    /** Wall-clock latency of the LLM call in milliseconds. */
    latency_ms: number;
    /** PageIndex node IDs cited in this agent's output.
     *  Empty array [] for agents that do not emit citations (e.g. planner, classifier). */
    cited_nodes: PageIndexNodeId[];
    /** Terminal status of this agent step. */
    status: "ok" | "rejected" | "error";
    /** ISO-8601 timestamp of when this trace was emitted. */
    timestamp: string;
    /** Optional: the user/session this trace belongs to (for RLS-scoped queries). */
    session_id?: string;
    /** Optional: human-readable error message if status === "error" | "rejected". */
    error_message?: string;
};
/** Supported legal document types (Goal G2). */
export type DocumentType = "rti_application" | "legal_notice" | "nda" | "consumer_complaint" | "employment_contract";
/** Supported output languages (Goal G3). */
export type SupportedLanguage = "en" | "hi" | "gu" | "mr" | "ta";
/**
 * The structured output of a completed agent pipeline run.
 * Produced after Reviewer passes; ready for export or user editing.
 */
export type DocumentDraft = {
    /** Auto-generated document ID (UUID). */
    id: string;
    /** Type of legal document drafted. */
    document_type: DocumentType;
    /** Language the final draft is written in. */
    language: SupportedLanguage;
    /** Full markdown text of the draft, including [CITE:<node_id>] markers. */
    content: string;
    /** All citations resolved during the Citator-gatekeeper pass. */
    citations: Citation[];
    /** Ordered list of agent traces for the full pipeline run that produced this draft. */
    traces: AgentTrace[];
    /** ISO-8601 timestamp. */
    created_at: string;
};
/**
 * The structured plan emitted by the Planner agent.
 * Consumed by the Drafter agent to know what to write and what to retrieve.
 */
export type PlannerOutput = {
    /** The document type the planner decided to produce. */
    document_type: DocumentType;
    /** Template name / ID to use (maps to a template in packages/agents). */
    template_id: string;
    /** List of PageIndex query strings the Drafter should run before writing. */
    pageindex_queries: string[];
    /** Relevant Indian acts to focus on (act codes). */
    applicable_acts: string[];
    /** Any additional context notes for the Drafter. */
    notes: string;
};
/**
 * Output of the Classifier agent.
 * Determines whether the intake is a legal matter and routes it to the Planner.
 */
export type ClassifierOutput = {
    /** Whether the intake text is a legal matter we can help with. */
    is_legal: boolean;
    /** Legal domain (e.g. "consumer_protection", "contract", "constitutional", "rti"). */
    domain: string;
    /** List of act codes deemed relevant (e.g. ["ICA-1872", "CPA-2019"]). */
    relevant_acts: string[];
    /** Confidence score 0–1. */
    confidence: number;
    /** Raw reason from the LLM for the classification. */
    reasoning: string;
};
//# sourceMappingURL=types.d.ts.map