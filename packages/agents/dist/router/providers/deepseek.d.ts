/**
 * providers/deepseek.ts
 * Owner: Yug Gandhi (LLM Router) & Jenil Sutariya
 *
 * DeepSeek provider — FUNCTIONAL in Week 3.
 * Requires DEEPSEEK_API_KEY in environment.
 * DeepSeek is fully OpenAI-API-compatible.
 */
import type { LLMRequest, LLMResponse } from "../index.js";
/**
 * Call DeepSeek with the given prompt and return a structured LLMResponse.
 * This is the ONLY function other agents should call — do not import OpenAI SDK directly elsewhere.
 */
export declare function callDeepSeek(req: LLMRequest): Promise<LLMResponse>;
//# sourceMappingURL=deepseek.d.ts.map