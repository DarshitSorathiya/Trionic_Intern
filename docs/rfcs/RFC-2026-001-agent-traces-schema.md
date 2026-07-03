# RFC-2026-001 — Agent Traces Schema Definition

> Defining the `agent_traces` table — required fields, nested call linking, and PII redaction rules

| | |
|---|---|
| **RFC Number** | RFC-2026-001 |
| **Title** | Agent Traces Schema Definition |
| **Author** | Yug Umrania (@YugUmrania) — Agents Team |
| **Team Owner** | Team B (table owner) · Agents Team (RFC author) |
| **Status** | Draft — Open for Review |
| **GitHub Issue** | #18 |
| **Branch** | `agents/trace-schema-rfc` |
| **Created** | 2026-05-18 |
| **Last Updated** | 2026-05-18 |

---

## 1. Summary

This RFC proposes the schema for the `agent_traces` table, owned and maintained by Team B. The purpose of this table is to store a structured log of every agent call made within the Trionic Technology platform. Each row represents a single agent invocation and captures timing, status, inputs, outputs, and linkage to parent/child calls.

This document defines:

- All required and optional columns with their data types and descriptions
- How nested (parent-child) agent calls are linked together in the same table
- Rules for detecting and redacting Personally Identifiable Information (PII) before data is stored

---

## 2. Motivation

As Trionic Technology scales its agent-based architecture, observability becomes critical. Without a centralized trace log, debugging failures, measuring latency, and auditing agent behaviour across complex multi-step pipelines is impossible.

### 2.1 Problems This Solves

- Inability to trace which agent call caused a downstream failure in a multi-agent chain
- No structured way to measure per-agent latency and token usage
- Risk of storing user PII in raw logs without a clear redaction policy
- No shared contract between teams about what data an agent call produces

### 2.2 Goals

- Single source of truth for all agent executions across the platform
- Support full call-tree reconstruction for any root trace
- Ensure compliance with data privacy policies through mandatory PII redaction
- Remain lightweight enough for high-throughput production insertion

---

## 3. Schema Definition

### 3.1 Table: `agent_traces`

| Field Name | Type | Nullable | Description |
|---|---|---|---|
| `trace_id` | UUID | NO | Primary key. Unique identifier for each agent call. Auto-generated (UUIDv4). |
| `parent_trace_id` | UUID | YES | References `trace_id` of the calling agent. NULL if this is a root-level call. |
| `root_trace_id` | UUID | NO | Always points to the top-level trace. Equals `trace_id` for root calls. Enables full tree retrieval. |
| `call_depth` | INTEGER | NO | Depth in the call tree. 0 = root, 1 = first child, 2 = grandchild, etc. |
| `agent_name` | VARCHAR(128) | NO | Name of the agent that was called. Example: `summarizer_agent`, `citator_gatekeeper`. |
| `agent_version` | VARCHAR(32) | YES | Semantic version of the agent. Helps correlate regressions to deployments. |
| `started_at` | TIMESTAMPTZ | NO | UTC timestamp when the agent call began. Indexed for time-range queries. |
| `ended_at` | TIMESTAMPTZ | YES | UTC timestamp when the agent call completed. NULL if still in progress. |
| `duration_ms` | INTEGER | YES | Computed: `ended_at` minus `started_at` in milliseconds. NULL if incomplete. |
| `status` | ENUM | NO | Outcome of the call: `success`, `error`, `timeout`, `cancelled`. |
| `input_payload` | JSONB | YES | Input data sent to the agent. PII fields are redacted before storage (see §5). |
| `output_payload` | JSONB | YES | Output data returned by the agent. PII fields are redacted before storage (see §5). |
| `citation_node_ids` | TEXT[] | YES | PageIndex node IDs cited by this agent call. Required for any agent making legal claims. Enforced by the Citator-gatekeeper agent. |
| `error_code` | VARCHAR(64) | YES | Machine-readable error code. NULL if status = `success`. Example: `TIMEOUT_503`. |
| `error_message` | TEXT | YES | Human-readable error description. Redacted if it contains PII. |
| `model_id` | VARCHAR(128) | YES | LLM model used by this agent. Example: `claude-sonnet-4-20250514`. |
| `token_input` | INTEGER | YES | Number of tokens in the input prompt. For cost/usage tracking. |
| `token_output` | INTEGER | YES | Number of tokens in the output. For cost/usage tracking. |
| `session_id` | UUID | YES | Groups traces belonging to one user session. Useful for UX debugging. |
| `user_id_hash` | VARCHAR(64) | YES | SHA-256 hash of the user ID. Never store raw user IDs in this table. |
| `environment` | VARCHAR(32) | NO | Deployment environment: `production`, `staging`, `development`. |
| `metadata` | JSONB | YES | Arbitrary key-value tags for filtering. Example: `{team: 'agents', feature: 'citator'}`. |
| `redaction_applied` | BOOLEAN | NO | TRUE if any PII redaction was applied to this row's payloads. |
| `created_at` | TIMESTAMPTZ | NO | Row insertion timestamp. Defaults to NOW(). Used for data retention. |

### 3.2 SQL DDL

```sql
CREATE TABLE agent_traces (
  trace_id            UUID          NOT NULL DEFAULT gen_random_uuid(),
  parent_trace_id     UUID          REFERENCES agent_traces(trace_id),
  root_trace_id       UUID          NOT NULL,
  call_depth          INTEGER       NOT NULL DEFAULT 0,
  agent_name          VARCHAR(128)  NOT NULL,
  agent_version       VARCHAR(32),
  started_at          TIMESTAMPTZ   NOT NULL,
  ended_at            TIMESTAMPTZ,
  duration_ms         INTEGER GENERATED ALWAYS AS (
                        EXTRACT(EPOCH FROM (ended_at - started_at)) * 1000) STORED,
  status              VARCHAR(20)   NOT NULL
                        CHECK (status IN ('success','error','timeout','cancelled')),
  input_payload       JSONB,
  output_payload      JSONB,
  citation_node_ids   TEXT[],
  error_code          VARCHAR(64),
  error_message       TEXT,
  model_id            VARCHAR(128),
  token_input         INTEGER,
  token_output        INTEGER,
  session_id          UUID,
  user_id_hash        VARCHAR(64),
  environment         VARCHAR(32)   NOT NULL DEFAULT 'production',
  metadata            JSONB,
  redaction_applied   BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  PRIMARY KEY (trace_id)
);
```

### 3.3 Indexes

```sql
CREATE INDEX idx_traces_root     ON agent_traces (root_trace_id);
CREATE INDEX idx_traces_parent   ON agent_traces (parent_trace_id);
CREATE INDEX idx_traces_time     ON agent_traces (started_at DESC);
CREATE INDEX idx_traces_agent    ON agent_traces (agent_name, started_at DESC);
CREATE INDEX idx_traces_session  ON agent_traces (session_id);
```

### 3.4 Row-Level Security (RLS)

This table must have Postgres RLS policies applied (Supabase standard). Suggested policy: users may only read rows where `user_id_hash` matches their own hashed identity. Team B is responsible for defining and enabling RLS policies before the table goes to production.

---

## 4. Nested Call Linking

When one agent calls another, both calls get their own rows in `agent_traces`. They are linked using three fields.

### 4.1 Linking Fields Explained

- `trace_id` — unique ID of this specific call
- `parent_trace_id` — the `trace_id` of the agent that called this one (NULL if root)
- `root_trace_id` — always the `trace_id` of the very first call in the chain (same for all rows in a tree)
- `call_depth` — how many levels deep this call is (root = 0, first child = 1, grandchild = 2)

### 4.2 Example: Three-Level Call Tree
UserQueryAgent  (trace_id=AAA, parent=NULL,  root=AAA, depth=0)

    └─ SearchAgent  (trace_id=BBB, parent=AAA,  root=AAA, depth=1)

    └─ EmbedAgent  (trace_id=CCC, parent=BBB,  root=AAA, depth=2)

To fetch the entire call tree for a given root:

```sql
SELECT * FROM agent_traces
WHERE root_trace_id = 'AAA'
ORDER BY call_depth, started_at;
```

### 4.3 Linking Rules

- Every agent call MUST write its row to `agent_traces` before calling any child agents
- The `root_trace_id` must be propagated by the caller through the request context
- `call_depth` must be incremented by 1 for each level of nesting
- Asynchronous child calls should still have `parent_trace_id` set before they execute
- Orphaned traces (parent missing) are permitted in edge cases but should be flagged in monitoring

---

## 5. PII Redaction Rules

No Personally Identifiable Information (PII) may be stored in raw form. All redaction must happen **before** the row is inserted. The redaction layer is applied by the agent framework, not by Team B.

### 5.1 What Counts as PII

| PII Category | Example | Redaction Method | Applies To |
|---|---|---|---|
| Full Name | Raghav Singh | Replace with `[NAME REDACTED]` | `input_payload`, `output_payload`, `error_message` |
| Email Address | user@example.com | Replace with `[EMAIL REDACTED]` | `input_payload`, `output_payload` |
| Phone Number | +91-9876543210 | Replace with `[PHONE REDACTED]` | `input_payload`, `output_payload` |
| Aadhaar / National ID | 1234-5678-9012 | Replace with `[ID REDACTED]` | `input_payload`, `output_payload` |
| IP Address | 192.168.1.1 | Mask last octet: `192.168.1.xxx` | `metadata`, `input_payload` |
| Date of Birth | 1990-05-15 | Replace with `[DOB REDACTED]` | `input_payload`, `output_payload` |
| Financial Info | 4111 1111 1111 1111 | Replace with `[FINANCIAL REDACTED]` | `input_payload`, `output_payload` |
| Raw User ID | user_abc123 | SHA-256 hash → `user_id_hash` | Never stored raw in any field |

### 5.2 Redaction Process

Every agent must follow these steps before writing to `agent_traces`:

1. Scan `input_payload` and `output_payload` using the shared PII detector library (`pii-scanner v2+`)
2. Replace detected PII with the appropriate placeholder token (e.g. `[EMAIL REDACTED]`)
3. Scan `error_message` and apply redaction if PII is detected
4. Set `redaction_applied = TRUE` if any field was modified
5. Hash any user ID using SHA-256 and store in `user_id_hash` — never store raw user IDs

### 5.3 Redaction Responsibilities

- **Agent Framework Team** — maintains the `pii-scanner` library and keeps regex rules updated
- **Team B (Table Owner)** — enforces `redaction_applied` is present; may reject rows missing this field
- **Calling Agent** — responsible for running redaction before insert; cannot delegate to Team B
- **Security Team** — quarterly audit of sampled rows to verify redaction quality

### 5.4 What NOT to Redact

The following are NOT PII in this context and should NOT be redacted:

- `agent_name`, `agent_version`, `model_id` — system identifiers
- `session_id` — a random UUID with no user identity attached
- `environment`, `metadata` tags — technical routing labels only

---

## 6. Data Retention

| Environment | Retention | Action |
|---|---|---|
| Production | 90 days | Archived to cold storage |
| Staging / Development | 14 days | Hard deleted |
| Rows with `redaction_applied = FALSE` after 7 days | — | Flagged for manual review |

Archived rows remain searchable via the Data Platform query API.

---

## 7. Open Questions for Team B

- **Q1:** Should `duration_ms` be a generated column in PostgreSQL, or computed by the application layer?
- **Q2:** What is the expected insert volume per day? This affects index strategy and partitioning decisions.
- **Q3:** Should `agent_traces` be partitioned by `started_at` (monthly) for performance?
- **Q4:** Is there a requirement to support soft-deletes, or is hard deletion acceptable for the retention policy?
- **Q5:** Should `metadata` be a JSONB column or a separate `agent_trace_tags` table for structured querying?

---

## 8. Alternatives Considered

### 8.1 Separate Tables per Agent
Rejected — makes cross-agent analysis and call-tree reconstruction very difficult, and creates operational overhead for Team B every time a new agent is added.

### 8.2 Event Streaming Only (No DB Table)
Rejected — makes ad-hoc debugging queries and PII auditing much harder without a queryable storage layer.

### 8.3 Using `parent_trace_id` Only (No `root_trace_id`)
Rejected — recursive CTEs are expensive for deeply nested trees. `root_trace_id` allows O(1) tree retrieval with a single indexed query.

---

## 9. Review & Approval

This RFC will be considered accepted after:

- Approval from Team B (table owner)
- Approval from the Security Team (PII redaction rules)
- No blocking objections within 5 business days of circulation

| Reviewer | Team | Decision | Date |
|---|---|---|---|
| Team B Lead | — | Pending | — |
| Security Team | — | Pending | — |
| Platform Architect | — | Pending | — |

---

*RFC-2026-001 | Agent Traces Schema | Trionic Technology — Internal Document*