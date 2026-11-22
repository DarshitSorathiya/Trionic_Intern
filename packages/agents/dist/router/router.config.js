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
/** Shared Claude fallback model string. */
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
exports.ROUTER_CONFIG = {
    classifier: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 512,
            temperature: 0.1,
        },
        fallback: {
            provider: "claude",
            model: CLAUDE_MODEL,
            maxTokens: 512,
            temperature: 0.1,
        },
    },
    planner: {
        // DeepSeek is the only provider we run in practice; Claude stays as a
        // documented resilience fallback for when a key is available.
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 1024,
            temperature: 0.2,
        },
        fallback: {
            provider: "claude",
            model: CLAUDE_MODEL,
            maxTokens: 1024,
            temperature: 0.2,
        },
    },
    drafter: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 4096,
            temperature: 0.3,
        },
        fallback: {
            provider: "claude",
            model: CLAUDE_MODEL,
            maxTokens: 4096,
            temperature: 0.3,
        },
    },
    citator: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 512,
            temperature: 0.0,
        },
        fallback: {
            provider: "claude",
            model: CLAUDE_MODEL,
            maxTokens: 512,
            temperature: 0.0,
        },
    },
    reviewer: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 1024,
            temperature: 0.2,
        },
        fallback: {
            provider: "claude",
            model: CLAUDE_MODEL,
            maxTokens: 1024,
            temperature: 0.2,
        },
    },
    translator: {
        preferred: {
            provider: "deepseek",
            model: "deepseek-chat",
            maxTokens: 2048,
            temperature: 0.1,
        },
        fallback: {
            provider: "claude",
            model: CLAUDE_MODEL,
            maxTokens: 2048,
            temperature: 0.1,
        },
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
    fallback: {
        provider: "claude",
        model: CLAUDE_MODEL,
        maxTokens: 1024,
        temperature: 0.2,
    },
};
//# sourceMappingURL=router.config.js.map