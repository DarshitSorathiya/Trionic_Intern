# RFC: Multi-Turn Conversation State Persistence

| Field          | Value                                                                  |
|----------------|------------------------------------------------------------------------|
| **RFC ID**     | RFC-memory-conversation-state                                          |
| **Author**     | Yatri Dungarani (`@yatri04`)                                           |
| **Team**       | Team C — Agent Layer                                                   |
| **Status**     | Draft — Open for Review                                                |
| **Created**    | 2026-06-01                                                             |
| **Issue**      | #39                                                                    |
| **Relates to** | `packages/agents/src/memory.ts`, `packages/agents/src/chain.ts`        |
| **Reviewers**  | Yug Umrania (tracing), Yug Gandhi (LLM Router), Malay Sheta (agents lead), Kirtan Patel (Team F evals) |

---

## 1. Summary

This RFC defines how multi-turn conversation state is persisted across agent calls in the Trionic Adalat pipeline. It covers:

- What fields live in **working memory** (ephemeral, in-flight) vs. **long-term memory** (persisted to Supabase).
- How memory is **scoped** — per-document, per-user, and cross-document boundaries.
- **PII containment rules** that ensure raw intake text never reaches downstream agents or storage after the first pass.
- **Replay semantics** to make eval runs fully reproducible for Team F.
- Integration points with **Yug Umrania's tracer** (`packages/agents/src/tracing`) and **Yug Gandhi's LLM Router** (`packages/agents/src/router`).

The implementation lives in [`packages/agents/src/memory.ts`](../packages/agents/src/memory.ts) and is consumed by [`packages/agents/src/chain.ts`](../packages/agents/src/chain.ts).

---

## 2. Background & Motivation

The agent pipeline (`Classifier → Planner → Drafter → Citator → Reviewer → Translator`) is invoked once per `POST /api/draft` call. A legal drafting session, however, is rarely one-shot:

1. The Citator-gatekeeper may **reject** a draft and the user retriggers the chain.
2. The user edits the intake text slightly (e.g., corrects a name) and re-requests a draft.
3. A reviewer asks for a **revision** — the Drafter is called again with the same plan.

Without persistence, every re-run re-classifies and re-plans from scratch — wasting LLM tokens and user time. With persisted conversation state, only the steps that actually changed need to re-run. Classifier and Planner outputs are cached; only the Drafter re-runs.

Additionally, **Team F (Evals)** needs to replay any run deterministically: given the same fixture input, the same agent steps must execute in the same order with the same cached vs. fresh decisions.

---

## 3. The `ConversationState` Type

`ConversationState` is the canonical shape of everything we persist per document. It lives in `packages/shared/src/types.ts`.

```typescript
// packages/shared/src/types.ts (to be added — requires repo manager review)
export type ConversationState = {
  /** Schema version for forward-compat migration. Start at 1; bump on breaking changes. */
  schema_version: 1;

  /** The document this state belongs to. Matches documents.id in Supabase. */
  document_id: string;

  /**
   * Monotonically increasing write counter.
   * Used for optimistic concurrency — save() rejects if stored version >= incoming version.
   */
  version: number;

  // ── Cached agent outputs ──────────────────────────────────────────────────

  /** Output of the Classifier agent. null until Classifier has run successfully. */
  last_classifier_output: ClassifierOutput | null;

  /** Output of the Planner agent. null until Planner has run successfully. */
  last_planner_output: PlannerOutput | null;

  /**
   * PageIndex node IDs retrieved during the most recent Drafter run.
   * Stored for audit / eval traceability only — NOT used to skip PageIndex re-runs.
   */
  retrieved_nodes: PageIndexNodeId[];

  /**
   * Draft version counter within this document's lifecycle.
   * Incremented by chain.ts after every successful Drafter + Citator pass.
   */
  current_draft_version: number;

  // ── Staleness detection ───────────────────────────────────────────────────

  /**
   * DJB2 hash of the intake text at the time the Classifier was last called.
   * If the new request's intake hash differs, cached Classifier/Planner outputs
   * are treated as stale and both steps re-run unconditionally.
   * NOT a cryptographic hash — used only for fast change detection.
   */
  intake_text_hash: string;

  // ── Bookkeeping ──────────────────────────────────────────────────────────

  /** ISO-8601 timestamp of the most recent save(). Stamped by Memory.save(). */
  updated_at: string;
};
```

> **Note on `ConversationState`:** The type is currently declared inline in `packages/agents/src/memory.ts` and imported as if it were already in `@trionic/shared`. The migration to `packages/shared/src/types.ts` is a pre-requisite for merging the Supabase store (see §6). Requires a PR reviewed by a repo manager (Dhruv / Sohil).

---

## 4. Working Memory vs. Long-Term Memory

### 4.1 Working Memory (ephemeral, in-process)

Working memory is the local state held by a single `runAgentChain()` invocation. It is **never persisted directly** — it's the live TypeScript object that gets checkpointed to long-term memory after each successful agent step.

| What lives here | Type | When it goes away |
|---|---|---|
| Current `ConversationState` object | `ConversationState` | End of the HTTP request / SSE stream |
| `intakeHash` of the current call | `string` | End of the HTTP request |
| Agent outputs in-flight (classifier result before save) | `ClassifierOutput`, `PlannerOutput`, … | After the successful `memory.save()` call |
| SSE stream generator state | generator frame | When the generator returns or throws |

Working memory is deliberately **stateless across requests**. There is no singleton, no module-level cache, no global Map that persists between HTTP calls. Each `runAgentChain()` call starts by loading state from the store.

### 4.2 Long-Term Memory (persisted)

Long-term memory is a serialized `ConversationState` JSON object stored in the backing `MemoryStore`. It is **keyed by `document_id`**.

| Field | When written | Why persisted |
|---|---|---|
| `last_classifier_output` | After Classifier succeeds | Avoid re-classifying on retry |
| `last_planner_output` | After Planner succeeds | Avoid re-planning on retry |
| `retrieved_nodes` | After Drafter completes | Audit trail / eval replay |
| `current_draft_version` | After each Drafter+Citator pass | Version counter for `DraftResponse.version_id` |
| `intake_text_hash` | On first run (with initial state) | Staleness detection |
| `version` | On every `memory.save()` | Optimistic concurrency |
| `updated_at` | Stamped by `memory.save()` | Debugging / dashboard freshness |

What is **never** persisted to long-term memory:

| What | Why |
|---|---|
| Raw `intake_text` | PII boundary — see §5 |
| LLM prompt strings | PII boundary — see §5 |
| Intermediate Drafter drafts (pre-Citator) | Storage cost; only final validated drafts go to `document_versions` |
| `AgentTrace` objects | Written directly to `agent_traces` table by the tracer, not memory |

### 4.3 Storage Backends

```
┌─────────────────────────────────────────────────────────────────┐
│  Memory API (packages/agents/src/memory.ts)                     │
│  load(documentId) / save(documentId, state) / clear(documentId) │
└────────────────────┬────────────────────────────────────────────┘
                     │ pluggable MemoryStore interface
          ┌──────────┴──────────┐
          ▼                     ▼
  InMemoryStore           SupabaseStore (Week 2)
  (dev / CI / demo)       documents.state JSONB column
  Map<string, state>      (migration #103 — @om-patel91)
```

The `MemoryStore` interface is:
```typescript
interface MemoryStore {
  get(documentId: string): Promise<ConversationState | null>;
  set(documentId: string, state: ConversationState): Promise<void>;
  delete(documentId: string): Promise<void>;
}
```

This lets us ship the API contract now (Week 1) while deferring the Supabase column to Week 2 without blocking any consumer.

---

## 5. Memory Scoping

### 5.1 Per-Document Scope (primary)

Every `ConversationState` is keyed exclusively by `document_id` (UUID). There is **no per-session key**, no cross-document merging, and no shared state between documents owned by the same user.

```
document A (doc-uuid-001) → ConversationState { ... }
document B (doc-uuid-002) → ConversationState { ... }  // completely independent
```

This maps directly to Supabase's `documents` table ownership model and the RLS policy (`documents: owner crud`) — no extra scoping layer is needed in memory.

### 5.2 Per-User Isolation

User isolation is enforced at **two layers**:

1. **MemoryStore layer:** The `SupabaseStore` executes all reads/writes using the `service_role` key but filters by `document_id`. Because the `documents` table enforces `owner_id = auth.uid()` via RLS, a document owned by user A can never be retrieved for user B.

2. **API layer (Team B):** `POST /api/draft` receives the authenticated user's JWT. The API creates the `document_id` via `POST /api/documents` — which enforces `owner_id = auth.uid()`. The `document_id` in the chain input therefore already implicitly carries the user identity.

> **Hard rule:** The `Memory` class itself does **not** receive a `user_id` parameter. User scoping is done at the DB layer (RLS), not in the memory module. This keeps memory logic simple and testable without auth setup.

### 5.3 Cross-Document Scope (explicitly out of scope — v1)

There is no cross-document memory in v1. Future use-cases (e.g., "user's preferred drafting tone learned across all their documents") are deferred to v2 and would require a separate `user_preferences` or `user_long_term_memory` table, not this module.

---

## 6. PII Containment Rules

Intake text (the user's legal problem description) frequently contains sensitive personal information: names, Aadhaar numbers, PAN cards, addresses, dates of birth, phone numbers, etc.

### 6.1 PII Flow Through the Pipeline

```
User → intake_text ──→ Classifier (ONLY here, raw)
                   ──→ Planner   (ONLY here, raw — last time)
                   ✗   Drafter   (receives PlannerOutput — structured, no raw PII)
                   ✗   Citator   (receives DocumentDraft — no raw PII)
                   ✗   Reviewer  (receives DocumentDraft — no raw PII)
                   ✗   Translator (receives DocumentDraft — no raw PII)
```

The PII boundary is enforced **structurally** in `chain.ts`: `intake_text` is passed only to `runClassifier()` and `runPlanner()`. All downstream agents receive structured outputs, not the raw string. This is a code-level constraint, not a configuration flag.

### 6.2 PII Rules for Memory

| Field | Rule |
|---|---|
| `intake_text` | **Never stored** in `ConversationState`. Only its DJB2 hash (`intake_text_hash`) is stored for staleness detection. |
| `last_classifier_output` | Stored — contains `domain`, `relevant_acts`, `confidence`, `reasoning`. No PII (the reasoning field is the classifier's interpretation, not a verbatim copy of intake). |
| `last_planner_output` | Stored — contains `document_type`, `template_id`, `pageindex_queries`, `applicable_acts`, `notes`. No PII. |
| `retrieved_nodes` | Stored — PageIndex node IDs only (`string[]`). No user data. |

### 6.3 PII Rules for Traces (Coordinate with Yug Umrania)

The tracer (`packages/agents/src/tracing/tracer.ts`) already implements `redactPII()` for Sentry logs. The `agent_traces` Supabase table stores `input_hash` (SHA-256 of the prompt) not the raw prompt — enforced by `RFC-versioning-audit-log.md` Hard Constraint #5.

**Action for Yug Umrania:** Confirm that the `buildTrace()` / `Tracer.start()` path **never** serializes raw prompt text into the `AgentTrace` object before persisting. The `AgentTrace` type in `packages/shared` has no prompt field — this is intentional.

### 6.4 Redaction on the `intake_text_hash`

The DJB2 hash stored in `ConversationState.intake_text_hash` is a non-cryptographic 8-hex-character value. It is sufficient for change detection, but:
- It is **not** suitable as a privacy-safe identifier (too short, collision-prone).
- It **cannot** be reversed to recover the intake text.

For eval fixtures (§7), raw intake text is replaced with a stable hash identifier. Fixture files in `packages/evals/fixtures/` must never contain real user data.

---

## 7. Replay Semantics for Evals (Team F)

Team F (Kirtan Patel) needs reproducible agent runs: given the same fixture, the same steps must run (or cache-hit) in the same order, with deterministic outcomes.

### 7.1 What "Replay" Means

A **replay run** is `runAgentChain()` invoked with a `memoryStore` pre-seeded with a specific `ConversationState`. The chain then reads that state and makes cache-hit / fresh decisions from it deterministically.

```typescript
// In packages/evals — how Team F seeds a replay:
const store = new InMemoryStore();
await store.set(fixture.document_id, fixture.initial_state); // seed from fixture

const events: AgentStreamEvent[] = [];
for await (const event of runAgentChain(fixture.chain_input, { memoryStore: store })) {
  events.push(event);
}
// assert events match fixture.expected_events
```

### 7.2 The Replay Fixture Format

Eval fixtures (stored in `packages/evals/fixtures/`) include the following fields to seed a replay:

```typescript
// packages/evals/src/types.ts (proposed)
export type ReplayFixture = {
  /** Stable ID for this fixture (not a real document UUID). */
  fixture_id: string;

  /** The chain input for this replay. intake_text contains synthetic, non-PII data. */
  chain_input: ChainInput;

  /**
   * Optional: pre-seeded ConversationState.
   * If provided, the chain starts from this state (simulates a resume run).
   * If null, the chain starts fresh (simulates a first-run).
   */
  initial_state: ConversationState | null;

  /**
   * Which agents are expected to be cache-hits (step.done with tokens=0)
   * vs. fresh runs (step.done with tokens>0) in this fixture.
   */
  expected_cache_hits: Array<"classifier" | "planner">;

  /**
   * The expected sequence of AgentStreamEvent types.
   * Used to assert ordering is stable across runs.
   */
  expected_event_sequence: AgentStreamEvent["type"][];
};
```

### 7.3 Determinism Guarantees

The memory module provides the following guarantees for replay:

| Guarantee | Mechanism |
|---|---|
| **Cache decisions are deterministic** | `isResume && state.last_classifier_output != null` is a pure boolean. Given the same `initial_state`, the same branch is always taken. |
| **No time-dependent cache invalidation** | There is no TTL on cached agent outputs. Staleness is driven only by `intake_text_hash` change. |
| **No model-selection variance in cache** | Cache hits emit `model: "cache"` traces with 0 tokens — the LLM Router is never called for cached steps. Confirmed via `persistCacheTrace()` in `chain.ts`. |
| **Version counter is deterministic** | `version` starts at 1 and increments by 1 per `memory.save()` call. Given the same number of steps, the final version is always the same. |

### 7.4 Coordination with Yug Gandhi (LLM Router)

For eval runs that do call the LLM Router (non-cached steps), reproducibility requires:

- **Model pinning**: The fixture must specify the exact `model` string expected. The LLM Router must expose a `forceModel` option (or the router config must be injectable) so evals can pin a specific model.
- **Mock/stub in CI**: All eval tests use `vi.mock()` for the router. No real LLM calls in CI. The router's `run()` function must be a named export (not inline) to be mockable.

**Open Question for Yug Gandhi:** Can `LLMRouter.run()` accept an optional `overrideModel?: string` parameter for eval pinning, or should evals swap out the router config entirely? Recommend the latter (inject a `TEST_ROUTER_CONFIG` with `model: "mock"`) to avoid leaking eval concerns into production router code.

---

## 8. Staleness Detection

### 8.1 Cache Invalidation Rule

Cached `last_classifier_output` and `last_planner_output` are **invalidated** (both steps re-run) if:

```
incoming_intake_hash !== stored_state.intake_text_hash
```

The check is performed implicitly: if the hash differs, `createInitialState()` produces a fresh state with `last_classifier_output: null` and `last_planner_output: null`, causing both steps to be treated as cache misses.

> **Current limitation (v1):** The hash comparison is not explicitly implemented in `chain.ts` today — the chain only checks `isResume && state.last_classifier_output !== null`. If a user changes their intake text and re-requests, the old classifier output would incorrectly be reused. This is a **known gap** that must be fixed before production.

**Action (Yatri):** Add hash-based invalidation to `runAgentChain()`:
```typescript
const intakeHash = hashIntakeText(intake_text);
const intakeChanged = state.intake_text_hash !== intakeHash;

// Invalidate cached outputs if intake changed
if (intakeChanged) {
  state = { ...state, last_classifier_output: null, last_planner_output: null, intake_text_hash: intakeHash };
}
```

### 8.2 Why Only Classifier & Planner Are Cached

| Agent | Cached? | Reason |
|---|---|---|
| Classifier | ✅ Yes | Pure function of intake text; expensive; deterministic |
| Planner | ✅ Yes | Pure function of classifier output + intake text; expensive |
| PageIndex retrieval | ❌ No | Fast, cheap, must always reflect current index snapshot |
| Drafter | ❌ No | Depends on PageIndex results which may have changed |
| Citator | ❌ No | Validation must be re-run on every new draft |
| Reviewer | ❌ No | Must re-review every new draft |
| Translator | ❌ No | Translates the final draft; must always reflect the latest |

---

## 9. Concurrency & Optimistic Locking

`Memory.save()` implements optimistic concurrency to prevent two concurrent `runAgentChain()` calls from corrupting the same document's state.

```
Run A (version 1) ──→ memory.save(doc-1, {version: 2})  ✅ (stored=1 < incoming=2)
Run B (version 1) ──→ memory.save(doc-1, {version: 2})  ❌ MemoryConflictError
                                                            (stored=2 >= incoming=2)
```

The caller (chain.ts) catches `MemoryConflictError`, re-loads the latest state, and retries (not yet implemented — Week 2 item).

In the `SupabaseStore`, this maps to a `UPDATE ... WHERE version = $expected RETURNING *` pattern, using Postgres's atomic update semantics to prevent races at the DB level.

---

## 10. Integration Points

### 10.1 With Yug Umrania (Tracing)

- **Dependency:** `chain.ts` calls `persistTrace()` for cache-hit steps with `model: "cache"`, 0 tokens. The tracer must handle this sentinel value without dividing by zero or producing negative costs.
- **Action for Yug Umrania:** Confirm `buildTrace()` handles `model: "cache"` / `tokens_in: 0` / `cost_usd: 0` gracefully. No special case should be needed since it's just zeroes, but verify the dashboard doesn't filter out zero-cost rows.
- **Trace field alignment:** `AgentTrace.session_id` is populated from `ChainInput.session_id` in both real and cache traces. This ensures Team F can group traces by session for per-document cost analysis.

### 10.2 With Yug Gandhi (LLM Router)

- **Dependency:** When a step is a cache-hit, the LLM Router is **never called**. The `session_id` is still passed to `persistCacheTrace()` so the trace row exists for audit.
- **Router config injection for evals:** See §7.4 above.
- **Fallback model recording:** When the router uses a fallback model (`fallback_used: true`), the `AgentTrace.model` field records the fallback model name, not the preferred model. This is correctly handled by the router's `LLMResponse.model` field. No changes needed to memory.

### 10.3 With Team B (API Layer)

- **Contract:** Team B creates the document via `POST /api/documents` and passes the resulting `document_id` to `runAgentChain()`. Memory is keyed on this ID. Team B must not call `memory.clear()` while a chain run is in flight.
- **State column migration (#103):** When the Supabase `documents.state JSONB` column lands (from @om-patel91), Team B must ensure the column has `DEFAULT NULL` and is not included in the `INSERT` payload for new documents.

---

## 11. What "Done" Looks Like (Acceptance Criteria)

### Week 1 (Current — scaffold)
- [x] `Memory` class with `InMemoryStore` ships — load/save/clear with optimistic concurrency.
- [x] `createInitialState()` and `hashIntakeText()` helpers.
- [x] `runAgentChain()` consumes `Memory` — cache-hit for classifier/planner on resume.
- [x] Unit tests: round-trip, version conflict, clear, hash stability (`memory.test.ts`).

### Week 2 (Next — production store + gap fixes)
- [ ] `SupabaseStore` implemented and wired behind a `NODE_ENV=production` guard (requires migration #103).
- [ ] Hash-based staleness invalidation added to `chain.ts` (§8.1).
- [ ] `MemoryConflictError` retry loop added to `chain.ts`.
- [ ] `ConversationState` type moved to `packages/shared/src/types.ts` (repo manager review required).
- [ ] Eval `ReplayFixture` type defined in `packages/evals/src/types.ts`.
- [ ] At least one replay fixture demonstrating cache-hit for classifier+planner (`rti-english-resume-001.json`).

---

## 12. Open Questions

1. **`ConversationState` in shared types:** Moving the type to `packages/shared` requires a repo manager PR review. Can we do this in Week 1, or does it wait for the Supabase column to be confirmed?
   - Tag: @Dhruv5353 / @Sohil2085

2. **Supabase `documents.state` column — migration #103:** Is this column confirmed in the migration plan? The `RFC-supabase-schema-rls.md` does not include it in the `documents` table definition. If it is missing, we need a follow-up migration `0010_documents_state_column.sql`.
   - Tag: @om-patel91

3. **Cache invalidation on partial intake changes:** Currently, any change to the intake text (even fixing a typo) invalidates both Classifier and Planner caches. Should we be smarter (e.g., only re-run classifier if the legal domain seems to have changed)? Proposal: keep it simple for v1 — full invalidation on any hash mismatch.
   - Tag: @malaysheta

4. **LLM Router eval model pinning:** Should `LLMRouter.run()` accept `overrideModel` for eval fixtures, or should evals inject an alternate router config? (See §7.4.)
   - Tag: @YugGandhi

5. **Cache-hit trace visibility for Team F:** Cache-hit traces are written with `model: "cache"` and 0 tokens. Does Team F's eval harness (§5 of `RFC-evals-citation-correctness-harness.md`) need to explicitly filter these out, or should they be included in cost/latency aggregations?
   - Tag: @KirtanPatel18

6. **`clear()` lifecycle — when is it called?** Currently `clear()` is documented for "archive / export / cleanup" but is not wired to any API trigger. Should `POST /api/documents/:id/archive` call `memory.clear()`? Or should the state be retained for audit trail purposes even after archiving?
   - Tag: @om-patel91 (Backend), @malaysheta

---

## 13. Out of Scope (this RFC)

- Case-law / vector-RAG memory (v2 — not in v1 scope).
- Cross-user or team-level shared memory.
- Memory for agents outside the `runAgentChain()` pipeline (e.g., standalone export).
- Prompt caching at the LLM provider level (Anthropic prompt caching, Gemini context caching) — separate performance RFC.
- User-facing "conversation history" UI (Team A / Team B).

---

*Last updated: 2026-06-01 — Yatri Dungarani*
*Next review: Week 2 sync with Yug Umrania (tracing), Yug Gandhi (router), and @om-patel91 (Supabase migration #103)*
