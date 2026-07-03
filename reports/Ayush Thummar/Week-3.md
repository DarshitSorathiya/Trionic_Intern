# Week 3 — Thummar Ayush

**Team:** Team F — Evals & Telemetry  
**Module owned:** Per-LLM evaluation dashboards (admin evals UI, budget tracking, alert thresholds)  
**Week of:** 2026-05-24

---

## What I shipped this week

- **Real Database Integration for Evals Dashboard** — Integrated the `/admin/evals` dashboard with the real `agent_traces` table. Swapped the mock readers to fetch real data post-schema.
- **Dynamic Model Selection Dropdown** — Replaced the hardcoded static `MODEL_OPTIONS` in `/admin/evals/page.tsx` with dynamic model options extracted directly from the computed runs. This automatically supports any models present in `agent_traces` (including DeepSeek and other provider models) without manual code updates.
- **Real Latency Percentile Calculation** — Calculated exact P50 and P95 latency metrics dynamically from `latency_ms` on both the client-side aggregation (`buildEvalRunsClient`) and server-side aggregation (`buildEvalRuns`).
- **Daily Budget Tracking and Warnings** — Implemented both server-side (in `GET /api/admin/evals`) and client-side (during direct Supabase queries) daily cap checks. Exceeding the $5.00 daily budget cap per model logs a warning alert to the console (as required for W3).
- **Premium UI Upgrades for Budget Tracker** — Updated the `BudgetTracker` component to clarify that the daily limit is tracked per model. Added dynamic warning badges (`⚠️ Over Budget` in red, `⚠️ Nearing Cap` in yellow) inside the today's model breakdown grid to highlight models approaching or exceeding limits.
- **Test Suite Fixes** — Added `export` keywords to internal helper functions (`isAdminUser`, `percentile`, `buildEvalRuns`, and `handleAdminEvals`) in `apps/web/app/api/admin/evals/route.ts` to fix the test imports. Verified that the test suite `tests/admin-evals.test.ts` now runs and passes with **0 failures**.
- **PR Code Review & Copilot Feedback Addressal** — Delegated `search`, `descend`, and `get_text` in the PageIndex Agno tool surface (`packages/pageindex/src/agnoTool.ts`) to local JSON-backed functions. Narrowed db queries (`.select("*")` to specific required fields) in `GET /api/admin/evals`, standardized error response formatting using the `errorResponse` helper, normalized budget metric unit casing to lowercase `"usd"`, restored the server-side `warnIfBudgetExceeded` invocation, and corrected frontend code indentation regressions.

---

## Demo

**Link:** (To be recorded/attached by user)

The dashboard now reads live traces from the Supabase `agent_traces` table, shows dynamic filters, displays real p50/p95 latency and per-model costs, and raises warnings if a model exceeds $5.

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Dashboard Queries Real Table | Yes | Connected to `agent_traces` |
| Dynamic Models Dropdown | Yes | Extracts unique models dynamically from runs |
| Latency Calculations | Yes | Real P50/P95 calculated from `latency_ms` |
| Daily Budget Cap Tracker | Yes | Cost vs $5 cap |
| Alert Logging | Yes | Console warnings raised when model > $5 cap |
| Test Files Fixed | 1 | `apps/web/app/api/admin/evals/route.ts` helper exports |
| Evals Unit Tests | 8/8 passed ✅ | All tests in `tests/admin-evals.test.ts` pass |
| Workspace Checks | 3/3 ✅ | Lint, typecheck, tests passed locally |
| Time Spent | ~6 hours | Integration, dynamic filters, budget tracker, testing |

---

## Blockers

**None currently blocking.**

- Unit tests originally failed to import internal helper functions from `apps/web/app/api/admin/evals/route.ts` because they were not exported. Exporting these functions resolved the issues.

---

## Next week

**Week 4: Sentry integration and advanced observability**

Planned breakdown:
- **Mon:** Move console alerts to real Sentry exception capturing (`Sentry.captureException`)
- **Tue:** Implement advanced filtering (by agent step, timestamp range)
- **Wed:** Add charts/visualizations for latency and cost trends
- **Thu:** Complete integrations and review workspace logs
- **Fri:** Demo, PR notes, and final checks

**Success criteria:**
- Sentry alerts are fully wired up and tested
- Evals dashboard is highly interactive and complete
- All workspace checks remain green

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> [Repo manager: 1-line feedback here]
