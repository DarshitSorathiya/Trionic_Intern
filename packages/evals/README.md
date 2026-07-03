# `packages/evals` — Evaluation harness

Eval framework + fixtures + dashboards for citation correctness, hallucination, completeness, and per-LLM cost/latency.

## Team

**Owner:** Team F — Evals & Telemetry
**Lead:** Kirtan Patel

| Module                              | Owner         |
| ----------------------------------- | ------------- |
| Citation-correctness eval framework | Kirtan Patel  |
| Cost & latency dashboards per-LLM   | Thummar Ayush |
| Hallucination & completeness eval   | Kaushal Vora  |

## What "good" looks like

- **Citation validity** (deterministic): every cited node_id resolves to a real PageIndex tree node. Target: **100%**.
- **Citation relevance** (LLM-judge or human): does the cited node actually support the claim?
- **Hallucination rate**: spans of legal claim text without a backing node — must be **0** after Citator-gatekeeper is enforced.
- **Completeness**: required sections present in the output doc type (e.g., RTI has all RTI fields).
- **Per-LLM** comparison: same eval set across at least 3 model providers via the LLM Router.

## Building the harness in Weeks 1–3

Don't wait for real data. Build the harness with fixture data in Weeks 1–3 so it's ready the moment real outputs flow through (Week 3+).

## Setup (Week 1)

Kirtan owns the Week-1 RFC: eval schema, fixture format, dashboard surface.
