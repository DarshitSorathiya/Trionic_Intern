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

import type {
  AgentTrace,
  ClassifierOutput,
  DocumentType,
  PlannerOutput,
  SupportedLanguage,
} from "@trionic/shared";
import { buildErrorTrace, buildTrace, persistTrace } from "../tracing/index.js";

// ─── Input / Output shapes ────────────────────────────────────────────────────

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

// ─── Canned plan table (W2 LLM stub) ─────────────────────────────────────────

/**
 * Canned plans keyed by legal domain.
 *
 * W2 rule: stub returns a deterministic plan so the full chain can be
 * exercised end-to-end without requiring a live LLM key.
 * Replace the stub body of `callPlannerLLM` in W3 with a real router.run()
 * call — the rest of the agent is identical.
 */
const CANNED_PLANS: Record<string, PlannerOutput> = {
  consumer: {
    document_type: "consumer_complaint",
    template_id: "tmpl-consumer-complaint-v1",
    pageindex_queries: [
      "CPA-2019 Section 2 — definition of consumer",
      "CPA-2019 Section 35 — complaint procedure",
      "CPA-2019 Section 39 — reliefs available to consumer",
    ],
    applicable_acts: ["CPA-2019"],
    notes:
      "Draft a formal consumer complaint. Include a clear timeline of events, " +
      "the deficiency in service / goods, and the relief sought.",
  },

  criminal: {
    document_type: "legal_notice",
    template_id: "tmpl-legal-notice-criminal-v1",
    pageindex_queries: [
      "IPC-1860 Section 415 — cheating",
      "IPC-1860 Section 420 — cheating and dishonestly inducing delivery",
      "CrPC-1973 Section 138 — dishonour of cheque",
    ],
    applicable_acts: ["IPC-1860", "CrPC-1973"],
    notes:
      "This is a criminal-domain matter. Cite the specific IPC section(s) and " +
      "include a demand for remedy within the statutory timeframe.",
  },

  contract: {
    document_type: "legal_notice",
    template_id: "tmpl-legal-notice-contract-v1",
    pageindex_queries: [
      "ICA-1872 Section 73 — compensation for loss / damage from breach",
      "ICA-1872 Section 74 — compensation when penalty stipulated",
      "ICA-1872 Section 55 — effect of failure to perform at fixed time",
    ],
    applicable_acts: ["ICA-1872"],
    notes:
      "Draft a breach-of-contract legal notice. Quote relevant ICA provisions " +
      "and specify the amount of damages or specific performance sought.",
  },

  administrative: {
    document_type: "rti_application",
    template_id: "tmpl-rti-application-v1",
    pageindex_queries: [
      "RTI-2005 Section 6 — request for obtaining information",
      "RTI-2005 Section 7 — disposal of request",
      "RTI-2005 Section 19 — appeal",
    ],
    applicable_acts: ["RTI-2005"],
    notes:
      "Draft an RTI application under the Right to Information Act 2005. " +
      "Clearly state the information sought, the public authority, and the " +
      "applicant's details.",
  },

  civil: {
    document_type: "legal_notice",
    template_id: "tmpl-legal-notice-civil-v1",
    pageindex_queries: [
      "CPC-1908 Section 80 — notice before suit against government",
      "CPC-1908 Order VII — plaint",
    ],
    applicable_acts: ["CPC-1908"],
    notes:
      "Draft a civil legal notice. Reference the relevant CPC provisions and " +
      "outline the cause of action clearly.",
  },

  labour: {
    document_type: "legal_notice",
    template_id: "tmpl-legal-notice-labour-v1",
    pageindex_queries: [
      "ID-1947 Section 2A — individual dispute",
      "ID-1947 Section 10 — reference of disputes",
      "MW-1948 Section 12 — authority for hearing minimum wages claims",
    ],
    applicable_acts: ["ID-1947", "MW-1948"],
    notes:
      "Draft an employment / labour legal notice. Refer to the Industrial " +
      "Disputes Act and Minimum Wages Act as applicable.",
  },

  family: {
    document_type: "legal_notice",
    template_id: "tmpl-legal-notice-family-v1",
    pageindex_queries: [
      "HMA-1955 Section 13 — grounds for divorce",
      "HMA-1955 Section 24 — maintenance pendente lite",
    ],
    applicable_acts: ["HMA-1955"],
    notes:
      "Draft a family-law legal notice. Be sensitive in tone. Cite the relevant " +
      "Hindu Marriage Act / Special Marriage Act provisions.",
  },

  constitutional: {
    document_type: "rti_application",
    template_id: "tmpl-writ-petition-v1",
    pageindex_queries: [
      "CONSTITUTION Article 12 — definition of State",
      "CONSTITUTION Article 21 — protection of life and personal liberty",
      "CONSTITUTION Article 226 — power of High Courts to issue writs",
    ],
    applicable_acts: ["CONSTITUTION"],
    notes:
      "Draft a constitutional petition / writ application. Cite the appropriate " +
      "fundamental right and the writ remedy sought (mandamus, certiorari, etc.).",
  },

  other: {
    document_type: "legal_notice",
    template_id: "tmpl-legal-notice-generic-v1",
    pageindex_queries: [
      "ICA-1872 Section 73 — compensation for loss / damage",
    ],
    applicable_acts: [],
    notes:
      "General legal notice. The domain could not be determined with high " +
      "confidence — review the intake carefully before drafting.",
  },
} as const;

// ─── Stub LLM call ────────────────────────────────────────────────────────────

/**
 * W2 stub: returns a canned PlannerOutput based on the classifier's domain.
 * Simulates the latency of a real LLM call so event timing is realistic.
 *
 * Replace this function body with `router.run("planner", ...)` in W3.
 */
async function callPlannerLLM(
  classifierOutput: ClassifierOutput
): Promise<{ plan: PlannerOutput; latency_ms: number; tokens_in: number; tokens_out: number }> {
  const start = Date.now();

  // Simulate ~100 ms network latency so step.start/step.done timing is non-zero
  await new Promise((resolve) => setTimeout(resolve, 80 + Math.random() * 40));

  const plan: PlannerOutput =
    CANNED_PLANS[classifierOutput.domain] ?? CANNED_PLANS["other"]!;

  // Merge in acts discovered by the classifier so they are not lost
  const mergedActs = Array.from(
    new Set([...plan.applicable_acts, ...classifierOutput.relevant_acts])
  );

  const finalPlan: PlannerOutput = { ...plan, applicable_acts: mergedActs };

  const latency_ms = Date.now() - start;

  // Stub token counts — proportional to plan size (realistic enough for UI)
  const planJson = JSON.stringify(finalPlan);
  const tokens_out = Math.ceil(planJson.length / 4);
  const tokens_in = 320; // rough system + user prompt estimate

  return { plan: finalPlan, latency_ms, tokens_in, tokens_out };
}

// ─── Agent function ───────────────────────────────────────────────────────────

/**
 * Run the Planner agent (W2 skeleton).
 *
 * Accepts a ClassifierOutput and returns a PlannerOutput plus an AgentTrace.
 * The LLM call is stubbed for W2 — see `callPlannerLLM` above.
 *
 * @throws Never — errors are captured in the trace with status "error" and
 *   re-thrown with the trace attached so the orchestrator can surface them.
 */
export async function runPlannerAgent(input: PlannerInput): Promise<PlannerResult> {
  const { classifierOutput, session_id } = input;

  try {
    const { plan, latency_ms, tokens_in, tokens_out } =
      await callPlannerLLM(classifierOutput);

    // Build a synthetic LLMResponse so buildTrace() has the right shape
    const syntheticLLMResponse = {
      text: JSON.stringify(plan),
      model: "stub/canned-plan-v2",
      provider: "claude" as const,
      tokens_in,
      tokens_out,
      cost_usd: 0, // stub: free
      latency_ms,
      fallback_used: false,
    };


    const trace = buildTrace({
      agent: "planner",
      llmResponse: syntheticLLMResponse,
      cited_nodes: [], // Planner does not emit citations
      status: "ok",
      session_id,
    });

    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });

    return { plan, trace };
  } catch (error) {
    const trace = buildErrorTrace("planner", error, session_id);
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });

    const err = error instanceof Error ? error : new Error(String(error));
    (err as any).trace = trace;
    throw err;
  }
}

// ─── Agent class ──────────────────────────────────────────────────────────────

/**
 * PlannerAgent class (Week 2 skeleton).
 *
 * Thin class wrapper around `runPlannerAgent` — Agno framework integration
 * expects agents to expose a `.run()` method on a named class instance.
 */
export class PlannerAgent {
  readonly name = "planner" as const;

  async run(input: PlannerInput): Promise<PlannerResult> {
    return runPlannerAgent(input);
  }
}
