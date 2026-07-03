/**
 * providers/claude.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Claude (Anthropic) provider — FUNCTIONAL in Week 1.
 * Requires ANTHROPIC_API_KEY in environment.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { LLMRequest, LLMResponse } from "../index.js";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "[ClaudeProvider] ANTHROPIC_API_KEY is not set in environment."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Call Claude with the given prompt and return a structured LLMResponse.
 * This is the ONLY function other agents should call — do not import Anthropic SDK elsewhere.
 */
export async function callClaude(req: LLMRequest): Promise<LLMResponse> {
  const anthropic = getClient();
  const startMs = Date.now();

  const message = await anthropic.messages.create({
    model: req.model,
    max_tokens: req.maxTokens,
    temperature: req.temperature,
    system: req.systemPrompt,
    messages: [{ role: "user", content: req.userPrompt }],
  });

  const latency_ms = Date.now() - startMs;
  const content = message.content[0];
  const text = content.type === "text" ? content.text : "";

  // Anthropic pricing (approximate) — update as models change
  const INPUT_COST_PER_1K = 0.003;   // $3 per 1M input tokens
  const OUTPUT_COST_PER_1K = 0.015;  // $15 per 1M output tokens
  const cost_usd =
    ((message.usage.input_tokens / 1000) * INPUT_COST_PER_1K) +
    ((message.usage.output_tokens / 1000) * OUTPUT_COST_PER_1K);

  return {
    text,
    model: req.model,
    provider: "claude",
    tokens_in: message.usage.input_tokens,
    tokens_out: message.usage.output_tokens,
    cost_usd,
    latency_ms,
    fallback_used: false,
  };

}
