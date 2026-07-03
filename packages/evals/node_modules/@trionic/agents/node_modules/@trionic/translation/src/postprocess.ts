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

// ─── Citation marker protection ───────────────────────────────────────────────

/** Regex to locate [CITE:<node_id>] spans so post-processors can skip them. */
const CITE_MARKER_REGEX = /\[CITE:[^\]]+\]/g;

/**
 * Split text into alternating [plain, cite-marker, plain, cite-marker, ...] segments.
 * Post-processors run only on plain segments.
 *
 * @param text - The translated text (with re-injected citation markers).
 * @returns    - Alternating plain-text / marker segments.
 */
export function splitAroundCiteMarkers(
  text: string
): Array<{ kind: "text" | "cite"; value: string }> {
  const segments: Array<{ kind: "text" | "cite"; value: string }> = [];
  let lastIndex = 0;
  const regex = new RegExp(CITE_MARKER_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ kind: "cite", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

// ─── Language-specific processors ────────────────────────────────────────────

/**
 * Hindi post-processor.
 * Owner: Megh Patel
 * TODO Week 3: Devanagari numeral formatting; "Section N" → "धारा N"; strip stray ZWJ/ZWNJ.
 */
function processHindi(text: string): string {
  // No-op stub — intentionally returns text unchanged until Megh's implementation lands.
  return text;
}

/**
 * Gujarati post-processor.
 * Owner: Patel Swar
 * TODO Week 3: Numeral handling; honorific formatting; nukta normalisation.
 */
function processGujarati(text: string): string {
  return text;
}

/**
 * Marathi post-processor.
 * Owner: Swara Jariwala
 * TODO Week 3: Gender agreement; "।।" → "।" punctuation fix.
 */
function processMarathi(text: string): string {
  return text;
}

/**
 * Tamil post-processor.
 * Owner: Anshul Jangid
 * TODO Week 3: Numeral format; gender suffixes; grantha ஸ் usage.
 */
function processTamil(text: string): string {
  return text;
}

// ─── postProcessIndicText ─────────────────────────────────────────────────────

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
export async function postProcessIndicText(
  language: IndicLanguage,
  text: string
): Promise<string> {
  const segments = splitAroundCiteMarkers(text);
  let processor: (s: string) => string;

  switch (language) {
    case "hi":
      processor = processHindi;
      break;
    case "gu":
      processor = processGujarati;
      break;
    case "mr":
      processor = processMarathi;
      break;
    case "ta":
      processor = processTamil;
      break;
    default: {
      // Unknown language — log and return unchanged
      const _exhaustive: never = language;
      console.debug(
        `[translation/postprocess] No processor for language "${_exhaustive}". Returning text unchanged.`
      );
      return text;
    }
  }

  return segments
    .map((seg) => (seg.kind === "text" ? processor(seg.value) : seg.value))
    .join("");
}
