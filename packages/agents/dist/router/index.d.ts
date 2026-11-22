/**
 * router/index.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * The LLM Router is the single point through which ALL agent LLM calls flow.
 * Agents never import provider SDKs directly — they call `router.run(step, prompt)`.
 *
 * Week 1 status:
 *   ✅ Claude — FUNCTIONAL (needs ANTHROPIC_API_KEY)
 *   🔲 Gemini — STUBBED
 *   🔲 GPT    — STUBBED
 */
import { type StepRouteConfig, type ModelProvider } from "./router.config.js";
/** Input to any provider call — the common contract. */
export interface LLMRequest {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    maxTokens: number;
    temperature: number;
}
/** Output from any provider call — the common contract. */
export interface LLMResponse {
    /** The raw text completion returned by the model. */
    text: string;
    /** Fully-qualified model string actually used. */
    model: string;
    /** The provider actually used ("claude" | "gemini" | "gpt"). */
    provider: ModelProvider;
    /** Prompt tokens consumed. */
    tokens_in: number;
    /** Completion tokens produced. */
    tokens_out: number;
    /** Estimated cost in USD. */
    cost_usd: number;
    /** Wall-clock latency of the API call in ms. */
    latency_ms: number;
    /** Whether the fallback model was utilized. */
    fallback_used: boolean;
}
export declare class LLMRouter {
    /**
     * Resolve the StepRouteConfig for a given agent step.
     * Reads from ROUTER_CONFIG; falls back to DEFAULT_ROUTE_CONFIG.
     */
    resolve(step: string): StepRouteConfig;
    /**
     * Run a prompt through the LLM resolved for the given step.
     *
     * @param step       - Agent step name (e.g. "planner", "drafter").
     * @param systemPrompt - System / instruction prompt.
     * @param userPrompt   - The user-facing content or task for this step.
     * @returns LLMResponse with text, usage, cost, latency, provider, fallback_used.
     */
    run(step: string, systemPrompt: string, userPrompt: string): Promise<LLMResponse>;
    private executeCall;
}
/** Singleton router instance — import and use this everywhere. */
export declare const router: LLMRouter;
//# sourceMappingURL=index.d.ts.map