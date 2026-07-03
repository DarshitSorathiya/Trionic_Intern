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

import { ROUTER_CONFIG, DEFAULT_ROUTE_CONFIG, type ModelConfig, type StepRouteConfig, type ModelProvider } from "./router.config.js";
import { callClaude } from "./providers/claude.js";
import { callGemini } from "./providers/gemini.js";
import { callGPT } from "./providers/gpt.js";
import { callDeepSeek } from "./providers/deepseek.js";
import { CostCapTracker } from "./costCapTracker.js";

// ─── Public Types ─────────────────────────────────────────────────────────────

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

// Helper to wrap a promise with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number, errMsg: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errMsg));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

// ─── LLMRouter ───────────────────────────────────────────────────────────────

export class LLMRouter {
  /**
   * Resolve the StepRouteConfig for a given agent step.
   * Reads from ROUTER_CONFIG; falls back to DEFAULT_ROUTE_CONFIG.
   */
  resolve(step: string): StepRouteConfig {
    return ROUTER_CONFIG[step] ?? DEFAULT_ROUTE_CONFIG;
  }

  /**
   * Run a prompt through the LLM resolved for the given step.
   *
   * @param step       - Agent step name (e.g. "planner", "drafter").
   * @param systemPrompt - System / instruction prompt.
   * @param userPrompt   - The user-facing content or task for this step.
   * @returns LLMResponse with text, usage, cost, latency, provider, fallback_used.
   */
  async run(
    step: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<LLMResponse> {
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
    } catch (primaryErr: any) {
      console.warn(
        `[LLMRouter] Preferred model (${routeConfig.preferred.provider}/${routeConfig.preferred.model}) failed for step "${step}": ${primaryErr.message || primaryErr}.`
      );

      if (routeConfig.fallback) {
        console.warn(
          `[LLMRouter] Attempting fallback to model (${routeConfig.fallback.provider}/${routeConfig.fallback.model}) for step "${step}"...`
        );
        try {
          const response = await this.executeCall(routeConfig.fallback, systemPrompt, userPrompt, timeoutMs);
          return {
            ...response,
            provider: routeConfig.fallback.provider,
            fallback_used: true,
          };
        } catch (fallbackErr: any) {
          throw new Error(
            `[LLMRouter] Both preferred and fallback models failed for step "${step}". ` +
            `Primary error: ${primaryErr.message || primaryErr}. ` +
            `Fallback error: ${fallbackErr.message || fallbackErr}.`
          );
        }
      } else {
        throw primaryErr;
      }
    }
  }

  private async executeCall(
    config: ModelConfig,
    systemPrompt: string,
    userPrompt: string,
    timeoutMs: number
  ): Promise<Omit<LLMResponse, "provider" | "fallback_used">> {
    const req: LLMRequest = {
      model: config.model,
      systemPrompt,
      userPrompt,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    };

    const callPromise = (() => {
      switch (config.provider) {
        case "claude":
          return callClaude(req);
        case "gemini":
          return callGemini(req);
        case "gpt":
          return callGPT(req);
        case "deepseek":
          CostCapTracker.verifyUnderCap();
          return callDeepSeek(req).then((res) => {
            CostCapTracker.addCost(res.cost_usd);
            return res;
          });
        default:
          throw new Error(`[LLMRouter] Unknown provider: ${config.provider}`);
      }
    })();

    return withTimeout(
      callPromise,
      timeoutMs,
      `[LLMRouter] API call timed out after ${timeoutMs}ms`
    );
  }
}

/** Singleton router instance — import and use this everywhere. */
export const router = new LLMRouter();
