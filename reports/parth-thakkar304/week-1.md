# Week 1 — Parth Jayeshbhai Thakkar

**Team:** team-evals (Team F)
**Module owned:** Usage Analytics Dashboard (`docs/RFC-usage-analytics-dashboard.md`)
**Week of:** 2026-05-18

---

## What I shipped this week

- RFC for Usage Analytics Dashboard — [PR #74](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/74) merged to main
  - Defined 6 usage metrics: doc-type popularity, language distribution, 7-day retention, conversion rate (draft → export), per-act citation frequency, error rate by agent
  - Confirmed `agent_traces` fields from Kirtan's RFC (`docs/RFC-evals-citation-correctness-harness.md`)
  - Wrote SQL queries for all 6 metrics using `agent_traces` and `documents` tables
  - Flagged `documents` schema as pending confirmation from Team B (@om-patel91)
  - Coordinated with @KirtanPatel18 (Evals lead) and identified non-overlap boundary with Thummar's cost dashboard

## Demo

[RFC Usage Analytics Dashboard — Week 1 Walkthrough](https://www.loom.com/share/7931eb3b2906419898fcdf37d63a5767)

## Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Metrics defined in RFC | 6 | All 6 required metrics covered |
| Tables referenced | 2 | `agent_traces` + `documents` only |
| Fields confirmed | 8 | Confirmed from Kirtan's RFC |
| SQL queries written | 6 | One per metric |
| PRs opened | 1 | PR #74 — merged to main |
| Coordinators contacted | 2 | @KirtanPatel18 + @om-patel91 |

## Blockers

- `documents` table column names not yet finalized — Team B (@om-patel91) schema RFC still in progress. SQL queries will be updated once schema is locked.

## Next week

- Confirm exact column names in `documents` table with @om-patel91 once his schema RFC is merged
- Update Open Questions in RFC with confirmed field names
- Test all 6 SQL queries in Supabase Studio against live or fixture data
- Hand off finalized dashboard spec (wireframe + queries) to frontend dev team

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>
