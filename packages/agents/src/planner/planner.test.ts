/**
 * planner/planner.test.ts
 * Owner: Malay Sheta (Planner agent)
 *
 * W4 Breadth: 5 fixture tests — one per v1 document type. Each asserts the
 * Planner emits a doc-type-specific PlannerOutput grounded against
 * DOC_TYPE_PROFILES (template_id, applicable_acts, pageindex_queries).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runPlanner, reconcilePlan } from "./index.js";
import { DOC_TYPE_PROFILES, resolveDocType, baselinePlan } from "./doc-type-profiles.js";
import type { ClassifierOutput, DocumentType } from "@trionic/shared";

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Mock the router so no real DeepSeek API call is made in tests.
const routerRun = vi.fn();
vi.mock("../router/index.js", () => ({
  router: {
    run: (...args: unknown[]) => routerRun(...args),
  },
}));

vi.mock("../tracing/index.js", () => ({
  buildTrace: vi.fn((input) => ({
    ...input.llmResponse,
    agent: input.agent,
    cited_nodes: [],
    status: input.status,
    timestamp: new Date().toISOString(),
  })),
  buildErrorTrace: vi.fn((agent, error) => ({
    agent,
    status: "error",
    error_message: String(error),
    timestamp: new Date().toISOString(),
  })),
  persistTrace: vi.fn().mockResolvedValue(undefined),
}));

/** Build an LLMResponse-shaped object wrapping a plan JSON string. */
function mockLLM(plan: Record<string, unknown>) {
  return {
    text: JSON.stringify(plan),
    model: "deepseek-chat",
    provider: "deepseek",
    tokens_in: 200,
    tokens_out: 90,
    cost_usd: 0.0001,
    latency_ms: 700,
    fallback_used: false,
  };
}

/** Build a classifier output for a given doc-type sub-domain. */
function classifierFor(domain: ClassifierOutput["domain"], subDomain: string, acts: string[]): ClassifierOutput {
  return {
    is_legal: true,
    domain,
    sub_domain: subDomain,
    relevant_acts: acts,
    severity: "medium",
    confidence: 0.9,
    reasoning: `Intake routed to ${subDomain}.`,
  };
}

beforeEach(() => {
  routerRun.mockReset();
});

// ─── Per-doc-type fixtures ────────────────────────────────────────────────────

interface Fixture {
  docType: DocumentType;
  intake: string;
  classifier: ClassifierOutput;
  /** What the (mocked) LLM returns. */
  llmPlan: Record<string, unknown>;
  /** Act codes that MUST appear in the resolved plan. */
  expectActs: string[];
  /** A substring that must appear in at least one pageindex query. */
  expectQuerySubstr: string;
}

const FIXTURES: Fixture[] = [
  {
    docType: "rti_application",
    intake: "I want to know how many potholes my municipal ward repaired last year.",
    classifier: classifierFor("administrative", "rti", ["RTI-2005"]),
    llmPlan: {
      document_type: "rti_application",
      template_id: "rti-application-v1",
      pageindex_queries: ["RTI-2005 Section 6 — request for obtaining information"],
      applicable_acts: ["RTI-2005"],
      notes: "Address to the PIO of the municipal corporation.",
    },
    expectActs: ["RTI-2005"],
    expectQuerySubstr: "RTI-2005",
  },
  {
    docType: "legal_notice",
    intake: "My contractor took an advance and never finished the work. I want to send a notice.",
    classifier: classifierFor("contract", "legal-notice", ["ICA-1872"]),
    llmPlan: {
      document_type: "legal_notice",
      template_id: "legal-notice-v1",
      pageindex_queries: ["ICA-1872 Section 73 — compensation for loss caused by breach of contract"],
      applicable_acts: ["ICA-1872", "CPC-1908"],
      notes: "Demand refund of advance within 15 days.",
    },
    expectActs: ["ICA-1872", "CPC-1908"],
    expectQuerySubstr: "ICA-1872",
  },
  {
    docType: "nda",
    intake: "I'm sharing source code with a vendor and need a confidentiality agreement.",
    classifier: classifierFor("contract", "nda", ["ICA-1872", "IT-2000"]),
    llmPlan: {
      document_type: "nda",
      template_id: "nda-v1",
      pageindex_queries: [
        "ICA-1872 Section 27 — agreement in restraint of trade is void",
        "IT-2000 Section 43A — compensation for failure to protect data",
      ],
      applicable_acts: ["ICA-1872", "IT-2000"],
      notes: "Mutual NDA; 3-year term.",
    },
    // NDA queries Contract Act + IT Act per the acceptance criteria.
    expectActs: ["ICA-1872", "IT-2000"],
    expectQuerySubstr: "IT-2000",
  },
  {
    docType: "consumer_complaint",
    intake: "I ordered a phone online, it arrived defective, and the seller won't respond.",
    classifier: classifierFor("consumer", "consumer-complaint", ["CPA-2019"]),
    llmPlan: {
      document_type: "consumer_complaint",
      template_id: "consumer-complaint-v1",
      pageindex_queries: ["CPA-2019 Section 35 — filing of complaint before District Commission"],
      applicable_acts: ["CPA-2019"],
      notes: "Claim refund + compensation for deficiency of service.",
    },
    expectActs: ["CPA-2019"],
    expectQuerySubstr: "CPA-2019",
  },
  {
    docType: "cheque_bounce_notice",
    intake: "A cheque of ₹2,00,000 given to me bounced for insufficient funds.",
    classifier: classifierFor("criminal", "cheque-bounce", ["NI-1881"]),
    llmPlan: {
      document_type: "cheque_bounce_notice",
      template_id: "cheque-bounce-notice-v1",
      pageindex_queries: ["NI-1881 Section 138 — dishonour of cheque for insufficiency of funds"],
      applicable_acts: ["NI-1881"],
      notes: "Issue within 30 days of the bank return memo; demand payment in 15 days.",
    },
    // Cheque-bounce queries NI Act per the acceptance criteria.
    expectActs: ["NI-1881"],
    expectQuerySubstr: "NI-1881",
  },
];

describe("runPlanner() — 5 doc-type fixtures", () => {
  for (const fx of FIXTURES) {
    it(`emits a ${fx.docType} plan with the correct template, acts, and queries`, async () => {
      routerRun.mockResolvedValueOnce(mockLLM(fx.llmPlan));

      const { plan, trace } = await runPlanner({
        intakeText: fx.intake,
        classifierOutput: fx.classifier,
        language: "en",
        documentType: fx.docType,
        session_id: "test-session",
      });

      // document_type + template_id come authoritatively from the profile.
      expect(plan.document_type).toBe(fx.docType);
      expect(plan.template_id).toBe(DOC_TYPE_PROFILES[fx.docType].template_id);

      // Applicable acts include the doc-type contract acts.
      for (const act of fx.expectActs) {
        expect(plan.applicable_acts).toContain(act);
      }

      // pageindex_queries are doc-type specific.
      expect(plan.pageindex_queries.length).toBeGreaterThan(0);
      expect(plan.pageindex_queries.some((q) => q.includes(fx.expectQuerySubstr))).toBe(true);

      // Trace succeeds.
      expect(trace.status).toBe("ok");
    });
  }
});

describe("runPlanner() — doc-type resolution & robustness", () => {
  it("resolves doc type from the classifier when no hint is given", async () => {
    routerRun.mockResolvedValueOnce(
      mockLLM({
        document_type: "cheque_bounce_notice",
        template_id: "cheque-bounce-notice-v1",
        pageindex_queries: ["NI-1881 Section 138"],
        applicable_acts: ["NI-1881"],
        notes: "",
      })
    );

    const { plan } = await runPlanner({
      intakeText: "A cheque I received bounced.",
      classifierOutput: classifierFor("criminal", "cheque-bounce", ["NI-1881"]),
      language: "en",
      // no documentType hint — resolved from sub_domain
    });

    expect(plan.document_type).toBe("cheque_bounce_notice");
    expect(plan.template_id).toBe("cheque-bounce-notice-v1");
  });

  it("falls back to the doc-type baseline when the LLM returns invalid JSON", async () => {
    routerRun.mockResolvedValueOnce({
      text: "Sorry, here is your plan: not-json at all",
      model: "deepseek-chat",
      provider: "deepseek",
      tokens_in: 50,
      tokens_out: 10,
      cost_usd: 0.0,
      latency_ms: 300,
      fallback_used: false,
    });

    const { plan } = await runPlanner({
      intakeText: "NDA with a vendor.",
      classifierOutput: classifierFor("contract", "nda", ["ICA-1872", "IT-2000"]),
      language: "en",
      documentType: "nda",
    });

    // Falls back to the nda baseline rather than throwing.
    expect(plan).toEqual(baselinePlan("nda"));
  });
});

describe("resolveDocType()", () => {
  it("honours an explicit hint", () => {
    expect(resolveDocType("nda", "rti", ["RTI-2005"])).toBe("nda");
  });
  it("maps sub-domain aliases", () => {
    expect(resolveDocType(undefined, "cheque", [])).toBe("cheque_bounce_notice");
    expect(resolveDocType(undefined, "non-disclosure", [])).toBe("nda");
  });
  it("falls back to act-code signals, then legal_notice", () => {
    expect(resolveDocType(undefined, "unknown", ["CPA-2019"])).toBe("consumer_complaint");
    expect(resolveDocType(undefined, "unknown", [])).toBe("legal_notice");
  });
});

describe("reconcilePlan()", () => {
  it("keeps profile template_id/document_type even if the LLM disagrees", () => {
    const plan = reconcilePlan("nda", {
      document_type: "rti_application" as DocumentType, // LLM tried to drift
      template_id: "wrong-id",
      pageindex_queries: ["custom query"],
      applicable_acts: ["MADE-UP-ACT"],
      notes: "custom notes",
    });
    expect(plan.document_type).toBe("nda");
    expect(plan.template_id).toBe("nda-v1");
    // profile acts are always present; LLM extras are unioned in
    expect(plan.applicable_acts).toContain("ICA-1872");
    expect(plan.applicable_acts).toContain("IT-2000");
    expect(plan.applicable_acts).toContain("MADE-UP-ACT");
    expect(plan.pageindex_queries).toEqual(["custom query"]);
    expect(plan.notes).toBe("custom notes");
  });
});
