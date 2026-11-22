/**
 * iterate.ts
 * Owner: Yatri Dungarani (Week 4 — Draft Iteration)
 * Module: packages/agents/src/iterate
 *
 * The iteration chain orchestrator. Called by Team B's
 * `POST /api/draft/{document_id}/iterate` handler.
 *
 * Responsibilities:
 *   1. Load conversation memory — MUST already exist from a prior full chain run
 *   2. Skip Classifier, Planner, and PageIndex retrieval (served from cache)
 *   3. Run reviseDraft() with the user's instruction as revisionHint
 *   4. Run Citator → Reviewer → [Translator] on the revised draft
 *   5. Write memory after each step
 *   6. Emit AgentStreamEvents (same shape as full chain for frontend compat)
 *
 * Speed benefit: ~3-5× faster than full chain since 3 agents skip (Classifier,
 * Planner, PageIndex) and only Drafter + Citator + Reviewer + maybe Translator run.
 *
 * Inter-team contract (from API_CONTRACTS.md):
 *   Frontend ──POST /api/draft/{id}/iterate──▶ Backend ──runIterationChain()──▶ Agents
 *   The backend forwards AgentStreamEvent emissions straight to the SSE stream.
 */
import type { AgentStreamEvent, SupportedLanguage } from "@trionic/shared";
import type { MemoryStore } from "./memory.js";
/**
 * Input to the iteration chain orchestrator.
 * Provided by Team B's API layer from the IterateRequest.
 */
export interface IterateInput {
    /** Document ID — must have a prior successful full chain run. */
    document_id: string;
    /** User's iteration instruction. e.g. "Make it stricter" */
    instruction: string;
    /** Language the user wants the output document in. */
    target_language: SupportedLanguage;
    /** Session/user ID for RLS scoping and trace attribution. */
    session_id: string;
}
export interface IterateOptions {
    /** Custom memory store (defaults to InMemoryStore). */
    memoryStore?: MemoryStore;
    /** If true, skip the translator even if target_language ≠ "en". */
    skipTranslation?: boolean;
}
/**
 * Run the iteration chain for a document that already has a completed draft.
 *
 * This is an async generator that yields `AgentStreamEvent` frames,
 * identical in shape to `runAgentChain` for frontend SSE compatibility.
 *
 * Memory integration:
 *   - On entry, loads existing ConversationState for the document.
 *   - Validates that `last_draft_content` and `last_planner_output` exist
 *     (i.e., a prior full chain run has completed).
 *   - Skips Classifier, Planner, PageIndex (emits synthetic cached events).
 *   - Runs Drafter (reviseDraft) → Citator → Reviewer → [Translator].
 *   - Saves updated state with new draft content and citations.
 *
 * @param input  - Iteration input from the API layer.
 * @param options - Optional: custom memory store, skip translation flag.
 * @yields AgentStreamEvent frames for the SSE stream.
 */
export declare function runIterationChain(input: IterateInput, options?: IterateOptions): AsyncGenerator<AgentStreamEvent>;
//# sourceMappingURL=iterate.d.ts.map