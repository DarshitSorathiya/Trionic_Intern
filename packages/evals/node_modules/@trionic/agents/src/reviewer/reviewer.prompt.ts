/**
 * reviewer/reviewer.prompt.ts
 * Owner: Evan Gregor
 * Module: packages/agents/src/reviewer
 *
 * Prompts for the Reviewer agent's LLM-based checks:
 *   - Tone analysis (per-doc-type tone rules)
 *   - Section completeness scoring (semantic matching)
 */

import type { DocumentType } from "@trionic/shared";

/**
 * System prompt for tone analysis.
 * Instructs the LLM to identify informal, advisory, or unprofessional language
 * and return structured JSON.
 */
export const REVIEWER_TONE_SYSTEM_PROMPT = `You are a legal document tone reviewer for Trionic Adalat, an Indian legal drafting platform.

Your job is to check whether a legal draft maintains an appropriate professional tone, according to the document type's specific tone rules.

Flag any of the following general tone issues:
- Informal or casual language (slang, emoji, colloquialisms like "lol", "hey", "don't worry")
- First-person guarantees or promises ("I guarantee", "We will win", "You will definitely get")
- Imperative personal legal advice ("You should sue", "You must file", "Hire a lawyer immediately")
- Threatening or aggressive language
- Emotional appeals instead of factual statements

Do NOT flag:
- Neutral conditional phrasing ("The Act provides that...", "You may wish to consult...")
- Standard legal formulas and boilerplate
- Formal recommendations with citations

Respond ONLY with a JSON object. No markdown, no explanation, no code fences.

Example response:
{"tone_issues": ["Informal greeting: 'Hey' is not appropriate for a legal document"]}

If the tone is fully appropriate, respond with:
{"tone_issues": []}`;

/**
 * Per-doc-type tone expectations.
 * Injected into the user prompt by buildToneUserPrompt() so the LLM
 * evaluates tone against the correct standard for each document type.
 * Week 4 (#277): NDA formal-precise, consumer firm-but-respectful, cheque statutory-formal.
 */
export const TONE_RULES: Record<DocumentType, string> = {
  rti_application: "Formal, neutral, factual",
  legal_notice: "Formal, assertive, legally grounded",
  nda: "Formal-precise, contract language, no ambiguity",
  consumer_complaint: "Firm-but-respectful, factual grievance, no threats",
  cheque_bounce_notice: "Statutory-formal, cite NI Act § 138 language, strict demand tone",
};

/**
 * Build the user prompt for tone analysis.
 *
 * @param draftContent - The full markdown text of the draft.
 * @param docType - The document type, to enforce specific tone rules.
 */
export function buildToneUserPrompt(draftContent: string, docType: DocumentType): string {
  const specificTone = TONE_RULES[docType] || "Formal, neutral, factual";

  return `Analyze the tone of the following legal draft and identify any tone issues.

Ensure it complies with the specific tone rule for this document type:
**${specificTone}**

<draft>
${draftContent}
</draft>

Respond with a JSON object containing a "tone_issues" array.`;
}

// ─── Section Completeness Scoring Prompts ─────────────────────────────────────

/**
 * System prompt for section completeness scoring (all doc types).
 * Instructs the LLM to identify required sections semantically —
 * matching exact headings, semantic equivalents, or content-present-without-heading.
 */
export const REVIEWER_SECTION_SYSTEM_PROMPT = `You are a legal document structure reviewer for Trionic Adalat, an Indian legal drafting platform.

Your task is to check whether a legal draft contains all required sections. A section is "found" if:
- The exact heading appears (e.g., "## Address")
- OR a semantic equivalent appears (e.g., "Recipient Details" matches "Address", "Details Requested" matches "Information Sought")
- OR the content is clearly present even without a formal heading

A section is "missing" if no heading or content matching that section's purpose is found anywhere in the draft.

Respond ONLY with a JSON object. No markdown, no explanation, no code fences.

Example response:
{"sections": {"Address": "found", "Subject": "found", "Information Sought": "missing", "Declaration": "found", "Date and Signature": "missing"}}

If all sections are present, respond with all values as "found".`;

/**
 * Build the user prompt for section completeness scoring.
 *
 * @param draftContent     - The full markdown text of the draft.
 * @param requiredSections - List of section names to check for.
 */
export function buildSectionScoringUserPrompt(
  draftContent: string,
  requiredSections: string[]
): string {
  return `Check whether the following legal draft contains each of these required sections:
${requiredSections.map((s) => `- ${s}`).join("\n")}

<draft>
${draftContent}
</draft>

For each required section, respond "found" or "missing" in a JSON object with a "sections" key.`;
}
