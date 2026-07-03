/**
 * types.ts
 * Owner: Malay Sheta (Team C Lead — scaffolder)
 *
 * Agent-layer local types.
 * Re-exports shared types consumed by all agents in this package.
 * Agent-specific internal types live here (not in packages/shared).
 */

// Re-export all shared types so agents can import from "../types.js" locally
export type {
  AgentTrace,
  Citation,
  PageIndexNodeId,
  SnapshotId,
  DocumentType,
  SupportedLanguage,
  DocumentDraft,
  PlannerOutput,
  ClassifierOutput,
} from "@trionic/shared";

// ─── Agent pipeline types ─────────────────────────────────────────────────────

/**
 * The full input to the agent pipeline — provided by the API layer (Team B).
 */
export interface PipelineInput {
  /** Raw intake text from the user (any supported language). */
  intakeText: string;
  /** Language the user wants the output document in. */
  outputLanguage: import("@trionic/shared").SupportedLanguage;
  /** Session/user ID for RLS scoping and trace attribution. */
  session_id: string;
}

/**
 * The full output of a completed pipeline run.
 * Returned to Team B's API layer for persistence and streaming.
 */
export interface PipelineResult {
  /** The final translated draft text (or English draft if no translation). */
  finalDraftText: string;
  /** Whether the pipeline completed successfully. */
  success: boolean;
  /** All agent traces, in order. Persisted to agent_traces table. */
  traces: import("@trionic/shared").AgentTrace[];
  /** Rejection reason if citator or reviewer blocked the draft. */
  rejection_reason?: string;
}
