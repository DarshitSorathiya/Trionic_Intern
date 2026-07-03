# Week 2 Report — Yatri Dungarani

**GitHub handle:** @yatri04  
**Team:** C — Agent Layer  
**Week:** 2 (starting 2026-05-26 cont.)  
**Date submitted:** 2026-06-01  

---

## What I shipped

### 1. `ConversationState` added to `@trionic/shared/types.ts`

The type now lives in the locked shared contract (PR-reviewed as per rule). Fields:
- `schema_version`, `document_id`, `version` — identity + optimistic concurrency
- `last_classifier_output`, `last_planner_output` — cached agent outputs (null = not yet run)
- `retrieved_nodes`, `current_draft_version` — audit trail
- `intake_text_hash` — staleness key
- `updated_at` — bookkeeping

Previously the type was an inline shim in `memory.ts`. Now all packages import from `@trionic/shared`.

### 2. `SupabaseStore` implemented in `packages/agents/src/memory.ts`

Uncommented and activated. Reads/writes the `documents.state JSONB` column (migration #103 by @om-patel91). Uses `supabase: any` to avoid version-coupling. Waiting on Om's migration to flip to production.

### 3. Intake-hash staleness detection in `chain.ts`

Previously, if a user changed their intake text and re-requested a draft, the old classifier/planner outputs would silently be reused — a correctness bug. Fixed:

```typescript
} else if (state.intake_text_hash !== intakeHash) {
  // Intake changed → invalidate cached classifier + planner
  state = { ...state, last_classifier_output: null, last_planner_output: null, intake_text_hash: intakeHash };
}
```

### 4. `MemoryConflictError` retry loop in `chain.ts`

Added `saveWithRetry()` helper — catches `MemoryConflictError`, reloads fresh state, re-applies the field update via a merge callback, retries once. Applied at every `memory.save()` call site in the chain.

### 5. Tests — 137 passing (up from 122)

New tests added:
- `memory.test.ts`: 3 staleness-detection tests (different hash → different text, same hash → same text, minor edit → different hash)
- `chain.test.ts`: Test 11 — changed intake text triggers fresh classifier+planner run; Test 12 — identical intake uses cache and gets `tokens: 0`

---

## Metrics

| Metric | Value |
|---|---|
| Total tests passing | 137 / 137 |
| New tests added this week | 5 |
| Agents where cache now works correctly | 2 (Classifier, Planner) |
| Known correctness bugs fixed | 1 (staleness check) |
| Estimated token savings on retry (same intake) | ~1,600–2,000 tokens per re-run |

---

## Demo gate

**Scenario:** Run `runAgentChain` twice on the same `document_id` with the **same intake text**. Second run shows `step.done` with `tokens: 0` for classifier and planner — cache hit confirmed by Test 12 in `chain.test.ts`.

**Scenario:** Run twice with **different intake text**. Second run shows real token counts for classifier and planner — staleness correctly detected by Test 11.

---

## Blockers / open items

1. **`documents.state JSONB` column (migration #103)** — `SupabaseStore` is live code but can't be wired to production until Om's migration lands. Still shipping `InMemoryStore` as the default.

2. **`SupabaseStore` integration test** — can't write an integration test against real Supabase until the column exists. Placeholder for Week 3.

---

## Plan for Week 3

- [ ] Wire `SupabaseStore` once migration #103 lands — one-line change in `chain.ts` default.
- [ ] Add `SupabaseStore` integration test (mock Supabase client).
- [ ] Coordinate with Team F (Kirtan) on `ReplayFixture` type for eval replay.
- [ ] Coordinate with Yug Gandhi on LLM Router model-pinning for eval fixtures.

---

## Coordination this week

- Confirmed `SupabaseStore` shape with @om-patel91 — he's aware the `state JSONB` column needs to land before the store goes live.
- Reviewed `RFC-llm-router.md` (Yug Gandhi) — `LLMResponse.model` correctly records fallback model name; no changes needed to memory layer.
- `redactPII()` in tracer confirmed safe — `AgentTrace` has no prompt field; no raw intake ever reaches the trace.

---

*Mentor feedback (to be filled by repo manager):*
