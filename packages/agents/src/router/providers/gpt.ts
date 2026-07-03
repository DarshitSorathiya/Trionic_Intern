/**
 * providers/gpt.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * GPT (OpenAI) provider — FUNCTIONAL in Week 2.
 * Requires OPENAI_API_KEY in environment.
 */

import OpenAI from "openai";
import type { LLMRequest, LLMResponse } from "../index.js";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "[GPTProvider] OPENAI_API_KEY is not set in environment."
      );
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

/**
 * Call GPT with the given prompt and return a structured LLMResponse.
 * This is the ONLY function other agents should call — do not import OpenAI SDK elsewhere.
 */
export async function callGPT(req: LLMRequest): Promise<LLMResponse> {
  const openai = getClient();
  const startMs = Date.now();

  const completion = await openai.chat.completions.create({
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

  // GPT pricing (as of May 2026)
  // gpt-4o: Input $0.0025 / 1K, Output $0.010 / 1K
  // gpt-4o-mini: Input $0.00015 / 1K, Output $0.0006 / 1K
  const isMini = req.model.toLowerCase().includes("mini");
  const INPUT_COST_PER_1K = isMini ? 0.00015 : 0.0025;
  const OUTPUT_COST_PER_1K = isMini ? 0.0006 : 0.010;

  const cost_usd =
    ((tokens_in / 1000) * INPUT_COST_PER_1K) +
    ((tokens_out / 1000) * OUTPUT_COST_PER_1K);

  return {
    text,
    model: req.model,
    provider: "gpt",
    tokens_in,
    tokens_out,
    cost_usd,
    latency_ms,
    fallback_used: false,
  };
}
