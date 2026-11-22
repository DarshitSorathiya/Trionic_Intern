/**
 * packages/agents/src/agents/planner.ts
 * Owner: Malay Sheta (Agents lead — Week 2)
 *
 * Week-2 PlannerAgent skeleton.
 *
 * Contract:
 *   - Accepts ClassifierOutput
 *   - Returns PlannerOutput
 *   - Stubs the LLM call for W2 (returns a canned plan keyed on domain)
 *   - Builds and persists an AgentTrace on every call
 *   - Never throws — errors land in the trace with status "error"
 *
 * Imports ONLY from @trionic/shared — never redefines shared types.
 */
import type { AgentTrace, ClassifierOutput, PlannerOutput, SupportedLanguage } from "@trionic/shared";
export interface PlannerInput {
    /** Raw intake text from the user (any supported language). */
    intakeText: string;
    /** Output from the Classifier agent. */
    classifierOutput: ClassifierOutput;
    /** The language the user requested for the output document. */
    language: SupportedLanguage;
    /** Optional session ID for trace RLS scoping. */
    session_id?: string;
}
export interface PlannerResult {
    /** The structured plan for the Drafter agent. */
    plan: PlannerOutput;
    /** The audit trace for this agent call — persisted to agent_traces table. */
    trace: AgentTrace;
}
/**
 * Run the Planner agent (W2 skeleton).
 *
 * Accepts a ClassifierOutput and returns a PlannerOutput plus an AgentTrace.
 * The LLM call is stubbed for W2 — see `callPlannerLLM` above.
 *
 * @throws Never — errors are captured in the trace with status "error" and
 *   re-thrown with the trace attached so the orchestrator can surface them.
 */
export declare function runPlannerAgent(input: PlannerInput): Promise<PlannerResult>;
/**
 * PlannerAgent class (Week 2 skeleton).
 *
 * Thin class wrapper around `runPlannerAgent` — Agno framework integration
 * expects agents to expose a `.run()` method on a named class instance.
 */
export declare class PlannerAgent {
    readonly name: "planner";
    run(input: PlannerInput): Promise<PlannerResult>;
}
//# sourceMappingURL=planner.d.ts.map