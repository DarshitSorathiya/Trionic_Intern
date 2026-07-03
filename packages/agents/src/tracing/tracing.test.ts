/**
 * tracing/tracing.test.ts
 * Owner: Umrania Yug (Tracing / observability layer)
 */

import { describe, it, expect } from "vitest";
import { buildTrace, buildErrorTrace } from "./tracer.js";
import type { LLMResponse } from "../router/index.js";

const mockLLMResponse: LLMResponse = {
  text: "Some output text",
  model: "claude-3-5-sonnet-20241022",
  tokens_in: 150,
  tokens_out: 75,
  cost_usd: 0.000563,
  latency_ms: 1234,
};

describe("buildTrace()", () => {
  it("produces a valid AgentTrace from LLMResponse", () => {
    const trace = buildTrace({
      agent: "planner",
      llmResponse: mockLLMResponse,
      cited_nodes: [],
      status: "ok",
    });

    expect(trace.agent).toBe("planner");
    expect(trace.model).toBe("claude-3-5-sonnet-20241022");
    expect(trace.tokens_in).toBe(150);
    expect(trace.tokens_out).toBe(75);
    expect(trace.cost_usd).toBeCloseTo(0.000563);
    expect(trace.latency_ms).toBe(1234);
    expect(trace.cited_nodes).toEqual([]);
    expect(trace.status).toBe("ok");
    expect(trace.timestamp).toBeTruthy();
  });

  it("includes session_id when provided", () => {
    const trace = buildTrace({
      agent: "classifier",
      llmResponse: mockLLMResponse,
      cited_nodes: [],
      status: "ok",
      session_id: "session-abc-123",
    });
    expect(trace.session_id).toBe("session-abc-123");
  });
});

describe("buildErrorTrace()", () => {
  it("builds a safe error trace when LLM call fails", () => {
    const trace = buildErrorTrace("drafter", new Error("API timeout"));
    expect(trace.agent).toBe("drafter");
    expect(trace.status).toBe("error");
    expect(trace.error_message).toBe("API timeout");
    expect(trace.tokens_in).toBe(0);
    expect(trace.cost_usd).toBe(0);
  });
});
