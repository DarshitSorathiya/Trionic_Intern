# Week 3 — Yug Umrania

**Team:** Agents
**Module owned:** Tracing / observability layer (`packages/agents/src/tracing/`)
**Week of:** 2026-06-02

---

## What I shipped this week

- Wired real Supabase persistence into `persistTrace()` — [PR #214](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/214)
  - Replaced Week-2 `console.log` stub with real Supabase service-role client insert
  - Mapped `AgentTrace` fields to correct DB column names (`agent_name`, `model_name`, `prompt_tokens`, `completion_tokens`)
  - `cited_nodes`, `session_id`, `timestamp` stored in `metadata` JSONB column
  - Added `try/catch` so trace failures never crash the agent pipeline
  - PII redaction via `redactPII()` before any error goes to Sentry
  - Used direct `createClient()` approach while `packages/db` workspace registration is pending (@om-patel91)
  - Commented on #103 flagging missing `package.json` in `packages/db`

## Demo

[Demo Video for Week 3](https://www.loom.com/share/12aa567bafa54c21953eccfdc055e0fc)

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Files changed | 2 | `tracer.ts`, `index.ts` |
| DB columns mapped | 9 | `user_id`, `document_id`, `agent_name`, `model_name`, `prompt_tokens`, `completion_tokens`, `cost_usd`, `latency_ms`, `status` |
| PII patterns covered | 6 | Aadhaar, PAN, phone, email, DOB, card numbers |
| CI status | ✅ Passing | lint + typecheck + tests all green |
| Tracing tests passing | 3/3 | `src/tracing/tracing.test.ts` all green |
| Supabase table | ✅ Exists | `agent_traces` — Om's migration #103 landed |

## Blockers

- `packages/db` has no `package.json` so `@trionic/db` is not registered as a workspace package. Worked around by using direct `createClient()` from `@supabase/supabase-js`. Flagged to @om-patel91.
- `SUPABASE_SERVICE_ROLE_KEY` not available locally — service role key is server-only per `docs/INTERN_ACCESS.md`. End-to-end test will happen via deployed preview on Integration Day (Thu 7-9 PM IST).
- `parent_trace_id` still not in `AgentTrace` shared type — requested from repo managers. Nested call linking pending approval.

## Next week

- Add `parent_trace_id` to `persistTrace()` once repo managers approve the shared type change
- Replace direct `createClient()` with `import { supabaseAdmin } from "@trionic/db"` once `packages/db` package.json is fixed
- Write 2-3 integration tests that hit real Supabase to catch column mismatches early
- Support @AayushTilva4 and @Ayush5112006 with any questions on `agent_traces` row shape

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>