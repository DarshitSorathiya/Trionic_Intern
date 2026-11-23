/**
 * classifier/classifier.test.ts
 * Owner: Yug Gandhi (Classifier agent)
 *
 * Tests for the Classifier Agent.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runClassifier } from "./index.js";
import { router } from "../router/index.js";

vi.mock("../router/index.js", () => ({
  router: {
    run: vi.fn(),
  },
}));

describe("ClassifierAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully categorizes a valid legal intake", async () => {
    const mockOutput = {
      is_legal: true,
      domain: "contract",
      sub_domain: "nda",
      relevant_acts: ["ICA-1872"],
      severity: "low",
      confidence: 0.95,
      reasoning: "User wants to draft a non-disclosure agreement which is contract law.",
    };

    vi.mocked(router.run).mockResolvedValueOnce({
      text: JSON.stringify(mockOutput),
      model: "gemini-1.5-flash",
      provider: "gemini",
      tokens_in: 50,
      tokens_out: 100,
      cost_usd: 0.00001,
      latency_ms: 120,
      fallback_used: false,
    });

    const result = await runClassifier({
      intakeText: "I want to draft an NDA for a tech startup.",
      language: "en",
      session_id: "test-session-123",
    });

    expect(result.classification.is_legal).toBe(true);
    expect(result.classification.domain).toBe("contract");
    expect(result.classification.sub_domain).toBe("nda");
    expect(result.classification.relevant_acts).toContain("ICA-1872");
    expect(result.trace.agent).toBe("classifier");
    expect(result.trace.status).toBe("ok");
    expect(result.trace.session_id).toBe("test-session-123");
    expect(router.run).toHaveBeenCalledTimes(1);
  });

  it("handles non-legal queries gracefully", async () => {
    const mockOutput = {
      is_legal: false,
      domain: "other",
      sub_domain: "general",
      relevant_acts: [],
      severity: "low",
      confidence: 0.99,
      reasoning: "User is asking for chocolate cake recipe, not a legal issue.",
    };

    vi.mocked(router.run).mockResolvedValueOnce({
      text: JSON.stringify(mockOutput),
      model: "gemini-1.5-flash",
      provider: "gemini",
      tokens_in: 50,
      tokens_out: 100,
      cost_usd: 0.00001,
      latency_ms: 100,
      fallback_used: false,
    });

    const result = await runClassifier({
      intakeText: "Can you tell me how to bake a cake?",
      language: "en",
    });

    expect(result.classification.is_legal).toBe(false);
    expect(result.classification.domain).toBe("other");
    expect(result.classification.relevant_acts).toHaveLength(0);
    expect(result.trace.status).toBe("ok");
  });

  it("extracts wrapped JSON and normalizes known Act-code aliases", async () => {
    vi.mocked(router.run).mockResolvedValueOnce({
      text: `Classification:\n\`\`\`json\n${JSON.stringify({
        is_legal: true,
        domain: "criminal",
        sub_domain: "cheque-bounce",
        relevant_acts: ["NIA-1881", "IPC-1860"],
        severity: "high",
        confidence: 0.97,
        reasoning: "Cheque dishonour request.",
      })}\n\`\`\``,
      model: "openai/gpt-oss-120b",
      provider: "groq",
      tokens_in: 50,
      tokens_out: 100,
      cost_usd: 0,
      latency_ms: 120,
      fallback_used: true,
    });

    const result = await runClassifier({
      intakeText: "Two cheques issued to me were dishonoured.",
      language: "en",
    });

    expect(result.classification.relevant_acts).toEqual(["NI-1881", "IPC-1860"]);
    expect(result.classification.sub_domain).toBe("cheque-bounce");
  });

  it("uses the explicitly selected document type when model JSON is truncated", async () => {
    vi.mocked(router.run).mockResolvedValueOnce({
      text: '{"is_legal":true,"domain":"criminal","sub_domain":"cheque-bounce"',
      model: "openai/gpt-oss-120b",
      provider: "groq",
      tokens_in: 50,
      tokens_out: 100,
      cost_usd: 0,
      latency_ms: 120,
      fallback_used: true,
    });

    const result = await runClassifier({
      intakeText: "Two cheques issued to me were dishonoured.",
      language: "en",
      documentType: "cheque_bounce_notice",
    });

    expect(result.classification).toMatchObject({
      is_legal: true,
      domain: "criminal",
      sub_domain: "cheque-bounce",
      relevant_acts: ["NI-1881"],
      severity: "high",
    });
    expect(result.trace.status).toBe("ok");
  });

  it("fails and records error trace if LLM returns invalid JSON", async () => {
    vi.mocked(router.run).mockResolvedValueOnce({
      text: "Not a JSON string at all",
      model: "gemini-1.5-flash",
      provider: "gemini",
      tokens_in: 50,
      tokens_out: 10,
      cost_usd: 0.00001,
      latency_ms: 80,
      fallback_used: false,
    });

    await expect(
      runClassifier({
        intakeText: "Legal question here...",
        language: "en",
        session_id: "error-session",
      })
    ).rejects.toThrow("Classifier LLM returned invalid JSON");
  });
});
