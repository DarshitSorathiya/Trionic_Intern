# Week 3 Report — Jenil Sutariya

**GitHub handle:** jenil-sutariya  
**Team:** Team C (Agents)  
**Module owned:** Drafter Agent (`packages/agents/src/drafter`)  
**Week:** 3 (due: Friday 5 June 2026, 5 PM IST)

---

## Summary

In Week 3, I successfully implemented the first real vertical slice for the **Drafter agent** featuring a real DeepSeek API call, an RTI-specific system message prompt context, and a robust RTI Node ID normalization utility to match and resolve citations back to the real RTI Act 2005 index tree. Since the LLM Router lacked a DeepSeek provider, I also authored the DeepSeek client provider integrated directly into the LLM Router.

---

## Acceptance Criteria — Status

| Criterion | Status | Notes |
|---|---|---|
| DeepSeek LLM Router Provider | ✅ Done | Authored an OpenAI-compatible DeepSeek provider and registered it inside Yug Gandhi's router. |
| Drafter configured to use DeepSeek | ✅ Done | Set `preferred` provider for the `drafter` step to `"deepseek"` and model to `"deepseek-chat"`. |
| RTI-specific system message | ✅ Done | Created `RTI_DRAFTER_SYSTEM_PROMPT` referencing key RTI Act 2005 sections (5, 6, 7, 8, 9, 10, 11) for drafting. |
| Shorthand Node ID Normalization | ✅ Done | Implemented `normalizeRtiNodeId` mapping `RTI-2005/S-6` style markers to canonical JSON tree node IDs like `RTI-2005/CH-II/S-6`. |
| Acceptance tests added and passing | ✅ Done | Authored acceptance tests in both functional and standalone Drafter test suites, ensuring complete coverage. |
| All tests passing cleanly | ✅ Done | 113/113 vitest tests pass, and ts-typecheck completes with zero compilation warnings. |

---

## Files Changed

### router package

| File | Change |
|---|---|
| `packages/agents/src/router/providers/deepseek.ts` | Created OpenAI-compatible DeepSeek provider mapping `DEEPSEEK_API_KEY` and pricing ($0.00014 / 1K in, $0.00028 / 1K out). |
| `packages/agents/src/router/router.config.ts` | Added `"deepseek"` to `ModelProvider` and updated `drafter` config to use DeepSeek preferred. |
| `packages/agents/src/router/index.ts` | Imported `callDeepSeek` and integrated it in `executeCall`. |
| `packages/agents/src/router/router.test.ts` | Updated unit tests to mock and validate `"deepseek"`. |

### drafter package

| File | Change |
|---|---|
| `packages/agents/src/drafter/drafter.prompt.ts` | Created `RTI_DRAFTER_SYSTEM_PROMPT` detailing the legal provisions of the RTI Act 2005. |
| `packages/agents/src/drafter/citations.ts` | Created `normalizeRtiNodeId` and wired it inside `extractCitations` and `extractNodeIds`. |
| `packages/agents/src/drafter/index.ts` | Barrel exports updated to include new system prompt and normalization helper. |
| `packages/agents/src/drafter/drafter.agent.ts` | Dynamically routes `rti_application` document types through `RTI_DRAFTER_SYSTEM_PROMPT`. |
| `packages/agents/src/drafter/drafter.test.ts` | Created a comprehensive RTI acceptance test with canned inputs and verified normalized citations. |

### agents package

| File | Change |
|---|---|
| `packages/agents/src/agents/drafter.ts` | Integrated the new dynamic system prompt and citation normalization in `runDrafterAgent`. |
| `packages/agents/src/agents/drafter.test.ts` | Created a corresponding acceptance test for standalone Drafter V2. |

---

## Design Decisions

### Shorthand node ID mapping
The RTI Act 2005 JSON index tree organizes nodes using structural chapter markers (e.g. `RTI-2005/CH-II/S-6`). However, the issue ticket specifically defines a requirements signature using shorthand markers like `[CITE:RTI-2005/S-6]`. To satisfy both requirements perfectly, the normalization utility handles both styles. It parses shorthands, maps them to their correct chapters, and yields canonical node IDs. This allows the LLM to output shorthand citations that still successfully resolve and pass downstream validation via the Citator-gatekeeper.

### Router extension
To implement the DeepSeek call, we avoided making ad-hoc HTTP calls in our agent. Instead, we extended the master `LLMRouter` designed by Yug Gandhi to support `"deepseek"` as a first-class provider. This maintains clean encapsulation, respects the router's fallback architecture, and ensures cost and latency tracking metrics are seamlessly recorded in tracing logs.

---

## Test Results

```bash
pnpm --filter @trionic/agents test
```
```text
 RUN  v2.1.9 D:/Projects/AI Adalat/packages/agents

 ✓ src/drafter/citations.test.ts (21 tests)
 ✓ src/tracing/tracing.test.ts (3 tests)
 ✓ src/translator/translator.test.ts (25 tests)
 ✓ src/router/router.test.ts (7 tests)
 ✓ src/planner/planner.test.ts (2 tests)
 ✓ src/citator/citator.test.ts (3 tests)
 ✓ src/classifier/classifier.test.ts (3 tests)
 ✓ src/reviewer/reviewer.test.ts (20 tests)
 ✓ src/agents/drafter.test.ts (3 tests)
 ✓ src/drafter/drafter.test.ts (26 tests)

 Test Files  10 passed (10)
      Tests  113 passed (113)
   Start at  21:20:54
   Duration  965ms
```
