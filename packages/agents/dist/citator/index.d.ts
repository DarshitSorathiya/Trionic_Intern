/**
 * citator/index.ts
 * Owner: Hitarth Sherathia
 * Module: packages/agents/src/citator
 *
 * The Citator-Gatekeeper agent — the most critical agent in the pipeline.
 *
 * Validates every [CITE:<node_id>] marker in the Drafter's output against
 * the live PageIndex tree via pageindex.get_text(node_id).
 *
 * Rules (non-negotiable):
 *   1. Every [CITE:<node_id>] is validated via pageindex.get_text(node_id).
 *      A 404 (NodeNotFoundError) is a rejection — no exceptions.
 *   2. A draft with NO [CITE:...] markers is ALSO a rejection.
 *      A legal claim without citation has no place in this system.
 *   3. On any rejection: approved = false, rejected_spans is populated,
 *      and the chain emits step.error → document status becomes "failed".
 *
 * --strict flag:
 *   When strict = true (default, production): both rules above apply.
 *   When strict = false (dev/test only): skips the "no citations" rejection
 *   so devs can run the chain without a fully cited draft during local testing.
 */
import type { AgentTrace, Citation, CitatorVerdict, DocumentDraft } from "@trionic/shared";
export interface CitatorOptions {
    /**
     * When true (default), a draft with no [CITE:...] markers is rejected.
     * Set to false only for dev testing — never disable in production.
     */
    strict?: boolean;
}
export interface CitatorInput {
    /** The draft to validate citations for. */
    draft: DocumentDraft;
    /** Optional session ID for trace attribution. */
    session_id?: string;
    /** Citator behaviour options. */
    options?: CitatorOptions;
}
export interface CitatorResult {
    /** Whether all citations passed validation. */
    approved: boolean;
    /** Backwards-compatibility alias for approved. */
    passed: boolean;
    /** Validated citations returned when the draft is approved. */
    validatedCitations: Citation[];
    /**
     * Full CitatorVerdict — this is the canonical output shape from @trionic/shared.
     * approved: false → chain aborts, document status = "failed".
     * approved: true  → resolved_citations is populated, chain continues.
     */
    verdict: CitatorVerdict;
    /** Convenience alias: same as verdict.resolved_citations. */
    resolved_citations: Citation[];
    /** Convenience alias: spans that failed (node not found or no citation). */
    rejected_spans: [number, number][];
    /** Human-readable reason for rejection when approved === false. */
    rejection_reason?: string;
    /** Audit trace for this agent call. */
    trace: AgentTrace;
}
/**
 * Validate every [CITE:<node_id>] marker in the draft content against PageIndex.
 *
 * Returns a CitatorResult with `approved: true` only when:
 *   - At least one [CITE:...] marker exists (or strict = false)
 *   - Every marker resolves to a real node in PageIndex
 *
 * On any failure, returns `approved: false` with `rejected_spans` populated
 * so the chain can emit step.error and set document status to "failed".
 */
export declare function runCitator(input: CitatorInput): Promise<CitatorResult>;
export declare class CitatorGatekeeperAgent {
    readonly name = "citator";
    private readonly options;
    constructor(options?: CitatorOptions);
    run(input: CitatorInput): Promise<CitatorResult>;
}
//# sourceMappingURL=index.d.ts.map