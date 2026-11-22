/**
 * packages/translation/src/postprocess.ts
 * Owner: Team E — per-language owners listed below
 * Scaffolded by: Maharshi Patel (Team C — Translator Agent integration)
 *
 * Per-language post-processing for translated Indic legal text.
 * Called by the Translator Agent AFTER citation markers have been re-injected.
 *
 * CRITICAL RULE (RFC-indic-legal-glossary.md §8):
 *   Post-processing MUST NEVER modify text inside [CITE:...] markers.
 *   Citation markers are machine-readable and byte-exact — any change breaks
 *   the Citator-gatekeeper downstream.
 *
 * Current implementation status:
 *   hi — no-op stub (Megh Patel to implement Week 3)
 *   gu — no-op stub (Patel Swar to implement Week 3)
 *   mr — no-op stub (Swara Jariwala to implement Week 3)
 *   ta — no-op stub (Anshul Jangid to implement Week 3)
 */
import type { SupportedLanguage } from "@trionic/shared";
export type IndicLanguage = Exclude<SupportedLanguage, "en">;
/**
 * Split text into alternating [plain, cite-marker, plain, cite-marker, ...] segments.
 * Post-processors run only on plain segments.
 *
 * @param text - The translated text (with re-injected citation markers).
 * @returns    - Alternating plain-text / marker segments.
 */
export declare function splitAroundCiteMarkers(text: string): Array<{
    kind: "text" | "cite";
    value: string;
}>;
/**
 * Apply language-specific post-processing to a translated Indic draft.
 *
 * Citation markers [CITE:...] are protected from modification.
 * If a language has no processor yet, the text is returned unchanged.
 *
 * @param language - The Indic target language.
 * @param text     - Translated text with re-injected [CITE:...] markers.
 * @returns        - Post-processed text (citation markers byte-identical).
 */
export declare function postProcessIndicText(language: IndicLanguage, text: string): Promise<string>;
//# sourceMappingURL=postprocess.d.ts.map