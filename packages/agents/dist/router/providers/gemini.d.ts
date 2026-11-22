/**
 * providers/gemini.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Gemini (Google) provider — FUNCTIONAL in Week 2.
 * Requires GOOGLE_API_KEY in environment.
 */
import type { LLMRequest, LLMResponse } from "../index.js";
/**
 * Call Gemini with the given prompt and return a structured LLMResponse.
 * This is the ONLY function other agents should call — do not import GoogleGenerativeAI SDK elsewhere.
 */
export declare function callGemini(req: LLMRequest): Promise<LLMResponse>;
//# sourceMappingURL=gemini.d.ts.map