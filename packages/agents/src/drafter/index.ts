/**
 * drafter/index.ts
 * Owner: Jenil Sutariya
 * Module: packages/agents/src/drafter
 *
 * Public barrel — the ONLY file other packages import from this module.
 * All agent logic is split across focused files:
 *
 *   types.ts         — DrafterInput, DrafterResult
 *   citations.ts     — extractCitations(), extractNodeIds(), constants
 *   drafter.agent.ts — runDrafter(), reviseDraft(), DrafterAgent class
 *   drafter.prompt.ts— DRAFTER_SYSTEM_PROMPT, buildDrafterUserPrompt(), buildDrafterRevisionPrompt()
 *
 * Test files:
 *   citations.test.ts — pure unit tests for citation utilities (no mocks)
 *   drafter.test.ts   — integration-style tests for runDrafter(), DrafterAgent, etc.
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type { DrafterInput, DrafterResult } from "./types.js";

// ─── Citation utilities ───────────────────────────────────────────────────────
export {
  extractCitations,
  extractNodeIds,
  CITE_MARKER_REGEX,
  PROVISIONAL_SNAPSHOT_ID,
  normalizeRtiNodeId,
} from "./citations.js";

// ─── Agent (runDrafter, reviseDraft, DrafterAgent) ────────────────────────────
export { runDrafter, reviseDraft, DrafterAgent } from "./drafter.agent.js";

// ─── Prompts (exported for testing / inspection) ──────────────────────────────
export {
  DRAFTER_SYSTEM_PROMPT,
  RTI_DRAFTER_SYSTEM_PROMPT,
  buildDrafterUserPrompt,
  buildDrafterRevisionPrompt,
} from "./drafter.prompt.js";
