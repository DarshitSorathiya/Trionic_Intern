# RFC: LLM Router (Multi-LLM Routing & Fault-Tolerant Fallbacks)

| Field        | Value                                       |
|--------------|---------------------------------------------|
| **RFC ID**   | RFC-llm-router                              |
| **Author**   | Yug Gandhi (`@YugGandhi`)                   |
| **Team**     | Team C — Agent Layer (Owner)                |
| **Status**   | Draft — Open for Review                     |
| **Created**  | 2026-05-19                                  |
| **Relates to** | `packages/agents/src/router`, `packages/agents/src/tracing` |

---

## 1. Summary

This RFC defines the design and implementation specifications for the **LLM Router** in the Agent Layer (`packages/agents`). The LLM Router is the single, centralized gateway through which **all** LLM calls made by downstream agents (Classifier, Planner, Drafter, Citator-gatekeeper, Reviewer, Translator) must flow. 

The router is responsible for:
1. **Dynamic Step-to-Model Routing:** Resolving a step's preferred LLM configuration from a centralized `ROUTER_CONFIG` table.
2. **Resilience & Fallback Handling:** Intercepting request failures (timeouts, rate limits, API key exhaustion) on preferred models and seamlessly routing the prompt to a secondary **fallback model** without breaking the user session.
3. **Telemetry & Cost Instrumentation:** Measuring wall-clock API latency, tracking token usage (input/output), estimating per-call cost in USD, and surfacing these metrics to the agent trace log (`agent_traces` table).

---

## 2. Background & Motivation

In a complex multi-agent system like Trionic Adalat, individual agents have vastly different requirements:
- **The Classifier agent** needs low latency and cost to categorize user queries (e.g., Gemini 1.5 Flash).
- **The Drafter agent** needs deep reasoning and high instruction compliance to draft precise legal notices (e.g., Claude 3.5 Sonnet).
- **The Translator agent** needs strong multilingual capabilities and glossary adherence.

Hardcoding provider SDKs (Anthropic, OpenAI, Google) inside individual agent implementations creates severe coupling, makes model upgrades tedious, and lacks uniform error-handling, retry, or tracing behaviors.

Furthermore, relying on a single provider introduces a single point of failure. If Anthropic experiences downtime or rate-limiting during peak usage, the entire legal drafting assistant crashes.

### 2.1 Key Objectives
- **Decoupling:** Agents invoke `router.run("drafter", systemPrompt, userPrompt)`. They do not know or care which provider is behind it.
- **Centralized Config:** Rerouting an agent is a one-line config change in `router.config.ts`.
- **High Availability:** If the preferred provider fails, the router automatically attempts execution on a pre-configured fallback model from a different provider.
- **Cost & Performance Evals:** Estimating the exact cost and latency of every call and feeding it directly to Team F's evaluation dashboard via the trace table.

---

## 3. Architecture & Data Model

### 3.1 Step Routing Table Schema
We extend `packages/agents/src/router/router.config.ts` to support both `preferred` and `fallback` model configurations per agent step:

```typescript
export type ModelProvider = "claude" | "gemini" | "gpt";

export interface ModelConfig {
  /** Which provider to use. */
  provider: ModelProvider;
  /** Exact model string to pass to the provider SDK (e.g., "claude-3-5-sonnet-20241022"). */
  model: string;
  /** Max tokens for the completion. */
  maxTokens: number;
  /** Temperature (0 = deterministic, 1 = creative). Legal drafts want low temp. */
  temperature: number;
}

export interface StepRouteConfig {
  /** The primary model that should handle this step under normal circumstances. */
  preferred: ModelConfig;
  /** The backup model to call if the primary model fails. */
  fallback?: ModelConfig;
}
```

### 3.2 Public Methods & Payload Interfaces
The `LLMRouter` class in `packages/agents/src/router/index.ts` exposes the following:

```typescript
export interface LLMRequest {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
}

export interface LLMResponse {
  /** The raw text completion returned by the model. */
  text: string;
  /** Fully-qualified model string *actually* used (helps identify if fallback took over). */
  model: string;
  /** The provider *actually* used ("claude" | "gemini" | "gpt"). */
  provider: ModelProvider;
  /** Prompt tokens consumed. */
  tokens_in: number;
  /** Completion tokens produced. */
  tokens_out: number;
  /** Estimated cost in USD, calculated dynamically based on model rates. */
  cost_usd: number;
  /** Wall-clock latency of the successful API call in ms. */
  latency_ms: number;
  /** Whether the fallback model was utilized. */
  fallback_used: boolean;
}
```

---

## 4. Proposed Step-to-Model Routing Configuration

The proposed configuration is optimized to balance cost, performance, and cross-provider resilience:

```typescript
export const ROUTER_CONFIG: Record<string, StepRouteConfig> = {
  classifier: {
    preferred: {
      provider: "gemini",
      model: "gemini-1.5-flash", // Fast, low-latency classification
      maxTokens: 512,
      temperature: 0.1,
    },
    fallback: {
      provider: "gpt",
      model: "gpt-4o-mini", // Cost-effective GPT fallback
      maxTokens: 512,
      temperature: 0.1,
    }
  },
  planner: {
    preferred: {
      provider: "claude",
      model: "claude-3-5-sonnet-20241022", // Highly logical structure mapping
      maxTokens: 1024,
      temperature: 0.2,
    },
    fallback: {
      provider: "gemini",
      model: "gemini-1.5-pro",
      maxTokens: 1024,
      temperature: 0.2,
    }
  },
  drafter: {
    preferred: {
      provider: "claude",
      model: "claude-3-5-sonnet-20241022", // Unbeatable legal drafting and instruction following
      maxTokens: 4096,
      temperature: 0.3,
    },
    fallback: {
      provider: "gpt",
      model: "gpt-4o",
      maxTokens: 4096,
      temperature: 0.3,
    }
  },
  citator: {
    preferred: {
      provider: "claude",
      model: "claude-3-5-sonnet-20241022",
      maxTokens: 512,
      temperature: 0.0,
    },
    fallback: {
      provider: "gemini",
      model: "gemini-1.5-pro",
      maxTokens: 512,
      temperature: 0.0,
    }
  },
  reviewer: {
    preferred: {
      provider: "gemini",
      model: "gemini-1.5-pro",
      maxTokens: 1024,
      temperature: 0.2,
    },
    fallback: {
      provider: "gpt",
      model: "gpt-4o",
      maxTokens: 1024,
      temperature: 0.2,
    }
  },
  translator: {
    preferred: {
      provider: "gemini",
      model: "gemini-1.5-pro", // Excellent multilingual performance
      maxTokens: 2048,
      temperature: 0.1,
    },
    fallback: {
      provider: "gpt",
      model: "gpt-4o",
      maxTokens: 2048,
      temperature: 0.1,
    }
  }
};
```

---

## 5. Fallback Handling & Resilience Algorithm

When `router.run(step, systemPrompt, userPrompt)` is invoked, it executes the following resilience flowchart:

```
                    [ router.run(step) ]
                             │
                             ▼
              [ Resolve Step Route Config ]
                             │
                             ▼
             [ Try Primary (Preferred) Model ]
                             │
            ┌────────────────┴────────────────┐
            ▼ (Success)                       ▼ (Failure / Exception)
    [ Return LLMResponse ]             [ Log Warning: Primary Failed ]
                                              │
                                              ▼
                                    [ Has Fallback Config? ]
                                     ┌────────┴────────┐
                                     ▼ (Yes)           ▼ (No)
                         [ Try Fallback Model ]     [ Throw Original Error ]
                                     │
                    ┌────────────────┴────────────────┐
                    ▼ (Success)                       ▼ (Failure)
             [ Return LLMResponse ]           [ Throw Cumulative Error ]
            (fallback_used = true)
```

### 5.1 Dynamic Timeout
To ensure that a slow primary provider does not delay the user interface indefinitely before falling back, each provider invocation will implement a strict timeout (e.g., **12 seconds** for classification/review, **25 seconds** for long-form drafting). If the timeout is reached, it is caught as an error, triggerring the fallback.

---

## 6. Cost & Latency Estimation Specification

To surface accurate data to the `agent_traces` table, the router maintains a strict pricing map in USD per 1,000 (1K) tokens. 

### 6.1 Token Pricing Matrix (as of May 2026)

| Model String | Input Cost (per 1K tokens) | Output Cost (per 1K tokens) |
|---|---|---|
| `claude-3-5-sonnet-20241022` | $0.00300 | $0.01500 |
| `gemini-1.5-pro` | $0.00125 | $0.00500 |
| `gemini-1.5-flash` | $0.000075 | $0.00030 |
| `gpt-4o` | $0.00250 | $0.01000 |
| `gpt-4o-mini` | $0.00015 | $0.00060 |

### 6.2 Cost Calculation
The estimated USD cost is calculated inside each provider's wrapper:

$$\text{cost\_usd} = \left(\frac{\text{tokens\_in}}{1000} \times \text{Input Cost per 1K}\right) + \left(\frac{\text{tokens\_out}}{1000} \times \text{Output Cost per 1K}\right)$$

### 6.3 Latency Measurement
Latency is measured via monotonic high-resolution timers (`Date.now()`) surrounding only the actual API call, excluding application-side routing overhead:

```typescript
const startMs = Date.now();
const response = await sdk.call();
const latency_ms = Date.now() - startMs;
```

---

## 7. Trace Instrumentation

When the `router.run` method completes, the returned `LLMResponse` is structured to match the downstream contracts. In `packages/agents/src/tracing/tracer.ts`, the `buildTrace` function receives this data.

The trace schema proposed in **RFC-2026-001** aligns perfectly:
- `model_id` $\leftarrow$ `LLMResponse.model` (reveals the fallback model if fallback occurred).
- `token_input` $\leftarrow$ `LLMResponse.tokens_in`
- `token_output` $\leftarrow$ `LLMResponse.tokens_out`
- `duration_ms` $\leftarrow$ `LLMResponse.latency_ms`
- `metadata` $\leftarrow$ `{ fallback_used: LLMResponse.fallback_used, preferred_model: config.preferred.model }`

This allows Team F (Evals & Telemetry) to query the database and generate real-time metrics showing:
1. Average cost and latency per agent step.
2. The frequency of fallback events per provider.
3. Total billing estimations across Anthropic, Google, and OpenAI accounts.

---

## 8. Open Questions

1. **How do we handle rate-limiting headers?** Should the Anthropic fallback trigger immediately upon detecting `429 Too Many Requests`, or should we perform an exponential backoff retry first?
2. **What if the fallback model also fails?** Should there be a tertiary "ultra-cheap/always-up" fallback (like `gemini-1.5-flash` or `gpt-4o-mini` for all steps)?
3. **API Key Security:** Do we restrict key access to the router modules, ensuring no other codebase part can read `process.env.ANTHROPIC_API_KEY`, `process.env.GEMINI_API_KEY`, or `process.env.OPENAI_API_KEY`?

---

## 9. Acceptance Criteria (What "Done" Looks Like)

- [ ] `packages/agents/src/router/router.config.ts` structured with separate `preferred` and `fallback` configurations.
- [ ] `LLMRouter.run()` successfully catches primary provider exceptions and executes fallback.
- [ ] If fallback is triggered, `fallback_used` is logged as `true` and the fallback `model` name is surfaced.
- [ ] Wall-clock latency `latency_ms` and calculated `cost_usd` are populated for Claude, Gemini, and GPT calls.
- [ ] unit tests pass verifying fallback routing on mock/stub failures.
- [ ] Standardized tracing logs display correct model name, inputs, outputs, cost, and duration.
