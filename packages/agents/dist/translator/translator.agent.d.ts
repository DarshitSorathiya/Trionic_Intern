/**
 * translator/translator.agent.ts
 * Owner: Maharshi Patel
 * Module: packages/agents/src/translator
 *
 * Core Translator agent logic.
 *
 * Pipeline position:
 *   Drafter → Citator-gatekeeper → Reviewer → [Translator] → User/Export
 *
 * Citation-preservation strategy (RFC-translator-agent.md §4):
 *   [CITE:<node_id>] markers are STRIPPED before the LLM call and replaced
 *   with Unicode placeholders (⟦CITE_N⟧). After translation, placeholders
 *   are swapped back deterministically in code — never relying on the LLM
 *   to preserve them.
 *
 * Glossary integration (RFC-translator-agent.md §3):
 *   lookupGlossary() from @trionic/translation is called before the LLM call.
 *   Approved entries are injected as hard constraints in the system prompt.
 *   Failures are graceful — the agent continues in degraded mode.
 *
 * Pass-through rule:
 *   If target_language === 'en', the input is returned unchanged (no LLM call).
 */
import type { TranslatorInput, TranslatorResult } from "./index.js";
export interface CitationSpan {
    /** Placeholder index (⟦CITE_N⟧). */
    index: number;
    /** The PageIndex node ID, e.g. "ICA-1872/CH-VI/S-73". */
    node_id: string;
    /** Snapshot date, provisionally "2024-12-01". */
    snapshot_id: string;
    /** Span [start, end) in the ORIGINAL English draft. */
    original_span: [number, number];
    /** Span [start, end) in the TRANSLATED draft. Filled after re-injection. */
    translated_span?: [number, number];
}
export type CitationMap = CitationSpan[];
/** Thrown when a placeholder is missing from LLM output. */
export declare class CitationDropError extends Error {
    readonly missingIndexes: number[];
    constructor(missingIndexes: number[]);
}
/** Thrown when a placeholder appears more than once in LLM output. */
export declare class CitationDuplicateError extends Error {
    readonly duplicateIndexes: number[];
    constructor(duplicateIndexes: number[]);
}
/**
 * Replace every [CITE:<node_id>] in the draft with a ⟦CITE_N⟧ placeholder.
 *
 * @param markdown - The original English draft.
 * @returns        - { cleaned, citationMap }
 */
export declare function stripCitations(markdown: string): {
    cleaned: string;
    citationMap: CitationMap;
};
/**
 * Validate that every placeholder appears exactly once in the LLM output.
 * Throws CitationDropError or CitationDuplicateError on failure.
 */
export declare function validatePlaceholders(translatedText: string, citationMap: CitationMap): void;
/**
 * Swap ⟦CITE_N⟧ placeholders back to [CITE:<node_id>] in translated text.
 * Also records translated_span for each CitationSpan.
 */
export declare function reinjectCitations(translatedText: string, citationMap: CitationMap): {
    result: string;
    updatedMap: CitationMap;
};
/**
 * Translate an approved English legal draft into the target language.
 *
 * Steps:
 *   1. Pass-through if target_language === 'en'.
 *   2. Extract node IDs from [CITE:...] markers.
 *   3. Glossary lookup (Team E) — degraded mode on failure.
 *   4. Strip citations → ⟦CITE_N⟧ placeholders (CitationMap).
 *   5. Build LLM prompt with glossary constraints.
 *   6. Call LLM Router (Gemini in Week 2 config).
 *   7. Validate placeholder completeness (throw on drop/duplicate).
 *   8. Re-inject citations.
 *   9. Post-process (Team E) — no-op stubs for now.
 *  10. Build trace, persist, return.
 *
 * @throws CitationDropError      - If LLM drops a placeholder (never silently returns broken draft).
 * @throws CitationDuplicateError - If LLM duplicates a placeholder.
 * @throws Error                  - Any other failure (LLM timeout, etc.).
 */
export declare function runTranslator(input: TranslatorInput): Promise<TranslatorResult>;
/**
 * Agno framework class wrapper for the Translator agent.
 */
export declare class TranslatorAgent {
    readonly name = "translator";
    run(input: TranslatorInput): Promise<TranslatorResult>;
}
//# sourceMappingURL=translator.agent.d.ts.map