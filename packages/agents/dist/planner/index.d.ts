/**
 * planner/index.ts
 * Owner: Malay Sheta (Planner agent — Team C Lead)
 *
 * The Planner agent decides:
 *   - Which document type to draft
 *   - Which PageIndex queries to run
 *   - Which acts apply
 *   - Which template to use
 *
 * Input:  User's intake text + ClassifierOutput
 * Output: PlannerOutput + AgentTrace (for audit trail)
 */
import type { AgentTrace, ClassifierOutput, DocumentType, PlannerOutput, SupportedLanguage } from "@trionic/shared";
export interface PlannerInput {
    /** Raw intake text from the user (any supported language). */
    intakeText: string;
    /** Output from the Classifier agent. */
    classifierOutput: ClassifierOutput;
    /** The language the user requested for the output document. */
    language: SupportedLanguage;
    /**
     * Optional explicit document-type hint (e.g. from a UI selection or
     * ChainInput.doc_type). If absent, the doc type is resolved from the
     * classifier's sub_domain / relevant_acts.
     */
    documentType?: string;
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
 * Run the Planner agent.
 *
 * Calls Claude (via LLM Router) with the classified intake and returns
 * a structured PlannerOutput + an AgentTrace matching packages/shared/AgentTrace.
 *
 * @throws Never — errors are captured in the trace with status "error".
 */
export declare function runPlanner(input: PlannerInput): Promise<PlannerResult>;
/**
 * Reconcile an LLM-produced plan with the doc-type profile.
 *
 * The per-doc-type contract is authoritative for the structural fields every
 * downstream Agents intern depends on:
 *   - document_type and template_id ALWAYS come from the profile.
 *   - applicable_acts is the union of profile acts + any extra (in-list) acts
 *     the LLM proposed, but never empty.
 *   - pageindex_queries / notes take the LLM's refinement when present and
 *     non-empty, otherwise the profile baseline.
 *
 * @param docType  The resolved document type.
 * @param llmPlan  Parsed LLM output, or null if the LLM returned invalid JSON.
 */
export declare function reconcilePlan(docType: DocumentType, llmPlan: Partial<PlannerOutput> | null): PlannerOutput;
/**
 * PlannerAgent class wrapper (for Agno framework integration).
 * Agno expects agents to be classes with a run() method.
 * Week 1: thin wrapper around runPlanner().
 */
export declare class PlannerAgent {
    readonly name = "planner";
    run(input: PlannerInput): Promise<PlannerResult>;
}
//# sourceMappingURL=index.d.ts.map