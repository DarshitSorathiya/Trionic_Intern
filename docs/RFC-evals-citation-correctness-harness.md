# RFC: Eval Harness for Trionic Adalat

**Issue:** #29
**Author:** Kirtan Patel (@KirtanPatel18)
**Team:** F — Evals & Telemetry
**Status:** Draft
**Date:** 2026-05-17

---

## 1. Why this RFC exists

The eval harness verifies that the Citator-gatekeeper enforcement guarantees
100% citation validity across generated drafts. This RFC defines the fixture
format, metric definitions, harness design, and dashboard surface for
packages/evals.

Deterministic metrics (citation validity, latency, cost) are computed directly
from structured data, while semantic metrics (citation relevance, completeness
quality) may require LLM-judge or human evaluation.

The harness is intentionally fixture-first so that evaluation development can
proceed before production traffic becomes available in Week 3.

---

## 2. Fixture format

Fixtures are static JSON files stored in packages/evals/fixtures/.
They simulate what the real agent_traces table will produce in Week 3+.

File path convention: fixtures/<name>.json

Example fixture — fixtures/rti-english-001.json:

fixture_id: "rti-english-001"
doc_type: "rti_application"
language: "en"

agent_traces: - agent: "drafter"
model: "claude-sonnet-4-20250514"
tokens_in: 1200
tokens_out: 800
cost_usd: 0.0048
latency_ms: 1340
cited_nodes: ["RTI-2005/S-6/CL-1", "RTI-2005/S-7/CL-1"]
status: "ok"

    - agent: "citator-gatekeeper"
      model: "claude-sonnet-4-20250514"
      tokens_in: 400
      tokens_out: 120
      cost_usd: 0.0012
      latency_ms: 560
      cited_nodes: ["RTI-2005/S-6/CL-1", "RTI-2005/S-7/CL-1"]
      status: "ok"

draft_output:
text: "Under Section 6(1) of the RTI Act [CITE:RTI-2005/S-6/CL-1], I hereby request..."
cite_markers: - node_id: "RTI-2005/S-6/CL-1" span: [6, 42] - node_id: "RTI-2005/S-7/CL-1" span: [180, 210]

ground_truth:
valid_node_ids: ["RTI-2005/S-6/CL-1", "RTI-2005/S-7/CL-1"]
required_sections: ["applicant_details", "information_requested", "pio_address"]

Node ID format: <ACT-YEAR>/<DIVISION>/<SECTION>
Examples:
RTI-2005/S-6/CL-1 — RTI Act 2005, Section 6, Clause 1
ICA-1872/CH-VI/S-73 — Indian Contract Act 1872, Chapter VI, Section 73

---

## 3. Eval flow

Fixture JSON
|
v
Harness Runner (src/run.ts)
|
v
Metric Evaluators (src/metrics/)
|
v
Eval Report (console + JSON)
|
v
Dashboard (Week 2 — Thummar Ayush)

---

## 4. Metric definitions

4.1 Citation validity (deterministic)
What: Every node_id in cite_markers must exist in ground_truth.valid_node_ids
Formula: valid_citations / total_citations x 100
Target: 100%
Owner: Kirtan Patel

4.2 Citation relevance (LLM-judge)
What: Does the cited node actually support the legal claim it is attached to?
Scoring: LLM judge scores each (span, node_text) pair as relevant / partial / irrelevant
Target: >= 90% relevant
Owner: Kirtan Patel

4.3 Hallucination rate
What: Legal claim spans in draft text that have NO [CITE] marker
Formula: uncited_claim_spans / total_claim_spans x 100
Target: 0% after Citator-gatekeeper is enforced (Week 4+)
Owner: Kaushal Vora

4.4 Completeness
What: All required sections for the doc type are present in the output
Formula: present_sections / required_sections x 100
Target: 100%
Owner: Kaushal Vora

4.5 Per-LLM cost and latency
What: Aggregate cost_usd and latency_ms per model across an eval run
Formula: Sum and average from agent_traces
Target: Track and compare — no hard target in Week 1
Owner: Thummar Ayush

---

## 5. How the harness reads agent_traces

In Weeks 1-2, the harness reads from fixture JSON files (see Section 2).
From Week 3 onward, the harness will also read from the live Supabase
agent_traces table using the shared contract below.

AgentTrace contract (from packages/shared):

agent: string
model: string
tokens_in: number
tokens_out: number
cost_usd: number
latency_ms: number
cited_nodes: PageIndexNodeId[]
status: "ok" | "rejected" | "error"

---

## 6. Dashboard surface (Week 2 — Thummar Ayush)

Citation validity % — Big number + trend line
Hallucination rate % — Big number, red if > 0
Completeness % — Big number
Cost per draft per model — Bar chart: Claude vs Gemini vs GPT
Latency per agent per model — Bar chart
Eval run history — Table: run ID, date, fixture, scores

---

## 7. Week-1 skeleton deliverables

fixtures/rti-english-001.json — one fixture file
src/run.ts — entry point, reads fixture, runs metrics, prints report
src/metrics/citationValidity.ts — citation validity metric (deterministic)

Full dashboard and Supabase integration deferred to Week 2.

---

## 8. Dependencies

AgentTrace type — packages/shared — Week 1 (already defined)
PageIndex node IDs — Team D — Week 3 (fixture mocks this)
Supabase eval_runs — Team B — Week 2
LLM Router multi-model — Yug Gandhi — Week 4 (A/B harness)

---

## 9. Open questions

[ ] Should eval_runs store per-span relevance scores or just aggregate?
Tag: @Om Patel — Team B

[ ] LLM judge model for relevance — Claude or smaller/cheaper model?
Tag: @Malay Sheta — Team C

[ ] Fixture node ID naming convention — confirm with Tirth Dalal (Team D)
so node IDs stay consistent across packages.
