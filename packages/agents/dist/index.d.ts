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
export { LLMRouter, router } from "./router/index.js";
export type { LLMRequest, LLMResponse } from "./router/index.js";
export { buildTrace, buildErrorTrace, persistTrace } from "./tracing/index.js";
export type { TraceInput } from "./tracing/index.js";
export { PlannerAgent, runPlanner } from "./planner/index.js";
export type { PlannerInput, PlannerResult } from "./planner/index.js";
export { ClassifierAgent, runClassifier } from "./classifier/index.js";
export type { ClassifierInput, ClassifierResult } from "./classifier/index.js";
export { DrafterAgent, runDrafter } from "./drafter/index.js";
export type { DrafterInput, DrafterResult } from "./drafter/index.js";
export { CitatorGatekeeperAgent, runCitator } from "./citator/index.js";
export type { CitatorInput, CitatorResult } from "./citator/index.js";
export { ReviewerAgent, runReviewer } from "./reviewer/index.js";
export type { ReviewerInput, ReviewerResult } from "./reviewer/index.js";
export { TranslatorAgent, runTranslator } from "./translator/index.js";
export type { TranslatorInput, TranslatorResult } from "./translator/index.js";
export type { PipelineInput, PipelineResult } from "./types.js";
export { PlannerAgent as PlannerAgentV2, runPlannerAgent, } from "./agents/planner.js";
export type { PlannerInput as PlannerInputV2, PlannerResult as PlannerResultV2, } from "./agents/planner.js";
export { DrafterAgent as DrafterAgentV2, runDrafterAgent, } from "./agents/drafter.js";
export type { DrafterAgentInput, PageIndexNodeInput, } from "./agents/drafter.js";
export { runAgentChain } from "./orchestrator.js";
export { Memory, InMemoryStore, SupabaseStore, MemoryConflictError, createInitialState, hashIntakeText, } from "./memory.js";
export type { MemoryStore, MemoryApi } from "./memory.js";
export { runAgentChain as runAgentChainWithMemory } from "./chain.js";
export type { ChainInput, ChainOptions } from "./chain.js";
export { runIterationChain } from "./iterate.js";
export type { IterateInput, IterateOptions } from "./iterate.js";
//# sourceMappingURL=index.d.ts.map