"use strict";
/**
 * src/index.ts — Master public API for @trionic/agents
 * Owner: Malay Sheta (Team C Lead — scaffolder)
 *
 * This is the ONLY file Team B (API layer) imports from.
 * All agents and the router are exported from here.
 *
 * Acceptance criteria (Week 1):
 *   ✅ exports a runnable PlannerAgent stub
 *   ✅ Router resolves model from config; pluggable interface
 *   ✅ Trace shape matches packages/shared/AgentTrace type
 *
 * Week-2 additions:
 *   ✅ PlannerAgent skeleton (agents/planner.ts) — canned plan by domain
 *   ✅ runAgentChain — full pipeline orchestrator (orchestrator.ts)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runIterationChain = exports.runAgentChainWithMemory = exports.hashIntakeText = exports.createInitialState = exports.MemoryConflictError = exports.SupabaseStore = exports.InMemoryStore = exports.Memory = exports.runAgentChain = exports.runDrafterAgent = exports.DrafterAgentV2 = exports.runPlannerAgent = exports.PlannerAgentV2 = exports.runTranslator = exports.TranslatorAgent = exports.runReviewer = exports.ReviewerAgent = exports.runCitator = exports.CitatorGatekeeperAgent = exports.runDrafter = exports.DrafterAgent = exports.runClassifier = exports.ClassifierAgent = exports.runPlanner = exports.PlannerAgent = exports.persistTrace = exports.buildErrorTrace = exports.buildTrace = exports.router = exports.LLMRouter = void 0;
// ─── LLM Router ───────────────────────────────────────────────────────────────
var index_js_1 = require("./router/index.js");
Object.defineProperty(exports, "LLMRouter", { enumerable: true, get: function () { return index_js_1.LLMRouter; } });
Object.defineProperty(exports, "router", { enumerable: true, get: function () { return index_js_1.router; } });
// ─── Tracing ──────────────────────────────────────────────────────────────────
var index_js_2 = require("./tracing/index.js");
Object.defineProperty(exports, "buildTrace", { enumerable: true, get: function () { return index_js_2.buildTrace; } });
Object.defineProperty(exports, "buildErrorTrace", { enumerable: true, get: function () { return index_js_2.buildErrorTrace; } });
Object.defineProperty(exports, "persistTrace", { enumerable: true, get: function () { return index_js_2.persistTrace; } });
// ─── Planner Agent ✅ (Malay Sheta) ──────────────────────────────────────────
var index_js_3 = require("./planner/index.js");
Object.defineProperty(exports, "PlannerAgent", { enumerable: true, get: function () { return index_js_3.PlannerAgent; } });
Object.defineProperty(exports, "runPlanner", { enumerable: true, get: function () { return index_js_3.runPlanner; } });
// ─── Classifier Agent (Kathan Purohit) ───────────────────────────────────────
var index_js_4 = require("./classifier/index.js");
Object.defineProperty(exports, "ClassifierAgent", { enumerable: true, get: function () { return index_js_4.ClassifierAgent; } });
Object.defineProperty(exports, "runClassifier", { enumerable: true, get: function () { return index_js_4.runClassifier; } });
// ─── Drafter Agent (Jenil Sutariya) ──────────────────────────────────────────
var index_js_5 = require("./drafter/index.js");
Object.defineProperty(exports, "DrafterAgent", { enumerable: true, get: function () { return index_js_5.DrafterAgent; } });
Object.defineProperty(exports, "runDrafter", { enumerable: true, get: function () { return index_js_5.runDrafter; } });
// ─── Citator-Gatekeeper Agent ⚠️ (Hitarth Sherathia) ────────────────────────
var index_js_6 = require("./citator/index.js");
Object.defineProperty(exports, "CitatorGatekeeperAgent", { enumerable: true, get: function () { return index_js_6.CitatorGatekeeperAgent; } });
Object.defineProperty(exports, "runCitator", { enumerable: true, get: function () { return index_js_6.runCitator; } });
// ─── Reviewer Agent (Evan Gregor) ────────────────────────────────────────────
var index_js_7 = require("./reviewer/index.js");
Object.defineProperty(exports, "ReviewerAgent", { enumerable: true, get: function () { return index_js_7.ReviewerAgent; } });
Object.defineProperty(exports, "runReviewer", { enumerable: true, get: function () { return index_js_7.runReviewer; } });
// ─── Translator Agent (Maharshi Patel) ───────────────────────────────────────
var index_js_8 = require("./translator/index.js");
Object.defineProperty(exports, "TranslatorAgent", { enumerable: true, get: function () { return index_js_8.TranslatorAgent; } });
Object.defineProperty(exports, "runTranslator", { enumerable: true, get: function () { return index_js_8.runTranslator; } });
// ─── Week-2: PlannerAgent skeleton (agents/planner.ts) ───────────────────────
// Named differently from the W1 PlannerAgent to avoid a conflict.
// The W2 class is the canonical one going forward.
var planner_js_1 = require("./agents/planner.js");
Object.defineProperty(exports, "PlannerAgentV2", { enumerable: true, get: function () { return planner_js_1.PlannerAgent; } });
Object.defineProperty(exports, "runPlannerAgent", { enumerable: true, get: function () { return planner_js_1.runPlannerAgent; } });
// ─── Week-2: DrafterAgent (agents/drafter.ts) ────────────────────────────────
var drafter_js_1 = require("./agents/drafter.js");
Object.defineProperty(exports, "DrafterAgentV2", { enumerable: true, get: function () { return drafter_js_1.DrafterAgent; } });
Object.defineProperty(exports, "runDrafterAgent", { enumerable: true, get: function () { return drafter_js_1.runDrafterAgent; } });
// ─── Week-2: runAgentChain orchestrator ──────────────────────────────────────
var orchestrator_js_1 = require("./orchestrator.js");
Object.defineProperty(exports, "runAgentChain", { enumerable: true, get: function () { return orchestrator_js_1.runAgentChain; } });
// ─── Week-3: Memory API (Yatri Dungarani — Issue #39) ────────────────────────
// Team B's POST /api/draft handler imports these to wire the correct store:
//
//   import { Memory, SupabaseStore } from "@trionic/agents";
//   const memory = new Memory(new SupabaseStore(supabaseClient));
//   // pass memoryStore into runAgentChain options
//
var memory_js_1 = require("./memory.js");
Object.defineProperty(exports, "Memory", { enumerable: true, get: function () { return memory_js_1.Memory; } });
Object.defineProperty(exports, "InMemoryStore", { enumerable: true, get: function () { return memory_js_1.InMemoryStore; } });
Object.defineProperty(exports, "SupabaseStore", { enumerable: true, get: function () { return memory_js_1.SupabaseStore; } });
Object.defineProperty(exports, "MemoryConflictError", { enumerable: true, get: function () { return memory_js_1.MemoryConflictError; } });
Object.defineProperty(exports, "createInitialState", { enumerable: true, get: function () { return memory_js_1.createInitialState; } });
Object.defineProperty(exports, "hashIntakeText", { enumerable: true, get: function () { return memory_js_1.hashIntakeText; } });
// Memory-aware runAgentChain (from chain.ts).
// Preferred over the orchestrator.ts version for production use —
// this one reads/writes ConversationState on every step.
var chain_js_1 = require("./chain.js");
Object.defineProperty(exports, "runAgentChainWithMemory", { enumerable: true, get: function () { return chain_js_1.runAgentChain; } });
// ─── Week-4: Iteration chain (Yatri Dungarani) ──────────────────────────────
// Skips Classifier + Planner + PageIndex retrieval; re-runs only
// Drafter → Citator → Reviewer → [Translator]. 3-5× faster than full chain.
var iterate_js_1 = require("./iterate.js");
Object.defineProperty(exports, "runIterationChain", { enumerable: true, get: function () { return iterate_js_1.runIterationChain; } });
//# sourceMappingURL=index.js.map