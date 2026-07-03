# RFC: Per-LLM Evaluation Dashboards for Trionic Adalat

**Project:** Trionic Adalat — Multilingual AI Legal Assistant  
**Date:** May 2026  
**Author:** @Ayush5112006 (Thummar Ayush)  
**Team:** Team F — Evals & Telemetry  
**Status:** Proposed (observability aligned; pending remaining stakeholder sign-off)  
**Reviewers:** @KirtanPatel18 (Citation-correctness evals), @Paghadar (Observability), @Om Patel (DB/RLS)

---

## Executive Summary

This RFC defines **real-time per-LLM evaluation dashboards** for Trionic Adalat that monitor citation integrity, cost efficiency, and latency across the multi-LLM agent pipeline. These dashboards are **mandatory gates** — the product cannot deploy a document type until citation validity reaches 100%.

**Core mission:** Make LLM quality and compliance visible, actionable, and enforced at every step of the drafting workflow.

**Key decisions:**
- **5 core metrics:** Citation Validity (P0), Cost Per Query (P0), Hallucination Rate (P1), Latency (P1), Error Rate (P1)
- **Observability tool (aligned with @Paghadar):** Supabase Studio for Week 2 dashboards, then Grafana in Week 3+ only if advanced alerting/escalations are needed
- **Citation-or-die integration:** Dashboard enforces the hard rule—no document ships without 100% citation grounding
- **Multi-LLM tracking:** Per-LLM metrics for Claude, Gemini, GPT (routed per agent step)
- **Phase 1 scope:** Citation validity + cost tracking dashboards (Week 2), full suite Week 3-4

---

## 1. Context: Why This Matters for Trionic Adalat

### The Citation-or-Die Rule

From the project brief:
> "Citation-or-die: the Citator-gatekeeper agent rejects any draft span containing a legal claim without a valid PageIndex node ID. Enforced in code, not in prompts."

**Our job:** Make this visible and measurable.

Without dashboards:
- ❌ We don't know if Citator-gatekeeper is actually working
- ❌ We don't know which LLM models are hallucinating
- ❌ We ship documents with ungrounded claims (legal liability)
- ❌ We have no cost visibility across multi-LLM routing

With dashboards:
- ✅ Every document type shows citation validity % in real-time
- ✅ Team can spot which LLM is failing at which agent step
- ✅ Blocks production deployment until 100% citation validity
- ✅ Cost per document type is tracked and optimized

### Where in the Pipeline?

```
User Input (Hindi/English/etc)
    ↓
Classifier Agent (which domain? which acts?)
    ↓ [LLM Router: Claude/Gemini/GPT]
Planner Agent (which template? which sections?)
    ↓ [LLM Router]
PageIndex Retrieval (fetch node IDs + text)
    ↓
Drafter Agent (generate legal text)
    ↓ [LLM Router]
Citator-Gatekeeper Agent ← **EVALUATION POINT 1**
    "Does every claim have a valid PageIndex node?"
    ↓
Reviewer Agent (tone, completeness)
    ↓ [LLM Router]
Translator Agent (if Indic output)
    ↓ [LLM Router]
Redline Editor (user edits)
    ↓
Export (PDF/DOCX + citation appendix)
    ↓
Audit Log (all agent calls tracked) ← **EVALUATION POINT 2**
```

**Dashboard tracks:**
- Citation validity at Citator-Gatekeeper stage
- Hallucination rate across drafts
- Cost & latency per LLM per agent step
- Error rate (which documents fail completely?)

---

## 2. Metric Selection

### Why These 5 Metrics?

| Metric | Why It Matters | Trionic Context | Priority |
|--------|----------------|-----------------|----------|
| **Citation Validity %** | Legal compliance | Every claim must link to PageIndex node | **P0 (must-have)** |
| **Cost Per Document** | Budget control | Optimize LLM routing (Claude vs. Gemini vs. GPT) | **P0 (must-have)** |
| **Hallucination Rate** | Quality signal | Detect when LLM generates false legal claims | **P1 (nice-to-have)** |
| **Latency (P50/P95/P99)** | UX metric | Users wait for draft generation; slow = bad UX | **P1 (nice-to-have)** |
| **Error Rate** | System health | Which agent is crashing? Which document type is broken? | **P1 (nice-to-have)** |

### Phase 1 (Week 2): P0 Metrics Only

**Dashboard 1: Citation Validity (The Legal Gatekeeper)**
- % of claims with valid PageIndex citations
- Per-document-type breakdown (RTI, NDA, legal notice, etc.)
- Per-LLM comparison (Claude vs. Gemini vs. GPT)
- Trend line (7-day rolling average)
- **Alert:** RED if < 100% (blocks ship)

**Dashboard 2: Cost Per Document**
- Avg cost per document type
- Cost breakdown by LLM (which model is most expensive?)
- Cost breakdown by agent step (which agent consumes the most tokens?)
- Daily budget tracking across team
- **Alert:** YELLOW at 80%, RED at 100% of daily budget

### Phase 2 (Week 3+): P1 Metrics

- Hallucination rate (LLM-as-judge: is the generated claim supported by PageIndex text?)
- Latency percentiles (when does draft generation timeout?)
- Error rate (how often does an agent fail completely?)

---

## 3. Daily Budget Design

### The Problem

Without budget tracking:
- Team could spend $500+ in a day on expensive Claude queries
- No visibility into which document type is expensive
- No early warning before monthly bill arrives

### The Solution

#### Budget Model

```
Budget Setup (Admin):
  - Set daily limit per LLM (e.g., $100/day for Claude Opus)
  - Budget resets at UTC 00:00 every day
  - Soft alert (80%): warning, no blocking
  - Hard block (100%): stop accepting new drafts until tomorrow

Example Flow:
  10:00 AM  → Claude cost: $20 (OK, no alert)
  02:00 PM  → Claude cost: $80 (⚠️ WARNING - soft alert at 80%)
  04:00 PM  → Claude cost: $99 (⚠️ CRITICAL - approaching hard block)
  05:00 PM  → Claude cost: $101 (🔴 BLOCKED - no more Claude queries)
             Manager can approve emergency override (+$50)
  11:59 PM  → Budget resets → Claude available again tomorrow
```

#### Budget Config (Admin Panel)

```
Daily Budget Settings
┌─────────────────────────────────────┐
│ LLM: claude-opus                    │
│ Daily Limit: $100                   │
│ Soft Alert: 80% ($80)               │
│ Hard Block: 100% ($100)             │
│ Status: ✅ Enabled                  │
│                                     │
│ [Save] [Reset] [Disable]            │
└─────────────────────────────────────┘

Budget Overview
┌─────────────────────────────────────┐
│ Today's Spend                       │
│                                     │
│ claude-opus: $45 / $100 (45%) ✅   │
│ gemini-pro: $18 / $50 (36%)  ✅   │
│ gpt-4: $12 / $80 (15%)       ✅   │
│                                     │
│ Total: $75 / $230 (33%)       ✅   │
└─────────────────────────────────────┘
```

#### Budget Enforcement Logic

```typescript
// Before executing any agent step, check budget:
async function checkBudgetBeforeQuery(llm_id, team_id) {
  const budget = await db
    .from('llm_budgets')
    .select('*')
    .eq('team_id', team_id)
    .eq('llm_id', llm_id)
    .single();
  
  const today = new Date().toISOString().split('T')[0];
  const todaySpend = await db
    .from('daily_spend')
    .select('total_cost_usd')
    .eq('team_id', team_id)
    .eq('llm_id', llm_id)
    .eq('date', today)
    .single();
  
  const spendSoFar = todaySpend?.total_cost_usd || 0;
  const percentUsed = (spendSoFar / budget.daily_limit_usd) * 100;
  
  // Hard block at 100%
  if (percentUsed >= 100) {
    throw new Error(
      `Budget exceeded for ${llm_id}. Daily limit: $${budget.daily_limit_usd}. ` +
      `Current spend: $${spendSoFar}. ` +
      `Contact @Paghadar for emergency override.`
    );
  }
  
  // Soft alert at 80%
  if (percentUsed >= budget.soft_alert_pct) {
    await alertSlack({
      severity: 'WARNING',
      metric: 'Daily Budget',
      llm: llm_id,
      message: `⚠️ ${llm_id}: ${percentUsed.toFixed(0)}% of daily budget used ($$${spendSoFar}/$${budget.daily_limit_usd})`
    });
  }
}
```

#### Default Daily Budgets (Per LLM)

```
LLM                      Daily Budget    Rationale
─────────────────────────────────────────────────────
claude-opus              $100            Most capable for legal drafting; limit heavy testing
claude-sonnet            $50             Good cost/quality balance
gpt-4-turbo              $80             Expensive; careful allocation
gemini-pro               $40             Cost control priority
claude-haiku             $20             Cheap fallback; more experimental testing allowed
```

#### Database Schema

```sql
-- Budget configuration per LLM
CREATE TABLE llm_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  llm_id VARCHAR(50) NOT NULL,  -- 'claude-opus', 'gpt-4', 'gemini-pro'
  daily_limit_usd NUMERIC(10,2) NOT NULL,
  soft_alert_pct INT DEFAULT 80,
  hard_block_pct INT DEFAULT 100,
  enabled BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, llm_id),
  CHECK (daily_limit_usd > 0),
  CHECK (soft_alert_pct > 0 AND soft_alert_pct <= 100)
);

-- Real-time daily spending tracker
CREATE TABLE daily_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  llm_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_cost_usd NUMERIC(12,6) DEFAULT 0,
  query_count INT DEFAULT 0,
  
  UNIQUE(team_id, llm_id, date),
  CHECK (total_cost_usd >= 0)
);

-- RLS Policies
ALTER TABLE llm_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_isolation ON llm_budgets
  USING (team_id = (SELECT team_id FROM auth.users WHERE id = auth.uid()));

ALTER TABLE daily_spend ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_isolation ON daily_spend
  USING (team_id = (SELECT team_id FROM auth.users WHERE id = auth.uid()));
```

---

## 4. Alert Thresholds & Severity

### Alert Strategy

**🔴 CRITICAL (Blocks Shipping):** Stop everything, requires action
**🟡 WARNING (Investigate):** Alert but allows operations
**ℹ️ INFO (FYI):** Dashboard notification, no blocking

### Per-Metric Thresholds

| Metric | Threshold | Severity | Alert Channel | Action |
|--------|-----------|----------|---|--------|
| **Citation Validity < 100%** | < 100% | 🔴 CRITICAL | Block ship | Manual review + Citator-gatekeeper fix |
| **Daily cost exceeded** | > Budget | 🔴 CRITICAL | Pause queries | Manager override or wait for reset |
| **Hallucination Rate > 10%** | > 10% | 🟡 WARNING | Slack | Investigate LLM quality |
| **Latency P95 > 10s** | > 10,000ms | 🟡 WARNING | Slack | Check Supabase performance |
| **Error rate > 2%** | > 2% | 🟡 WARNING | Slack | Debug agent failure |

### Critical Alerts (Non-Negotiable)

**Citation Validity < 100% = HARD BLOCK**
- **Why:** Legal requirement. No document with ungrounded claims can ship.
- **Enforcement:** Citator-gatekeeper rejects the draft automatically.
- **Resolution:** Fix Drafter or Citator-gatekeeper agent. Re-run.
- **Override:** Requires team lead approval + legal sign-off.

**Budget Exceeded = HARD BLOCK**
- **Why:** Financial control. Prevent runaway costs.
- **Enforcement:** Agent execution fails with cost error.
- **Resolution:** Wait for budget reset (tomorrow) or request emergency override.
- **Override:** Requires Paghadar + team lead approval.

### Configurable Alerts (Per Team)

Teams can adjust thresholds via admin panel:

```
Alert Customization
┌──────────────────────────────────────────────┐
│ Hallucination Threshold: [10%] (adjustable)  │
│ Latency Warning P95: [10s] (adjustable)      │
│ Error Rate: [2%] (adjustable)                │
│                                              │
│ Citation Validity: 100% (HARD-CODED)         │
│ Budget Block: 100% (HARD-CODED)              │
│                                              │
│ [Save Settings]                              │
└──────────────────────────────────────────────┘
```

---

## 5. Observability Tool Decision

### Option A: Supabase Studio (CHOSEN for Week 2)

**Pros:**
- ✅ Zero infrastructure overhead (already using Supabase)
- ✅ Native Postgres dashboards (built into Supabase console)
- ✅ RLS-aware (respects team isolation automatically)
- ✅ Real-time data (no caching issues)
- ✅ Fast to prototype (2-3 hours for basic dashboards)
- ✅ Free tier sufficient for internal dashboards
- ✅ Easy to debug (see exact SQL queries)

**Cons:**
- ❌ Limited customization (pre-built chart types only)
- ❌ Not designed for customer-facing dashboards
- ❌ No advanced alerting (need custom Slack integration)
- ❌ Can't embed in main app easily

**Best for:** Week 2 rapid prototyping, internal team use

---

### Option B: Grafana (UPGRADE in Week 3+)

**Pros:**
- ✅ Advanced alerting (Slack, email, PagerDuty, OpsGenie)
- ✅ Highly customizable (any visualization you want)
- ✅ Mature, production-grade (used at scale everywhere)
- ✅ Community templates available
- ✅ Better for scaling to multiple teams

**Cons:**
- ❌ Ops overhead (new service to deploy + maintain)
- ❌ More setup time (4-6 hours initial config)
- ❌ Cost (hosted tier ~$50-200/month depending on usage)
- ❌ More complex datasource configuration

**Best for:** Week 3+ when we need sophisticated alerting

---

### Option C: Custom React Dashboard

**Pros:**
- ✅ Full design control (integrate seamlessly with Adalat UI)
- ✅ No new infrastructure
- ✅ Single codebase (team knows Next.js already)

**Cons:**
- ❌ Most dev time (20-30 hours for full implementation)
- ❌ More bugs to maintain
- ❌ Need to build alerting from scratch
- ❌ Performance optimization needed (caching, real-time updates)

**Best for:** Customer-facing dashboards (Phase 2+)

---

### Decision: Hybrid Approach

| Phase | Tool | Rationale |
|-------|------|-----------|
| **Week 2** | Supabase Studio | Fast iteration, minimal overhead, good enough for internal use |
| **Week 3+** | Grafana | Advanced alerting, scaling to more teams, sophisticated charts |
| **Future** | Custom React | If we need customer-facing dashboards or tight design integration |

**Action items:**
- Week 1: Alignment completed with @Paghadar on a Supabase-first rollout
- Week 2: Build dashboards in Supabase Studio
- Week 3: Evaluate Grafana; set up only if advanced alert routing (PagerDuty/OpsGenie) is required

---

## 6. Data Model & Schema

### Core Tables

#### 1. `eval_results` (Raw evaluation data from each agent step)

```sql
CREATE TABLE eval_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  
  -- Document context
  document_id UUID NOT NULL REFERENCES documents(id),
  document_type VARCHAR(50),  -- 'RTI', 'NDA', 'legal_notice', 'consumer_complaint', 'employment_contract'
  
  -- Agent step that was evaluated
  agent_name VARCHAR(100) NOT NULL,  -- 'classifier', 'planner', 'drafter', 'citator_gatekeeper', 'reviewer', 'translator'
  agent_step_number INT,  -- 1, 2, 3, ... for tracking execution order
  
  -- LLM that was used
  llm_id VARCHAR(50) NOT NULL,  -- 'claude-opus', 'gemini-pro', 'gpt-4-turbo'
  llm_model_version VARCHAR(100),  -- 'claude-3-opus-20250219'
  
  -- Citation tracking (core metric)
  claims_detected INT DEFAULT 0,  -- How many legal claims did the LLM make?
  claims_cited INT DEFAULT 0,  -- How many were grounded in PageIndex?
  citation_valid BOOLEAN GENERATED ALWAYS AS (claims_cited = claims_detected),
  pageindex_node_ids JSONB,  -- Array of valid node IDs: ['2.3.1', '4.5.2']
  
  -- Hallucination tracking
  hallucination_score NUMERIC(3,2),  -- 0.0-1.0 (LLM-as-judge score, Phase 2)
  is_hallucinating BOOLEAN GENERATED ALWAYS AS (hallucination_score > 0.5),
  
  -- Cost tracking
  tokens_input INT NOT NULL,
  tokens_output INT NOT NULL,
  cost_usd NUMERIC(10,6) NOT NULL,
  
  -- Performance tracking
  latency_ms INT NOT NULL,
  error BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CHECK (claims_cited <= claims_detected),
  CHECK (hallucination_score >= 0.0 AND hallucination_score <= 1.0),
  CHECK (latency_ms >= 0)
);

-- Indexes for dashboard queries
CREATE INDEX idx_eval_results_team_doc_type 
  ON eval_results(team_id, document_type, created_at DESC);
CREATE INDEX idx_eval_results_team_llm_agent
  ON eval_results(team_id, llm_id, agent_name, created_at DESC);
CREATE INDEX idx_eval_results_citation
  ON eval_results(team_id, citation_valid, created_at DESC);

-- RLS Policy
ALTER TABLE eval_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_isolation ON eval_results
  USING (team_id = (SELECT team_id FROM auth.users WHERE id = auth.uid()));
```

#### 2. `eval_metrics_daily` (Aggregated metrics for dashboard performance)

```sql
CREATE TABLE eval_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  llm_id VARCHAR(50) NOT NULL,
  agent_name VARCHAR(100),  -- NULL = across all agents
  document_type VARCHAR(50),  -- NULL = across all document types
  date DATE NOT NULL,
  
  -- Citation Metrics
  total_claims INT,
  cited_claims INT,
  citation_validity_pct NUMERIC(5,2),  -- 0-100
  
  -- Hallucination Metrics
  eval_count INT,  -- How many evaluations for this agent/llm/doc-type combo?
  hallucination_count INT,
  hallucination_rate_pct NUMERIC(5,2),  -- 0-100
  
  -- Cost Metrics
  total_cost_usd NUMERIC(12,6),
  avg_cost_per_eval NUMERIC(10,6),
  total_tokens_input INT,
  total_tokens_output INT,
  
  -- Latency Metrics
  avg_latency_ms INT,
  p50_latency_ms INT,
  p95_latency_ms INT,
  p99_latency_ms INT,
  
  -- Error Metrics
  error_count INT,
  error_rate_pct NUMERIC(5,2),  -- 0-100
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, llm_id, agent_name, document_type, date)
);

-- Indexes
CREATE INDEX idx_metrics_daily_team_date
  ON eval_metrics_daily(team_id, created_at DESC);
CREATE INDEX idx_metrics_daily_doc_type
  ON eval_metrics_daily(team_id, document_type, created_at DESC);

-- RLS Policy
ALTER TABLE eval_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_isolation ON eval_metrics_daily
  USING (team_id = (SELECT team_id FROM auth.users WHERE id = auth.uid()));
```

#### 3. `llm_budgets` (Budget configuration)

```sql
CREATE TABLE llm_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  llm_id VARCHAR(50) NOT NULL,  -- 'claude-opus', 'gemini-pro', 'gpt-4-turbo'
  daily_limit_usd NUMERIC(10,2) NOT NULL,
  soft_alert_pct INT DEFAULT 80,
  hard_block_pct INT DEFAULT 100,
  enabled BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, llm_id),
  CHECK (daily_limit_usd > 0)
);

ALTER TABLE llm_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_isolation ON llm_budgets
  USING (team_id = (SELECT team_id FROM auth.users WHERE id = auth.uid()));
CREATE POLICY admin_update ON llm_budgets FOR UPDATE
  USING ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');
```

#### 4. `daily_spend` (Real-time tracking)

```sql
CREATE TABLE daily_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  llm_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_cost_usd NUMERIC(12,6) DEFAULT 0,
  eval_count INT DEFAULT 0,
  
  UNIQUE(team_id, llm_id, date),
  CHECK (total_cost_usd >= 0)
);

-- Update on each eval_results insert
CREATE TRIGGER update_daily_spend
  AFTER INSERT ON eval_results
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_spend_fn();
```

---

## 7. Phase 1 Scope (Week 2 Deliverable)

### What Ships

#### Dashboard 1: Citation Validity (The Legal Gatekeeper)

**Purpose:** Ensure 100% citation grounding before document ships

**Features:**
- **Pie chart:** % of claims with valid PageIndex citations
- **7-day trend line:** Citation validity rolling average
- **Per-document-type breakdown:** RTI, NDA, legal notice, consumer complaint, employment contract
- **Per-LLM comparison:** Claude vs. Gemini vs. GPT (which LLM is most grounded?)
- **Per-agent breakdown:** Classifier, Planner, Drafter, Citator-gatekeeper, Reviewer, Translator (which agent introduces hallucinations?)
- **Alert:** 🔴 RED if < 100%

**Sample Data:**
```
Citation Validity: 98.5%
- Total claims detected: 234
- Claims with citations: 231
- Claims missing citations: 3
- Status: 🔴 CRITICAL — Document cannot ship (requires 100%)

By Document Type:
  RTI: 100% (125/125) ✅
  NDA: 96.2% (51/53) 🔴
  Legal Notice: 99.1% (56/57) 🟡

By LLM:
  Claude Opus: 99.8% (198/199) ✅
  Gemini Pro: 97.5% (32/33) 🟡
  GPT-4: 95.0% (4/4) 🔴

By Agent:
  Classifier: 100% (0 claims made)
  Planner: 100% (15/15) ✅
  Drafter: 98.0% (196/200) 🟡
  Citator-Gatekeeper: Rejected 9 ungrounded claims ✅
  Reviewer: 100% (18/18) ✅
  Translator: 100% (5/5) ✅
```

#### Dashboard 2: Cost Tracking

**Purpose:** Optimize LLM routing and prevent budget overruns

**Features:**
- **Gauge chart:** Today's spend vs. daily budget
- **7-day cumulative spend line:** Trend over time
- **Per-LLM breakdown:** Which LLM is most expensive?
- **Per-document-type breakdown:** RTI drafting vs. NDA drafting — which costs more?
- **Per-agent breakdown:** Which agent step consumes the most tokens?
- **Budget override log:** Who requested overrides? When? For how long?
- **Alerts:** 🟡 YELLOW at 80%, 🔴 RED at 100%

**Sample Data:**
```
Today's Spend: $12.34 / $230.00 (5.4%) ✅

By LLM:
  Claude Opus: $8.50 / $100 (8.5%) ✅
  Gemini Pro: $2.84 / $50 (5.7%) ✅
  GPT-4: $1.00 / $80 (1.3%) ✅

By Document Type:
  RTI: $3.20 (7 documents) = $0.46/doc
  NDA: $5.12 (3 documents) = $1.71/doc
  Legal Notice: $2.50 (4 documents) = $0.63/doc
  Consumer Complaint: $1.52 (2 documents) = $0.76/doc

By Agent Step:
  Classifier: $0.10 (1%)
  Planner: $0.50 (4%)
  Drafter: $7.50 (61%) ← Most expensive
  Reviewer: $2.50 (20%)
  Translator: $1.74 (14%)

7-Day Total: $84.23
```

#### API Endpoints (6 Total)

**1. GET `/api/metrics/citation`**
```json
{
  "llm_id": "claude-opus",
  "document_type": "NDA",
  "agent_name": "drafter",
  "current_citation_validity_pct": 98.5,
  "total_claims": 234,
  "cited_claims": 231,
  "uncited_claims": 3,
  "trend": [
    { "date": "2026-05-12", "validity_pct": 97.0 },
    { "date": "2026-05-13", "validity_pct": 98.2 }
  ],
  "alert_status": "CRITICAL"
}
```

**2. GET `/api/metrics/cost`**
```json
{
  "llm_id": "claude-opus",
  "document_type": null,
  "today_spend_usd": 12.34,
  "daily_budget_usd": 100.00,
  "spend_pct": 12.34,
  "trend": [
    { "date": "2026-05-12", "cost_usd": 8.50 },
    { "date": "2026-05-13", "cost_usd": 11.23 }
  ],
  "breakdown_by_llm": [
    { "llm_id": "claude-opus", "spend": 8.50, "budget": 100 },
    { "llm_id": "gemini-pro", "spend": 2.84, "budget": 50 }
  ],
  "breakdown_by_doc_type": [
    { "doc_type": "RTI", "cost": 3.20, "avg_per_doc": 0.46 },
    { "doc_type": "NDA", "cost": 5.12, "avg_per_doc": 1.71 }
  ],
  "alert_status": "OK"
}
```

**3. GET `/api/eval-results`**
Query params: `llm_id`, `document_type`, `agent_name`, `days`, `limit`
```json
{
  "results": [
    {
      "id": "uuid",
      "document_id": "uuid",
      "document_type": "NDA",
      "agent_name": "drafter",
      "llm_id": "claude-opus",
      "claims_detected": 5,
      "claims_cited": 5,
      "citation_valid": true,
      "pageindex_node_ids": ["2.3.1", "4.5.2"],
      "hallucination_score": 0.2,
      "tokens_input": 150,
      "tokens_output": 280,
      "cost_usd": 0.015,
      "latency_ms": 245,
      "error": false,
      "created_at": "2026-05-13T10:24:00Z"
    }
  ],
  "total_count": 234
}
```

**4. POST `/api/eval-results`** (Agent writes eval data)
```json
{
  "document_id": "uuid",
  "document_type": "NDA",
  "agent_name": "drafter",
  "llm_id": "claude-opus",
  "llm_model_version": "claude-3-opus-20250219",
  "claims_detected": 5,
  "claims_cited": 5,
  "pageindex_node_ids": ["2.3.1", "4.5.2"],
  "tokens_input": 150,
  "tokens_output": 280,
  "cost_usd": 0.015,
  "latency_ms": 245,
  "error": false
}
```

**5. GET `/api/budgets`**
```json
{
  "budgets": [
    {
      "llm_id": "claude-opus",
      "daily_limit_usd": 100,
      "soft_alert_pct": 80,
      "enabled": true
    }
  ]
}
```

**6. POST `/api/budgets`** (Admin only)
```json
{
  "llm_id": "claude-opus",
  "daily_limit_usd": 150
}
```

---

#### Eval Worker Integration (Pseudocode)

```typescript
// In packages/agents/src/base-agent.ts (all agents inherit from this):

async function executeStep(input: any): Promise<AgentOutput> {
  const startTime = Date.now();
  const response = await this.callLLM(input);  // Claude/Gemini/GPT
  
  // Evaluate this step
  const evalData = {
    document_id: input.document_id,
    document_type: input.document_type,
    agent_name: this.agentName,  // 'drafter', 'citator_gatekeeper', etc.
    llm_id: this.llmId,  // which LLM was routed here?
    llm_model_version: this.model,
    
    // Citation tracking (CRITICAL)
    claims_detected: await citationChecker.detectClaims(response),
    claims_cited: await citationChecker.countValidCitations(response),
    pageindex_node_ids: citationChecker.getNodeIds(response),
    
    // Cost tracking
    tokens_input: response.usage.input_tokens,
    tokens_output: response.usage.output_tokens,
    cost_usd: this.calculateCost(response.usage),
    
    // Performance
    latency_ms: Date.now() - startTime,
    error: false
  };
  
  // Write to eval_results
  await fetch('/api/eval-results', {
    method: 'POST',
    body: JSON.stringify(evalData)
  });
  
  return response;
}
```

---

#### Nightly Aggregation Job

```typescript
// In packages/jobs/src/aggregate-metrics.ts
// Runs at 00:30 UTC daily

export async function aggregateMetricsDaily() {
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000)
    .toISOString()
    .split('T')[0];
  
  // Call Supabase function
  const aggregated = await db.rpc('aggregate_metrics_for_date', {
    target_date: yesterday
  });
  
  console.log(`✅ Aggregated metrics for ${yesterday}`);
  return aggregated;
}
```

---

### What Doesn't Ship in Week 2

- ❌ Hallucination metric (Phase 2, Week 3)
- ❌ Latency/error dashboards (Phase 2, Week 3)
- ❌ Slack alerting integration (Phase 2, Week 3)
- ❌ Grafana dashboards (Phase 2, Week 3)
- ❌ Alert customization UI (Phase 2, Week 3)
- ❌ Budget override UI (Phase 2, Week 3)
- ❌ Multi-week historical view (Phase 2, Week 3)

---

## 8. Implementation Timeline

### Week 2 Breakdown (7 business days)

| Day | Task | Duration | Owner | Notes |
|-----|------|----------|-------|-------|
| Mon-Tue | Schema + migrations + RLS | 3 hours | @Ayush | Database setup |
| Tue-Wed | API endpoints (6 total) | 2.5 hours | @Ayush | Backend |
| Wed-Thu | Citation dashboard | 1.5 hours | @Ayush | Frontend (Supabase Studio) |
| Thu-Fri | Cost tracking dashboard | 1 hour | @Ayush | Frontend (Supabase Studio) |
| Fri | Testing, E2E, demo | 1.5 hours | @Ayush | QA + demo prep |
| **Total** | | **9.5 hours** | | |

---

## 9. Risks & Mitigations

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|-----------|
| RLS policy leaks data across teams | HIGH | LOW | Pair with @Om Patel on review; write RLS tests |
| Citator-gatekeeper not rejecting ungrounded claims | HIGH | MEDIUM | Test with known hallucinations; manual audit |
| Citation checker unreliable (false positives/negatives) | MEDIUM | MEDIUM | Use manual review as fallback |
| Dashboard slow with 100k+ evals | MEDIUM | MEDIUM | Aggregate to daily table; add indexes; load test |
| Daily spend trigger not firing | HIGH | LOW | Unit test trigger; monitor logs |
| Supabase Studio not flexible enough for team needs | MEDIUM | LOW | Plan Grafana upgrade for Week 3 |
| Cost calculation off by rounding errors | LOW | LOW | Verify with API docs; unit test |
| Team confused about when to ship (100% citation rule) | LOW | HIGH | Write runbook; demo for all agents; clear UI messaging |

---

## 10. Success Criteria (Week 2)

**Dashboard ships when ALL of these are true:**

### Functional ✅
- [ ] Citation dashboard displays real data (>0 documents evaluated)
- [ ] Citation alert fires when < 100% (RED badge appears)
- [ ] Cost dashboard accurately tracks spend vs. budget
- [ ] Cost alert fires at 80% and 100% thresholds
- [ ] All 6 API endpoints respond correctly
- [ ] Data persists after browser refresh
- [ ] Charts update every 5 minutes

### Performance ✅
- [ ] Dashboard loads in < 2 seconds
- [ ] Metrics update within 5 minutes
- [ ] Load test with 10k+ evals passes (no timeout)

### Security ✅
- [ ] RLS policies tested (Team A can't see Team B data)
- [ ] Unauthenticated users blocked
- [ ] Admin-only endpoints require role check
- [ ] No SQL injection vulnerability (parameterized queries)

### Testing ✅
- [ ] Unit tests for metric calculations (>90% coverage)
- [ ] E2E tests for both dashboards
- [ ] RLS isolation tested (manual audit)

### Quality ✅
- [ ] 3+ team members have tested it
- [ ] Zero RLS security issues
- [ ] Code reviewed by @Om Patel (DB expert)
- [ ] Week-2 report written with metrics

---

## 11. Questions for Stakeholders

**For @Paghadar (Observability) — resolved in RFC sync:**
- Week 2 stack: Supabase Studio dashboards + SQL-backed threshold checks (80% warning, 100% hard stop)
- Week 3 decision gate: move to Grafana only if we need PagerDuty/OpsGenie-style routing and richer alert policies
- Immediate escalation path: Slack warning at 80%, critical at 100%, with manager override flow

**For @KirtanPatel18 (Citation-correctness evals):**
- Are the 5 metrics right? Any missing?
- Hallucination threshold: 10% reasonable?
- How to validate citation checker accuracy?

**For @Om Patel (DB/RLS expert):**
- RLS policy correct? Any security concerns?
- Which table has team_id for row isolation?
- SQL migration testing process?
- Rate limiting strategy (per-user? per-team?)?

**For @Sohil Kareliya (FSD co-PM):**
- When should dashboard UI land in main app vs. standalone?
- Auth token handling for API calls?
- PDF export citation appendix design?

---

## 12. Glossary

- **Citation Validity:** % of legal claims that are grounded in a PageIndex node ID
- **Hallucination:** A claim the LLM makes that isn't supported by PageIndex text (LLM-as-judge score)
- **Latency:** Response time from agent call to completion (milliseconds)
- **Citator-Gatekeeper:** The agent that rejects any draft with ungrounded claims (the legal safety mechanism)
- **PageIndex:** Tree-based retrieval system for Indian Acts (Constitution, IPC, CrPC, etc.)
- **RLS:** Row-Level Security in Postgres (controls who sees which rows)
- **Eval Results:** Record of metrics from a single agent step execution
- **Daily Spend:** Real-time tracker of today's cost per LLM
- **Document Type:** RTI, NDA, legal notice, consumer complaint, employment contract

---

## Approval & Sign-Off

| Role | Name | Status | Date |
|------|------|--------|------|
| **Author** | @Ayush5112006 | ✅ Ready | May 2026 |
| **Team Lead (Evals)** | @KirtanPatel18 | ⏳ Pending | — |
| **Observability** | @Paghadar | ✅ Aligned on stack choice | May 2026 |
| **DB Expert** | @Om Patel | ⏳ Pending | — |
| **FSD Co-PM** | @Sohil Kareliya | ⏳ Pending | — |

---

## Next Steps

1. **Get stakeholder feedback** (Mon-Tue Week 1)
2. **Merge RFC to main** (Tue EOD Week 1)
3. **Create implementation branch:** `evals/dashboards-schema`
4. **Week 2 kickoff:** Monday 9 AM IST (team sync)
5. **Daily standups:** 4 PM IST (async Slack)
6. **Demo Day Friday 5 PM IST:** 60-second video + live demo

---

**This RFC is ready. Let's build the legal gatekeeper dashboards.**
