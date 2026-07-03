# RFC: Supabase Schema & RLS Policies (v1)

**Issue:** #7  
**Author:** Om Patel (`@om-patel91`)  
**Team:** Backend  
**Status:** Draft  
**Created:** 2026-05-20  

---

## 1. Context & Goals

Trionic AI Adalat is a multilingual, agentic AI assistant for Indian legal drafting. Every agent output must be grounded in a PageIndex node (citation-or-die rule). This RFC defines:

- The v1 Postgres schema for all eight core tables
- Row-Level Security (RLS) policies for each table
- Indexing and extension strategy
- Migration structure and connection info handoff to DevOps

---

## 2. Tables

### 2.1 `users`

Mirrors Supabase Auth's `auth.users` with app-level profile data.

```sql
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  role         text not null default 'user' check (role in ('user', 'admin')),
  preferred_lang text not null default 'en',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
```

**RLS:**

```sql
alter table public.users enable row level security;

-- Users can read their own profile
create policy "users: self read"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own profile (not role)
create policy "users: self update"
  on public.users for update
  using (auth.uid() = id)
  with check (role = 'user'); -- prevent self-escalation

-- Admins can read all users
create policy "users: admin read all"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
```

---

### 2.2 `documents`

Top-level legal document records. One document can have many versions.

```sql
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.users(id) on delete cascade,
  title        text not null,
  doc_type     text not null,            -- e.g. 'petition', 'affidavit', 'notice'
  language     text not null default 'en',
  status       text not null default 'draft'
                 check (status in ('draft', 'review', 'final', 'archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index on public.documents(owner_id);
create index on public.documents(status);
```

**RLS:**

```sql
alter table public.documents enable row level security;

create policy "documents: owner crud"
  on public.documents for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "documents: admin read"
  on public.documents for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
```

---

### 2.3 `document_versions`

Immutable snapshots of a document's content at each save/agent-draft cycle.

```sql
create table public.document_versions (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  version_num  integer not null,
  content_md   text not null,           -- markdown body
  change_note  text,
  created_by   uuid not null references public.users(id),
  created_at   timestamptz not null default now(),
  unique (document_id, version_num)
);

create index on public.document_versions(document_id);
```

**RLS:**

```sql
alter table public.document_versions enable row level security;

-- Read: only if you own the parent document
create policy "doc_versions: owner read"
  on public.document_versions for select
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.owner_id = auth.uid()
    )
  );

-- Insert: only if you own the parent document
create policy "doc_versions: owner insert"
  on public.document_versions for insert
  with check (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.owner_id = auth.uid()
    )
  );

-- No update/delete — versions are append-only
```

---

### 2.4 `agent_traces`

One row per LLM call made by any agent. Used for cost accounting, latency dashboards (Team F), and debugging.

```sql
create table public.agent_traces (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid references public.documents(id) on delete set null,
  user_id      uuid not null references public.users(id) on delete cascade,
  agent_name   text not null,           -- 'planner' | 'classifier' | 'drafter' | 'citator' | 'reviewer' | 'translator'
  llm_provider text not null,           -- 'claude' | 'gpt' | 'gemini' | ...
  model_name   text not null,
  prompt_tokens  integer,
  completion_tokens integer,
  cost_usd     numeric(10, 6),
  latency_ms   integer,
  status       text not null default 'ok' check (status in ('ok', 'error', 'timeout')),
  error_msg    text,
  created_at   timestamptz not null default now()
);

create index on public.agent_traces(user_id);
create index on public.agent_traces(document_id);
create index on public.agent_traces(created_at);
create index on public.agent_traces(agent_name);
```

**RLS:**

```sql
alter table public.agent_traces enable row level security;

-- Users can only see traces tied to their own work
create policy "agent_traces: user read own"
  on public.agent_traces for select
  using (auth.uid() = user_id);

-- Only service role can insert (agents run server-side)
-- Client-side insert is blocked; all writes go through API routes

-- Admins can read everything (for telemetry)
create policy "agent_traces: admin read all"
  on public.agent_traces for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
```

> **Note:** `agent_traces` is write-heavy. Consider a dedicated Postgres role with INSERT-only permission for the agents service, separate from the anon/authenticated roles.

---

### 2.5 `citations`

Each citation links a span in a document version to a PageIndex node (citation-or-die rule enforcement surface).

```sql
create table public.citations (
  id                uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references public.document_versions(id) on delete cascade,
  pageindex_node_id uuid not null references public.pageindex_nodes(id),
  span_start        integer not null,   -- character offset in content_md
  span_end          integer not null,
  quote_text        text not null,      -- the legal claim text
  verified          boolean not null default false,
  created_at        timestamptz not null default now()
);

create index on public.citations(document_version_id);
create index on public.citations(pageindex_node_id);
```

**RLS:**

```sql
alter table public.citations enable row level security;

-- Readable if you own the document containing this version
create policy "citations: owner read"
  on public.citations for select
  using (
    exists (
      select 1
      from public.document_versions dv
      join public.documents d on d.id = dv.document_id
      where dv.id = document_version_id
        and d.owner_id = auth.uid()
    )
  );

-- Only service role inserts (Citator-gatekeeper agent)
```

---

### 2.6 `pageindex_trees`

One row per indexed Act / statute. Managed by Team D (PageIndex & Corpus).

```sql
create table public.pageindex_trees (
  id           uuid primary key default gen_random_uuid(),
  act_name     text not null,
  act_year     integer,
  language     text not null default 'en',
  source_url   text,
  indexed_at   timestamptz not null default now(),
  metadata     jsonb default '{}'
);

create index on public.pageindex_trees(act_name);
```

**RLS:**

```sql
alter table public.pageindex_trees enable row level security;

-- All authenticated users can read the corpus index
create policy "pageindex_trees: auth read"
  on public.pageindex_trees for select
  using (auth.role() = 'authenticated');

-- Only service role (Team D corpus pipeline) can insert/update
```

---

### 2.7 `pageindex_nodes`

Each node is a section/sub-section within a tree, returned by PageIndex's tree query API. Stores the authoritative text used for grounding.

```sql
create table public.pageindex_nodes (
  id           uuid primary key default gen_random_uuid(),
  tree_id      uuid not null references public.pageindex_trees(id) on delete cascade,
  node_path    text not null,           -- e.g. "Part III > Section 12 > Clause (a)"
  heading      text,
  body_text    text not null,
  embedding    vector(1536),            -- pgvector; nullable until corpus pipeline runs
  created_at   timestamptz not null default now()
);

create index on public.pageindex_nodes(tree_id);
create index on public.pageindex_nodes using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);                  -- tune lists after corpus size is known
```

**RLS:**

```sql
alter table public.pageindex_nodes enable row level security;

create policy "pageindex_nodes: auth read"
  on public.pageindex_nodes for select
  using (auth.role() = 'authenticated');

-- Only service role writes (corpus ingestion pipeline)
```

---

### 2.8 `eval_runs`

Evaluation harness results, owned by Team F (Evals & Telemetry).

```sql
create table public.eval_runs (
  id           uuid primary key default gen_random_uuid(),
  run_name     text not null,
  eval_type    text not null,           -- 'citation_accuracy' | 'translation_bleu' | 'draft_quality' | ...
  config       jsonb not null default '{}',
  results      jsonb,
  score        numeric(5, 4),           -- 0.0000 – 1.0000
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  run_by       uuid references public.users(id) on delete set null,
  status       text not null default 'running'
                 check (status in ('running', 'passed', 'failed', 'error'))
);

create index on public.eval_runs(eval_type);
create index on public.eval_runs(status);
```

**RLS:**

```sql
alter table public.eval_runs enable row level security;

-- All authenticated users can read eval results (transparency)
create policy "eval_runs: auth read"
  on public.eval_runs for select
  using (auth.role() = 'authenticated');

-- Only the runner (or admin) can insert/update
create policy "eval_runs: runner insert"
  on public.eval_runs for insert
  with check (auth.uid() = run_by);

create policy "eval_runs: runner update"
  on public.eval_runs for update
  using (auth.uid() = run_by);
```

---

## 3. Extensions Required

```sql
-- UUID generation (already enabled in Supabase)
create extension if not exists "pgcrypto";

-- Vector similarity search for PageIndex node embeddings
create extension if not exists "vector";
```

---

## 4. Migration Structure

```
packages/db/
└── migrations/
    ├── 0001_enable_extensions.sql
    ├── 0002_users.sql
    ├── 0003_documents.sql
    ├── 0004_document_versions.sql
    ├── 0005_pageindex_trees.sql
    ├── 0006_pageindex_nodes.sql
    ├── 0007_citations.sql
    ├── 0008_agent_traces.sql
    └── 0009_eval_runs.sql
```

Run order matters: `pageindex_trees` and `pageindex_nodes` must precede `citations` (foreign key dependency).

Use `supabase db push` locally and in CI:

```bash
supabase db push --db-url $SUPABASE_DB_URL
```

---

## 5. Roles & Service Key Usage

| Caller | Supabase Role | Notes |
|---|---|---|
| Browser (Next.js client) | `authenticated` | JWT from Supabase Auth |
| API routes (Team B) | `service_role` | Server-side only; never exposed to client |
| Corpus pipeline (Team D) | `service_role` | Writes to `pageindex_*` tables |
| Agents (packages/agents) | `service_role` | Writes `agent_traces`, `citations` |

> **Hard rule:** The `service_role` key must never appear in client-side bundles. All writes from agents and pipelines go through Next.js API routes or a dedicated server process.

---

## 6. TypeScript Types

After schema is applied, generate types with:

```bash
supabase gen types typescript --project-id $SUPABASE_PROJECT_ID \
  > packages/db/src/types.ts
```

Commit `types.ts` to the repo and re-run whenever the schema changes.

---

## 7. Connection Info Handoff (DevOps)

Once the Supabase project is provisioned, post the following to the DevOps channel / infra secrets store:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Project API URL |
| `SUPABASE_ANON_KEY` | Public anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service key (server only, never public) |
| `SUPABASE_DB_URL` | Direct Postgres URL (for migrations) |

Ping `@Paghadar Prins` (DevOps) to add these to the repo's environment secrets for CI/CD.

---

## 8. Open Questions

1. **Soft-delete vs hard-delete for documents?** Current schema uses `status = 'archived'` as logical delete — is that sufficient or do we need a `deleted_at` tombstone column?
2. **Citation verification workflow:** Who sets `citations.verified = true`? The Reviewer agent, a human, or both?
3. **pgvector `lists` tuning:** IVFFlat index requires enough rows to be useful. Should we defer the vector index creation until after corpus ingestion is complete?
4. **Multi-tenancy future:** Current RLS is per-user. If Team accounts are added later, the `documents` table will need a `team_id` foreign key. Flag for v2.

---

## 9. Checklist

- [ ] Schema SQL reviewed by at least one other Backend team member
- [ ] RLS policies manually tested with Supabase policy tester
- [ ] Migrations run cleanly on a fresh Supabase project
- [ ] TypeScript types generated and committed
- [ ] Connection info posted to DevOps
- [ ] `week-1.md` report references this RFC
