/**
 * reviewer/index.ts
 * Owner: Evan Gregor
 * Module: packages/agents/src/reviewer
 *
 * The Reviewer agent is the last automated editorial step in the English
 * drafting pipeline. It runs AFTER the Citator-gatekeeper has approved
 * all citations. It performs three checks:
 *
 *   1. Banner check   — deterministic: exact-string match for disclaimer
 *   2. Completeness   — LLM-scored: semantic section detection via Router
 *   3. Tone check     — LLM-based: is the language formal, professional, non-advisory?
 *
 * Returns ReviewerOutput (from @trionic/shared) + AgentTrace.
 *
 * See: docs/RFC-reviewer-agent.md, Issue #112, Issue #185, Issue #277
 */
import type { AgentTrace, DocumentDraft, DocumentType, ReviewerOutput, SupportedLanguage } from "@trionic/shared";
/**
 * The canonical "not legal advice" disclaimer banner.
 * Must appear in the first 2,000 characters of every draft.
 */
export declare const LEGAL_DISCLAIMER_BANNER: string;
/**
 * Per-doc-type required sections.
 * Week 4 (#277): supported doc types have required sections.
 * Exported for sharing with Sohil's editor.
 */
export declare const REQUIRED_SECTIONS: Record<DocumentType, string[]>;
export interface ReviewerInput {
    /** The citator-validated draft to review. */
    draft: DocumentDraft;
    /** Optional session ID for trace attribution. */
    session_id?: string;
}
/**
 * Extends the locked ReviewerOutput from @trionic/shared with the audit trace
 * and integration fields from docs/agents-package.md.
 */
export interface ReviewerResult extends ReviewerOutput {
    /** Human-readable summary of the review outcome. */
    feedback: string;
    /** If approved is false, the reason for rejection. Used by chain.ts to emit step.error. */
    rejection_reason?: string;
    /** Audit trace for this agent call. */
    trace: AgentTrace;
}
/**
 * Returns the list of required section names for a given document type.
 * AC1 (#277): Reviewer.requiredSections(doc_type) → correct list per type.
 */
export declare function requiredSections(docType: DocumentType): string[];
/**
 * Banner check with multilingual support.
 * Returns true if the canonical banner lead-in appears in the first 2,000 chars.
 * Week 3: tightened from regex to exact match per AC5 (#185).
 * Week 4 (#277): added glossary lookup for translated banners (AC3).
 */
export declare function checkBanner(draftMarkdown: string, language: SupportedLanguage): boolean;
/**
 * Deterministic completeness check (fallback).
 * Returns the list of MISSING required section names using simple string matching.
 * Used as fallback when LLM scoring is unavailable.
 */
export declare function checkCompleteness(draftMarkdown: string, docType: DocumentType): string[];
/**
 * LLM-scored completeness check.
 * Calls the Router to semantically match required section headings or equivalents.
 * Falls back to deterministic checkCompleteness() on LLM failure.
 * AC2 (#185): "use the LLM to score" semantic equivalents.
 */
export declare function checkCompletenessLLM(draftMarkdown: string, docType: DocumentType): Promise<{
    missing: string[];
    llmResponse?: any;
}>;
/**
 * Run the Reviewer agent on a citator-approved draft.
 *
 * Steps:
 *   1. checkBanner()          — deterministic exact-string match
 *   2. checkCompletenessLLM() — LLM-scored semantic section detection
 *   3. Tone analysis          — LLM call via Router ("reviewer" step)
 *   4. Aggregate → ReviewerResult
 *   5. Build and persist AgentTrace
 *
 * @throws On infrastructure errors (both LLM calls fail). Business failures
 *         (banner missing, sections missing, tone issues) are returned as
 *         approved: false, trace.status: "rejected".
 */
export declare function runReviewer(input: ReviewerInput): Promise<ReviewerResult>;
export declare class ReviewerAgent {
    readonly name = "reviewer";
    /** Returns the list of required section names for a given document type. */
    requiredSections(docType: DocumentType): string[];
    run(input: ReviewerInput): Promise<ReviewerResult>;
}
//# sourceMappingURL=index.d.ts.map