"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.LLMRouter = void 0;
const router_config_js_1 = require("./router.config.js");
const claude_js_1 = require("./providers/claude.js");
const gemini_js_1 = require("./providers/gemini.js");
const gpt_js_1 = require("./providers/gpt.js");
const deepseek_js_1 = require("./providers/deepseek.js");
const groq_js_1 = require("./providers/groq.js");
const costCapTracker_js_1 = require("./costCapTracker.js");
// Helper to wrap a promise with a timeout
function withTimeout(promise, ms, errMsg) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(errMsg));
        }, ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutId);
    });
}
// ─── LLMRouter ───────────────────────────────────────────────────────────────
class LLMRouter {
    /**
     * Resolve the StepRouteConfig for a given agent step.
     * Reads from ROUTER_CONFIG; falls back to DEFAULT_ROUTE_CONFIG.
     */
    resolve(step) {
        return router_config_js_1.ROUTER_CONFIG[step] ?? router_config_js_1.DEFAULT_ROUTE_CONFIG;
    }
    /**
     * Run a prompt through the LLM resolved for the given step.
     *
     * @param step       - Agent step name (e.g. "planner", "drafter").
     * @param systemPrompt - System / instruction prompt.
     * @param userPrompt   - The user-facing content or task for this step.
     * @returns LLMResponse with text, usage, cost, latency, provider, fallback_used.
     */
    async run(step, systemPrompt, userPrompt) {
        const routeConfig = this.resolve(step);
        // 12s for classifier & reviewer; 25s for others
        const timeoutMs = (step === "classifier" || step === "reviewer") ? 12000 : 25000;
        try {
            const response = await this.executeCall(routeConfig.preferred, systemPrompt, userPrompt, timeoutMs);
            return {
                ...response,
                provider: routeConfig.preferred.provider,
                fallback_used: false,
            };
        }
        catch (primaryErr) {
            console.warn(`[LLMRouter] Preferred model (${routeConfig.preferred.provider}/${routeConfig.preferred.model}) failed for step "${step}": ${primaryErr.message || primaryErr}.`);
            const failures = [`Primary error: ${primaryErr.message || primaryErr}`];
            for (const fallback of routeConfig.fallbacks ?? []) {
                console.warn(`[LLMRouter] Attempting fallback to model (${fallback.provider}/${fallback.model}) for step "${step}"...`);
                try {
                    const response = await this.executeCall(fallback, systemPrompt, userPrompt, timeoutMs);
                    return {
                        ...response,
                        provider: fallback.provider,
                        fallback_used: true,
                    };
                }
                catch (fallbackErr) {
                    failures.push(`${fallback.provider} error: ${fallbackErr.message || fallbackErr}`);
                }
            }
            if (!routeConfig.fallbacks?.length)
                throw primaryErr;
            throw new Error(`[LLMRouter] Preferred and all fallback models failed for step "${step}". ${failures.join(". ")}.`);
        }
    }
    async executeCall(config, systemPrompt, userPrompt, timeoutMs) {
        const req = {
            model: config.model,
            systemPrompt,
            userPrompt,
            maxTokens: config.maxTokens,
            temperature: config.temperature,
        };
        const callPromise = (() => {
            switch (config.provider) {
                case "claude":
                    return (0, claude_js_1.callClaude)(req);
                case "gemini":
                    return (0, gemini_js_1.callGemini)(req);
                case "gpt":
                    return (0, gpt_js_1.callGPT)(req);
                case "deepseek":
                    costCapTracker_js_1.CostCapTracker.verifyUnderCap();
                    return (0, deepseek_js_1.callDeepSeek)(req).then((res) => {
                        costCapTracker_js_1.CostCapTracker.addCost(res.cost_usd);
                        return res;
                    });
                case "groq":
                    return (0, groq_js_1.callGroq)(req);
                default:
                    throw new Error(`[LLMRouter] Unknown provider: ${config.provider}`);
            }
        })();
        return withTimeout(callPromise, timeoutMs, `[LLMRouter] API call timed out after ${timeoutMs}ms`);
    }
}
exports.LLMRouter = LLMRouter;
/** Singleton router instance — import and use this everywhere. */
exports.router = new LLMRouter();
//# sourceMappingURL=index.js.map