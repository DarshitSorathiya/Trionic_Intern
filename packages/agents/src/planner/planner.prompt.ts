/**
 * planner/planner.prompt.ts
 * Owner: Malay Sheta (Planner agent)
 *
 * System and user prompt templates for the Planner agent.
 * Keep prompts here — never inline them in index.ts.
 *
 * W4: the system prompt carries a <doc_type> slot so the LLM is locked to the
 * document type the chain resolved, and the user prompt injects the doc-type
 * baseline (template_id, acts, queries) from doc-type-profiles.ts.
 */

import type { ClassifierOutput, DocumentType, SupportedLanguage } from "../types.js";
import { DOC_TYPE_PROFILES, baselinePlan } from "./doc-type-profiles.js";

/**
 * Base Planner system prompt (doc-type agnostic).
 * Exported for tests / inspection. Production calls go through
 * {@link buildPlannerSystemPrompt} which fills the <doc_type> slot.
 */
export const PLANNER_SYSTEM_PROMPT = `You are the Planner agent for Trionic Adalat, an AI-assisted Indian legal document drafting system.

Your job is to read a classified legal request and produce a structured PLAN that tells the Drafter agent:
1. Which document type to produce.
2. Which template to use.
3. Which sections of Indian acts to retrieve from PageIndex.
4. Which acts are most relevant.
5. Any special notes for the Drafter.

RULES:
- You MUST output valid JSON and nothing else.
- The JSON must match the PlannerOutput type exactly.
- Never invent act codes — only use standard codes (e.g. ICA-1872, CPA-2019, IPC-1860, CrPC-1973, RTI-2005, IT-2000, NI-1881, CPC-1908, CONSTITUTION).
- For pageindex_queries, be specific: "ICA-1872 Section 73 — consequences of breach" not just "breach".
- This is a drafting aid, NOT legal advice. Do not give legal opinions.`;

/**
 * Build the Planner system prompt for a specific document type.
 *
 * Injects a <doc_type> slot so the LLM cannot drift to a different document
 * type than the one the chain resolved. The acceptance criteria require this
 * slot to be present in the system prompt for every Planner LLM call.
 */
export function buildPlannerSystemPrompt(docType: DocumentType): string {
  const profile = DOC_TYPE_PROFILES[docType];
  return `${PLANNER_SYSTEM_PROMPT}

<doc_type>
You are planning a ${profile.label}.
- document_type MUST be exactly "${profile.document_type}".
- template_id MUST be exactly "${profile.template_id}".
- The applicable Indian acts for this document type are: ${profile.applicable_acts.join(", ")}.
- Your pageindex_queries MUST target sections of those acts. Do not introduce acts that are irrelevant to a ${profile.label}.
</doc_type>`;
}

/**
 * Build the user prompt for the planner given a classified intake and the
 * resolved document type. The doc-type baseline plan is injected so the LLM
 * refines a known-good starting point rather than inventing one from scratch.
 */
export function buildPlannerUserPrompt(
  intakeText: string,
  classifier: ClassifierOutput,
  language: SupportedLanguage,
  docType: DocumentType
): string {
  const baseline = baselinePlan(docType);

  return `## Classified Legal Request

Original intake (user's language: ${language}):
${intakeText}

Classifier result:
- Domain: ${classifier.domain}
- Sub-domain: ${classifier.sub_domain ?? "(none)"}
- Relevant acts: ${classifier.relevant_acts.join(", ")}
- Confidence: ${classifier.confidence}
- Reasoning: ${classifier.reasoning}

## Resolved Document Type
${docType}

## Baseline plan for this document type
Use this as your starting point. Keep template_id and document_type as given.
Refine pageindex_queries and notes to fit the specific facts of the intake,
but stay within the listed acts.

${JSON.stringify(baseline, null, 2)}

## Your Task

Produce a JSON plan with this exact shape:
{
  "document_type": "<rti_application | legal_notice | nda | consumer_complaint | cheque_bounce_notice>",
  "template_id": "<string>",
  "pageindex_queries": ["<specific query 1>", "<specific query 2>", ...],
  "applicable_acts": ["<ACT_CODE_1>", "<ACT_CODE_2>", ...],
  "notes": "<any special instructions for the Drafter>"
}

Output ONLY the JSON object. No explanation, no markdown fences.`;
}
