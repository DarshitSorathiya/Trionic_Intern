/**
 * packages/shared/src/types.ts
 * Cross-cutting TypeScript types consumed by ALL packages.
 * Owner: No single owner — changes require review from a repo manager (Dhruv / Sohil).
 *
 * Rule: NO side effects here. No SDK imports, no fetch calls, no React.
 */

// ─── PageIndex ───────────────────────────────────────────────────────────────

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

// ─── Citation ────────────────────────────────────────────────────────────────

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

// ─── Agent Trace ─────────────────────────────────────────────────────────────

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
   /** Optional: trace ID of the parent agent call. Used for nested call linking.
   *  e.g. Drafter's child PageIndex calls set this to the Drafter's trace ID. */
  parent_trace_id?: string;
  /** Optional: document type this trace belongs to. */
  doc_type?: "rti_application" | "legal_notice" | "nda" | "consumer_complaint" | "cheque_bounce_notice";
};

// ─── Document Draft ───────────────────────────────────────────────────────────

/** Supported legal document types (Goal G2). */
export type DocumentType =
  | "rti_application"
  | "legal_notice"
  | "nda"
  | "consumer_complaint"
  | "cheque_bounce_notice";

/** Supported output languages (Goal G3). */
export type SupportedLanguage =
  | "en"   // English (baseline)
  | "hi"   // Hindi
  | "gu"   // Gujarati
  | "mr"   // Marathi
  | "ta";  // Tamil

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

// ─── Planner Output ──────────────────────────────────────────────────────────

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

// ─── Classifier Output ───────────────────────────────────────────────────────

/** Coarse legal domain bucket. */
export type LegalDomain =
  | "criminal"
  | "civil"
  | "consumer"
  | "contract"
  | "labour"
  | "family"
  | "constitutional"
  | "administrative"
  | "other";

/** Triage severity for prioritising the user (mostly UX hinting). */
export type Severity = "low" | "medium" | "high";

/**
 * Output of the Classifier agent.
 * Determines whether the intake is a legal matter and routes it to the Planner.
 */
export type ClassifierOutput = {
  /** Whether the intake text is a legal matter we can help with. */
  is_legal: boolean;
  /** Legal domain. */
  domain: LegalDomain;
  /** Free-form sub-domain string for finer routing (e.g. "rti", "cheque-bounce"). */
  sub_domain?: string;
  /** List of act codes deemed relevant (e.g. ["ICA-1872", "CPA-2019"]). */
  relevant_acts: string[];
  /** Severity hint for the UI. */
  severity: Severity;
  /** Confidence score 0–1. */
  confidence: number;
  /** Raw reason from the LLM for the classification. */
  reasoning: string;
};

// ─── User / Document persistence ─────────────────────────────────────────────

/** Mirrors Supabase `users` table (extends auth.users via trigger). */
export type User = {
  id: string;                       // UUID, matches auth.users.id
  email: string;
  display_name: string | null;
  default_language: SupportedLanguage;
  onboarded_at: string | null;      // ISO-8601, null until first-run completes
  created_at: string;
};

/** Lifecycle status of a Document. */
export type DocumentStatus =
  | "draft"        // user created, not yet generated
  | "generating"   // agent chain in flight
  | "final"        // generated + citations valid
  | "failed"       // citator-gatekeeper rejected, awaits regen
  | "exported"     // at least one export performed
  | "archived";    // user-archived

/** A persisted draft (separate from a generated DraftDocument snapshot). */
export type Document = {
  id: string;
  owner_id: string;                 // -> users.id
  doc_type: DocumentType;
  language: SupportedLanguage;
  title: string;                    // auto-derived from intake or user-edited
  status: DocumentStatus;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
};

/** One saved snapshot of a Document. Every edit creates a new version. */
export type DocumentVersion = {
  id: string;
  document_id: string;              // -> documents.id
  version_num: number;              // 1, 2, 3, ...
  body_markdown: string;            // full draft text including [CITE:node_id] markers
  citations: Citation[];
  created_by: string;               // -> users.id (the user OR a system service)
  created_at: string;
};

// ─── API request/response shapes ─────────────────────────────────────────────

/** POST /api/draft request body. */
export type DraftRequest = {
  document_id: string;              // pre-created via POST /api/documents
  intake_text: string;
  target_language: SupportedLanguage;
  /** Optional. If absent, Classifier will infer. */
  doc_type?: DocumentType;
  /** Optional user context (location, etc.) for personalisation. */
  user_context?: Record<string, string>;
};

/** POST /api/draft/{document_id}/iterate request body. */
export type IterateRequest = {
  /** User's iteration instruction. e.g. "Make it stricter", "Add a late fee clause" */
  instruction: string;
};

/** Final response after the SSE stream completes. */
export type DraftResponse = {
  document_id: string;
  version_id: string;
  body_markdown: string;
  citations: Citation[];
  trace_ids: string[];              // pointers into agent_traces
  warnings: string[];               // soft issues (e.g. low-confidence citations)
};

/** Server-Sent Event payload emitted by POST /api/draft.
 *  The frontend renders the step list off these. */
export type AgentStreamEvent =
  | { type: "step.start"; agent: string; ts: string }
  | { type: "step.done"; agent: string; ts: string; duration_ms: number; tokens: number }
  | { type: "step.error"; agent: string; ts: string; message: string }
  | { type: "citation.emitted"; node_id: PageIndexNodeId; ts: string }
  | { type: "draft.partial"; markdown_chunk: string; ts: string }
  | { type: "draft.final"; response: DraftResponse; ts: string };

/** Export format. */
export type ExportFormat = "pdf" | "docx";

/** Response from POST /api/documents/{id}/export. */
export type ExportResult = {
  url: string;                      // signed Supabase Storage URL, short TTL
  format: ExportFormat;
  expires_at: string;
};

// ─── Drafter / Citator / Reviewer / Translator outputs ───────────────────────

export type DrafterOutput = {
  body_markdown: string;            // contains inline [CITE:<node_id>] markers
  pending_citations: PageIndexNodeId[];
};

export type CitatorVerdict = {
  approved: boolean;
  rejected_spans: Array<{
    span: [number, number];
    reason: "no_citation" | "invalid_node" | "ambiguous";
    message: string;
  }>;
  resolved_citations: Citation[];
};

export type ReviewerOutput = {
  approved: boolean;
  banner_present: boolean;
  missing_required_sections: string[];
  tone_issues: string[];
};

export type TranslatorOutput = {
  target_language: SupportedLanguage;
  translated_markdown: string;
  glossary_hits: Array<{ source: string; target: string; node_id?: PageIndexNodeId }>;
};

// ─── Conversation Memory ─────────────────────────────────────────────────────

/**
 * The persisted shape of multi-turn conversation state for a single document.
 * One row per document — stored as JSONB in `documents.state` (Supabase).
 * Owned by packages/agents/src/memory.ts; keyed by document_id.
 *
 * Rule: only add fields here with a repo-manager PR review.
 * Do NOT store raw intake text or LLM prompt strings here (PII boundary).
 */
export type ConversationState = {
  /** Schema version — bump only on breaking field changes; used for forward-compat migration. */
  schema_version: 1;

  /** The document this state belongs to. Foreign key → documents.id. */
  document_id: string;

  /**
   * Monotonically increasing write counter (starts at 1).
   * Memory.save() rejects writes where stored version >= incoming version
   * (optimistic concurrency — prevents split-brain on concurrent retries).
   */
  version: number;

  // ── Cached agent outputs (null = not yet run) ─────────────────────────────

  /** Last successful Classifier output. Cached to skip re-classification on retry. */
  last_classifier_output: ClassifierOutput | null;

  /** Last successful Planner output. Cached to skip re-planning on retry. */
  last_planner_output: PlannerOutput | null;

  /**
   * PageIndex node IDs retrieved during the most recent Drafter run.
   * Stored for audit / eval replay only — PageIndex itself is always re-queried.
   */
  retrieved_nodes: PageIndexNodeId[];

  /**
   * How many complete Drafter→Citator passes have succeeded on this document.
   * Used to populate DraftResponse.version_id ("v1", "v2", …).
   */
  current_draft_version: number;

  // ── Iteration support (Week 4 — Yatri Dungarani) ──────────────────────────

  /**
   * Markdown content of the latest successful draft.
   * Stored so the iteration chain can feed it to reviseDraft() without a DB read.
   * null until the first full chain run completes successfully.
   */
  last_draft_content: string | null;

  /**
   * Citations from the latest successful draft.
   * Preserved across iterations so citations stay valid.
   * null until the first full chain run completes successfully.
   */
  last_citations: Citation[] | null;

  // ── Staleness detection ───────────────────────────────────────────────────

  /**
   * DJB2 hash of the intake text at the time the Classifier was last called.
   * If the next request's hash differs, cached classifier/planner outputs are
   * discarded and both agents re-run unconditionally.
   * NOT cryptographic — used only for fast change detection.
   */
  intake_text_hash: string;

  // ── Bookkeeping ───────────────────────────────────────────────────────────

  /** ISO-8601 timestamp stamped by Memory.save() on every write. */
  updated_at: string;
};

// ─── Eval ────────────────────────────────────────────────────────────────────

export type EvalMetric = {
  name: string;
  value: number;
  unit?: string;
};

export type EvalRunResult = {
  run_id: string;
  dataset_id: string;
  model: string;
  ran_at: string;
  metrics: EvalMetric[];
  per_doc_type?: Record<DocumentType, EvalMetric[]>;
};


