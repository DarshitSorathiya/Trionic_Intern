import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock router to avoid network calls
vi.mock("../router/index.js", () => ({
  router: {
    run: vi.fn(),
  },
}));

import { runDrafterAgent, DrafterAgent } from "./drafter.js";
import type { PlannerOutput } from "@trionic/shared";

const mockPlan: PlannerOutput = {
  document_type: "consumer_complaint",
  template_id: "tmpl-consumer-complaint-v1",
  pageindex_queries: ["CPA-2019 Section 2"],
  applicable_acts: ["CPA-2019"],
  notes: "Draft a complaint",
};

const mockNodes = [
  { node_id: "CPA-2019/CH-I/S-2", text: "Mock text for node 2" },
];

const mockLlmResponse = {
  text: "Draft content with [CITE:CPA-2019/CH-I/S-2] citation.",
  model: "claude-3-5-sonnet-20241022",
  provider: "claude" as const,
  tokens_in: 300,
  tokens_out: 700,
  cost_usd: 0.003,
  latency_ms: 1000,
  fallback_used: false,
};

describe("DrafterAgentV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the LLM router and extracts citations", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValueOnce(mockLlmResponse);

    const result = await runDrafterAgent({
      plan: mockPlan,
      retrievedNodes: mockNodes,
    });

    expect(result.body_markdown).toBe(mockLlmResponse.text);
    expect(result.pending_citations).toEqual(["CPA-2019/CH-I/S-2"]);
    expect(router.run).toHaveBeenCalledWith(
      "drafter",
      expect.any(String),
      expect.stringContaining("Retrieved Legal Sections from PageIndex")
    );
  });

  it("exposes the class DrafterAgent with run method", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValueOnce(mockLlmResponse);

    const agent = new DrafterAgent();
    expect(agent.name).toBe("drafter");

    const result = await agent.run({
      plan: mockPlan,
      retrievedNodes: mockNodes,
    });

    expect(result.body_markdown).toBe(mockLlmResponse.text);
    expect(result.pending_citations).toEqual(["CPA-2019/CH-I/S-2"]);
  });

  it("acceptance: given a canned planner output + retrieved RTI nodes, returns a draft with 3+ valid markers and uses the RTI system prompt", async () => {
    const { router } = await import("../router/index.js");
    const { RTI_DRAFTER_SYSTEM_PROMPT } = await import("../drafter/drafter.prompt.js");

    const rtiLlmResponse = {
      text: `---
**AI-generated draft — not legal advice.** This document was produced by Trionic Adalat to assist with drafting only. It is not a substitute for advice from a qualified legal professional. Verify all citations and facts before use.
---

## Right to Information Application

To: The Public Information Officer [CITE:RTI-2005/S-5]

I hereby request information regarding municipal expenditures under Section 6(1) of the RTI Act [CITE:RTI-2005/S-6].

Please provide the disposal status in accordance with Section 7(1) [CITE:RTI-2005/S-7].`,
      model: "claude-3-5-sonnet-20241022",
      provider: "claude" as const,
      tokens_in: 300,
      tokens_out: 700,
      cost_usd: 0.003,
      latency_ms: 1000,
      fallback_used: false,
    };

    vi.mocked(router.run).mockResolvedValueOnce(rtiLlmResponse);

    const rtiPlan = {
      document_type: "rti_application" as const,
      template_id: "rti-template-v1",
      pageindex_queries: ["RTI Section 6(1)", "RTI Section 7(1)"],
      applicable_acts: ["RTI-2005"],
      notes: "Municipal expenditures seek",
    };

    const rtiNodes = [
      { node_id: "RTI-2005/CH-II/S-5", text: "Designation of Public Information Officers" },
      { node_id: "RTI-2005/CH-II/S-6", text: "Request for obtaining information" },
      { node_id: "RTI-2005/CH-II/S-7", text: "Disposal of request" },
      { node_id: "RTI-2005/CH-II/S-8", text: "Exemption from disclosure of information" },
    ];

    const result = await runDrafterAgent({
      plan: rtiPlan,
      retrievedNodes: rtiNodes,
    });

    // Verify dynamic system prompt selection
    expect(router.run).toHaveBeenCalledWith(
      "drafter",
      RTI_DRAFTER_SYSTEM_PROMPT,
      expect.any(String)
    );

    // Verify normalized pending_citations
    expect(result.pending_citations.length).toBe(3);
    expect(result.pending_citations).toContain("RTI-2005/CH-II/S-5");
    expect(result.pending_citations).toContain("RTI-2005/CH-II/S-6");
    expect(result.pending_citations).toContain("RTI-2005/CH-II/S-7");
  });
});
