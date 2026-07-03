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

// ─── Language display names ───────────────────────────────────────────────────

export const LANGUAGE_NAMES: Record<Exclude<SupportedLanguage, "en">, string> = {
  hi: "Hindi (हिन्दी)",
  gu: "Gujarati (ગુજરાતી)",
  mr: "Marathi (मराठी)",
  ta: "Tamil (தமிழ்)",
};

// ─── System Prompt ────────────────────────────────────────────────────────────

export const TRANSLATOR_SYSTEM_PROMPT_TEMPLATE = (
  targetLanguage: Exclude<SupportedLanguage, "en">,
  glossaryConstraints: string
): string => `You are the Translator agent for Trionic Adalat — an AI-assisted Indian legal document drafting system.

Your task is to translate a legal document from English into ${LANGUAGE_NAMES[targetLanguage]}.

## NON-NEGOTIABLE RULES

### Rule 1 — Placeholder Protection (CRITICAL)
The draft contains citation placeholders in the format: ⟦CITE_0⟧, ⟦CITE_1⟧, ⟦CITE_2⟧, etc.
These are machine-readable citation markers. You MUST:
- Keep every placeholder EXACTLY as-is (⟦CITE_0⟧ → ⟦CITE_0⟧)
- Never translate, paraphrase, rearrange, or omit any placeholder
- Each placeholder must appear EXACTLY ONCE in your output
- Place the placeholder at the same logical position in the translated sentence

### Rule 2 — Glossary Constraints
${
  glossaryConstraints.trim()
    ? `The following legal term translations are MANDATORY. Use them exactly — do not deviate:

${glossaryConstraints}

For terms with status "needs_review", use the suggested translation but note it may require review.`
    : "No specific glossary constraints for this translation."
}

### Rule 3 — Legal Register
- Maintain formal, professional legal language throughout
- Use the formal register appropriate for Indian court documents
- Preserve the document's legal structure and heading hierarchy
- Do not add or remove any legal claims or sections
- Translate disclaimer banners verbatim (the "AI-generated draft — not legal advice" notice)

### Rule 4 — Output Format
- Output translated Markdown only — same structure as the input
- Do NOT wrap output in code fences or JSON
- Maintain all Markdown headings (##, ###), bold text, and formatting

### Rule 5 — What NOT to do
- Do NOT translate text inside the ⟦CITE_N⟧ placeholders (they contain no translatable text)
- Do NOT add your own legal interpretations or change the meaning
- Do NOT use colloquial or simplified language
- Do NOT change numbers, dates, or proper nouns (names, addresses)

This translation is part of a legal document pipeline. Accuracy is critical.`;

// ─── User Prompt Builder ──────────────────────────────────────────────────────

/**
 * Build the user prompt for translation.
 *
 * @param cleanedDraft  - The draft with [CITE:...] replaced by ⟦CITE_N⟧ placeholders.
 * @param targetLang    - The target language code.
 * @param glossaryCount - Number of glossary entries injected (for prompt header).
 * @returns             - User prompt string for the LLM.
 */
export function buildTranslatorUserPrompt(
  cleanedDraft: string,
  targetLang: Exclude<SupportedLanguage, "en">,
  glossaryCount: number
): string {
  return `## Translation Request

Translate the following English legal document to ${LANGUAGE_NAMES[targetLang]}.

${glossaryCount > 0 ? `${glossaryCount} glossary constraint(s) have been applied. Use them exactly as specified in the system prompt.` : ""}

Remember:
- Keep every ⟦CITE_N⟧ placeholder EXACTLY as-is
- Each placeholder must appear exactly once in the output
- Maintain all legal structure and Markdown formatting

### Document to Translate

${cleanedDraft}

### End of Document

Output ONLY the translated Markdown. No preamble, no explanation, no code fences.`;
}

// ─── Glossary Constraints Block Builder ──────────────────────────────────────

/**
 * Format approved glossary entries as hard constraints for the system prompt.
 *
 * @param entries - Glossary entries from Team E's lookup.
 * @returns       - Formatted constraint block (empty string if no entries).
 */
export function buildGlossaryConstraintsBlock(entries: GlossaryEntry[]): string {
  if (entries.length === 0) return "";

  const approved = entries.filter((e) => e.status === "approved");
  const needsReview = entries.filter((e) => e.status === "needs_review");

  const lines: string[] = [];

  if (approved.length > 0) {
    lines.push("**MANDATORY translations (approved — use exactly these):**");
    for (const e of approved) {
      const nodeRef = e.node_id ? ` (node: ${e.node_id})` : "";
      lines.push(`- "${e.term_en}" → "${e.term_indic}"${nodeRef}`);
    }
  }

  if (needsReview.length > 0) {
    lines.push("");
    lines.push("**Suggested translations (needs review — prefer these but log if changed):**");
    for (const e of needsReview) {
      lines.push(`- "${e.term_en}" → "${e.term_indic}" [needs_review]`);
    }
  }

  return lines.join("\n");
}
