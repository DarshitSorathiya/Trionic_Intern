/**
 * providers/gpt.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * GPT (OpenAI) provider — FUNCTIONAL in Week 2.
 * Requires OPENAI_API_KEY in environment.
 */
import type { LLMRequest, LLMResponse } from "../index.js";
/**
 * Call GPT with the given prompt and return a structured LLMResponse.
 * This is the ONLY function other agents should call — do not import OpenAI SDK elsewhere.
 */
export declare function callGPT(req: LLMRequest): Promise<LLMResponse>;
//# sourceMappingURL=gpt.d.ts.map