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
/**
 * Base Planner system prompt (doc-type agnostic).
 * Exported for tests / inspection. Production calls go through
 * {@link buildPlannerSystemPrompt} which fills the <doc_type> slot.
 */
export declare const PLANNER_SYSTEM_PROMPT = "You are the Planner agent for Trionic Adalat, an AI-assisted Indian legal document drafting system.\n\nYour job is to read a classified legal request and produce a structured PLAN that tells the Drafter agent:\n1. Which document type to produce.\n2. Which template to use.\n3. Which sections of Indian acts to retrieve from PageIndex.\n4. Which acts are most relevant.\n5. Any special notes for the Drafter.\n\nRULES:\n- You MUST output valid JSON and nothing else.\n- The JSON must match the PlannerOutput type exactly.\n- Never invent act codes \u2014 only use standard codes (e.g. ICA-1872, CPA-2019, IPC-1860, CrPC-1973, RTI-2005, IT-2000, NI-1881, CPC-1908, CONSTITUTION).\n- For pageindex_queries, be specific: \"ICA-1872 Section 73 \u2014 consequences of breach\" not just \"breach\".\n- This is a drafting aid, NOT legal advice. Do not give legal opinions.";
/**
 * Build the Planner system prompt for a specific document type.
 *
 * Injects a <doc_type> slot so the LLM cannot drift to a different document
 * type than the one the chain resolved. The acceptance criteria require this
 * slot to be present in the system prompt for every Planner LLM call.
 */
export declare function buildPlannerSystemPrompt(docType: DocumentType): string;
/**
 * Build the user prompt for the planner given a classified intake and the
 * resolved document type. The doc-type baseline plan is injected so the LLM
 * refines a known-good starting point rather than inventing one from scratch.
 */
export declare function buildPlannerUserPrompt(intakeText: string, classifier: ClassifierOutput, language: SupportedLanguage, docType: DocumentType): string;
//# sourceMappingURL=planner.prompt.d.ts.map