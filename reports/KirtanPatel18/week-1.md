# Week 1 — Kirtan Patel

**Team:** Team F — Evals & Telemetry
**Module owned:** Citation-correctness eval framework
**Week of:** 2026-05-19

---

## What I shipped this week

- Authored `docs/RFC-evals-citation-correctness-harness.md` — eval framework RFC covering fixture format, metric definitions (citation validity, relevance), `agent_traces` integration, and dashboard surface design. [PR #40](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/40)
- Built eval harness skeleton in `packages/evals/` with TypeScript types, citation validity metric, fixture reader, and harness entry point. [PR #40](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/40)
- Created first fixture `fixtures/rti-english-001.json` — RTI Act English fixture for running citation correctness evals. [PR #40](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/40)
- Implemented `src/metrics/citationValidity.ts` — deterministic citation validity metric (P0). [PR #40](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/40)
- Implemented `src/run.ts` — harness entry point that reads fixtures, runs metrics, and prints eval report. [PR #40](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/40)
- Moved RFC to `docs/` folder and renamed for discoverability. [PR pending](https://github.com/Trionic-Interns/trionic-ai-adalat)
- Reviewed teammate RFCs — Ayush's per-LLM dashboard RFC and Parth's usage analytics dashboard RFC as Evals team lead.

---

## Demo

Successfully built and ran the eval harness skeleton on the RTI English fixture:

- Harness reads fixture from `fixtures/rti-english-001.json`
- Runs citation validity metric deterministically
- Prints eval report to console

---

## Metrics

| Metric              | Value | Notes                                                         |
| ------------------- | ----- | ------------------------------------------------------------- |
| PRs merged          | 1     | PR #40 — eval harness RFC + skeleton                          |
| Files shipped       | 7     | RFC, fixture, types, metric, run, package.json, tsconfig.json |
| Metrics implemented | 1     | Citation validity (P0)                                        |
| Fixtures created    | 1     | RTI English fixture                                           |
| RFC reviews done    | 2     | Ayush (per-LLM dashboards), Parth (usage analytics)           |

---

## Blockers

- `pnpm-lock.yaml` merge conflicts due to 36 interns merging PRs simultaneously — resolved each time by taking main's lockfile and regenerating evals dependencies on top.
- Kaushal Vora (hallucination & completeness eval) had not joined the org yet in Week 1 — no blocker on my end but his module is unstarted.

---

## Next week

- Implement hallucination rate metric (P1) in `packages/evals/`
- Add relevance scoring metric (P1)
- Create at least 3 more fixtures covering different legal acts (IPC, Contract Act, CrPC)
- Sync with Kaushal once he joins org and onboard him to the harness
- Sync with Tirth (Team D) on retrieval eval fixture format compatibility
- Coordinate with Ayush on connecting eval metrics to his per-LLM dashboard

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

>
