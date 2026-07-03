# Week 2 — Tulsi Dhameliya

**Team:** Team A — Frontend
**Module owned:** Dashboard + History
**Week:** Week 2 (May 25 – May 31, 2026)

---

## What I shipped this week

* Implemented `/dashboard` page per RFC and Week-2 task description
* Built document table with row click navigation to `/draft/[id]`
* Implemented all 6 status badges: `draft`, `generating`, `final`, `failed`, `exported`, `archived`
* Built filter bar with status, language, and doc type dropdowns plus title search
* Implemented all empty states: loading, error, no drafts, no results
* Added `[+ New Draft]` button navigating to `/new`
* Integrated frontend fetch logic for `GET /api/documents` following `API_CONTRACTS.md`
* All types imported from `@trionic/shared` — no redefinitions
* Broke dashboard into modular components inside `_components/` folder

## Metrics

| Metric | Value | Notes |
| --- | --- | --- |
| Pages implemented | 1 | `/dashboard` |
| Components built | 5 | page, table, filter-bar, status-badge, empty-state |
| Status badges covered | 6 | All `DocumentStatus` values |
| Filter dropdowns | 3 | Status, language, doc type |
| Empty states handled | 4 | Loading, error, no drafts, no results |
| PRs opened | 1 | `frontend/dashboard-history-week-2` |
| TypeScript errors in my files | 0 | Clean `tsc --noEmit` output |

## Learnings

* Understood monorepo structure with `apps/web` and `packages/shared`
* Learned to import locked types from `@trionic/shared` without redefining them
* Learned how to wire API query params per locked contracts
* Learned shadcn/ui component installation and usage
* Understood inter-team dependency workflow

## Blockers

* Backend `GET /api/documents` not yet running locally — dashboard shows error empty state until Team B implements the route
* Local disk space and memory constraints slowed environment setup

## Next week

* Connect dashboard to live backend once Team B deploys `GET /api/documents`
* Add row-level quick actions (export, archive, delete)
* Implement pagination using `next_cursor` from API response

---

### Mentor feedback 

> *Pending*