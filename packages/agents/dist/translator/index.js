"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitationDuplicateError = exports.CitationDropError = exports.reinjectCitations = exports.validatePlaceholders = exports.stripCitations = exports.LANGUAGE_NAMES = exports.buildGlossaryConstraintsBlock = exports.buildTranslatorUserPrompt = exports.TRANSLATOR_SYSTEM_PROMPT_TEMPLATE = exports.TranslatorAgent = exports.runTranslator = void 0;
// ─── Agent exports ────────────────────────────────────────────────────────────
var translator_agent_js_1 = require("./translator.agent.js");
Object.defineProperty(exports, "runTranslator", { enumerable: true, get: function () { return translator_agent_js_1.runTranslator; } });
Object.defineProperty(exports, "TranslatorAgent", { enumerable: true, get: function () { return translator_agent_js_1.TranslatorAgent; } });
// ─── Prompt exports (for testing / inspection) ────────────────────────────────
var translator_prompt_js_1 = require("./translator.prompt.js");
Object.defineProperty(exports, "TRANSLATOR_SYSTEM_PROMPT_TEMPLATE", { enumerable: true, get: function () { return translator_prompt_js_1.TRANSLATOR_SYSTEM_PROMPT_TEMPLATE; } });
Object.defineProperty(exports, "buildTranslatorUserPrompt", { enumerable: true, get: function () { return translator_prompt_js_1.buildTranslatorUserPrompt; } });
Object.defineProperty(exports, "buildGlossaryConstraintsBlock", { enumerable: true, get: function () { return translator_prompt_js_1.buildGlossaryConstraintsBlock; } });
Object.defineProperty(exports, "LANGUAGE_NAMES", { enumerable: true, get: function () { return translator_prompt_js_1.LANGUAGE_NAMES; } });
// ─── Citation utilities (exported for testing) ────────────────────────────────
var translator_agent_js_2 = require("./translator.agent.js");
Object.defineProperty(exports, "stripCitations", { enumerable: true, get: function () { return translator_agent_js_2.stripCitations; } });
Object.defineProperty(exports, "validatePlaceholders", { enumerable: true, get: function () { return translator_agent_js_2.validatePlaceholders; } });
Object.defineProperty(exports, "reinjectCitations", { enumerable: true, get: function () { return translator_agent_js_2.reinjectCitations; } });
Object.defineProperty(exports, "CitationDropError", { enumerable: true, get: function () { return translator_agent_js_2.CitationDropError; } });
Object.defineProperty(exports, "CitationDuplicateError", { enumerable: true, get: function () { return translator_agent_js_2.CitationDuplicateError; } });
//# sourceMappingURL=index.js.map