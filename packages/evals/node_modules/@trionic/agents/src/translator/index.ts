/**
 * translator/index.ts
 * Owner: Maharshi Patel
 * Module: packages/agents/src/translator
 *
 * Public barrel — the ONLY file other packages import from this module.
 * All agent logic is split across focused files:
 *
 *   types (inline below)       — TranslatorInput, TranslatorResult
 *   translator.agent.ts        — runTranslator(), TranslatorAgent class
 *   translator.prompt.ts       — prompts and glossary constraint builder
 *
 * Test file:
 *   translator.test.ts         — unit and integration tests (no real API calls)
 *
 * Acceptance criteria (Issue #51):
 *   ✅ Exported from packages/agents/src/agents/translator.ts (this barrel)
 *   ✅ Accepts { body_markdown, target_language, citations }
 *   ✅ Calls glossary.lookup before LLM call
 *   ✅ Returns TranslatorOutput { target_language, translated_markdown, glossary_hits }
 *   ✅ [CITE:<node_id>] markers survive translation
 *   ✅ target_language === 'en' passes through unchanged
 */

import type {
  AgentTrace,
  Citation,
  SupportedLanguage,
  TranslatorOutput,
} from "@trionic/shared";

// ─── Input / Output shapes ────────────────────────────────────────────────────

/**
 * Input to the Translator agent (Week-2 spec shape).
 *
 * The agent accepts the approved English draft body + target language.
 * Citations are forwarded through for traceability but are also re-extracted
 * from [CITE:...] markers inside body_markdown for placeholder mapping.
 */
export interface TranslatorInput {
  /**
   * The full Markdown body of the approved English draft.
   * MUST contain [CITE:<node_id>] markers — they are preserved across translation.
   */
  body_markdown: string;

  /**
   * Language to translate into. If "en", the input is returned unchanged.
   */
  target_language: SupportedLanguage;

  /**
   * Citations resolved by the Citator-gatekeeper.
   * Forwarded through for context (node IDs also extracted from body_markdown).
   */
  citations?: Citation[];

  /**
   * Optional session ID for trace attribution and RLS scoping.
   */
  session_id?: string;
}

/**
 * Output of the Translator agent.
 *
 * Wraps the canonical TranslatorOutput from @trionic/shared with the AgentTrace
 * needed for pipeline observability.
 */
export interface TranslatorResult {
  /**
   * The translation result — matches packages/shared/src/types.ts TranslatorOutput.
   * { target_language, translated_markdown, glossary_hits }
   */
  output: TranslatorOutput;

  /**
   * Audit trace for this agent call — persisted to agent_traces table.
   */
  trace: AgentTrace;
}

// ─── Agent exports ────────────────────────────────────────────────────────────
export { runTranslator, TranslatorAgent } from "./translator.agent.js";

// ─── Prompt exports (for testing / inspection) ────────────────────────────────
export {
  TRANSLATOR_SYSTEM_PROMPT_TEMPLATE,
  buildTranslatorUserPrompt,
  buildGlossaryConstraintsBlock,
  LANGUAGE_NAMES,
} from "./translator.prompt.js";

// ─── Citation utilities (exported for testing) ────────────────────────────────
export {
  stripCitations,
  validatePlaceholders,
  reinjectCitations,
  CitationDropError,
  CitationDuplicateError,
} from "./translator.agent.js";

export type { CitationSpan, CitationMap } from "./translator.agent.js";
