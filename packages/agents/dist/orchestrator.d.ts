/**
 * packages/agents/src/orchestrator.ts
 * Owner: Malay Sheta (Agents lead — Week 2)
 *
 * runAgentChain — the master async-iterable orchestrator consumed by
 * the backend's POST /api/draft route (Team B — Prashant).
 *
 * Pipeline order:
 *   Classifier → Planner → (PageIndex retrieval) → Drafter → Citator → Reviewer → [Translator]
 *
 * Each agent step emits:
 *   { type: "step.start", agent, ts }
 *   { type: "step.done",  agent, ts, duration_ms, tokens }
 *   (or { type: "step.error", agent, ts, message } on failure)
 *
 * The final event is always:
 *   { type: "draft.final", response: DraftResponse, ts }
 *
 * Imports types exclusively from @trionic/shared — never redefines them.
 *
 * Demo gate (from a Node REPL):
 *   import { runAgentChain } from "@trionic/agents";
 *   const req = { document_id: "doc-1", intake_text: "...", target_language: "en" };
 *   for await (const evt of runAgentChain(req)) { console.log(evt); }
 */
import type { AgentStreamEvent, DraftRequest } from "@trionic/shared";
/**
 * Run the full agent chain for a draft request.
 *
 * Exported as an AsyncIterable<AgentStreamEvent> so the backend can forward
 * each event directly to the SSE stream without buffering.
 *
 * Usage (Node REPL demo):
 *   for await (const evt of runAgentChain(req)) { console.log(evt); }
 *
 * @param req - DraftRequest from POST /api/draft body.
 */
export declare function runAgentChain(req: DraftRequest): AsyncIterable<AgentStreamEvent>;
//# sourceMappingURL=orchestrator.d.ts.map