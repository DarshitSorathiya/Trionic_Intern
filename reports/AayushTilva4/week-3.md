# Week 3 — Aayush Tilva

**Team:** B — Backend  
**Module owned:** Versioning + Audit Log API  
**Week of:** 2026-06-02

---

## What I shipped this week

- Re-implemented all 3 routes against the real Supabase schema from migration #163 (no mocks):
  - `PATCH /api/documents/{id}` — creates `DocumentVersion` on every edit, `version_num` auto-increments, updates `documents.current_version_id` (PR: _link here_)
  - `GET /api/documents/{id}/versions` — returns version history from real `document_versions` table ordered by `version_num ASC`
  - `GET /api/audit/{document_id}` — returns `AgentTrace[]` mapped from real `agent_traces` columns to `@trionic/shared` type
- Added integration tests (`apps/web/app/api/documents/__tests__/versioning.test.ts`) covering happy path + auth + error cases for all 3 routes using a mock Supabase client (same vitest pattern as `memory.supabase.test.ts`)
- Added vitest to `apps/web` devDependencies and `test`/`test:watch` scripts
- Resolved merge conflict in `lib/supabase/server.ts` from Week 2 PR — both `createClient()` (main) and `createSupabaseServerClient()` (our branch) now exported from the same function

## Demo

_60-second Loom: [link to be added for Friday 5 PM IST Demo Day]_

Manual test sequence (demo gate from Issue #171):

```bash
# 1. Start dev server (talks to real Supabase via .env.local)
pnpm dev

# 2. PATCH three times
curl -X PATCH http://localhost:3000/api/documents/doc-001 \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"body_markdown":"RTI draft — edit 1"}'

curl -X PATCH http://localhost:3000/api/documents/doc-001 \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"body_markdown":"RTI draft — edit 2"}'

curl -X PATCH http://localhost:3000/api/documents/doc-001 \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"body_markdown":"RTI draft — edit 3"}'

# 3. Check versions — 3 rows in ascending order
curl http://localhost:3000/api/documents/doc-001/versions \
  -H "Cookie: <session-cookie>"

# 4. Check audit trail after a Drafter run
curl http://localhost:3000/api/audit/doc-001 \
  -H "Cookie: <session-cookie>"
```

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Routes implemented | 3 | PATCH + GET versions + GET audit |
| Integration tests written | 9 | happy path + 401 + 400 + 404 for all 3 routes |
| Schema dependencies resolved | 2 | migration #163 (Om), tracer writes #114 (Umrania) |
| Merge conflicts | 0 | branched fresh from main |

## Blockers

- Need a live Supabase session cookie + real `document_id` to run the full manual demo gate (`/api/audit/{id}` showing real traces after a Drafter run depends on Umrania's tracer being active)
- Integration Day (Thu Jun 4) sync with Frontend to confirm session cookie format for API calls

## Next week

- Wire real document flow end-to-end: Frontend PATCH → versions endpoint → audit endpoint shows real traces
- Add test fixture for a 3-edit sequence asserting version_nums are 1, 2, 3 in strict order
- Coordinate with Team F (Kirtan) — confirm `/api/audit` response shape matches their eval pipeline

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> _repo manager writes 1 line here_
