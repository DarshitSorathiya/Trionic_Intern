/**
 * drafter/drafter.agent.ts
 * Owner: Jenil Sutariya
 * Module: packages/agents/src/drafter
 *
 * Core Drafter agent logic:
 *   - runDrafter()   — initial draft generation
 *   - reviseDraft()  — revision pass driven by Reviewer feedback
 *   - DrafterAgent   — Agno-compatible class wrapper
 *
 * Pipeline position:
 *   Planner → PageIndex → [Drafter] → Citator-gatekeeper → Reviewer
 *
 * Citation-or-die rule (enforced via prompt in drafter.prompt.ts):
 *   Every legal claim in the draft MUST carry a [CITE:<node_id>] marker.
 *   Un-cited claims are BLOCKED by the Citator-gatekeeper downstream.
 *
 * Week 1 note:
 *   PageIndex tool (Team D) is not yet wired. Node IDs are derived by the LLM
 *   from plan.applicable_acts using the canonical format <ACT_CODE>/<CHAPTER>/<SECTION>.
 *   Week 2: replace with real pageindexTool.query() calls before the LLM call.
 */
import type { DocumentDraft } from "@trionic/shared";
import type { DrafterInput, DrafterResult } from "./types.js";
/**
 * Run the Drafter agent — produce an initial legal document draft.
 *
 * Steps:
 *   1. Build user prompt from plan + intakeText.
 *   2. Call LLM Router (Claude in Week 1) with system + user prompts.
 *   3. Extract [CITE:<node_id>] markers from LLM output → Citation[].
 *   4. Assemble DocumentDraft with content, citations, and metadata.
 *   5. Build and persist AgentTrace.
 *   6. Return { draft, trace }.
 *
 * @throws Never — errors are captured in the trace (status: "error") and
 *                 re-thrown with `.trace` attached for the pipeline to surface.
 */
export declare function runDrafter(input: DrafterInput): Promise<DrafterResult>;
/**
 * Revise an existing draft based on feedback from the Reviewer agent.
 *
 * Called by the Reviewer's retry loop (max 2 revisions — see RFC-reviewer-agent.md).
 *
 * IMPORTANT: The revised draft MUST pass through the Citator-gatekeeper again
 * before the Reviewer re-runs. This is the orchestrator's responsibility.
 *
 * @param original      - The DocumentDraft the Reviewer rejected or flagged.
 * @param revisionHint  - Plain-text summary from ReviewerRevisionHint.summary.
 *                        Week 2+: import ReviewerRevisionHint type from reviewer package.
 * @param session_id    - Same session ID as the original draft (for trace linking).
 *
 * @throws Never — errors captured in trace, re-thrown with `.trace` attached.
 */
export declare function reviseDraft(original: DocumentDraft, revisionHint: string, session_id?: string): Promise<DrafterResult>;
/**
 * Agno framework class wrapper for the Drafter agent.
 *
 * Agno expects agents to be classes with a run() method.
 * This is a thin wrapper around the functional helpers above.
 *
 * The revise() method is the entry-point the Reviewer's retry loop calls:
 *   ```ts
 *   const revised = await drafterAgent.revise(draft, review.revision_hint!.summary);
 *   const revalidated = await citatorAgent.run({ draft: revised.draft });  // MUST re-validate
 *   ```
 */
export declare class DrafterAgent {
    readonly name = "drafter";
    /**
     * Run the Drafter agent to produce an initial draft.
     */
    run(input: DrafterInput): Promise<DrafterResult>;
    /**
     * Revise an existing draft based on Reviewer feedback.
     *
     * @param original     - The draft to revise.
     * @param revisionHint - Plain-text summary of required changes.
     * @param session_id   - Optional session ID for trace linking.
     */
    revise(original: DocumentDraft, revisionHint: string, session_id?: string): Promise<DrafterResult>;
}
//# sourceMappingURL=drafter.agent.d.ts.map