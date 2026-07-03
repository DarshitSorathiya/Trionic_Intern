/**
 * citator.test.ts
 * Owner: Hitarth Sherathia
 *
 * Anti-hallucination gate tests for the Citator-Gatekeeper agent.
 *
 * Required test cases (from Issue #86):
 *   1. Valid draft with all real markers → approved: true, resolved_citations populated
 *   2. Draft with one fake [CITE:FAKE-ACT/S-99] → approved: false, exact span identified
 *   3. Draft with no markers at all → approved: false (legal claim without citation)
 *
 * Additional cases:
 *   4. Mixed draft (some valid, some fake) → approved: false, all bad spans surfaced
 *   5. strict = false bypasses the no-marker rejection
 *   6. Unexpected PageIndex error propagates (not swallowed as rejection)
 *   7. CitatorGatekeeperAgent class delegates to runCitator correctly
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runCitator, CitatorGatekeeperAgent } from "./index.js";
import type { DocumentDraft } from "@trionic/shared";
import { pageindex, NodeNotFoundError } from "./pageindex.js";

const getTextSpy = vi.spyOn(pageindex, "get_text");

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("./events.js", () => ({
  emitAgentStreamEvent: vi.fn(),
}));

vi.mock("../tracing/index.js", () => ({
  buildTrace: vi.fn((input) => ({
    ...input.llmResponse,
    agent: input.agent,
    cited_nodes: input.cited_nodes,
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

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** A real RTI-2005/CH-II/S-6 node response from PageIndex. */
const REAL_NODE = {
  node_id: "RTI-2005/CH-II/S-6",
  snapshot_id: "2024-12-01",
  text: "Request for obtaining information under the RTI Act.",
};

/** Draft content with one valid marker. */
const CONTENT_WITH_REAL_CITE =
  "Under the RTI Act, the applicant may request information. [CITE:RTI-2005/S-6]";

/** Draft content with one fake marker that doesn't exist in PageIndex. */
const CONTENT_WITH_FAKE_CITE =
  "This clause cites a non-existent section. [CITE:FAKE-ACT/S-99]";

/** Draft content with zero citation markers — a legal claim without citation. */
const CONTENT_NO_CITES =
  "The applicant is entitled to information under the law.";

/** Helper to build a minimal DocumentDraft. */
function makeDraft(content: string): DocumentDraft {
  return {
    id: "test-draft-1",
    document_type: "rti_application",
    language: "en",
    content,
    citations: [],
    traces: [],
    created_at: new Date().toISOString(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("runCitator() — Issue #86 acceptance criteria", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Test 1 (required): Valid draft with all real markers ──────────────────

  it("approves a draft where all [CITE:] markers resolve in PageIndex", async () => {
    const result = await runCitator({
      draft: makeDraft(CONTENT_WITH_REAL_CITE),
      session_id: "s1",
    });

    expect(result.approved).toBe(true);
    expect(result.passed).toBe(true);
    expect(result.rejected_spans).toHaveLength(0);

    // resolved_citations must be populated
    expect(result.resolved_citations).toHaveLength(1);
    expect(result.resolved_citations[0].node_id).toBe("RTI-2005/CH-II/S-6"); // normalised
    expect(result.resolved_citations[0].snapshot_id).toBe("2026-05-28");

    // verdict mirrors the same data
    expect(result.verdict.approved).toBe(true);
    expect(result.verdict.resolved_citations).toHaveLength(1);
    expect(result.verdict.rejected_spans).toHaveLength(0);

    expect(result.trace.status).toBe("ok");
  });

  // ── Test 2 (required): Draft with one fake marker → exact span identified ─

  it("rejects a draft containing [CITE:FAKE-ACT/S-99] and identifies the exact span", async () => {
    const result = await runCitator({
      draft: makeDraft(CONTENT_WITH_FAKE_CITE),
      session_id: "s2",
    });

    expect(result.approved).toBe(false);
    expect(result.passed).toBe(false);

    // The bad span must be present
    expect(result.rejected_spans).toHaveLength(1);

    // Exact span: verifies the span covers some real character range
    const [start, end] = result.rejected_spans[0];
    expect(typeof start).toBe("number");
    expect(typeof end).toBe("number");
    expect(end).toBeGreaterThan(start);

    // Span must fall within the draft content bounds
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeLessThanOrEqual(CONTENT_WITH_FAKE_CITE.length);

    // verdict carries the same rejection details
    expect(result.verdict.approved).toBe(false);
    expect(result.verdict.rejected_spans).toHaveLength(1);
    expect(result.verdict.rejected_spans[0].reason).toBe("invalid_node");
    expect(result.verdict.rejected_spans[0].message).toContain("FAKE-ACT/S-99");

    // No resolved citations
    expect(result.resolved_citations).toHaveLength(0);

    expect(result.trace.status).toBe("rejected");
  });

  // ── Test 3 (required): Draft with no markers at all → rejected ────────────

  it("rejects a draft with no [CITE:...] markers (strict mode, default)", async () => {
    const result = await runCitator({
      draft: makeDraft(CONTENT_NO_CITES),
      session_id: "s3",
    });

    expect(result.approved).toBe(false);
    expect(result.passed).toBe(false);

    // Rejection must explain the lack of citations
    expect(result.rejection_reason).toMatch(/no \[CITE/i);

    // A span covering the full content is returned so the chain can surface it
    expect(result.rejected_spans).toHaveLength(1);
    expect(result.verdict.rejected_spans[0].reason).toBe("no_citation");

    // PageIndex should never have been called
    expect(getTextSpy).not.toHaveBeenCalled();

    expect(result.trace.status).toBe("rejected");
  });
});

describe("runCitator() — additional robustness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Test 4: Mixed draft — some valid, some fake ───────────────────────────

  it("surfaces all rejected spans when a draft has mixed valid and invalid citations", async () => {
    const content =
      "First claim [CITE:RTI-2005/S-6] and second claim [CITE:FAKE-ACT/S-99].";

    const result = await runCitator({ draft: makeDraft(content), session_id: "s4" });

    expect(result.approved).toBe(false);
    // One resolved, one rejected
    expect(result.resolved_citations).toHaveLength(1);
    expect(result.rejected_spans).toHaveLength(1);
    expect(result.verdict.rejected_spans[0].message).toContain("FAKE-ACT/S-99");
  });

  // ── Test 5: --strict false skips no-citation rejection ───────────────────

  it("passes a draft with no markers when strict = false (dev mode)", async () => {
    const result = await runCitator({
      draft: makeDraft(CONTENT_NO_CITES),
      session_id: "s5",
      options: { strict: false },
    });

    // No markers, but strict is off — no citations means nothing to reject
    expect(result.approved).toBe(true);
    expect(result.passed).toBe(true);
    expect(result.resolved_citations).toHaveLength(0);
    expect(result.rejected_spans).toHaveLength(0);
    expect(getTextSpy).not.toHaveBeenCalled();
  });

  // ── Test 6: Unexpected PageIndex error propagates ─────────────────────────

  it("propagates unexpected PageIndex errors rather than treating them as rejections", async () => {
    getTextSpy.mockRejectedValueOnce(new Error("DB connection timeout"));

    await expect(
      runCitator({ draft: makeDraft(CONTENT_WITH_REAL_CITE), session_id: "s6" })
    ).rejects.toThrow("DB connection timeout");
  });

  // ── Test 7: CitatorGatekeeperAgent class ─────────────────────────────────

  it("CitatorGatekeeperAgent.run() delegates correctly and inherits options", async () => {
    const agent = new CitatorGatekeeperAgent({ strict: true });
    expect(agent.name).toBe("citator");

    const result = await agent.run({ draft: makeDraft(CONTENT_WITH_REAL_CITE) });
    expect(result.approved).toBe(true);
    expect(result.resolved_citations).toHaveLength(1);
  });

  // ── Test 8: Trace is always persisted regardless of outcome ──────────────

  it("always persists a trace — approved or rejected", async () => {
    const { persistTrace } = await import("../tracing/index.js");

    // Rejection case
    const result = await runCitator({
      draft: makeDraft(CONTENT_NO_CITES),
      session_id: "s8",
    });
    expect(result.approved).toBe(false);
    expect(persistTrace).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();

    // Approval case
    const result2 = await runCitator({
      draft: makeDraft(CONTENT_WITH_REAL_CITE),
      session_id: "s8b",
    });
    expect(result2.approved).toBe(true);
    expect(persistTrace).toHaveBeenCalledTimes(1);
  });
});
