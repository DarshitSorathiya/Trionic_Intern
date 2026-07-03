-- =============================================================================
-- Migration: 0001_init.sql
-- Description: Initial schema for Trionic AI Adalat — all 8 core tables + RLS
-- Author: Om Patel (@om-patel91)
-- Issue: #73 (Week-2 implementation of RFC from Week-1 #7)
-- Apply: supabase db push  OR paste into Supabase SQL Editor
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type document_status   as enum ('draft', 'review', 'final', 'archived', 'failed');
create type document_type     as enum ('petition', 'affidavit', 'notice', 'agreement', 'complaint', 'reply', 'other');
create type supported_language as enum ('en', 'hi', 'gu', 'mr', 'ta', 'te', 'kn', 'bn', 'pa', 'ur');
create type agent_name_enum   as enum ('planner', 'classifier', 'drafter', 'citator', 'reviewer', 'translator');
create type trace_status      as enum ('ok', 'error', 'timeout');
create type eval_status       as enum ('running', 'passed', 'failed', 'error');
create type user_role         as enum ('user', 'admin');

-- ---------------------------------------------------------------------------
-- Table: users
-- Mirrors auth.users with app-level profile data.
-- ---------------------------------------------------------------------------
create table public.users (
  id               uuid          primary key references auth.users(id) on delete cascade,
  email            text          not null unique,
  display_name     text,
  role             user_role     not null default 'user',
  default_language supported_language not null default 'en',
  onboarded_at     timestamptz,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- RLS
alter table public.users enable row level security;

create policy "users: self read"
  on public.users for select
  using (auth.uid() = id);

create policy "users: self update"
  on public.users for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.users where id = auth.uid())  -- prevent self-escalation
  );

create policy "users: admin read all"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Auto-create user row on Supabase Auth sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Table: documents
-- Top-level legal document records.
-- ---------------------------------------------------------------------------
create table public.documents (
  id               uuid              primary key default gen_random_uuid(),
  owner_id         uuid              not null references public.users(id) on delete cascade,
  title            text              not null default 'Untitled Draft',
  doc_type         document_type     not null default 'other',
  language         supported_language not null default 'en',
  status           document_status   not null default 'draft',
  intake_text      text,             -- seed text from intake form
  conversation_state jsonb           default '{}',   -- agent memory (yatri04 #115)
  created_at       timestamptz       not null default now(),
  updated_at       timestamptz       not null default now()
);

create index documents_owner_id_idx  on public.documents(owner_id);
create index documents_status_idx    on public.documents(status);
create index documents_created_at_idx on public.documents(created_at desc);

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- RLS
alter table public.documents enable row level security;

create policy "documents: owner all"
  on public.documents for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "documents: admin read"
  on public.documents for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- Table: document_versions
-- Append-only snapshots. Never update or delete a version.
-- ---------------------------------------------------------------------------
create table public.document_versions (
  id              uuid        primary key default gen_random_uuid(),
  document_id     uuid        not null references public.documents(id) on delete cascade,
  version_num     integer     not null,
  body_markdown   text        not null,
  change_note     text,
  created_by      uuid        not null references public.users(id),
  created_at      timestamptz not null default now(),
  unique (document_id, version_num)
);

create index doc_versions_document_id_idx on public.document_versions(document_id);
create index doc_versions_created_at_idx  on public.document_versions(created_at desc);

-- RLS  (append-only: no update/delete policies)
alter table public.document_versions enable row level security;

create policy "doc_versions: owner read"
  on public.document_versions for select
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.owner_id = auth.uid()
    )
  );

create policy "doc_versions: owner insert"
  on public.document_versions for insert
  with check (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.owner_id = auth.uid()
    )
    and auth.uid() = created_by
  );

-- ---------------------------------------------------------------------------
-- Table: pageindex_trees
-- One row per indexed Act / statute. Managed by Team D.
-- Must exist before pageindex_nodes (FK dependency).
-- ---------------------------------------------------------------------------
create table public.pageindex_trees (
  id          uuid        primary key default gen_random_uuid(),
  act_name    text        not null,
  act_year    integer,
  language    supported_language not null default 'en',
  source_url  text,
  indexed_at  timestamptz not null default now(),
  metadata    jsonb       not null default '{}'
);

create index pageindex_trees_act_name_idx on public.pageindex_trees(act_name);

-- RLS (read: all authenticated; write: service role only)
alter table public.pageindex_trees enable row level security;

create policy "pageindex_trees: auth read"
  on public.pageindex_trees for select
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Table: pageindex_nodes
-- Sections / sub-sections of an Act. Holds authoritative text + embedding.
-- Must exist before citations (FK dependency).
-- ---------------------------------------------------------------------------
create table public.pageindex_nodes (
  id          uuid        primary key default gen_random_uuid(),
  tree_id     uuid        not null references public.pageindex_trees(id) on delete cascade,
  node_path   text        not null,   -- e.g. "Part III > Section 12 > Clause (a)"
  heading     text,
  body_text   text        not null,
  embedding   vector(1536),           -- populated by corpus ingestion pipeline (Team D)
  created_at  timestamptz not null default now()
);

create index pageindex_nodes_tree_id_idx on public.pageindex_nodes(tree_id);
-- IVFFlat index for cosine similarity — create AFTER corpus is loaded (needs rows to tune lists)
-- create index pageindex_nodes_embedding_idx
--   on public.pageindex_nodes using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RLS (read: all authenticated; write: service role only)
alter table public.pageindex_nodes enable row level security;

create policy "pageindex_nodes: auth read"
  on public.pageindex_nodes for select
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Table: citations
-- Links a span in a document version to a pageindex_node (citation-or-die).
-- ---------------------------------------------------------------------------
create table public.citations (
  id                    uuid        primary key default gen_random_uuid(),
  document_version_id   uuid        not null references public.document_versions(id) on delete cascade,
  pageindex_node_id     uuid        not null references public.pageindex_nodes(id),
  span_start            integer     not null,   -- char offset in body_markdown
  span_end              integer     not null,
  quote_text            text        not null,   -- the legal claim text
  verified              boolean     not null default false,
  created_at            timestamptz not null default now(),
  constraint citations_span_check check (span_end > span_start)
);

create index citations_document_version_id_idx on public.citations(document_version_id);
create index citations_pageindex_node_id_idx   on public.citations(pageindex_node_id);

-- RLS (write: service role only — Citator-gatekeeper agent via API routes)
alter table public.citations enable row level security;

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

-- ---------------------------------------------------------------------------
-- Table: agent_traces
-- One row per LLM call. Written by API routes (service role).
-- Read by owners for /api/audit and by admins / Team F for evals.
-- ---------------------------------------------------------------------------
create table public.agent_traces (
  id                uuid          primary key default gen_random_uuid(),
  document_id       uuid          references public.documents(id) on delete set null,
  user_id           uuid          not null references public.users(id) on delete cascade,
  agent_name        agent_name_enum not null,
  llm_provider      text          not null,
  model_name        text          not null,
  prompt_tokens     integer,
  completion_tokens integer,
  cost_usd          numeric(10,6),
  latency_ms        integer,
  status            trace_status  not null default 'ok',
  error_msg         text,
  metadata          jsonb         not null default '{}',
  created_at        timestamptz   not null default now()
);

create index agent_traces_user_id_idx     on public.agent_traces(user_id);
create index agent_traces_document_id_idx on public.agent_traces(document_id);
create index agent_traces_created_at_idx  on public.agent_traces(created_at desc);
create index agent_traces_agent_name_idx  on public.agent_traces(agent_name);

-- RLS (write: service role only via API routes — never from client)
alter table public.agent_traces enable row level security;

create policy "agent_traces: owner read"
  on public.agent_traces for select
  using (auth.uid() = user_id);

create policy "agent_traces: admin read all"
  on public.agent_traces for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- Table: eval_runs
-- Eval harness results. Owned by Team F (Evals & Telemetry).
-- ---------------------------------------------------------------------------
create table public.eval_runs (
  id          uuid        primary key default gen_random_uuid(),
  run_name    text        not null,
  eval_type   text        not null,   -- 'citation_accuracy' | 'translation_bleu' | 'draft_quality' | ...
  config      jsonb       not null default '{}',
  results     jsonb,
  score       numeric(5,4),           -- 0.0000 – 1.0000
  run_by      uuid        references public.users(id) on delete set null,
  status      eval_status not null default 'running',
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);

create index eval_runs_eval_type_idx on public.eval_runs(eval_type);
create index eval_runs_status_idx    on public.eval_runs(status);
create index eval_runs_started_at_idx on public.eval_runs(started_at desc);

-- RLS
alter table public.eval_runs enable row level security;

create policy "eval_runs: auth read"
  on public.eval_runs for select
  using (auth.role() = 'authenticated');

create policy "eval_runs: runner insert"
  on public.eval_runs for insert
  with check (auth.uid() = run_by);

create policy "eval_runs: runner update"
  on public.eval_runs for update
  using (auth.uid() = run_by);

-- =============================================================================
-- End of migration 0001_init.sql
-- =============================================================================