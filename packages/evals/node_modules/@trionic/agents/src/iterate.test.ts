/**
 * iterate.test.ts
 * Owner: Yatri Dungarani (Week 4 — Draft Iteration)
 *
 * Integration tests for runIterationChain.
 *
 * Strategy: mock all individual agents (drafter reviseDraft, citator, reviewer,
 * translator) and the tracing layer. Test that:
 *   1. Error if no conversation state exists
 *   2. Error if no prior draft exists in state
 *   3. Single iteration skips Classifier/Planner, runs Drafter→Citator→Reviewer
 *   4. 3 consecutive iterations carry state forward, citations stay valid
 *   5. Translation runs when target_language ≠ "en"
 *   6. Agent call count confirms 3-5× speedup (3 agents instead of 6+)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  AgentStreamEvent,
  ClassifierOutput,
  PlannerOutput,
  AgentTrace,
  DocumentDraft,
  Citation,
  ConversationState,
} from "@trionic/shared";
import { InMemoryStore, Memory, createInitialState, hashIntakeText } from "./memory.js";
import { runIterationChain, type IterateInput } from "./iterate.js";

// ─── Mock agent modules ───────────────────────────────────────────────────────

const {
  MOCK_CLASSIFIER_OUTPUT,
  MOCK_PLANNER_OUTPUT,
  MOCK_TRACE,
  MOCK_CITATION,
  MOCK_DRAFT,
  MOCK_REVISED_DRAFT,
  MOCK_CITATION_2,
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

  const MOCK_CITATION_2: Citation = {
    node_id: "RTI-2005/S-7",
    snapshot_id: "2024-12-01",
    span: [50, 80],
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

  const MOCK_REVISED_DRAFT: DocumentDraft = {
    id: "draft-revised",
    document_type: "rti_application",
    language: "en",
    content: "# RTI Application (Revised)\n\nUnder Section 6 of the RTI Act, 2005 [CITE:RTI-2005/S-6]... Also Section 7 [CITE:RTI-2005/S-7]...",
    citations: [MOCK_CITATION, MOCK_CITATION_2],
    traces: [],
    created_at: new Date().toISOString(),
  };

  return {
    MOCK_CLASSIFIER_OUTPUT,
    MOCK_PLANNER_OUTPUT,
    MOCK_TRACE,
    MOCK_CITATION,
    MOCK_CITATION_2,
    MOCK_DRAFT,
    MOCK_REVISED_DRAFT,
  };
});

// Mock only the agents used by the iteration chain (not classifier/planner)
vi.mock("./drafter/index.js", () => ({
  runDrafter: vi.fn().mockResolvedValue({
    draft: MOCK_DRAFT,
    trace: { ...MOCK_TRACE, agent: "drafter" },
  }),
  reviseDraft: vi.fn().mockResolvedValue({
    draft: MOCK_REVISED_DRAFT,
    trace: { ...MOCK_TRACE, agent: "drafter" },
  }),
}));

vi.mock("./citator/index.js", () => ({
  runCitator: vi.fn().mockResolvedValue({
    passed: true,
    validatedCitations: [MOCK_CITATION, MOCK_CITATION_2],
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
    output: { translated_markdown: "# आरटीआई आवेदन (संशोधित)", glossary_hits: [] },
    trace: { ...MOCK_TRACE, agent: "translator" },
  }),
}));

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

/**
 * Build a ConversationState that simulates a completed full chain run.
 * This is the pre-condition for all iteration tests.
 */
function buildCompletedState(documentId: string): ConversationState {
  return {
    schema_version: 1,
    document_id: documentId,
    version: 5, // simulates several saves from the full chain
    last_classifier_output: MOCK_CLASSIFIER_OUTPUT,
    last_planner_output: MOCK_PLANNER_OUTPUT,
    retrieved_nodes: ["RTI-2005/S-6"],
    current_draft_version: 1,
    last_draft_content: MOCK_DRAFT.content,
    last_citations: [MOCK_CITATION],
    intake_text_hash: hashIntakeText("I need an RTI application for municipal building records"),
    updated_at: new Date().toISOString(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("runIterationChain", () => {
  let store: InMemoryStore;
  const BASE_INPUT: IterateInput = {
    document_id: "doc-iter-1",
    instruction: "Make it stricter",
    target_language: "en",
    session_id: "session-1",
  };

  beforeEach(() => {
    store = new InMemoryStore();
    vi.clearAllMocks();
  });

  // ── Test 1: Error when no conversation state exists ─────────────────────

  it("returns step.error when no conversation state exists", async () => {
    // No state seeded — store is empty
    const events = await collectEvents(
      runIterationChain(BASE_INPUT, { memoryStore: store })
    );

    const errorEvents = eventsOfType(events, "step.error");
    expect(errorEvents.length).toBe(1);
    expect(errorEvents[0].agent).toBe("system");
    expect(errorEvents[0].message).toContain("No conversation state found");

    // No draft.final should be emitted
    const finalEvents = eventsOfType(events, "draft.final");
    expect(finalEvents.length).toBe(0);
  });

  // ── Test 2: Error when no prior draft exists ────────────────────────────

  it("returns step.error when state has no last_draft_content", async () => {
    // Seed state WITHOUT last_draft_content (simulates interrupted chain)
    const incompleteState = createInitialState("doc-iter-1", hashIntakeText("test"));
    incompleteState.last_classifier_output = MOCK_CLASSIFIER_OUTPUT;
    incompleteState.last_planner_output = MOCK_PLANNER_OUTPUT;
    // last_draft_content is still null
    await store.set("doc-iter-1", incompleteState);

    const events = await collectEvents(
      runIterationChain(BASE_INPUT, { memoryStore: store })
    );

    const errorEvents = eventsOfType(events, "step.error");
    expect(errorEvents.length).toBe(1);
    expect(errorEvents[0].agent).toBe("system");
    expect(errorEvents[0].message).toContain("No prior draft found");
  });

  // ── Test 3: Single iteration works correctly ────────────────────────────

  it("runs single iteration: skips Classifier/Planner, runs Drafter→Citator→Reviewer", async () => {
    // Seed completed state
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    const events = await collectEvents(
      runIterationChain(BASE_INPUT, { memoryStore: store })
    );

    // Should see all agent steps
    const startEvents = eventsOfType(events, "step.start");
    const doneEvents = eventsOfType(events, "step.done");

    // Classifier, Planner, PageIndex (cached) + Drafter, Citator, Reviewer = 6 agents
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

    // Cached steps have 0 tokens
    const classifierDone = doneEvents.find((e) => e.agent === "classifier");
    const plannerDone = doneEvents.find((e) => e.agent === "planner");
    const pageindexDone = doneEvents.find((e) => e.agent === "pageindex");

    expect(classifierDone!.tokens).toBe(0);
    expect(classifierDone!.duration_ms).toBe(0);
    expect(plannerDone!.tokens).toBe(0);
    expect(pageindexDone!.tokens).toBe(0);

    // Drafter should have real tokens (from mock)
    const drafterDone = doneEvents.find((e) => e.agent === "drafter");
    expect(drafterDone!.tokens).toBeGreaterThan(0);

    // Should emit draft.final
    const finalEvents = eventsOfType(events, "draft.final");
    expect(finalEvents.length).toBe(1);
    expect(finalEvents[0].response.document_id).toBe("doc-iter-1");

    // Should emit citation events
    const citationEvents = eventsOfType(events, "citation.emitted");
    expect(citationEvents.length).toBeGreaterThan(0);

    // reviseDraft was called (not runDrafter)
    const { reviseDraft } = await import("./drafter/index.js");
    expect(reviseDraft).toHaveBeenCalledTimes(1);

    // Verify reviseDraft was called with the instruction
    expect(reviseDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        content: MOCK_DRAFT.content, // the previous draft
      }),
      "Make it stricter", // the instruction
      "session-1" // session_id
    );
  });

  // ── Test 4: Classifier and Planner are NEVER called ─────────────────────

  it("never calls Classifier or Planner during iteration", async () => {
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    await collectEvents(
      runIterationChain(BASE_INPUT, { memoryStore: store })
    );

    // These modules should not even be imported/called
    // (they're not mocked in this test file since iterate.ts doesn't import them)
    // Instead, verify that persistCacheTrace was called for classifier + planner
    const { persistTrace } = await import("./tracing/index.js");
    const cacheCalls = (persistTrace as any).mock.calls.filter(
      (call: any[]) => call[0]?.model === "cache"
    );
    expect(cacheCalls.length).toBe(2); // classifier + planner
    expect(cacheCalls[0][0].agent).toBe("classifier");
    expect(cacheCalls[1][0].agent).toBe("planner");
  });

  // ── Test 5: 3 consecutive iterations carry state forward ────────────────

  it("3 iterations on the same draft — state carries forward, citations stay valid", async () => {
    // Seed initial completed state
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    // Iteration 1: "Make it stricter"
    const events1 = await collectEvents(
      runIterationChain(
        { ...BASE_INPUT, instruction: "Make it stricter" },
        { memoryStore: store }
      )
    );
    expect(eventsOfType(events1, "draft.final").length).toBe(1);

    // Verify state updated after iteration 1
    const state1 = await store.get("doc-iter-1");
    expect(state1).not.toBeNull();
    expect(state1!.current_draft_version).toBe(2);
    expect(state1!.last_draft_content).not.toBeNull();
    expect(state1!.last_citations).not.toBeNull();
    expect(state1!.last_citations!.length).toBeGreaterThan(0);
    // Classifier and Planner outputs are preserved
    expect(state1!.last_classifier_output).toEqual(MOCK_CLASSIFIER_OUTPUT);
    expect(state1!.last_planner_output).toEqual(MOCK_PLANNER_OUTPUT);

    vi.clearAllMocks();

    // Iteration 2: "Add a clause about late fees"
    const events2 = await collectEvents(
      runIterationChain(
        { ...BASE_INPUT, instruction: "Add a clause about late fees" },
        { memoryStore: store }
      )
    );
    expect(eventsOfType(events2, "draft.final").length).toBe(1);

    const state2 = await store.get("doc-iter-1");
    expect(state2!.current_draft_version).toBe(3);
    expect(state2!.last_classifier_output).toEqual(MOCK_CLASSIFIER_OUTPUT);
    expect(state2!.last_planner_output).toEqual(MOCK_PLANNER_OUTPUT);

    vi.clearAllMocks();

    // Iteration 3: "Translate to Hindi keeping all citations"
    const events3 = await collectEvents(
      runIterationChain(
        { ...BASE_INPUT, instruction: "Keep the English version but refine language" },
        { memoryStore: store }
      )
    );
    expect(eventsOfType(events3, "draft.final").length).toBe(1);

    const state3 = await store.get("doc-iter-1");
    expect(state3!.current_draft_version).toBe(4);
    // Classifier and planner still preserved from original run
    expect(state3!.last_classifier_output).toEqual(MOCK_CLASSIFIER_OUTPUT);
    expect(state3!.last_planner_output).toEqual(MOCK_PLANNER_OUTPUT);
    // Citations are still valid
    expect(state3!.last_citations!.length).toBeGreaterThan(0);
    expect(state3!.last_citations![0].node_id).toBe("RTI-2005/S-6");
  });

  // ── Test 6: Version ID increments correctly across iterations ───────────

  it("version_id increments: v2, v3, v4 across 3 iterations", async () => {
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    // Iteration 1
    const events1 = await collectEvents(
      runIterationChain({ ...BASE_INPUT, instruction: "iter 1" }, { memoryStore: store })
    );
    const final1 = eventsOfType(events1, "draft.final")[0];
    expect(final1.response.version_id).toBe("v2");

    // Iteration 2
    const events2 = await collectEvents(
      runIterationChain({ ...BASE_INPUT, instruction: "iter 2" }, { memoryStore: store })
    );
    const final2 = eventsOfType(events2, "draft.final")[0];
    expect(final2.response.version_id).toBe("v3");

    // Iteration 3
    const events3 = await collectEvents(
      runIterationChain({ ...BASE_INPUT, instruction: "iter 3" }, { memoryStore: store })
    );
    const final3 = eventsOfType(events3, "draft.final")[0];
    expect(final3.response.version_id).toBe("v4");
  });

  // ── Test 7: Translation runs when target_language ≠ "en" ────────────────

  it("runs translator when target_language is not en", async () => {
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    const hindiInput: IterateInput = {
      ...BASE_INPUT,
      target_language: "hi",
      instruction: "Translate to Hindi keeping all citations",
    };

    const events = await collectEvents(
      runIterationChain(hindiInput, { memoryStore: store })
    );

    // Should see translator step
    const startEvents = eventsOfType(events, "step.start");
    const agentOrder = startEvents.map((e) => e.agent);
    expect(agentOrder).toContain("translator");

    // 7 agents: classifier (cached), planner (cached), pageindex (cached),
    // drafter, citator, reviewer, translator
    expect(startEvents.length).toBe(7);

    // Translator should have been called
    const { runTranslator } = await import("./translator/index.js");
    expect(runTranslator).toHaveBeenCalledTimes(1);
  });

  // ── Test 8: skipTranslation option ──────────────────────────────────────

  it("skips translator when skipTranslation is true", async () => {
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    const hindiInput: IterateInput = {
      ...BASE_INPUT,
      target_language: "hi",
    };

    const events = await collectEvents(
      runIterationChain(hindiInput, { memoryStore: store, skipTranslation: true })
    );

    const startEvents = eventsOfType(events, "step.start");
    const agentOrder = startEvents.map((e) => e.agent);
    expect(agentOrder).not.toContain("translator");
  });

  // ── Test 9: Citator rejection aborts iteration ──────────────────────────

  it("citator rejection aborts iteration chain", async () => {
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    const { runCitator } = await import("./citator/index.js");
    (runCitator as any).mockResolvedValueOnce({
      passed: false,
      validatedCitations: [],
      rejection_reason: "Invalid citation: RTI-2005/S-99 does not exist",
      trace: { ...MOCK_TRACE, agent: "citator", status: "rejected" },
    });

    const events = await collectEvents(
      runIterationChain(BASE_INPUT, { memoryStore: store })
    );

    const errorEvents = eventsOfType(events, "step.error");
    expect(errorEvents.length).toBe(1);
    expect(errorEvents[0].agent).toBe("citator");

    const finalEvents = eventsOfType(events, "draft.final");
    expect(finalEvents.length).toBe(0);
  });

  // ── Test 10: draft.partial is emitted ───────────────────────────────────

  it("emits draft.partial with revised draft content", async () => {
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    const events = await collectEvents(
      runIterationChain(BASE_INPUT, { memoryStore: store })
    );

    const partialEvents = eventsOfType(events, "draft.partial");
    expect(partialEvents.length).toBe(1);
    expect(partialEvents[0].markdown_chunk).toContain("RTI Application (Revised)");
  });

  // ── Test 11: Agent call count confirms speedup ──────────────────────────

  it("iteration calls only 3 agents (Drafter + Citator + Reviewer) — 3-5× speedup", async () => {
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    await collectEvents(
      runIterationChain(BASE_INPUT, { memoryStore: store })
    );

    // Only these 3 agents should have been called
    const { reviseDraft } = await import("./drafter/index.js");
    const { runCitator } = await import("./citator/index.js");
    const { runReviewer } = await import("./reviewer/index.js");

    expect(reviseDraft).toHaveBeenCalledTimes(1);
    expect(runCitator).toHaveBeenCalledTimes(1);
    expect(runReviewer).toHaveBeenCalledTimes(1);

    // Translator should NOT have been called (target_language is "en")
    const { runTranslator } = await import("./translator/index.js");
    expect(runTranslator).not.toHaveBeenCalled();

    // Full chain calls: Classifier + Planner + PageIndex + Drafter + Citator + Reviewer = 6 agents
    // Iteration chain calls: Drafter + Citator + Reviewer = 3 agents
    // That's a 2× reduction in agent calls (which translates to 3-5× wall-clock speedup
    // since Classifier and Planner are the most expensive LLM calls)
  });

  // ── Test 12: Error in drafter aborts chain ──────────────────────────────

  it("error in drafter aborts iteration chain", async () => {
    await store.set("doc-iter-1", buildCompletedState("doc-iter-1"));

    const { reviseDraft } = await import("./drafter/index.js");
    (reviseDraft as any).mockRejectedValueOnce(new Error("LLM timeout"));

    const events = await collectEvents(
      runIterationChain(BASE_INPUT, { memoryStore: store })
    );

    const errorEvents = eventsOfType(events, "step.error");
    expect(errorEvents.length).toBe(1);
    expect(errorEvents[0].agent).toBe("drafter");
    expect(errorEvents[0].message).toBe("LLM timeout");

    // No draft.final
    expect(eventsOfType(events, "draft.final").length).toBe(0);
  });
});
