/**
 * Groq provider — OpenAI-compatible chat completions API.
 * Requires GROQ_API_KEY in the server environment.
 */

import OpenAI from "openai";
import type { LLMRequest, LLMResponse } from "../index.js";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("[GroqProvider] GROQ_API_KEY is not set in environment.");
    }
    client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
  }
  return client;
}

export async function callGroq(req: LLMRequest): Promise<LLMResponse> {
  const groq = getClient();
  const startMs = Date.now();

  const completion = await groq.chat.completions.create({
    model: req.model,
    messages: [
      { role: "system", content: req.systemPrompt },
      { role: "user", content: req.userPrompt },
    ],
    max_tokens: req.maxTokens,
    temperature: req.temperature,
  });

  const latency_ms = Date.now() - startMs;
  const tokens_in = completion.usage?.prompt_tokens || 0;
  const tokens_out = completion.usage?.completion_tokens || 0;

  return {
    text: completion.choices[0]?.message?.content || "",
    model: req.model,
    provider: "groq",
    tokens_in,
    tokens_out,
    cost_usd: 0,
    latency_ms,
    fallback_used: false,
  };
}