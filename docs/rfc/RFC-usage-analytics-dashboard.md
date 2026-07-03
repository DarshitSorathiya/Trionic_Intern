# RFC: Usage Analytics Dashboard
**Author:** Parth Jayeshbhai Thakkar (@parth-thakkar304)
**Role:** Data Analytics Intern
**Team:** team-evals
**Status:** Draft
**Created:** May 2026
**Reviewers:** @KirtanPatel18 (Evals lead), Thummar (Cost dashboards)

---

## 1. Problem Statement

The product currently has technical evals (citation correctness, hallucination rate) but **no visibility into how users are actually using it**. As a result, the team cannot answer basic product questions like:

- Which document types are users drafting most?
- Are users returning after their first session?
- What percentage of drafted documents are actually exported?
- Which Indian Acts are being cited the most?
- At which agent step in the pipeline do errors occur most?
- What languages are users writing in?

This RFC proposes a **Usage Analytics Dashboard** that reads from `agent_traces` and `documents` tables to surface these answers — complementing the existing technical evals with **behavioral and usage insights**.

---

## 2. Goals

| Metric | What it tells us |
|--------|-----------------|
| Doc-type popularity | Which document types drive the most usage |
| Language distribution | Which languages users are drafting in |
| Retention (7-day) | Whether users find enough value to return |
| Conversion rate | Whether drafts are completing the full workflow |
| Per-act citation frequency | Which Indian Acts are most legally relevant to users |
| Error rate by agent | Where the agent pipeline is failing users most |

---

## 3. Out of Scope

| Item | Owner |
|------|-------|
| Cost per query, token usage | Thummar (cost dashboard) |
| Citation validity, hallucination rate | Kirtan (technical evals) |
| Eval run results | Team F |
| Building the frontend page | Frontend dev team |
| RLS policies | Om / backend team |

This dashboard answers **"how is the product being used"** — not **"is it working correctly"** (that's Kirtan's job).

---

## 4. Data Sources

| Table | Owner | Fields Used |
|-------|-------|-------------|
| `documents` | Team B | `doc_type`, `language`, `status`, `owner_id`, `created_at` |
| `agent_traces` | Team B | `agent`, `model`, `tokens_in`, `tokens_out`, `cost_usd`, `latency_ms`, `cited_nodes`, `status` |

> ✅ `agent_traces` fields confirmed from `packages/evals/RFC.md` (Kirtan Patel)
> ⚠️ `documents` column names pending final confirmation from Team B (@om-patel91)

---

## 5. Confirmed Field Reference

### `agent_traces` — confirmed from Kirtan's RFC:
```
agent          — "drafter" | "citator-gatekeeper"
model          — e.g. "claude-sonnet-4-20250514"
tokens_in      — input tokens (number)
tokens_out     — output tokens (number)
cost_usd       — cost in USD (number)
latency_ms     — latency in milliseconds (number)
cited_nodes    — PageIndex node IDs array e.g. ["RTI-2005/S-6/CL-1"]
status         — "ok" | "rejected" | "error"
```

### `documents` — from initial project brief (pending Team B confirmation):
```
doc_type       — e.g. "rti_application"
language       — e.g. "en"
owner_id       — user who owns the document
status         — "draft" | "exported"
created_at     — timestamp
```

---

## 6. Metrics — Definitions & SQL Queries

### 6.1 Doc-Type Popularity
**Definition:** Count of documents grouped by document type, showing which types users draft most.

**Why it matters:** Tells the product team where to focus feature improvements.

**Fields used:** `documents.doc_type`

```sql
SELECT
  doc_type,
  COUNT(*) AS total_documents,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM documents
GROUP BY doc_type
ORDER BY total_documents DESC
LIMIT 10;
```

**Expected output:** Bar chart — top 10 document types by volume.

---

### 6.2 Language Distribution
**Definition:** % breakdown of documents by language field.

**Why it matters:** Validates multilingual adoption — are users actually using Hindi, Gujarati, etc. or defaulting to English?

**Fields used:** `documents.language`

```sql
SELECT
  language,
  COUNT(*) AS total_documents,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM documents
GROUP BY language
ORDER BY total_documents DESC;
```

**Expected output:** Pie chart — language breakdown by %.

---

### 6.3 Retention Rate (7-Day)
**Definition:** % of users who created at least one document within 7 days of their first session.

**Why it matters:** Core product health signal — if retention is low, users are not finding value.

**Fields used:** `documents.owner_id`, `documents.created_at`

```sql
WITH first_use AS (
  SELECT owner_id, MIN(created_at) AS first_date
  FROM documents
  GROUP BY owner_id
),
returning_users AS (
  SELECT DISTINCT d.owner_id
  FROM documents d
  JOIN first_use f ON d.owner_id = f.owner_id
  WHERE d.created_at > f.first_date
    AND d.created_at <= f.first_date + INTERVAL '7 days'
)
SELECT
  COUNT(DISTINCT f.owner_id) AS total_users,
  COUNT(DISTINCT r.owner_id) AS retained_users,
  ROUND(
    COUNT(DISTINCT r.owner_id) * 100.0 / COUNT(DISTINCT f.owner_id), 2
  ) AS retention_rate_percent
FROM first_use f
LEFT JOIN returning_users r ON f.owner_id = r.owner_id;
```

**Expected output:** Single KPI card — e.g. "42% 7-day retention"

**Benchmark:** >30% is healthy for a legal drafting tool in early access.

---

### 6.4 Conversion Rate (Draft → Export)
**Definition:** % of documents that moved from `draft` status to `exported` status.

**Why it matters:** If users draft but never export, the core workflow is broken or not valuable enough.

**Fields used:** `documents.status`

```sql
SELECT
  COUNT(*) AS total_drafts,
  COUNT(*) FILTER (WHERE status = 'exported') AS exported_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'exported') * 100.0 / COUNT(*), 2
  ) AS conversion_rate_percent
FROM documents;
```

**Expected output:** Single KPI card — e.g. "67% conversion rate"

**Insight trigger:** If conversion < 50%, investigate where documents are getting stuck:

```sql
SELECT status, COUNT(*) AS count
FROM documents
GROUP BY status
ORDER BY count DESC;
```

---

### 6.5 Per-Act Citation Frequency
**Definition:** Count of cited PageIndex node IDs grouped by Act, extracted directly from `agent_traces.cited_nodes`.

**Why it matters:** Shows which Indian Acts are most legally relevant to users — informs which PageIndex trees to prioritize.

**Fields used:** `agent_traces.cited_nodes`

> Note: `cited_nodes` is an array field e.g. `["RTI-2005/S-6/CL-1", "ICA-1872/CH-VI/S-73"]`
> Act name is extracted from the node ID prefix before the first `/`

```sql
SELECT
  SPLIT_PART(node_id, '/', 1) AS act_name,
  COUNT(*) AS citation_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM agent_traces,
  UNNEST(cited_nodes) AS node_id
GROUP BY act_name
ORDER BY citation_count DESC
LIMIT 10;
```

**Expected output:** Horizontal bar chart — Top 10 most cited Acts.

---

### 6.6 Error Rate by Agent
**Definition:** % of agent trace calls that resulted in an error, grouped by `agent` name.

**Why it matters:** Pinpoints exactly which agent in the pipeline is failing most — directly actionable for the engineering team.

**Fields used:** `agent_traces.agent`, `agent_traces.status`

```sql
SELECT
  agent,
  COUNT(*) AS total_calls,
  COUNT(*) FILTER (WHERE status = 'error') AS error_count,
  COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'error') * 100.0 / COUNT(*), 2
  ) AS error_rate_percent
FROM agent_traces
GROUP BY agent
ORDER BY error_rate_percent DESC;
```

**Expected output:** Table sorted by error rate — highest failure agents at the top.

**Insight trigger:** Any agent with error rate > 10% should be flagged to the engineering team immediately.

---

## 7. Insights This Dashboard Enables

| Insight | Metric used | Action it drives |
|---------|-------------|-----------------|
| "Users prefer RTI applications over contracts" | Doc-type popularity | Focus UX improvements on RTI flow |
| "90% of users write in English despite multilingual support" | Language distribution | Investigate why Indic language adoption is low |
| "Only 25% of users return in 7 days" | Retention | Trigger user research interviews |
| "Only 40% of drafts are exported" | Conversion | Find drop-off point in the workflow |
| "RTI-2005 is cited 3x more than any other Act" | Per-act citation | Prioritize RTI tree depth in PageIndex |
| "citator-gatekeeper fails 15% of the time" | Error rate by agent | Engineering team fixes citator agent |

---

## 8. Proposed Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Usage Analytics Dashboard          [Last 7d ▼] [30d]   │
├────────────────────┬────────────────────────────────────┤
│  Doc-Type          │  Language Distribution             │
│  Bar Chart         │  Pie Chart                         │
│  (top 10 types)    │  (% per language)                  │
├────────────────────┼────────────────────────────────────┤
│  7-Day Retention   │  Conversion Rate                   │
│  [ 42% ]           │  [ 67% ]                           │
│  KPI card          │  KPI card                          │
├────────────────────┴────────────────────────────────────┤
│  Per-Act Citation Frequency                             │
│  Horizontal Bar Chart (Top 10 Acts)                     │
├─────────────────────────────────────────────────────────┤
│  Error Rate by Agent                                    │
│  agent | total_calls | errors | rejected | error_rate%  │
│  (sorted by error rate — highest first)                 │
└─────────────────────────────────────────────────────────┘
```

**Filter controls needed:**
- Date range picker (default: last 7 days)
- Language filter (All / English / Hindi / Gujarati etc.)
- Doc-type filter (All / RTI / Contract / Petition etc.)

---

## 9. Open Questions

| # | Question | Who to ask | Priority |
|---|----------|------------|----------|
| 1 | Exact column names in `documents` table | @om-patel91 Team B | High |
| 2 | What are all possible values for `status` in `documents`? | @om-patel91 Team B | High |
| 3 | Is `cited_nodes` stored as a Postgres array or JSONB? | @om-patel91 Team B | High |
| 4 | Should retention window be 7-day or 30-day? | @KirtanPatel18 | Medium |
| 5 | Default date range for dashboard — 7 days or 30 days? | @KirtanPatel18 | Low |

> ✅ Removed: `citations` and `pageindex_nodes` table dependency — `cited_nodes` is directly available in `agent_traces` per Kirtan's RFC.

---

## 10. My Deliverables (Data Analytics Scope)

| Task | Status |
|------|--------|
| This RFC | ✅ Done |
| Confirm `documents` schema | Pending @om-patel91 |
| Finalize and test SQL queries | Week 2 |
| Dashboard spec handoff to frontend | Week 2 |
| Weekly insight summary | Ongoing |

> Note: Frontend implementation (Next.js page, charts, RLS) is owned by the dev team — not part of my scope.

---

## 11. References

- [Kirtan's Eval Harness RFC](packages/evals/RFC.md) — confirmed `agent_traces` fields
- [Agno agent framework](https://docs.agno.com)
- [PageIndex retrieval](https://github.com/VectifyAI/PageIndex)
- [LangSmith eval concepts](https://docs.smith.langchain.com/evaluation/concepts)
- [Supabase Studio](https://supabase.com/docs/guides/studio)
- [RFC writing guide](https://blog.pragmaticengineer.com/scaling-engineering-teams-via-writing-things-down-rfcs/)
