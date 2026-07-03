/**
 * chain.test.ts
 * Owner: Yatri Dungarani (Week 2 — Issue #39)
 *
 * Integration tests for runAgentChain with memory.
 *
 * Strategy: mock all individual agents (classifier, planner, drafter, citator,
 * reviewer, translator) and the tracing layer. Test that:
 *   1. Full pipeline runs on fresh document (no cached state)
 *   2. Second run reuses cached classifier + planner from memory
 *   3. State is persisted after each step
 *   4. Error handling aborts the chain correctly
 *   5. Cache traces have model="cache" with 0 tokens
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  AgentStreamEvent,
  ClassifierOutput,
  PlannerOutput,
  AgentTrace,
  DocumentDraft,
  Citation,
} from "@trionic/shared";
import { InMemoryStore, Memory } from "./memory.js";
import { runAgentChain, type ChainInput } from "./chain.js";

// ─── Mock agent modules ───────────────────────────────────────────────────────

// We need to mock the actual agent functions to avoid real LLM calls.
// These mocks return deterministic results. Use vi.hoisted to ensure they are defined before vi.mock.
const {
  MOCK_CLASSIFIER_OUTPUT,
  MOCK_PLANNER_OUTPUT,
  MOCK_TRACE,
  MOCK_CITATION,
  MOCK_DRAFT,
} = vi.hoisted(() => {
  const MOCK_CLASSIFIER_OUTPUT: ClassifierOutput = {
    is_legal: true,
    domain: "administrative",
    relevant_acts: ["RTI-2005"],
    severity: "medium",
    confidence: 0.95,
    reasoning: "RTI request for municipal records",
  };

  const MOCK_PLANNER_OUTPUT: PlannerOutput = {
    document_type: "rti_application",
    template_id: "rti-v1",
    pageindex_queries: ["RTI Act 2005 Section 6"],
    applicable_acts: ["RTI-2005"],
    notes: "Standard RTI application for municipal records",
  };

  const MOCK_TRACE: AgentTrace = {
    agent: "test",
    model: "test-model",
    tokens_in: 100,
    tokens_out: 200,
    cost_usd: 0.01,
    latency_ms: 500,
    cited_nodes: [],
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  const MOCK_CITATION: Citation = {
    node_id: "RTI-2005/S-6",
    snapshot_id: "2024-12-01",
    span: [0, 10],
  };

  const MOCK_DRAFT: DocumentDraft = {
    id: "draft-1",
    document_type: "rti_application",
    language: "en",
    content: "# RTI Application\n\nUnder Section 6 of the RTI Act, 2005 [CITE:RTI-2005/S-6]...",
    citations: [MOCK_CITATION],
    traces: [],
    created_at: new Date().toISOString(),
  };

  return {
    MOCK_CLASSIFIER_OUTPUT,
    MOCK_PLANNER_OUTPUT,
    MOCK_TRACE,
    MOCK_CITATION,
    MOCK_DRAFT,
  };
});

// Mock all agent modules
vi.mock("./classifier/index.js", () => ({
  runClassifier: vi.fn().mockResolvedValue({
    classification: MOCK_CLASSIFIER_OUTPUT,
    trace: { ...MOCK_TRACE, agent: "classifier" },
  }),
}));

vi.mock("./planner/index.js", () => ({
  runPlanner: vi.fn().mockResolvedValue({
    plan: MOCK_PLANNER_OUTPUT,
    trace: { ...MOCK_TRACE, agent: "planner" },
  }),
}));

vi.mock("./drafter/index.js", () => ({
  runDrafter: vi.fn().mockResolvedValue({
    draft: MOCK_DRAFT,
    trace: { ...MOCK_TRACE, agent: "drafter" },
  }),
}));

vi.mock("./citator/index.js", () => ({
  runCitator: vi.fn().mockResolvedValue({
    passed: true,
    validatedCitations: [MOCK_CITATION],
    trace: { ...MOCK_TRACE, agent: "citator" },
  }),
}));

vi.mock("./reviewer/index.js", () => ({
  runReviewer: vi.fn().mockResolvedValue({
    approved: true,
    feedback: "All good",
    trace: { ...MOCK_TRACE, agent: "reviewer" },
  }),
}));

vi.mock("./translator/index.js", () => ({
  runTranslator: vi.fn().mockResolvedValue({
    translatedDraft: { ...MOCK_DRAFT, language: "hi", content: "# आरटीआई आवेदन" },
    trace: { ...MOCK_TRACE, agent: "translator" },
  }),
}));

// Mock tracing to just no-op
vi.mock("./tracing/index.js", () => ({
  persistTrace: vi.fn().mockResolvedValue(undefined),
  buildTrace: vi.fn().mockReturnValue(MOCK_TRACE),
  buildErrorTrace: vi.fn().mockReturnValue({ ...MOCK_TRACE, status: "error" }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Collect all events from the async generator into an array. */
async function collectEvents(
  gen: AsyncGenerator<AgentStreamEvent>
): Promise<AgentStreamEvent[]> {
  const events: AgentStreamEvent[] = [];
  for await (const event of gen) {
    events.push(event);
  }
  return events;
}

/** Find events of a specific type. */
function eventsOfType<T extends AgentStreamEvent["type"]>(
  events: AgentStreamEvent[],
  type: T
): Extract<AgentStreamEvent, { type: T }>[] {
  return events.filter((e) => e.type === type) as Extract<AgentStreamEvent, { type: T }>[];
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("runAgentChain", () => {
  let store: InMemoryStore;
  const BASE_INPUT: ChainInput = {
    document_id: "doc-test-1",
    intake_text: "I need an RTI application for municipal building records",
    target_language: "en",
    session_id: "session-1",
  };

  beforeEach(() => {
    store = new InMemoryStore();
    vi.clearAllMocks();
  });

  // ── Test 1: Fresh pipeline run ──────────────────────────────────────────

  it("runs full pipeline on fresh document (no cached state)", async () => {
    const events = await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );

    // Should see all agent steps
    const startEvents = eventsOfType(events, "step.start");
    const doneEvents = eventsOfType(events, "step.done");

    // Classifier, Planner, PageIndex, Drafter, Citator, Reviewer = 6 agents
    expect(startEvents.length).toBe(6);
    expect(doneEvents.length).toBe(6);

    // Verify agent ordering
    const agentOrder = startEvents.map((e) => e.agent);
    expect(agentOrder).toEqual([
      "classifier",
      "planner",
      "pageindex",
      "drafter",
      "citator",
      "reviewer",
    ]);

    // Should emit draft.final
    const finalEvents = eventsOfType(events, "draft.final");
    expect(finalEvents.length).toBe(1);
    expect(finalEvents[0].response.document_id).toBe("doc-test-1");

    // Should emit citation events
    const citationEvents = eventsOfType(events, "citation.emitted");
    expect(citationEvents.length).toBeGreaterThan(0);

    // Memory should be persisted
    const state = await store.get("doc-test-1");
    expect(state).not.toBeNull();
    expect(state!.last_classifier_output).toEqual(MOCK_CLASSIFIER_OUTPUT);
    expect(state!.last_planner_output).toEqual(MOCK_PLANNER_OUTPUT);
  });

  // ── Test 2: Second run uses cached classifier + planner ─────────────────

  it("second run reuses cached classifier + planner from memory", async () => {
    // First run — populates memory
    await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );

    // Verify agents were called on first run
    const { runClassifier } = await import("./classifier/index.js");
    const { runPlanner } = await import("./planner/index.js");
    expect(runClassifier).toHaveBeenCalledTimes(1);
    expect(runPlanner).toHaveBeenCalledTimes(1);

    // Clear mocks but keep implementations
    vi.clearAllMocks();

    // Second run — SAME intake text → cache hit (staleness check passes)
    const events = await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store }) // identical intake = same hash
    );

    // Classifier and Planner should NOT have been called again
    expect(runClassifier).not.toHaveBeenCalled();
    expect(runPlanner).not.toHaveBeenCalled();

    // But Drafter should still run
    const { runDrafter } = await import("./drafter/index.js");
    expect(runDrafter).toHaveBeenCalledTimes(1);

    // Check that cached steps have 0 duration and 0 tokens
    const doneEvents = eventsOfType(events, "step.done");
    const classifierDone = doneEvents.find((e) => e.agent === "classifier");
    const plannerDone = doneEvents.find((e) => e.agent === "planner");

    expect(classifierDone).toBeDefined();
    expect(classifierDone!.duration_ms).toBe(0);
    expect(classifierDone!.tokens).toBe(0);

    expect(plannerDone).toBeDefined();
    expect(plannerDone!.duration_ms).toBe(0);
    expect(plannerDone!.tokens).toBe(0);

    // Should still reach draft.final
    const finalEvents = eventsOfType(events, "draft.final");
    expect(finalEvents.length).toBe(1);
  });

  // ── Test 3: Cache traces have model="cache" ─────────────────────────────

  it("cache hit persists trace with model='cache'", async () => {
    // First run
    await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );
    vi.clearAllMocks();

    // Second run (cache hit)
    await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );

    // Check that persistTrace was called with model="cache" for classifier & planner
    const { persistTrace } = await import("./tracing/index.js");
    const cacheCalls = (persistTrace as any).mock.calls.filter(
      (call: any[]) => call[0]?.model === "cache"
    );
    expect(cacheCalls.length).toBe(2); // classifier + planner
    expect(cacheCalls[0][0].agent).toBe("classifier");
    expect(cacheCalls[1][0].agent).toBe("planner");
  });

  // ── Test 4: State version increments ────────────────────────────────────

  it("state version increments after each agent step", async () => {
    await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );

    const state = await store.get("doc-test-1");
    expect(state).not.toBeNull();
    // Initial (1) + classifier (2) + planner (3) + drafter (4) + final (5) = version 5
    expect(state!.version).toBeGreaterThanOrEqual(4);
  });

  // ── Test 5: Translation runs when target_language ≠ "en" ────────────────

  it("runs translator when target_language is not en", async () => {
    const hindiInput: ChainInput = {
      ...BASE_INPUT,
      target_language: "hi",
    };

    const events = await collectEvents(
      runAgentChain(hindiInput, { memoryStore: store })
    );

    // Should see translator step
    const startEvents = eventsOfType(events, "step.start");
    const agentOrder = startEvents.map((e) => e.agent);
    expect(agentOrder).toContain("translator");

    // 7 agents: classifier, planner, pageindex, drafter, citator, reviewer, translator
    expect(startEvents.length).toBe(7);
  });

  // ── Test 6: skipTranslation option ──────────────────────────────────────

  it("skips translator when skipTranslation is true", async () => {
    const hindiInput: ChainInput = {
      ...BASE_INPUT,
      target_language: "hi",
    };

    const events = await collectEvents(
      runAgentChain(hindiInput, { memoryStore: store, skipTranslation: true })
    );

    const startEvents = eventsOfType(events, "step.start");
    const agentOrder = startEvents.map((e) => e.agent);
    expect(agentOrder).not.toContain("translator");
  });

  // ── Test 7: Error in classifier aborts chain ────────────────────────────

  it("error in classifier aborts chain with step.error", async () => {
    const { runClassifier } = await import("./classifier/index.js");
    (runClassifier as any).mockRejectedValueOnce(new Error("LLM timeout"));

    const events = await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );

    const errorEvents = eventsOfType(events, "step.error");
    expect(errorEvents.length).toBe(1);
    expect(errorEvents[0].agent).toBe("classifier");
    expect(errorEvents[0].message).toBe("LLM timeout");

    // No draft.final should be emitted
    const finalEvents = eventsOfType(events, "draft.final");
    expect(finalEvents.length).toBe(0);
  });

  // ── Test 8: Citator rejection aborts chain ──────────────────────────────

  it("citator rejection aborts chain", async () => {
    const { runCitator } = await import("./citator/index.js");
    (runCitator as any).mockResolvedValueOnce({
      passed: false,
      validatedCitations: [],
      rejection_reason: "Invalid citation: RTI-2005/S-99 does not exist",
      trace: { ...MOCK_TRACE, agent: "citator", status: "rejected" },
    });

    const events = await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );

    const errorEvents = eventsOfType(events, "step.error");
    expect(errorEvents.length).toBe(1);
    expect(errorEvents[0].agent).toBe("citator");

    const finalEvents = eventsOfType(events, "draft.final");
    expect(finalEvents.length).toBe(0);
  });

  // ── Test 9: draft.partial is emitted ────────────────────────────────────

  it("emits draft.partial with draft content", async () => {
    const events = await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );

    const partialEvents = eventsOfType(events, "draft.partial");
    expect(partialEvents.length).toBe(1);
    expect(partialEvents[0].markdown_chunk).toContain("RTI Application");
  });

  // ── Test 10: Memory is empty before first run ───────────────────────────

  it("starts with null memory for new document", async () => {
    const state = await store.get("brand-new-doc");
    expect(state).toBeNull();
  });

  // ── Test 11: Changed intake text invalidates classifier + planner cache ──

  it("changed intake text re-runs classifier and planner (staleness detection)", async () => {
    // First run with original intake
    await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );

    const { runClassifier } = await import("./classifier/index.js");
    const { runPlanner } = await import("./planner/index.js");
    expect(runClassifier).toHaveBeenCalledTimes(1);
    expect(runPlanner).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();

    // Second run with DIFFERENT intake text → hash changes → cache invalidated
    const changedInput: ChainInput = {
      ...BASE_INPUT,
      intake_text: "I need a legal notice for non-payment of rent", // completely different
    };

    const events = await collectEvents(
      runAgentChain(changedInput, { memoryStore: store })
    );

    // Classifier and Planner must re-run because intake changed
    expect(runClassifier).toHaveBeenCalledTimes(1);
    expect(runPlanner).toHaveBeenCalledTimes(1);

    // Step.done for classifier should have real tokens (not 0)
    const doneEvents = eventsOfType(events, "step.done");
    const classifierDone = doneEvents.find((e) => e.agent === "classifier");
    expect(classifierDone).toBeDefined();
    expect(classifierDone!.tokens).toBeGreaterThan(0); // real run, not cache hit
  });

  // ── Test 12: Same intake text on second run → cache hit ─────────────────

  it("identical intake text on second run uses cached classifier + planner", async () => {
    // First run
    await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store })
    );

    const { runClassifier } = await import("./classifier/index.js");
    const { runPlanner } = await import("./planner/index.js");
    vi.clearAllMocks();

    // Second run with IDENTICAL intake text
    const events = await collectEvents(
      runAgentChain(BASE_INPUT, { memoryStore: store }) // same BASE_INPUT
    );

    // Both should be cache hits
    expect(runClassifier).not.toHaveBeenCalled();
    expect(runPlanner).not.toHaveBeenCalled();

    const doneEvents = eventsOfType(events, "step.done");
    const classifierDone = doneEvents.find((e) => e.agent === "classifier");
    const plannerDone = doneEvents.find((e) => e.agent === "planner");

    // Cache hit → 0 tokens, 0 duration
    expect(classifierDone!.tokens).toBe(0);
    expect(plannerDone!.tokens).toBe(0);

    // But chain still completes successfully
    expect(eventsOfType(events, "draft.final").length).toBe(1);
  });
});
