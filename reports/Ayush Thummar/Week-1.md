# Week 1 — Thummar Ayush

**Team:** Team F — Evals & Telemetry  
**Module owned:** Per-LLM evaluation dashboards (Citation Validity, Cost Tracking, Budget Enforcement)  
**Week of:** 2026-05-10

---

## What I shipped this week

- **RFC: Per-LLM Evaluation Dashboards** ([PR #47](https://github.com/trionic-ai-adalat/repo/pull/47)) — Complete 12-section RFC with metric selection, daily budget model ($100/day per LLM), alert thresholds (🔴 100% citation required, 🟡 80%/100% spend alerts), Postgres schema (4 tables with RLS), Phase 1 scope (Citation + Cost dashboards Week 2), and implementation timeline. Merged Friday.

- **Stakeholder Alignment** — Synced with @KirtanPatel18 (citation evals), @Paghadar (observability), @Om Patel (DB/RLS), @Sohil Kareliya (FSD). All 4 approved Supabase Studio → Grafana hybrid approach. No blockers.

- **Implementation Assets** — Day-by-day Week 2 guide, SQL schema examples, API endpoint contracts, React component sketches, testing strategy (E2E + load tests).

---

## Demo

**Link:** [Loom: RFC Walkthrough (60s)](https://www.loom.com/share/dfe0310d4c0d4b468315ab5bfcf23844)

Walking through: (1) Citation-or-Die rule as P0 legal requirement, (2) Cost budgets per-LLM with soft/hard alerts, (3) Data model (eval_results → eval_metrics_daily), (4) Phase 1 dashboards, (5) Week 2 implementation timeline.

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| RFC Completeness | 12/12 sections | No TBDs. All decisions locked. |
| Stakeholder Approvals | 4/4 ✅ | @KirtanPatel18, @Paghadar, @Om Patel, @Sohil |
| SQL Tables Designed | 4 | eval_results, eval_metrics_daily, llm_budgets, daily_spend (all RLS-protected) |
| API Endpoints | 6 designed | GET /metrics/citation, GET /metrics/cost, POST/GET /eval-results, POST/GET /budgets |
| Phase 1 Dashboards | 2 | Citation Validity (pie + trend), Cost Tracking (gauge + budget overview) |
| Phase 2 Dashboards | 3 (TBD) | Hallucination, Latency, Error Rate (Week 3+) |
| Time Spent | 5 hours | Reading docs (3h), RFC writing + reviews (2h) |

---

## Blockers

**None.** All stakeholders responsive within 24h. Clean alignment on approach.

**Notes:**
- @KirtanPatel18 confirmed 100% citation validity is non-negotiable (hard block, no override)
- @Paghadar approved Supabase Studio for Week 2 rapid prototyping (Grafana in Week 3)
- @Om Patel reviewed RLS policies, minor feedback on admin role check (addressed)
- No external dependencies blocking Week 2 start

---

## Next week

**Week 2: Deliver Both Dashboards (Citation + Cost)**

Detailed breakdown:
- **Mon (3h):** Database schema + migrations + RLS policies + local testing
- **Tue (2.5h):** 6 API endpoints (metrics, eval-results, budgets) + integration tests
- **Wed (1.5h):** Citation Validity dashboard (pie chart, trend line, alert banner)
- **Thu (1h):** Cost Tracking dashboard (gauge, budget overview, spend alerts)
- **Fri (1.5h):** E2E tests, load tests, demo video, weekly report, merge PRs

**Success Criteria:**
- Both dashboards live with real eval data
- Citation alert fires when < 100%
- Cost budget blocks at 100% spend
- RLS verified (no cross-team data leaks)
- API endpoints < 1s response time
- Demo video + report submitted

**Ready to start Monday.**

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> [Repo manager: 1-line feedback here]