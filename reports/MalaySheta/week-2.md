# Week 2 Report — Malay Sheta

**GitHub handle:** MalaySheta  
**Role:** Agents Lead (Team C)  
**Week:** 2 (due: Friday 29 May 2026, 5 PM IST)

---

## Summary

Delivered the two core Week-2 deliverables for the agents package:

1. **`PlannerAgent` skeleton** — `packages/agents/src/agents/planner.ts`  
2. **`runAgentChain` orchestrator** — `packages/agents/src/orchestrator.ts`  
   Exported from the package barrel at `packages/agents/src/index.ts`.

---

## Acceptance Criteria — Status

| Criterion | Status |
|---|---|
| `PlannerAgent` exported from `packages/agents/src/agents/planner.ts` | ✅ Done |
| `runAgentChain(req: DraftRequest): AsyncIterable<AgentStreamEvent>` exported from `packages/agents/src/index.ts` | ✅ Done |
| Each agent call emits `step.start` + `step.done` events | ✅ Done |
| All types imported from `@trionic/shared` — none redefined | ✅ Done |
| Demo gate: Node REPL loop prints all 5 agents in order | ✅ Done |

---

## Files Changed (agents package only)

### New Files

| File | Purpose |
|---|---|
| `packages/agents/src/agents/planner.ts` | W2 `PlannerAgent` skeleton — accepts `ClassifierOutput`, returns `PlannerOutput`. Stubs LLM call with a canned plan keyed by `LegalDomain`. |
| `packages/agents/src/orchestrator.ts` | `runAgentChain` — async-iterable orchestrator wiring all 6 agent steps + PageIndex retrieval. Emits `AgentStreamEvent` per the shared contract. |
| `packages/agents/smoke-test.mjs` | Demo-gate script — runs the full chain against a canned consumer-complaint request and asserts all 5 agents fire in order. |

### Modified Files

| File | Change |
|---|---|
| `packages/agents/src/index.ts` | Added exports: `PlannerAgentV2`, `runPlannerAgent`, `PlannerInputV2`, `PlannerResultV2`, `runAgentChain`. |

---

## Design Decisions

### Canned-plan stub (PlannerAgent)

The W2 planner bypasses the LLM router and returns a deterministic `PlannerOutput` keyed on `ClassifierOutput.domain`. This lets the full chain run end-to-end without any API key. Every domain (`consumer`, `criminal`, `contract`, `administrative`, `civil`, `labour`, `family`, `constitutional`, `other`) has a tailored plan with real act codes and PageIndex query strings.

Swapping in a live LLM call requires only replacing the body of the private `callPlannerLLM()` function — the rest of the agent is unchanged.

### Graceful fallbacks in `runAgentChain`

Because Classifier, Drafter, Citator, Reviewer, and Translator are still stubs owned by other interns, the orchestrator catches their `throw new Error("... not yet implemented")` and falls back gracefully, emitting a `step.done` (with zero tokens) instead of aborting the chain. A `warnings[]` array on the final `DraftResponse` surfaces exactly which agents fell back. This means:

- The demo gate passes today without any other intern's code being merged.
- As each agent goes live, the fallback is automatically bypassed — no changes needed to the orchestrator.

### Translator is conditional

The Translator step only runs when `target_language !== "en"`. This matches the API contract ("optionally Translator") and avoids a redundant stub call for English-only requests.

### Event contract

Every agent emits exactly:
```
step.start  →  (agent work)  →  step.done
```
On failure: `step.error` is emitted and the chain returns immediately (the backend sets document status to `failed`).

The Drafter additionally emits `draft.partial` with the full markdown chunk. The Planner's PageIndex retrieval emits `citation.emitted` for each retrieved node.

---

## Demo Gate Output

```
======= runAgentChain smoke-test =======

▶  [step.start]  agent=classifier
✅ [step.done]   agent=classifier  duration_ms=1   tokens=120
▶  [step.start]  agent=planner
✅ [step.done]   agent=planner     duration_ms=88  tokens=425
🔗 [citation.emitted]  node_id=STUB-NODE-1
🔗 [citation.emitted]  node_id=STUB-NODE-2
🔗 [citation.emitted]  node_id=STUB-NODE-3
▶  [step.start]  agent=drafter
📝 [draft.partial]  chunk_len=264 chars
✅ [step.done]   agent=drafter     duration_ms=29  tokens=0
▶  [step.start]  agent=citator
✅ [step.done]   agent=citator     duration_ms=1   tokens=0
▶  [step.start]  agent=reviewer
✅ [step.done]   agent=reviewer    duration_ms=0   tokens=0
🏁 [draft.final]  document_id=demo-doc-001

Agent firing order: classifier → planner → drafter → citator → reviewer

Demo gate: ✅ PASS — all 5 agents fired
```

---

## Test Results

```
Test Files  9 passed (9)
Tests      61 passed (61)   ← zero regressions
```

Run with: `pnpm --filter @trionic/agents test`

---

## Inter-team Handoffs

| Team | What they get |
|---|---|
| **Backend (Prashant)** | `runAgentChain(req: DraftRequest): AsyncIterable<AgentStreamEvent>` — import from `@trionic/agents` and pipe straight to the SSE stream. |
| **Classifier (Kathan)** | `ClassifierInput` / `ClassifierResult` interface is unchanged. When `runClassifier()` stops throwing, the orchestrator automatically picks it up. |
| **Drafter (Jenil)** | `DrafterInput` / `DrafterResult` interface is unchanged. Orchestrator calls `runDrafter({ plan, intakeText, session_id })`. |
| **Citator (Hitarth)** | `CitatorInput` / `CitatorResult` unchanged. Orchestrator calls `runCitator({ draft, session_id })`. |
| **Reviewer (Evan)** | `ReviewerInput` / `ReviewerResult` unchanged. Orchestrator calls `runReviewer({ draft, session_id })`. |
| **Translator (Maharshi)** | `TranslatorInput` / `TranslatorResult` unchanged. Only called when `target_language !== "en"`. |
| **PageIndex (Samarth)** | Stub calls `pageindex.search()` — replace `runPageIndexRetrieval()` body in `orchestrator.ts` with real Agno tool calls when the tool surface is ready. |

---

## Week-3 TODOs (not in scope for W2)

- Replace `callPlannerLLM()` stub with real `router.run("planner", ...)` call
- Wire real `pageindex.search()` inside `runPageIndexRetrieval()`
- Wire `persistTrace()` to Supabase in `packages/agents/src/tracing/index.ts`
