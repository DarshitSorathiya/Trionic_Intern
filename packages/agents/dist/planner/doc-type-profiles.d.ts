/**
 * planner/doc-type-profiles.ts
 * Owner: Malay Sheta (Planner agent — Team C Lead)
 *
 * W4 Breadth: the per-doc-type contract.
 *
 * This registry is the SINGLE SOURCE OF TRUTH for what the Planner emits per
 * document type. Every other Agents intern depends on the shape locked here:
 *   - template_id   → maps to a row in @om-patel91's `document_templates` table
 *   - pageindex_queries → the acts/sections the Drafter must retrieve before writing
 *   - applicable_acts   → which Indian acts apply (standard act codes)
 *
 * The Planner LLM call is grounded against these profiles: the doc-type baseline
 * is injected into the prompt and the LLM refines it. If the LLM output is
 * invalid or omits a field, we fall back to the profile so the chain never
 * aborts on a malformed plan.
 *
 * Doc types (locked in PROJECT_BRIEF.md § 4):
 *   rti_application       — RTI Act 2005           (shipped W3 ✓)
 *   legal_notice          — Contract Act + CPC
 *   nda                   — Contract Act + IT Act
 *   consumer_complaint    — Consumer Protection Act 2019
 *   cheque_bounce_notice  — Negotiable Instruments Act § 138
 *   employment_contract   — Contract Act provisions for general agreements
 */
import type { DocumentType, PlannerOutput } from "@trionic/shared";
/** A doc-type-specific baseline the Planner LLM is grounded against. */
export interface DocTypeProfile {
    /** The canonical document type. */
    document_type: DocumentType;
    /** Human-readable label injected into the <doc_type> prompt slot. */
    label: string;
    /** Template row id in @om-patel91's `document_templates` table. */
    template_id: string;
    /** Standard Indian act codes that apply to this doc type. */
    applicable_acts: string[];
    /** Doc-type-specific PageIndex retrieval queries (act + section + intent). */
    pageindex_queries: string[];
    /** Default drafting notes for the Drafter. */
    notes: string;
}
/**
 * The per-doc-type contract. Keyed by DocumentType.
 *
 * Act codes follow the repo convention <ACT_CODE>-<YEAR>:
 *   RTI-2005   Right to Information Act, 2005
 *   ICA-1872   Indian Contract Act, 1872
 *   CPC-1908   Code of Civil Procedure, 1908
 *   IT-2000    Information Technology Act, 2000
 *   CPA-2019   Consumer Protection Act, 2019
 *   NI-1881    Negotiable Instruments Act, 1881
 */
export declare const DOC_TYPE_PROFILES: Record<DocumentType, DocTypeProfile>;
/**
 * Resolve the DocumentType to plan for.
 *
 * Resolution order:
 *   1. An explicit hint (e.g. ChainInput.doc_type or a UI selection).
 *   2. The classifier's free-form sub_domain string.
 *   3. A signal act code in relevant_acts.
 *   4. Fallback to "legal_notice" — the most generic demand document.
 *
 * @param hint           Optional explicit doc-type string (may be undefined).
 * @param subDomain      Classifier sub_domain (e.g. "cheque-bounce").
 * @param relevantActs   Classifier relevant_acts (e.g. ["NI-1881"]).
 */
export declare function resolveDocType(hint?: string, subDomain?: string, relevantActs?: string[]): DocumentType;
/**
 * Build a baseline PlannerOutput from a doc-type profile.
 * This is what the LLM is grounded against, and what we fall back to if the
 * LLM returns malformed JSON.
 */
export declare function baselinePlan(docType: DocumentType): PlannerOutput;
//# sourceMappingURL=doc-type-profiles.d.ts.map