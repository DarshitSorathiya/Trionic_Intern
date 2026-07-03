/**
 * providers/gemini.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Gemini (Google) provider — FUNCTIONAL in Week 2.
 * Requires GEMINI_API_KEY in environment.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMRequest, LLMResponse } from "../index.js";

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "[GeminiProvider] GEMINI_API_KEY is not set in environment."
      );
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

/**
 * Call Gemini with the given prompt and return a structured LLMResponse.
 * This is the ONLY function other agents should call — do not import GoogleGenerativeAI SDK elsewhere.
 */
export async function callGemini(req: LLMRequest): Promise<LLMResponse> {
  const genAI = getClient();
  const startMs = Date.now();

  const model = genAI.getGenerativeModel({
    model: req.model,
    systemInstruction: req.systemPrompt,
    generationConfig: {
      maxOutputTokens: req.maxTokens,
      temperature: req.temperature,
    },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: req.userPrompt }] }]
  });

  const latency_ms = Date.now() - startMs;
  const text = result.response.text() || "";

  // Gemini token counting
  const usage = result.response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };
  const tokens_in = usage.promptTokenCount || 0;
  const tokens_out = usage.candidatesTokenCount || 0;

  // Gemini pricing (as of May 2026)
  const isFlash = req.model.toLowerCase().includes("flash");
  const INPUT_COST_PER_1K = isFlash ? 0.000075 : 0.00125;
  const OUTPUT_COST_PER_1K = isFlash ? 0.0003 : 0.005;

  const cost_usd =
    ((tokens_in / 1000) * INPUT_COST_PER_1K) +
    ((tokens_out / 1000) * OUTPUT_COST_PER_1K);

  return {
    text,
    model: req.model,
    provider: "gemini",
    tokens_in,
    tokens_out,
    cost_usd,
    latency_ms,
    fallback_used: false,
  };
}
