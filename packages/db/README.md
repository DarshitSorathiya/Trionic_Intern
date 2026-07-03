# `packages/db` — Supabase schema & types

Postgres schema (via Supabase), Row-Level-Security policies, migrations, and generated TypeScript types.

## Team

**Owner:** Team B — Backend
**Lead:** Om Patel

| Module | Owner |
|---|---|
| Schema + RLS policies | Om Patel |
| Document storage + PDF/DOCX export API | Harsh Korat |
| Agent invocation API + streaming | Prashant Gangani |
| Versioning + audit log API | Aayush Tilva |

(Note: API routes physically live in `apps/web/app/api/` but Team B owns them.)

## Hard rule

**No Supabase table goes live without a tested RLS policy.** Om is the gate. PRs adding tables without RLS will be rejected.

## Tables (initial sketch — finalize in Week-1 RFC)

- `users` (extends Supabase auth.users via trigger)
- `documents` — drafts, status, language, owner
- `document_versions` — every save is a version (redline source)
- `agent_traces` — every agent call, with model, tokens, cost, citations, latency
- `citations` — PageIndex node references attached to document spans
- `pageindex_trees` — versioned trees per act
- `pageindex_nodes` — leaf storage (might also be a separate table per act)
- `eval_runs` — Team F's eval outputs

## Setup (Week 1)

Bootstrapped via Om's Week-1 scaffold PR. Schema RFC due end of Week 1.
