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
import { router } from "../router/index.js";
import { buildTrace, buildErrorTrace, persistTrace } from "../tracing/index.js";
import { buildPlannerSystemPrompt, buildPlannerUserPrompt } from "./planner.prompt.js";
import { DOC_TYPE_PROFILES, baselinePlan, resolveDocType } from "./doc-type-profiles.js";

// ─── Input / Output shapes ────────────────────────────────────────────────────

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

// ─── Agent ────────────────────────────────────────────────────────────────────

/**
 * Run the Planner agent.
 *
 * Calls Claude (via LLM Router) with the classified intake and returns
 * a structured PlannerOutput + an AgentTrace matching packages/shared/AgentTrace.
 *
 * @throws Never — errors are captured in the trace with status "error".
 */
export async function runPlanner(input: PlannerInput): Promise<PlannerResult> {
  const { intakeText, classifierOutput, language, documentType, session_id } = input;

  // ── Resolve the document type FIRST ──────────────────────────────────────
  // The Planner is doc-type-driven: it reads the resolved document_type and
  // emits a doc-type-specific plan grounded against DOC_TYPE_PROFILES.
  const docType: DocumentType = resolveDocType(
    documentType,
    classifierOutput.sub_domain,
    classifierOutput.relevant_acts
  );

  try {
    const systemPrompt = buildPlannerSystemPrompt(docType);
    const userPrompt = buildPlannerUserPrompt(intakeText, classifierOutput, language, docType);

    // Route through LLM Router — DeepSeek (see router.config.ts "planner").
    const llmResponse = await router.run("planner", systemPrompt, userPrompt);

    // Parse JSON output from the LLM.
    // Strip markdown code fences if the LLM returned them despite instructions.
    // If the LLM returns invalid JSON, fall back to the doc-type baseline so the
    // chain never aborts on a malformed plan.
    let llmPlan: Partial<PlannerOutput> | null = null;
    try {
      let cleanedText = llmResponse.text.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
      }
      llmPlan = JSON.parse(cleanedText) as Partial<PlannerOutput>;
    } catch {
      console.warn(
        `[Planner] LLM returned invalid JSON — falling back to ${docType} baseline. Raw: ${llmResponse.text.slice(0, 120)}`
      );
      llmPlan = null;
    }

    // Reconcile the LLM output with the doc-type profile. document_type and
    // template_id are AUTHORITATIVE from the profile (the per-doc-type contract
    // every other Agents intern depends on). Queries/acts/notes take the LLM's
    // refinement when present, else the profile baseline.
    const plan = reconcilePlan(docType, llmPlan);

    // Build and persist trace
    const trace = buildTrace({
      agent: "planner",
      llmResponse,
      cited_nodes: [],   // Planner does not emit citations
      status: "ok",
      session_id,
    });
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });

    return { plan, trace };
  } catch (error) {
    const trace = buildErrorTrace("planner", error, session_id);
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });

    // Re-throw with trace attached so the pipeline can surface it
    const err = error instanceof Error ? error : new Error(String(error));
    (err as any).trace = trace;
    throw err;
  }
}

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
export function reconcilePlan(
  docType: DocumentType,
  llmPlan: Partial<PlannerOutput> | null
): PlannerOutput {
  const profile = DOC_TYPE_PROFILES[docType];
  const baseline = baselinePlan(docType);

  if (!llmPlan) return baseline;

  const queries =
    Array.isArray(llmPlan.pageindex_queries) && llmPlan.pageindex_queries.length > 0
      ? llmPlan.pageindex_queries.filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      : baseline.pageindex_queries;

  // Union profile acts with any LLM-proposed acts, de-duplicated, profile-first.
  const llmActs = Array.isArray(llmPlan.applicable_acts)
    ? llmPlan.applicable_acts.filter((a): a is string => typeof a === "string" && a.trim().length > 0)
    : [];
  const applicable_acts = Array.from(new Set([...profile.applicable_acts, ...llmActs]));

  const notes =
    typeof llmPlan.notes === "string" && llmPlan.notes.trim().length > 0
      ? llmPlan.notes.trim()
      : baseline.notes;

  return {
    // Authoritative — never trust the LLM to set these.
    document_type: profile.document_type,
    template_id: profile.template_id,
    // Refined by the LLM, with profile fallbacks.
    pageindex_queries: queries.length > 0 ? queries : baseline.pageindex_queries,
    applicable_acts,
    notes,
  };
}

/**
 * PlannerAgent class wrapper (for Agno framework integration).
 * Agno expects agents to be classes with a run() method.
 * Week 1: thin wrapper around runPlanner().
 */
export class PlannerAgent {
  readonly name = "planner";

  async run(input: PlannerInput): Promise<PlannerResult> {
    return runPlanner(input);
  }
}
