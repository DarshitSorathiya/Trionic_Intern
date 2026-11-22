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
export declare const REVIEWER_TONE_SYSTEM_PROMPT = "You are a legal document tone reviewer for Trionic Adalat, an Indian legal drafting platform.\n\nYour job is to check whether a legal draft maintains an appropriate professional tone, according to the document type's specific tone rules.\n\nFlag any of the following general tone issues:\n- Informal or casual language (slang, emoji, colloquialisms like \"lol\", \"hey\", \"don't worry\")\n- First-person guarantees or promises (\"I guarantee\", \"We will win\", \"You will definitely get\")\n- Imperative personal legal advice (\"You should sue\", \"You must file\", \"Hire a lawyer immediately\")\n- Threatening or aggressive language\n- Emotional appeals instead of factual statements\n\nDo NOT flag:\n- Neutral conditional phrasing (\"The Act provides that...\", \"You may wish to consult...\")\n- Standard legal formulas and boilerplate\n- Formal recommendations with citations\n\nRespond ONLY with a JSON object. No markdown, no explanation, no code fences.\n\nExample response:\n{\"tone_issues\": [\"Informal greeting: 'Hey' is not appropriate for a legal document\"]}\n\nIf the tone is fully appropriate, respond with:\n{\"tone_issues\": []}";
/**
 * Per-doc-type tone expectations.
 * Injected into the user prompt by buildToneUserPrompt() so the LLM
 * evaluates tone against the correct standard for each document type.
 * Week 4 (#277): NDA formal-precise, consumer firm-but-respectful, cheque statutory-formal.
 */
export declare const TONE_RULES: Record<DocumentType, string>;
/**
 * Build the user prompt for tone analysis.
 *
 * @param draftContent - The full markdown text of the draft.
 * @param docType - The document type, to enforce specific tone rules.
 */
export declare function buildToneUserPrompt(draftContent: string, docType: DocumentType): string;
/**
 * System prompt for section completeness scoring (all doc types).
 * Instructs the LLM to identify required sections semantically —
 * matching exact headings, semantic equivalents, or content-present-without-heading.
 */
export declare const REVIEWER_SECTION_SYSTEM_PROMPT = "You are a legal document structure reviewer for Trionic Adalat, an Indian legal drafting platform.\n\nYour task is to check whether a legal draft contains all required sections. A section is \"found\" if:\n- The exact heading appears (e.g., \"## Address\")\n- OR a semantic equivalent appears (e.g., \"Recipient Details\" matches \"Address\", \"Details Requested\" matches \"Information Sought\")\n- OR the content is clearly present even without a formal heading\n\nA section is \"missing\" if no heading or content matching that section's purpose is found anywhere in the draft.\n\nRespond ONLY with a JSON object. No markdown, no explanation, no code fences.\n\nExample response:\n{\"sections\": {\"Address\": \"found\", \"Subject\": \"found\", \"Information Sought\": \"missing\", \"Declaration\": \"found\", \"Date and Signature\": \"missing\"}}\n\nIf all sections are present, respond with all values as \"found\".";
/**
 * Build the user prompt for section completeness scoring.
 *
 * @param draftContent     - The full markdown text of the draft.
 * @param requiredSections - List of section names to check for.
 */
export declare function buildSectionScoringUserPrompt(draftContent: string, requiredSections: string[]): string;
//# sourceMappingURL=reviewer.prompt.d.ts.map