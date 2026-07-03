# Week 4 — Parth Jayeshbhai Thakkar

**Team:** team-evals (Team F)
**Module owned:** Usage Analytics Dashboard (`apps/web/app/[locale]/admin/analytics/page.tsx`)
**Week of:** 2026-06-12

---

## What I shipped this week

- Extended cohort usage analytics dashboard with W4 per-doc-type features — [PR #329](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/329) open on main
  - Doc-type popularity now shows counts AND % of total
  - Language distribution per doc-type (top 3 doc types with language breakdown)
  - Conversion funnel — Created → Generated → Exported → Shared with drop-off % between each stage
  - Per-act citation frequency — fixed citations query to use correct column `pageindex_node_id`
  - Date range filter — Last 7 days / Last 30 days / All time (affects all cells)
  - Migrated dashboard to `/[locale]/admin/analytics` for next-intl locale routing
  - Used `packages/shared/src/types.ts` as source of truth for `DocumentType`
  - Verified real Supabase connection via Network tab — `documents` and `citations` tables return HTTP 200
  - Mock fallback preserved when DB returns 0 rows

## Demo

[Cohort Usage Analytics Dashboard — Week 4 Walkthrough](https://www.loom.com/share/0305431fd8034d62be09f0bb6c1daa5b)

## Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| New cells added | 3 | Language per doc-type, conversion funnel, date range filter |
| Existing cells enhanced | 2 | Doc-type popularity (+ % column), citation frequency (fixed column name) |
| Date range options | 3 | Last 7 days, Last 30 days, All time |
| Funnel stages | 4 | Created → Generated → Exported → Shared |
| Supabase connection verified | ✅ | HTTP 200 on documents + citations tables |
| Mock fallback preserved | ✅ | Yellow banner shown when DB empty |
| PRs open | 1 | PR #329 — pending Dhruv review |
| Contract gaps flagged | 2 | No `shared` status in DocumentStatus, DB vs shared type mismatch |

## Blockers

- `DocumentStatus` has no `shared` value in `packages/shared/src/types.ts` or `packages/db/src/types.ts` — Shared funnel stage uses estimated value. Flagged on issue #290 tagging `@Dhruv5353`.
- DB is currently empty — no real documents created yet so dashboard shows mock data. Will show real data automatically once users create documents.
- `DocumentType` mismatch between `shared/types.ts` (`rti_application | legal_notice...`) and `db/types.ts` (`petition | affidavit...`) — using shared types as source of truth per project contract. Flagged gap on issue #290.

## Next week

- Monitor dashboard with real data as users start creating documents
- Resolve `shared` status gap once `DocumentStatus` is updated
- Add `/admin/analytics` to `docs/UI_FLOW.md` routing map via PR

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>