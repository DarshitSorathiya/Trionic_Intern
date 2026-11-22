/**
 * translator/translator.prompt.ts
 * Owner: Maharshi Patel
 * Module: packages/agents/src/translator
 *
 * System and user prompt templates for the Translator agent.
 *
 * Key design decisions (RFC-translator-agent.md §4):
 *   - Citation markers are STRIPPED before the LLM sees the text.
 *     The cleaned draft uses ⟦CITE_N⟧ placeholders (Unicode U+27E6/U+27E7)
 *     which are rare enough never to appear in Indian legal text.
 *   - Glossary constraints are injected as HARD rules, not suggestions.
 *     Only "approved" entries are enforced; "needs_review" entries are shown
 *     as suggestions and flagged for human review.
 *   - The system prompt forbids ANY modification to ⟦CITE_N⟧ placeholders.
 */
import type { GlossaryEntry } from "@trionic/translation";
import type { SupportedLanguage } from "@trionic/shared";
export declare const LANGUAGE_NAMES: Record<Exclude<SupportedLanguage, "en">, string>;
export declare const TRANSLATOR_SYSTEM_PROMPT_TEMPLATE: (targetLanguage: Exclude<SupportedLanguage, "en">, glossaryConstraints: string) => string;
/**
 * Build the user prompt for translation.
 *
 * @param cleanedDraft  - The draft with [CITE:...] replaced by ⟦CITE_N⟧ placeholders.
 * @param targetLang    - The target language code.
 * @param glossaryCount - Number of glossary entries injected (for prompt header).
 * @returns             - User prompt string for the LLM.
 */
export declare function buildTranslatorUserPrompt(cleanedDraft: string, targetLang: Exclude<SupportedLanguage, "en">, glossaryCount: number): string;
/**
 * Format approved glossary entries as hard constraints for the system prompt.
 *
 * @param entries - Glossary entries from Team E's lookup.
 * @returns       - Formatted constraint block (empty string if no entries).
 */
export declare function buildGlossaryConstraintsBlock(entries: GlossaryEntry[]): string;
//# sourceMappingURL=translator.prompt.d.ts.map