# RFC: Document Versioning Model & Audit-Log Read API

**Author:** Aayush Tilva  
**Team:** B — Backend  
**Module:** Versioning + Audit Log API  
**Date:** 2026-05-21  
**Status:** Draft

---

## 1. Problem Statement

Every legal draft produced by Adalat is the output of a multi-agent pipeline. Users edit drafts after generation; agents re-run after a Citator rejection. We need two guarantees:

1. **No version is ever lost.** A user must be able to see the full history of a document and revert to any past version.
2. **No agent action is unaccountable.** Every LLM call, citation check, and rejection must be queryable so Team F (Evals) can compute hallucination rates, cost, and citation validity.

This RFC specifies the data model and API surface that delivers both guarantees.

---

## 2. Scope

- **In scope:** `document_versions` table schema, `agent_traces` table schema, `GET /api/audit` and `GET /api/documents/:id/versions` API routes, RLS policies, retention policy, redaction rules, and the read contract with Team F.
- **Out of scope:** PDF/DOCX export (Harsh Korat), agent invocation streaming (Prashant Gangani), write paths for traces (owned by the agent layer — Team C).

---

## 3. Data Model

### 3.1 `document_versions`

Append-only. One row per save event. Never updated or deleted in-place.

```sql
CREATE TABLE document_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,            -- monotonically increasing per document
  content_md      TEXT NOT NULL,               -- full markdown snapshot
  diff_from_prev  JSONB,                       -- optional: JSON patch vs. previous version
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  agent_trace_id  UUID REFERENCES agent_traces(id), -- null if user-initiated save
  is_agent_draft  BOOLEAN NOT NULL DEFAULT FALSE,
  snapshot_ids    TEXT[] NOT NULL DEFAULT '{}',      -- PageIndex snapshot IDs used in this version

  UNIQUE (document_id, version_number)
);
```

**Versioning rule:** `version_number` is assigned by the API as `MAX(version_number) + 1` within the document, inside a transaction with a row-level lock on the `documents` row to prevent races.

### 3.2 `agent_traces`

Written by the agent layer (Team C). Read by this module and Team F.

```sql
CREATE TABLE agent_traces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID REFERENCES documents(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  agent_name      TEXT NOT NULL,               -- e.g. "drafter", "citator-gatekeeper"
  model           TEXT NOT NULL,               -- e.g. "claude-3-5-sonnet-20241022"
  tokens_in       INTEGER NOT NULL,
  tokens_out      INTEGER NOT NULL,
  cost_usd        NUMERIC(10, 6) NOT NULL,
  latency_ms      INTEGER NOT NULL,
  cited_node_ids  TEXT[] NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL CHECK (status IN ('ok', 'rejected', 'error')),
  rejection_reason TEXT,                       -- non-null when status = 'rejected'
  input_hash      TEXT,                        -- SHA-256 of the input prompt (no raw PII stored)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

> **PII rule (Hard Constraint #5):** Raw prompt text is **never persisted**. Only `input_hash` (SHA-256) is stored. Redaction happens at write-time in the agent layer before the row is inserted.

---

## 4. Events Logged

| Event | `agent_name` value | `status` |
|---|---|---|
| Classifier ran | `classifier` | `ok` / `error` |
| Planner ran | `planner` | `ok` / `error` |
| Drafter produced a draft | `drafter` | `ok` / `error` |
| Citator-gatekeeper accepted | `citator-gatekeeper` | `ok` |
| Citator-gatekeeper rejected | `citator-gatekeeper` | `rejected` |
| Reviewer ran | `reviewer` | `ok` / `error` |
| Translator ran | `translator` | `ok` / `error` |
| User saved a manual edit | — | *(version row only, no trace row)* |

---

## 5. Retention Policy

| Table | Retention | Rationale |
|---|---|---|
| `document_versions` | Forever (per-user lifetime) | Users own their drafts; deletion follows account deletion via CASCADE |
| `agent_traces` | **90 days** rolling | Sufficient for 6-week eval cycles; reduces storage cost |

A nightly Postgres cron job (via `pg_cron`) will `DELETE FROM agent_traces WHERE created_at < now() - INTERVAL '90 days'`.

---

## 6. RLS Policies

### `document_versions`
```sql
-- Users can only read versions of documents they own
CREATE POLICY "owner_read_versions" ON document_versions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

-- Insert allowed only for the document owner (API enforces this too)
CREATE POLICY "owner_insert_version" ON document_versions
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND document_id IN (SELECT id FROM documents WHERE user_id = auth.uid())
  );
```

### `agent_traces`
```sql
-- Users can only see traces for their own documents
CREATE POLICY "owner_read_traces" ON agent_traces
  FOR SELECT USING (user_id = auth.uid());

-- Team F service role can read all (for eval aggregation) — uses service_role key, not anon
-- No additional policy needed; service_role bypasses RLS by design
```

---

## 7. API Routes

### 7.1 `GET /api/documents/:id/versions`

Returns the version history of a document (most recent first).

**Auth:** Supabase JWT (user must own the document — enforced by RLS).

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | Max versions to return |
| `cursor` | UUID | — | Pagination: `id` of the last item in previous page |

**Response (200):**
```json
{
  "versions": [
    {
      "id": "uuid",
      "version_number": 7,
      "created_at": "2026-05-21T12:00:00Z",
      "created_by": "uuid",
      "is_agent_draft": true,
      "agent_trace_id": "uuid",
      "snapshot_ids": ["2024-12-01"]
    }
  ],
  "next_cursor": "uuid-of-last-item"
}
```

> `content_md` is **not** returned in the list — too large. Fetch a single version via `GET /api/documents/:id/versions/:version_number` to get the full markdown.

### 7.2 `GET /api/documents/:id/versions/:version_number`

Returns the full content of one specific version.

**Response (200):**
```json
{
  "id": "uuid",
  "document_id": "uuid",
  "version_number": 7,
  "content_md": "## Legal Notice\n\n[CITE:ICA-1872/S-73] ...",
  "diff_from_prev": null,
  "created_at": "2026-05-21T12:00:00Z",
  "is_agent_draft": true,
  "snapshot_ids": ["2024-12-01"]
}
```

### 7.3 `GET /api/audit`

Returns the audit log (agent traces) for the calling user.  
Team F reads this via the **service role** (bypasses RLS) for cross-user aggregation.

**Auth:** Supabase JWT (returns only calling user's traces) **or** service-role key (returns all, used by Team F).

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `document_id` | UUID | — | Filter by document |
| `agent_name` | string | — | Filter by agent (e.g. `citator-gatekeeper`) |
| `status` | string | — | `ok`, `rejected`, or `error` |
| `from` | ISO date | 30 days ago | Start of time window |
| `to` | ISO date | now | End of time window |
| `limit` | integer | 50 | Max rows |
| `cursor` | UUID | — | Pagination cursor |

**Response (200):**
```json
{
  "traces": [
    {
      "id": "uuid",
      "document_id": "uuid",
      "agent_name": "citator-gatekeeper",
      "model": "claude-3-5-sonnet-20241022",
      "tokens_in": 1240,
      "tokens_out": 88,
      "cost_usd": 0.004512,
      "latency_ms": 1830,
      "cited_node_ids": ["ICA-1872/CH-VI/S-73"],
      "status": "rejected",
      "rejection_reason": "span at [412,560] has no cited node",
      "created_at": "2026-05-21T12:01:33Z"
    }
  ],
  "next_cursor": "uuid"
}
```

**Redacted fields at read-time:**

- `input_hash` is **never** returned to user-facing requests (only available to service-role queries from Team F).
- `user_id` is stripped from all responses (callers already know who they are; Team F gets anonymized IDs in their eval contract — see §8).

---

## 8. Data Contract with Team F (Evals)

Team F runs eval pipelines to compute citation validity, hallucination rate, and per-LLM cost/latency. They will query `GET /api/audit` using the service-role key from within the `packages/evals` package.

### What Team F receives

```ts
// packages/shared/src/types.ts (to be added)
export type AuditTraceForEvals = {
  id: string;                      // trace UUID
  anon_user_id: string;            // SHA-256(user_id) — no raw user IDs
  document_id: string;
  agent_name: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  latency_ms: number;
  cited_node_ids: string[];
  status: "ok" | "rejected" | "error";
  rejection_reason: string | null;
  created_at: string;              // ISO 8601
  // input_hash available on request with explicit flag: ?include_hash=true
};
```

### What Team F does NOT receive

| Field | Reason |
|---|---|
| Raw `user_id` | PII — replaced with `SHA-256(user_id)` |
| `content_md` of any version | Not in the trace; requires a separate document-owner-scoped query |
| Raw prompt text | Never persisted (per Hard Constraint #5) |

### Eval query example

```
GET /api/audit?agent_name=citator-gatekeeper&from=2026-05-14&limit=500
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

---

## 9. Open Questions

1. **`diff_from_prev` format** — JSON Patch (RFC 6902) or a simpler line-diff string? Leaning JSON Patch for programmatic access. Input from Team A (redline editor) welcome.
2. **90-day retention** — Is this sufficient for the 6-week internship eval cycle? Could go to 180 days at negligible cost. Decision for Om (lead) + Kirtan (Team F lead).
3. **Manual save trigger** — Does every keystroke create a version, or only explicit "Save" actions? Assuming explicit save + every agent completion. Needs alignment with Harsh (export) and Sohil (editor UI).

---

## 10. Implementation Checklist (Week 1 → 2)

- [ ] This RFC merged and reviewed
- [ ] `packages/db/migrations/0002_versioning.sql` — create `document_versions` and `agent_traces` tables + RLS policies
- [ ] `apps/web/app/api/documents/[id]/versions/route.ts` — list versions endpoint
- [ ] `apps/web/app/api/documents/[id]/versions/[version]/route.ts` — single version endpoint
- [ ] `apps/web/app/api/audit/route.ts` — audit log read endpoint
- [ ] `packages/shared/src/types.ts` — `AuditTraceForEvals` type exported
- [ ] Coordinate with Team C (agent layer) on `agent_traces` write contract
- [ ] Coordinate with Team F on eval query patterns
