"use strict";
/**
 * router.config.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Maps each agent step to its preferred LLM provider + model.
 * Change the values here to reroute any agent to a different model —
 * no code changes required in the agents themselves.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROUTE_CONFIG = exports.ROUTER_CONFIG = void 0;
/**
 * Step-to-model routing table.
 * Key = agent step name (matches agent.ts export names).
 * Value = step route config for that step (preferred + fallback).
 */
function fallbackChain(maxTokens, temperature) {
    return [
        {
            provider: "groq",
            model: "openai/gpt-oss-120b",
            maxTokens,
            temperature,
        },
        {
            provider: "gemini",
            model: "gemini-3.8-flash",
            maxTokens,
            temperature,
        },
    ];
}
exports.ROUTER_CONFIG = {
    classifier: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 512,
            temperature: 0.1,
        },
        fallbacks: fallbackChain(512, 0.1),
    },
    planner: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 1024,
            temperature: 0.2,
        },
        fallbacks: fallbackChain(1024, 0.2),
    },
    drafter: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 4096,
            temperature: 0.3,
        },
        fallbacks: fallbackChain(4096, 0.3),
    },
    citator: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 512,
            temperature: 0.0,
        },
        fallbacks: fallbackChain(512, 0.0),
    },
    reviewer: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 1024,
            temperature: 0.2,
        },
        fallbacks: fallbackChain(1024, 0.2),
    },
    translator: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 2048,
            temperature: 0.1,
        },
        fallbacks: fallbackChain(2048, 0.1),
    },
};
/** Default config used if a step is not found in ROUTER_CONFIG. */
exports.DEFAULT_ROUTE_CONFIG = {
    preferred: {
        provider: "deepseek",
        model: "deepseek-chat",
        maxTokens: 1024,
        temperature: 0.2,
    },
    fallbacks: fallbackChain(1024, 0.2),
};
//# sourceMappingURL=router.config.js.map