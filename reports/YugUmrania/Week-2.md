# Week 2 — Yug Umrania

**Team:** Agents
**Module owned:** Tracing / observability layer (`packages/agents/src/tracing/`)
**Week of:** 2026-05-25 - 2026-05-29

---

## What I shipped this week

- Implemented `Tracer` class with `Tracer.start()` and `handle.end()` API — [PR #133](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/#133)
  - `Tracer.start(agent, session_id)` records start time and returns a `TraceHandle`
  - `handle.end({ llmResponse, cited_nodes, status })` calculates real latency and returns a complete `AgentTrace`
  - Added `redactPII()` function — scrubs Aadhaar, PAN, phone, email, DOB, card numbers before Sentry logging
  - Added `TraceHandle` and `EndOptions` interfaces
  - Updated `persistTrace()` with try/catch error handling and PII-safe Sentry logging
  - Supabase insert stubbed and ready to wire when `@trionic/db` is available (Week 3)
  - All exports available from `packages/agents/src/tracing/index.ts`
  - Imports `AgentTrace` from `@trionic/shared` — no type redefinition

## Demo

[Building the Tracer Observability Module](https://www.loom.com/share/d1cd5f2569be4cb386bfdd248cb295b3)

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Files changed | 2 | `tracer.ts`, `index.ts` |
| New functions added | 4 | `Tracer.start()`, `handle.end()`, `redactPII()`, updated `persistTrace()` |
| PII patterns covered | 6 | Aadhaar, PAN, phone, email, DOB, card numbers |
| Tracing tests passing | 3/3 | `src/tracing/tracing.test.ts` all green |
| CI status | ✅ Passing | 3 unrelated test failures in other team's stubs |

## Blockers

- `parent_trace_id` field is not yet in `AgentTrace` type in `@trionic/shared` — commented on issue requesting repo manager to add it. Nested call linking will be completed once the type is updated.
- `@trionic/db` package not yet available from Team B — Supabase insert is stubbed and ready to wire in Week 3.
- 3 CI test failures in `classifier`, `reviewer`, `translator` test files — these are empty stubs owned by other team members (@KathanPurohit, @EvanGregor, @Maharshi309), not related to tracing module.

## Next week

- Wire real Supabase service-role client into `persistTrace()` once `@trionic/db` is available from Team B
- Add `parent_trace_id` to `AgentTrace` type once approved by repo manager and implement nested call linking
- Write additional tests for `redactPII()` covering all 6 PII patterns
- Support other agents in integrating `Tracer.start/end` into their flows

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>