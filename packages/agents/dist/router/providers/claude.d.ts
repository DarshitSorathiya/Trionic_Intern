/**
 * providers/claude.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Claude (Anthropic) provider — FUNCTIONAL in Week 1.
 * Requires ANTHROPIC_API_KEY in environment.
 */
import type { LLMRequest, LLMResponse } from "../index.js";
/**
 * Call Claude with the given prompt and return a structured LLMResponse.
 * This is the ONLY function other agents should call — do not import Anthropic SDK elsewhere.
 */
export declare function callClaude(req: LLMRequest): Promise<LLMResponse>;
//# sourceMappingURL=claude.d.ts.map