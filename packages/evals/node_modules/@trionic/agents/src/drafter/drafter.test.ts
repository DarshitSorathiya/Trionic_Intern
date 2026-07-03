/**
 * drafter/drafter.test.ts
 * Owner: Jenil Sutariya
 * Module: packages/agents/src/drafter
 *
 * Unit tests for the Drafter agent.
 * All LLM and tracing calls are mocked — no real API calls in CI.
 *
 * Run: pnpm --filter @trionic/agents test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock declarations (hoisted — must not reference any const defined below) ─

vi.mock("../router/index.js", () => ({
  router: {
    run: vi.fn(),
  },
}));

vi.mock("../tracing/index.js", () => ({
  buildTrace: vi.fn((input) => ({
    agent: input.agent,
    model: input.llmResponse.model,
    tokens_in: input.llmResponse.tokens_in,
    tokens_out: input.llmResponse.tokens_out,
    cost_usd: input.llmResponse.cost_usd,
    latency_ms: input.llmResponse.latency_ms,
    cited_nodes: input.cited_nodes,
    status: input.status,
    timestamp: new Date().toISOString(),
    session_id: input.session_id,
  })),
  buildErrorTrace: vi.fn((agent, error, session_id) => ({
    agent,
    model: "unknown",
    tokens_in: 0,
    tokens_out: 0,
    cost_usd: 0,
    latency_ms: 0,
    cited_nodes: [],
    status: "error",
    error_message: String(error),
    timestamp: new Date().toISOString(),
    session_id,
  })),
  persistTrace: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@trionic/pageindex", () => {
  // The Drafter agent talks to PageIndex via getPageIndex().search()/get_text().
  // Return a single stable instance so every getPageIndex() call shares mocks.
  const instance = {
    search: vi.fn().mockResolvedValue([
      { node_id: "CPA-2019/CH-I/S-2", snippet: "Mock section 2 text", score: 0.95 },
      { node_id: "CPA-2019/CH-IV/S-39", snippet: "Mock section 39 text", score: 0.88 },
      { node_id: "CPA-2019/CH-IV/S-34", snippet: "Mock section 34 text", score: 0.82 }
    ]),
    get_text: vi.fn().mockImplementation(async ({ node_id }) => {
      if (node_id === "RTI-2005/CH-XX/S-99" || node_id === "RTI-FAKE/CH-I/S-999") {
        return null;
      }
      return {
        text: `Mock text for node: ${node_id}`,
        snapshot_id: "2024-12-01",
      };
    }),
  };
  // The Citator wrapper (exercised by the handoff test) imports the named
  // get_text() and NodeNotFoundError directly, so provide those too.
  class NodeNotFoundError extends Error {
    constructor(node_id: string) {
      super(`PageIndex node not found: "${node_id}"`);
      this.name = "NodeNotFoundError";
    }
  }
  return {
    getPageIndex: () => instance,
    NodeNotFoundError,
    get_text: vi.fn(async (node_id: string) => ({
      node_id,
      snapshot_id: "2024-12-01",
      text: `Mock text for node: ${node_id}`,
    })),
  };
});

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { runDrafter, reviseDraft, DrafterAgent } from "./drafter.agent.js";
import { extractCitations, extractNodeIds } from "./citations.js";
import type { DrafterInput } from "./types.js";
import type { DocumentDraft } from "@trionic/shared";
import { runCitator } from "../citator/index.js";

// ─── Mock LLM outputs ─────────────────────────────────────────────────────────

const MOCK_DRAFT_CONTENT = `---
**AI-generated draft — not legal advice.** This document was produced by Trionic Adalat to assist with drafting only. It is not a substitute for advice from a qualified legal professional. Verify all citations and facts before use.
---

## Consumer Complaint

### I. Facts

The said product was found to be defective upon delivery, constituting a deficiency in service as defined under Section 2(11) of the Consumer Protection Act, 2019 [CITE:CPA-2019/CH-I/S-2].

### II. Deficiency of Service

The Opposite Party's failure to deliver a conforming product amounts to an unfair trade practice under Section 2(47) of the Consumer Protection Act, 2019 [CITE:CPA-2019/CH-I/S-2].

The Complainant is entitled to seek redressal and compensation under Section 39(1)(d) of the Consumer Protection Act, 2019 [CITE:CPA-2019/CH-IV/S-39].

### III. Jurisdiction

This Commission has jurisdiction to entertain this complaint under Section 34 of the Consumer Protection Act, 2019 [CITE:CPA-2019/CH-IV/S-34].`;

const MOCK_REVISED_CONTENT = `---
**AI-generated draft — not legal advice.** This document was produced by Trionic Adalat to assist with drafting only. It is not a substitute for advice from a qualified legal professional. Verify all citations and facts before use.
---

## Consumer Complaint (Revised)

The Opposite Party's acts constitute a deficiency in service [CITE:CPA-2019/CH-I/S-2].

### IV. Evidence

[EVIDENCE LIST ADDED PER REVIEWER REQUEST]`;

const makeMockLLMResponse = (text: string) => ({
  text,
  model: "claude-3-5-sonnet-20241022",
  provider: "claude" as const,
  tokens_in: 350,
  tokens_out: 820,
  cost_usd: 0.004,
  latency_ms: 1200,
  fallback_used: false,
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockInput: DrafterInput = {
  plan: {
    document_type: "consumer_complaint",
    template_id: "consumer-complaint-v1",
    pageindex_queries: [
      "CPA-2019 Section 2(11) — definition of deficiency in service",
      "CPA-2019 Section 39 — remedies available to consumer",
      "CPA-2019 Section 34 — jurisdiction of District Commission",
    ],
    applicable_acts: ["CPA-2019"],
    notes: "Focus on deficiency of service for a defective product purchase.",
  },
  intakeText:
    "I ordered a mobile phone online but received a defective unit. The seller refused to replace it.",
  session_id: "test-session-drafter-001",
};

const mockOriginalDraft: DocumentDraft = {
  id: "draft-uuid-123",
  document_type: "consumer_complaint",
  language: "en",
  content: MOCK_DRAFT_CONTENT,
  citations: extractCitations(MOCK_DRAFT_CONTENT),
  traces: [],
  created_at: new Date().toISOString(),
};

// ─── Tests: extractCitations() ────────────────────────────────────────────────

describe("extractCitations()", () => {
  it("extracts all [CITE:<node_id>] markers from content", () => {
    const citations = extractCitations(MOCK_DRAFT_CONTENT);
    expect(citations.length).toBeGreaterThan(0);
    citations.forEach((c) => {
      expect(c.node_id).toBeTruthy();
      expect(c.node_id).not.toBe("UNRESOLVED");
    });
  });

  it("sets provisional snapshot_id '2024-12-01' on every citation", () => {
    const citations = extractCitations(MOCK_DRAFT_CONTENT);
    citations.forEach((c) => {
      expect(c.snapshot_id).toBe("2024-12-01");
    });
  });

  it("records a valid span [start, end] for each citation", () => {
    const citations = extractCitations(MOCK_DRAFT_CONTENT);
    citations.forEach((c) => {
      expect(c.span[0]).toBeGreaterThanOrEqual(0);
      expect(c.span[1]).toBeGreaterThan(c.span[0]);
    });
  });

  it("returns empty array when no [CITE:...] markers present", () => {
    const citations = extractCitations("This is free prose with no legal claims.");
    expect(citations).toHaveLength(0);
  });
});

// ─── Tests: extractNodeIds() ──────────────────────────────────────────────────

describe("extractNodeIds()", () => {
  it("returns a deduplicated list of node IDs", () => {
    const ids = extractNodeIds(MOCK_DRAFT_CONTENT);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it("returns all distinct node IDs found in content", () => {
    const ids = extractNodeIds(MOCK_DRAFT_CONTENT);
    expect(ids).toContain("CPA-2019/CH-I/S-2");
    expect(ids).toContain("CPA-2019/CH-IV/S-39");
    expect(ids).toContain("CPA-2019/CH-IV/S-34");
  });

  it("returns empty array for content with no markers", () => {
    const ids = extractNodeIds("No citations here.");
    expect(ids).toHaveLength(0);
  });
});

// ─── Tests: runDrafter() ──────────────────────────────────────────────────────

describe("runDrafter()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a DrafterResult with draft and trace", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const result = await runDrafter(mockInput);
    expect(result).toHaveProperty("draft");
    expect(result).toHaveProperty("trace");
  });

  it("draft has correct document_type from plan", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const result = await runDrafter(mockInput);
    expect(result.draft.document_type).toBe("consumer_complaint");
  });

  it("draft.content contains [CITE:...] markers", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const result = await runDrafter(mockInput);
    expect(result.draft.content).toMatch(/\[CITE:[^\]]+\]/);
  });

  it("draft.citations is non-empty and each node_id appears in content", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const result = await runDrafter(mockInput);
    expect(result.draft.citations.length).toBeGreaterThan(0);
    result.draft.citations.forEach((c) => {
      expect(result.draft.content).toContain(`[CITE:${c.node_id}]`);
    });
  });

  it("trace.cited_nodes matches extracted node IDs from the draft", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const result = await runDrafter(mockInput);
    const expectedIds = extractNodeIds(MOCK_DRAFT_CONTENT);
    expect(result.trace.cited_nodes).toEqual(expect.arrayContaining(expectedIds));
    expect(result.trace.cited_nodes.length).toBe(expectedIds.length);
  });

  it("trace.status is 'ok' on success", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const result = await runDrafter(mockInput);
    expect(result.trace.status).toBe("ok");
  });

  it("trace.agent is 'drafter'", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const result = await runDrafter(mockInput);
    expect(result.trace.agent).toBe("drafter");
  });

  it("draft.language defaults to 'en'", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const result = await runDrafter(mockInput);
    expect(result.draft.language).toBe("en");
  });

  it("draft.traces contains the drafter trace", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const result = await runDrafter(mockInput);
    expect(result.draft.traces).toHaveLength(1);
    expect(result.draft.traces[0].agent).toBe("drafter");
  });

  it("captures error in trace when LLM throws, and re-throws", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockRejectedValueOnce(new Error("LLM timeout"));

    const { buildErrorTrace, persistTrace } = await import("../tracing/index.js");

    await expect(runDrafter(mockInput)).rejects.toThrow("LLM timeout");
    expect(vi.mocked(buildErrorTrace)).toHaveBeenCalledWith(
      "drafter",
      expect.any(Error),
      mockInput.session_id
    );
    expect(vi.mocked(persistTrace)).toHaveBeenCalled();
  });

  it("acceptance: given a canned planner output + retrieved RTI nodes, returns a draft with 3+ valid markers and uses the RTI system prompt", async () => {
    const { router } = await import("../router/index.js");
    const { RTI_DRAFTER_SYSTEM_PROMPT } = await import("./drafter.prompt.js");
    
    const rtiLlmResponse = `---
**AI-generated draft — not legal advice.** This document was produced by Trionic Adalat to assist with drafting only. It is not a substitute for advice from a qualified legal professional. Verify all citations and facts before use.
---

## Right to Information Application

To: The Public Information Officer [CITE:RTI-2005/S-5]

I hereby request information regarding municipal expenditures under Section 6(1) of the RTI Act [CITE:RTI-2005/S-6].

Please provide the disposal status in accordance with Section 7(1) [CITE:RTI-2005/S-7].`;

    vi.mocked(router.run).mockResolvedValueOnce(makeMockLLMResponse(rtiLlmResponse));

    const rtiInput: DrafterInput = {
      plan: {
        document_type: "rti_application",
        template_id: "rti-template-v1",
        pageindex_queries: ["RTI Section 6(1)", "RTI Section 7(1)"],
        applicable_acts: ["RTI-2005"],
        notes: "Municipal expenditures seek",
      },
      intakeText: "I want to file an RTI to get details about municipal expenditures.",
      session_id: "rti-session-001",
    };

    const result = await runDrafter(rtiInput);

    // Verify dynamic system prompt selection
    expect(router.run).toHaveBeenCalledWith(
      "drafter",
      RTI_DRAFTER_SYSTEM_PROMPT,
      expect.any(String)
    );

    // Verify draft and citations
    expect(result.draft.document_type).toBe("rti_application");
    expect(result.draft.citations.length).toBe(3);
    
    // Verify node ID normalization to real tree nodes
    const nodeIds = result.draft.citations.map((c) => c.node_id);
    expect(nodeIds).toContain("RTI-2005/CH-II/S-5");
    expect(nodeIds).toContain("RTI-2005/CH-II/S-6");
    expect(nodeIds).toContain("RTI-2005/CH-II/S-7");

    expect(result.trace.cited_nodes).toContain("RTI-2005/CH-II/S-5");
    expect(result.trace.cited_nodes).toContain("RTI-2005/CH-II/S-6");
    expect(result.trace.cited_nodes).toContain("RTI-2005/CH-II/S-7");
  });
});

// ─── Tests: reviseDraft() ─────────────────────────────────────────────────────

describe("reviseDraft()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a DrafterResult with revised draft and trace", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_REVISED_CONTENT));

    const result = await reviseDraft(
      mockOriginalDraft,
      "Add an Evidence section with a numbered list of documents.",
      "test-session-drafter-001"
    );
    expect(result).toHaveProperty("draft");
    expect(result).toHaveProperty("trace");
  });

  it("revised draft content contains [CITE:...] markers", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_REVISED_CONTENT));

    const result = await reviseDraft(mockOriginalDraft, "Add evidence section.");
    expect(result.draft.content).toMatch(/\[CITE:[^\]]+\]/);
  });

  it("revised draft carries forward prior traces", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_REVISED_CONTENT));

    const draftWithTrace: DocumentDraft = {
      ...mockOriginalDraft,
      traces: [
        {
          agent: "drafter",
          model: "claude-3-5-sonnet-20241022",
          tokens_in: 350,
          tokens_out: 820,
          cost_usd: 0.004,
          latency_ms: 1200,
          cited_nodes: [],
          status: "ok",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const result = await reviseDraft(draftWithTrace, "Fix tone.");
    // original trace + new revision trace
    expect(result.draft.traces.length).toBe(2);
  });

  it("assigns a new unique draft ID (not reusing original ID)", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_REVISED_CONTENT));

    const result = await reviseDraft(mockOriginalDraft, "Fix missing section.");
    expect(result.draft.id).not.toBe(mockOriginalDraft.id);
  });
});

// ─── Tests: DrafterAgent class ────────────────────────────────────────────────

describe("DrafterAgent class", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has name === 'drafter'", () => {
    const agent = new DrafterAgent();
    expect(agent.name).toBe("drafter");
  });

  it("run() returns a valid DrafterResult", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_DRAFT_CONTENT));

    const agent = new DrafterAgent();
    const result = await agent.run(mockInput);
    expect(result.draft.document_type).toBe("consumer_complaint");
    expect(result.trace.status).toBe("ok");
  });

  it("revise() returns a revised DrafterResult with [CITE:...] markers", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(makeMockLLMResponse(MOCK_REVISED_CONTENT));

    const agent = new DrafterAgent();
    const result = await agent.revise(
      mockOriginalDraft,
      "Add missing section.",
      "session-xyz"
    );
    expect(result.draft.content).toContain("[CITE:");
    expect(result.trace.agent).toBe("drafter");
  });
});

// ─── Tests: Integration (Drafter -> Citator) ──────────────────────────────────

describe("Drafter -> Citator Handoff Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully passes a generated draft with valid citations through Citator", async () => {
    const { router } = await import("../router/index.js");
    
    // Mock Drafter's LLM response
    vi.mocked(router.run).mockResolvedValueOnce(makeMockLLMResponse(MOCK_DRAFT_CONTENT));
    
    // Run Drafter
    const drafterResult = await runDrafter(mockInput);
    expect(drafterResult.draft.citations.length).toBeGreaterThan(0);
    
    // Mock Citator's LLM response returning approved = true
    vi.mocked(router.run).mockResolvedValueOnce(makeMockLLMResponse(JSON.stringify({
      passed: true,
      validatedCitations: drafterResult.draft.citations,
    })));
    
    // Run Citator with Drafter's output
    const citatorResult = await runCitator({
      draft: drafterResult.draft,
      session_id: "integration-session-001"
    });
    
    // Verify handoff was successful
    expect(citatorResult.passed).toBe(true);
    expect(citatorResult.validatedCitations.length).toBe(drafterResult.draft.citations.length);
    expect(citatorResult.trace.status).toBe("ok");
  });
});
