# Week 3 — Kirtan Patel
**Team:** Team F — Evals & Telemetry
**Module owned:** Citation-correctness eval framework
**Week of:** 2026-06-02

---

## What I shipped this week
- Added citation validity admin dashboard at `apps/web/app/admin/evals/citation-validity/page.tsx` — admin-only page showing `citation_validity_rate`, valid/total citations, invalid citation node IDs, and run status per eval run. [PR #230](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/230)
- Created `packages/evals/fixtures/rti-week3.json` — 10 real RTI draft fixtures using real node IDs from VrajAnghan's RTI Act 2005 tree. 8 valid, 2 with hallucinated citations. [PR #230](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/230)
- Harness now runs on 10 real RTI drafts against real `pageindex.get_text` — citation validity computed from actual RTI Act 2005 data, not mocks. [PR #230](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/230)
- Resolved merge conflict in `packages/evals/tsconfig.json` with main — `rootDir: ".."` preserved for workspace imports. [PR #161](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/161)
- Rebased `evals/harness-week-3` onto latest main — picked up Om's migration, VrajAnghan's real RTI tree, Malaysheta's agent chain.
- Verified `eval_runs` table exists in Supabase after Om's migration #163 merged — harness is wired and ready, skips gracefully without admin auth from CLI.

---

## Demo
Harness runs against 10 real RTI drafts using real RTI Act 2005 node IDs:
```bash
npx tsx src/run.ts --fixture fixtures/rti-week3.json --models claude-sonnet-4-20250514
```
Citation validity dashboard visible at `/admin/evals/citation-validity` — shows per-run citation_validity_rate, valid/total citations, invalid node IDs, and status.

---

## Metrics
| Metric | Value | Notes |
| --- | --- | --- |
| PRs opened | 1 | PR #230 — week-3 fixtures + dashboard |
| Fixtures created | 1 | `rti-week3.json` — 10 real RTI drafts |
| Valid fixtures | 8 | rti-w3-001 to rti-w3-008 |
| Bad citation fixtures | 2 | rti-w3-009, rti-w3-010 |
| citation_validity_rate (rti-week3.json) | 84.6% | 11/13 citations valid — bad ones correctly detected |
| Real node IDs used | 9 | From actual RTI Act 2005 — S-3, S-4, S-5, S-6, S-7, S-8, S-11, S-19, S-20 |
| Hallucinated node IDs caught | 2 | RTI-2005/CH-VII/S-42, RTI-FAKE/CH-II/S-15A |
| Dashboard page | 1 | `/admin/evals/citation-validity` — admin-only citation validity view |

---

## Blockers
- PR #161 pending merge — tsconfig conflict resolved, checks passing, awaiting repo manager review.
- `eval_runs` write from CLI blocked by admin auth requirement in Om's API — expected, works in deployed environment with valid session.
- Real agent drafts from Malaysheta's `runAgentChain` — Integration Day (Jun 4) is the handoff point.
- ~~Dashboard cell~~ — DONE. Built own admin page at `/admin/evals/citation-validity` showing citation_validity_rate from eval_runs table.

---

## Next week
- Run harness on real agent-generated RTI drafts from Malaysheta's chain
- Verify eval_runs write works end-to-end in deployed environment
- Add hallucination rate metric (P1) — coordinate with Kaushal
- Add fixtures covering IPC and Consumer Protection Act (trees now merged in main)

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)
>