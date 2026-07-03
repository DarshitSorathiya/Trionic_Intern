/**
 * router/providers.test.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Direct tests for each provider client (Claude, Gemini, GPT, DeepSeek)
 * using mocked SDKs.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Set environment variables before importing providers
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
process.env.GEMINI_API_KEY = "test-gemini-key";
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.DEEPSEEK_API_KEY = "test-deepseek-key";

import { callClaude } from "./providers/claude.js";
import { callGemini } from "./providers/gemini.js";
import { callGPT } from "./providers/gpt.js";
import { callDeepSeek } from "./providers/deepseek.js";

// Mock Anthropic
const mockClaudeMessagesCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        messages: {
          create: mockClaudeMessagesCreate,
        },
      };
    }),
  };
});

// Mock Gemini
const mockGeminiGenerateContent = vi.fn();
vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: mockGeminiGenerateContent,
        }),
      };
    }),
  };
});

// Mock OpenAI (used by GPT and DeepSeek)
const mockOpenAICreate = vi.fn();
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: mockOpenAICreate,
          },
        },
      };
    }),
  };
});

describe("LLM Providers - Direct Mock Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("callClaude correctly parses Anthropic response and calculates cost", async () => {
    mockClaudeMessagesCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Mock Claude Response" }],
      usage: { input_tokens: 120, output_tokens: 250 },
    });

    const res = await callClaude({
      model: "claude-3-5-sonnet-20241022",
      systemPrompt: "System message",
      userPrompt: "User message",
      maxTokens: 100,
      temperature: 0.5,
    });

    expect(res.text).toBe("Mock Claude Response");
    expect(res.model).toBe("claude-3-5-sonnet-20241022");
    expect(res.provider).toBe("claude");
    expect(res.tokens_in).toBe(120);
    expect(res.tokens_out).toBe(250);
    // (120/1000)*0.003 + (250/1000)*0.015 = 0.00036 + 0.00375 = 0.00411
    expect(res.cost_usd).toBeCloseTo(0.00411, 6);
    expect(res.latency_ms).toBeGreaterThanOrEqual(0);
    expect(res.fallback_used).toBe(false);
    expect(mockClaudeMessagesCreate).toHaveBeenCalledTimes(1);
  });

  it("callGemini correctly parses Google Generative AI response and calculates cost", async () => {
    mockGeminiGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "Mock Gemini Response",
        usageMetadata: { promptTokenCount: 150, candidatesTokenCount: 300 },
      },
    });

    const res = await callGemini({
      model: "gemini-1.5-flash",
      systemPrompt: "System message",
      userPrompt: "User message",
      maxTokens: 100,
      temperature: 0.5,
    });

    expect(res.text).toBe("Mock Gemini Response");
    expect(res.model).toBe("gemini-1.5-flash");
    expect(res.provider).toBe("gemini");
    expect(res.tokens_in).toBe(150);
    expect(res.tokens_out).toBe(300);
    // (150/1000)*0.000075 + (300/1000)*0.0003 = 0.00001125 + 0.00009 = 0.00010125
    expect(res.cost_usd).toBeCloseTo(0.00010125, 8);
    expect(res.latency_ms).toBeGreaterThanOrEqual(0);
    expect(res.fallback_used).toBe(false);
    expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("callGPT correctly parses OpenAI response and calculates cost", async () => {
    mockOpenAICreate.mockResolvedValueOnce({
      choices: [{ message: { content: "Mock GPT Response" } }],
      usage: { prompt_tokens: 80, completion_tokens: 160 },
    });

    const res = await callGPT({
      model: "gpt-4o-mini",
      systemPrompt: "System message",
      userPrompt: "User message",
      maxTokens: 100,
      temperature: 0.5,
    });

    expect(res.text).toBe("Mock GPT Response");
    expect(res.model).toBe("gpt-4o-mini");
    expect(res.provider).toBe("gpt");
    expect(res.tokens_in).toBe(80);
    expect(res.tokens_out).toBe(160);
    // (80/1000)*0.00015 + (160/1000)*0.0006 = 0.000012 + 0.000096 = 0.000108
    expect(res.cost_usd).toBeCloseTo(0.000108, 6);
    expect(res.latency_ms).toBeGreaterThanOrEqual(0);
    expect(res.fallback_used).toBe(false);
    expect(mockOpenAICreate).toHaveBeenCalledTimes(1);
  });

  it("callDeepSeek correctly parses DeepSeek OpenAI-compatible response and calculates cost", async () => {
    mockOpenAICreate.mockResolvedValueOnce({
      choices: [{ message: { content: "Mock DeepSeek Response" } }],
      usage: { prompt_tokens: 100, completion_tokens: 200 },
    });

    const res = await callDeepSeek({
      model: "deepseek-chat",
      systemPrompt: "System message",
      userPrompt: "User message",
      maxTokens: 100,
      temperature: 0.5,
    });

    expect(res.text).toBe("Mock DeepSeek Response");
    expect(res.model).toBe("deepseek-chat");
    expect(res.provider).toBe("deepseek");
    expect(res.tokens_in).toBe(100);
    expect(res.tokens_out).toBe(200);
    // (100/1000)*0.00014 + (200/1000)*0.00028 = 0.000014 + 0.000056 = 0.00007
    expect(res.cost_usd).toBeCloseTo(0.00007, 6);
    expect(res.latency_ms).toBeGreaterThanOrEqual(0);
    expect(res.fallback_used).toBe(false);
    expect(mockOpenAICreate).toHaveBeenCalledTimes(1);
  });
});
