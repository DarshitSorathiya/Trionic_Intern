/**
 * drafter/types.ts
 * Owner: Jenil Sutariya
 * Module: packages/agents/src/drafter
 *
 * Input/output type definitions for the Drafter agent.
 * Imported by drafter.agent.ts, index.ts, and tests.
 */

import type { AgentTrace, DocumentDraft, PlannerOutput } from "@trionic/shared";

// ─── Input ────────────────────────────────────────────────────────────────────

/**
 * Input to the Drafter agent.
 *
 * Note: `intakeText` is required so the LLM has the user's original request for
 * drafting context. The scaffold only had `plan` and `session_id`; this extends
 * it without breaking anything (the old stub threw unconditionally).
 */
export interface DrafterInput {
  /** Plan produced by the Planner agent. */
  plan: PlannerOutput;
  /**
   * Raw intake text from the user (any supported language).
   * Gives the LLM context about what the user actually wants drafted.
   */
  intakeText: string;
  /** Optional session ID for trace attribution and RLS scoping. */
  session_id?: string;
}

// ─── Output ───────────────────────────────────────────────────────────────────

/**
 * Output of the Drafter agent.
 *
 * `draft.content` contains the full Markdown document with inline
 * [CITE:<node_id>] markers after every legal claim.
 * `draft.citations` is populated by the citation extraction pass over content.
 */
export interface DrafterResult {
  /** The generated document draft with inline [CITE:<node_id>] markers. */
  draft: DocumentDraft;
  /** Audit trace for this agent call — persisted to agent_traces table. */
  trace: AgentTrace;
}
