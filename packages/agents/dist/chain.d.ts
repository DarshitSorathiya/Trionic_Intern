/**
 * chain.ts
 * Owner: Yatri Dungarani (Week 2 — Issue #39)
 * Co-owner: Malay Sheta (runAgentChain integration)
 *
 * The agent chain orchestrator. This is the SINGLE entry point that
 * Team B's `POST /api/draft` handler calls.
 *
 * Responsibilities:
 *   1. Load conversation memory on entry
 *   2. Run each agent step (or serve from cache)
 *   3. Emit AgentStreamEvents as an async generator
 *   4. Write memory after each step
 *   5. Enforce PII boundaries (intake text NOT re-sent after first pass)
 *
 * Pipeline: Classifier → Planner → [PageIndex] → Drafter → Citator → Reviewer → [Translator]
 *
 * Inter-team contract (from API_CONTRACTS.md):
 *   Frontend ──POST /api/draft──▶ Backend ──runAgentChain()──▶ Agents
 *   The backend forwards AgentStreamEvent emissions straight to the SSE stream.
 *   Team C does not write API code. Team B does not write agent logic.
 */
import type { AgentStreamEvent, SupportedLanguage } from "@trionic/shared";
import type { MemoryStore } from "./memory.js";
/**
 * Input to the agent chain orchestrator.
 * Provided by Team B's API layer from the DraftRequest.
 */
export interface ChainInput {
    /** Pre-created document ID (from POST /api/documents). */
    document_id: string;
    /** Raw intake text from the user. */
    intake_text: string;
    /** Language the user wants the output document in. */
    target_language: SupportedLanguage;
    /** Optional document type hint. If absent, Classifier infers. */
    doc_type?: string;
    /** Session/user ID for RLS scoping and trace attribution. */
    session_id: string;
}
export interface ChainOptions {
    /** Custom memory store (defaults to InMemoryStore). */
    memoryStore?: MemoryStore;
    /** If true, skip the translator even if target_language ≠ "en". */
    skipTranslation?: boolean;
}
/**
 * Run the full agent chain for a document.
 *
 * This is an async generator that yields `AgentStreamEvent` frames.
 * The backend pipes these directly into the SSE stream.
 *
 * Memory integration:
 *   - On entry, loads any existing ConversationState for the document.
 *   - If classifier/planner outputs are cached, those steps are skipped
 *     and synthetic step.start/step.done events are emitted (with tokens=0).
 *   - After each real agent step, memory is updated.
 *   - PII boundary: intake_text is ONLY sent to the Classifier and Planner
 *     (first pass). The Drafter receives a structured PlannerOutput + a
 *     PII-redacted summary string on subsequent passes instead of raw intake.
 *
 * @param input  - Chain input from the API layer.
 * @param options - Optional: custom memory store, skip translation flag.
 * @yields AgentStreamEvent frames for the SSE stream.
 */
export declare function runAgentChain(input: ChainInput, options?: ChainOptions): AsyncGenerator<AgentStreamEvent>;
//# sourceMappingURL=chain.d.ts.map