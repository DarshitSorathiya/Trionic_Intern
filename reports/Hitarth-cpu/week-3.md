# Week 3 — Hitarth Sherathia

**Team:** Team C — Agent Layer  
**Module owned:** Citator-Gatekeeper Agent (`packages/agents/src/citator`)  
**GitHub:** @Hitarth-cpu  
**Week of:** 2026-06-01 to 2026-06-05

---

## What I shipped this week

**Citator-Gatekeeper Agent (Issue #86) — anti-hallucination gate.**

The Citator validates every `[CITE:<node_id>]` marker in the Drafter's output against the live PageIndex tree before the draft is allowed to proceed. No real citation → no real document.

### Core logic (`packages/agents/src/citator/index.ts`)

- **Rule 1 — Invalid node = rejection:** Every `[CITE:<node_id>]` is resolved via `pageindex.get_text(node_id)`. A `NodeNotFoundError` (404) is a rejection — no exceptions.
- **Rule 2 — No citations = rejection:** A draft with zero `[CITE:...]` markers is rejected outright in strict mode. A legal claim without citation has no place in this system.
- **`--strict` flag:** `strict: true` is the default (production). `strict: false` disables the no-citation rejection for local dev testing only.
- **`CitatorVerdict` shape:** Returns the canonical `CitatorVerdict` from `@trionic/shared` — `approved`, `rejected_spans` (with `reason` and `message`), and `resolved_citations`.
- **Chain integration:** On rejection `approved: false` + `rejected_spans` are populated → `runAgentChain` emits `step.error` from `"citator"` → Prashant's route sets document `status = "failed"`.
- **Trace always persisted:** Every run (pass or fail) writes an `AgentTrace` via the tracing layer.

### Tests (`packages/agents/src/citator/citator.test.ts`)

All 3 required acceptance criteria from the issue pass, plus 5 additional robustness cases:

| # | Description | Result |
|---|---|---|
| 1 | Valid draft, all real markers → `approved: true`, `resolved_citations` populated | ✓ |
| 2 | Draft with `[CITE:FAKE-ACT/S-99]` → `approved: false`, exact span identified | ✓ |
| 3 | Draft with no markers at all → `approved: false` (strict mode) | ✓ |
| 4 | Mixed valid + fake citations → all bad spans surfaced | ✓ |
| 5 | `strict: false` bypasses the no-citation rejection (dev mode) | ✓ |
| 6 | Unexpected PageIndex error propagates (not swallowed as a rejection) | ✓ |
| 7 | `CitatorGatekeeperAgent` class delegates + inherits options correctly | ✓ |
| 8 | Trace is always persisted regardless of outcome | ✓ |

**8 / 8 tests passing.**

## Demo

```typescript
// Test 1 — all real markers → approved
const result = await runCitator({ draft: validDraft });
// result.approved === true
// result.resolved_citations.length === 1 (with real snapshot_id from PageIndex)

// Test 2 — fake marker → rejected with exact span
const result = await runCitator({ draft: draftWithFakeCite });
// result.approved === false
// result.rejected_spans[0] = [start, end]  ← exact character offsets
// result.verdict.rejected_spans[0].reason === "invalid_node"
// result.verdict.rejected_spans[0].message contains "FAKE-ACT/S-99"

// Test 3 — no markers → rejected (strict mode default)
const result = await runCitator({ draft: noCiteDraft });
// result.approved === false
// result.verdict.rejected_spans[0].reason === "no_citation"

// Dev testing — turn off strict mode
const result = await runCitator({ draft: noCiteDraft, options: { strict: false } });
// result.approved === true  (nothing to reject)
```

## Metrics

| Metric | Value |
|---|---|
| Tests passing | 8 / 8 |
| Validation rules enforced | 2 (invalid node, no citations) |
| `--strict` flag | implemented |
| `CitatorVerdict` shape | fully implemented per `@trionic/shared` |
| Chain integration | `step.error` on rejection, `draft.final` blocked |

## Blockers

None. Mocked `pageindex.get_text` and `tracing.persistTrace` cleanly isolated the agent from I/O during testing.

## Dependencies

- **Depends on:** `@jenil-sutariya` (Drafter `extractCitations` — already available in `drafter/citations.ts`), `@Samarth305` (PageIndex `get_text` real responses via `@trionic/pageindex`)
- **Depended on by:** Backend route (`POST /api/draft`) — sets `status = "failed"` on `step.error` from `"citator"`

## Next week

- Wire `CitatorGatekeeperAgent` into integration testing against real PageIndex data once Samarth's live Supabase tree is fully populated.
- Confirm the `step.error → status: "failed"` path is exercised in the end-to-end vertical slice demo.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> _<repo manager writes 1 line here>_
