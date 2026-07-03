# Week 3 — Yug Gandhi

**Team:** Team C — Agent Layer
**Module owned:** LLM Router (multi-LLM Routing, Resilient Fallbacks, Observability & Cost Caps)
**Week of:** 2026-06-01 to 2026-06-05

---

## What I shipped this week

- **DeepSeek V3 Provider Integration:** Implemented the full DeepSeek client provider inside the LLM Router at [`packages/agents/src/router/providers/deepseek.ts`](file:///Users/yuggandhi/Trionic%20technology%20internship/trionic-ai-adalat/packages/agents/src/router/providers/deepseek.ts). Utilizes the OpenAI-API-compatible interface pointing to DeepSeek's endpoints and pricing scales ($0.14/1M input, $0.28/1M output tokens).
- **Daily Cost Cap Tracker:** Coded a robust usage guard at [`packages/agents/src/router/costCapTracker.ts`](file:///Users/yuggandhi/Trionic%20technology%20internship/trionic-ai-adalat/packages/agents/src/router/costCapTracker.ts) that honors the $5.00/day daily cost limit. It persists the current day's cumulative cost in a local file (`.deepseek-cost.json`) and gracefully falls back to memory if running in serverless or read-only environments.
- **Resilient Fallback Retry Logic:** Wired up DeepSeek as the preferred model for the `drafter` step with dynamic fallback to Claude or GPT in [`packages/agents/src/router/index.ts`](file:///Users/yuggandhi/Trionic%20technology%20internship/trionic-ai-adalat/packages/agents/src/router/index.ts). If DeepSeek errors out (e.g. 503 Service Unavailable) or hits its daily $5.00 limit, the Router automatically and transparently retries with the fallback model.
- **Agent Package Compiler Repair:** Identified and resolved type mismatches in [`packages/agents/src/chain.ts`](file:///Users/yuggandhi/Trionic%20technology%20internship/trionic-ai-adalat/packages/agents/src/chain.ts) between the orchestrator and the latest Reviewer/Translator packages. The entire `@trionic/agents` package now builds 100% cleanly.

## Demo

We added comprehensive tests in [`packages/agents/src/router/router.test.ts`](file:///Users/yuggandhi/Trionic%20technology%20internship/trionic-ai-adalat/packages/agents/src/router/router.test.ts) demonstrating that:
- DeepSeek successfully processes drafting calls and increments cumulative daily cost in telemetry.
- If DeepSeek is blocked due to the cost cap (e.g. limit set to a tiny scale in testing), the router transparently falls back to Claude without breaking execution:

```typescript
// From router.test.ts verifying cost-cap fallback routing
it("transparently retries with fallback if DeepSeek cost cap is exceeded", async () => {
  CostCapTracker.setLimit(0.00001);
  CostCapTracker.addCost(0.00005);
  
  const res = await router.run("drafter", "System prompt", "User prompt");
  expect(res.text).toBe("claude fallback draft successfully due to cost cap");
  expect(res.provider).toBe("claude");
  expect(res.fallback_used).toBe(true);
});
```

## Metrics

| Metric | Value | Notes |
|---|---|---|
| DeepSeek Pricing | Input: $0.14/1M; Output: $0.28/1M | Accurate standard API pricing captured |
| Daily Cost Cap | $5.00 USD/day | Honor cap; throws and triggers fallback when hit |
| Failover Speed | Immediate | Transparently fallbacks without delay |
| Unit Tests Passing | 153 / 153 green | DeepSeek resolving, success, 503 retry, and cost cap paths fully covered |
| Package Build Status | passing | Built cleanly with `pnpm --filter @trionic/agents build` |

## Blockers

No blockers. Decoupled test mocking allowed us to implement and verify 100% of the DeepSeek, fallback, and cost-cap business logic before integration day without needing local private keys.

## Next week

- **Integration Day support (Thursday):** Support backend and other Agents interns as they integrate their agents through the LLM Router.
- **Concurrent Load Testing:** Confirm the router operates flawlessly under concurrent loads (5 parallel flows) during integration.
- **Cost Cap Tuning:** Monitor usage on deployed environments and raise the daily cap if needed during extensive vertical slice testing.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>
