# Week 4 — Tulsi Dhameliya

**Team:** Team A — Frontend
**Module owned:** Dashboard + History
**Week of:** 2026-06-12

---

## What I shipped this week

* Upgraded `/dashboard` page with Week 4 acceptance criteria
* Implemented pagination via `next_cursor` from `GET /api/documents` API contract — "Load more" button appends next page to existing list
* Built zero-draft empty state with 5 doc-type cards — RTI Application, Legal Notice, NDA, Consumer Complaint, Cheque Bounce Notice — each linking to `/new?doc_type=...`
* Implemented per-filter empty state messages — e.g. "No RTI Applications found" when doc_type filter is active with no results
* Added smart empty state detection — distinguishes between "no drafts at all" and "no results for current filters"
* Opened PR #347 for Week 4 changes
* Rebased PR against latest `main` after i18n migration (#341) moved dashboard route to `app/[locale]/dashboard/`
* Resolved merge conflicts in `empty-state.tsx` caused by the rebase — cleaned up duplicate type declarations and orphaned code blocks
* Removed the old orphaned `app/dashboard/` folder left behind after the i18n route migration
* Verified `tsc --noEmit` is clean for all dashboard files after rebase

## Metrics

| Metric | Value | Notes |
| --- | --- | --- |
| Files changed | 2 | `page.tsx`, `empty-state.tsx` |
| New features added | 3 | Pagination, doc-type cards, per-filter empty states |
| Doc-type cards implemented | 5 | All v1 document types covered |
| PRs opened | 1 | #347 — Week 4 dashboard upgrades |
| Rebase conflicts resolved | 1 | `empty-state.tsx` post-i18n migration |
| TypeScript errors in my files | 0 | Clean `tsc --noEmit` output |
| Blocked on | 1 | `GET /api/documents` list route — #262 |

## Learnings

* Understood cursor-based pagination pattern from `API_CONTRACTS.md`
* Learned how to distinguish empty states based on active filter combinations
* Understood how i18n routing (`[locale]` segment) changes file structure and import paths (`@/i18n/routing` vs `next/link`)
* Learned how to identify and clean up botched rebase merges with duplicate code blocks
* Learned how to safely remove orphaned folders after a route migration

## Blockers

* `GET /api/documents` list route (#262) still not merged — dashboard shows error empty state until Backend team lands this route
* All frontend code is complete and correct — will wire to real data automatically once #262 lands

## Next week

* Watch for #262 to land and test dashboard against real document data
* Continue with any Week 5 task assigned

---

### Mentor feedback

> *Pending*