"use strict";
/**
 * drafter/index.ts
 * Owner: Jenil Sutariya
 * Module: packages/agents/src/drafter
 *
 * Public barrel — the ONLY file other packages import from this module.
 * All agent logic is split across focused files:
 *
 *   types.ts         — DrafterInput, DrafterResult
 *   citations.ts     — extractCitations(), extractNodeIds(), constants
 *   drafter.agent.ts — runDrafter(), reviseDraft(), DrafterAgent class
 *   drafter.prompt.ts— DRAFTER_SYSTEM_PROMPT, buildDrafterUserPrompt(), buildDrafterRevisionPrompt()
 *
 * Test files:
 *   citations.test.ts — pure unit tests for citation utilities (no mocks)
 *   drafter.test.ts   — integration-style tests for runDrafter(), DrafterAgent, etc.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDrafterRevisionPrompt = exports.buildDrafterUserPrompt = exports.RTI_DRAFTER_SYSTEM_PROMPT = exports.DRAFTER_SYSTEM_PROMPT = exports.DrafterAgent = exports.reviseDraft = exports.runDrafter = exports.normalizeRtiNodeId = exports.PROVISIONAL_SNAPSHOT_ID = exports.CITE_MARKER_REGEX = exports.extractNodeIds = exports.extractCitations = void 0;
// ─── Citation utilities ───────────────────────────────────────────────────────
var citations_js_1 = require("./citations.js");
Object.defineProperty(exports, "extractCitations", { enumerable: true, get: function () { return citations_js_1.extractCitations; } });
Object.defineProperty(exports, "extractNodeIds", { enumerable: true, get: function () { return citations_js_1.extractNodeIds; } });
Object.defineProperty(exports, "CITE_MARKER_REGEX", { enumerable: true, get: function () { return citations_js_1.CITE_MARKER_REGEX; } });
Object.defineProperty(exports, "PROVISIONAL_SNAPSHOT_ID", { enumerable: true, get: function () { return citations_js_1.PROVISIONAL_SNAPSHOT_ID; } });
Object.defineProperty(exports, "normalizeRtiNodeId", { enumerable: true, get: function () { return citations_js_1.normalizeRtiNodeId; } });
// ─── Agent (runDrafter, reviseDraft, DrafterAgent) ────────────────────────────
var drafter_agent_js_1 = require("./drafter.agent.js");
Object.defineProperty(exports, "runDrafter", { enumerable: true, get: function () { return drafter_agent_js_1.runDrafter; } });
Object.defineProperty(exports, "reviseDraft", { enumerable: true, get: function () { return drafter_agent_js_1.reviseDraft; } });
Object.defineProperty(exports, "DrafterAgent", { enumerable: true, get: function () { return drafter_agent_js_1.DrafterAgent; } });
// ─── Prompts (exported for testing / inspection) ──────────────────────────────
var drafter_prompt_js_1 = require("./drafter.prompt.js");
Object.defineProperty(exports, "DRAFTER_SYSTEM_PROMPT", { enumerable: true, get: function () { return drafter_prompt_js_1.DRAFTER_SYSTEM_PROMPT; } });
Object.defineProperty(exports, "RTI_DRAFTER_SYSTEM_PROMPT", { enumerable: true, get: function () { return drafter_prompt_js_1.RTI_DRAFTER_SYSTEM_PROMPT; } });
Object.defineProperty(exports, "buildDrafterUserPrompt", { enumerable: true, get: function () { return drafter_prompt_js_1.buildDrafterUserPrompt; } });
Object.defineProperty(exports, "buildDrafterRevisionPrompt", { enumerable: true, get: function () { return drafter_prompt_js_1.buildDrafterRevisionPrompt; } });
//# sourceMappingURL=index.js.map