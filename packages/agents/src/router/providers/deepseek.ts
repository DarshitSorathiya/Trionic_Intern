/**
 * providers/deepseek.ts
 * Owner: Yug Gandhi (LLM Router) & Jenil Sutariya
 *
 * DeepSeek provider — FUNCTIONAL in Week 3.
 * Requires DEEPSEEK_API_KEY in environment.
 * DeepSeek is fully OpenAI-API-compatible.
 */

import OpenAI from "openai";
import type { LLMRequest, LLMResponse } from "../index.js";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error(
        "[DeepSeekProvider] DEEPSEEK_API_KEY is not set in environment."
      );
    }
    client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });
  }
  return client;
}

/**
 * Call DeepSeek with the given prompt and return a structured LLMResponse.
 * This is the ONLY function other agents should call — do not import OpenAI SDK directly elsewhere.
 */
export async function callDeepSeek(req: LLMRequest): Promise<LLMResponse> {
  const deepseek = getClient();
  const startMs = Date.now();

  const completion = await deepseek.chat.completions.create({
    model: req.model,
    messages: [
      { role: "system", content: req.systemPrompt },
      { role: "user",   content: req.userPrompt },
    ],
    max_tokens: req.maxTokens,
    temperature: req.temperature,
  });

  const latency_ms = Date.now() - startMs;
  const text = completion.choices[0]?.message?.content || "";

  const tokens_in = completion.usage?.prompt_tokens || 0;
  const tokens_out = completion.usage?.completion_tokens || 0;

  // DeepSeek pricing (standard DeepSeek-V3 pricing):
  // Input $0.00014 / 1K (cache miss), Output $0.00028 / 1K
  const INPUT_COST_PER_1K = 0.00014;
  const OUTPUT_COST_PER_1K = 0.00028;

  const cost_usd =
    ((tokens_in / 1000) * INPUT_COST_PER_1K) +
    ((tokens_out / 1000) * OUTPUT_COST_PER_1K);

  return {
    text,
    model: req.model,
    provider: "deepseek",
    tokens_in,
    tokens_out,
    cost_usd,
    latency_ms,
    fallback_used: false,
  };
}
