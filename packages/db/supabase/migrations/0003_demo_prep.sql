-- =============================================================================
-- Migration: 0003_demo_prep.sql
-- Applied: 2026-06-23 (in Om's absence)
-- Purpose:   Demo-prep schema fixes for Week 5 → Week 6.
--            Three P0 findings from the multi-agent code review (Mon Jun 22):
--            - every draft fails because document_status lacks 'generating'
--            - every citator rejection is silently dropped because trace_status
--              lacks 'rejected' AND the tracer coerces unknown statuses to 'ok'
--            - every trace insert fails because the tracer writes a doc_type
--              column that did not exist
-- =============================================================================

-- 1. document_status: add 'generating' (iterate/retry routes write this value;
--    Postgres was rejecting every write with 22P02 before this migration.)
alter type document_status add value if not exists 'generating';

-- 2. trace_status: add 'rejected' (citator + reviewer emit rejected; the
--    tracer was silently coercing it to 'ok' — see fix in tracing/index.ts.)
alter type trace_status add value if not exists 'rejected';
-- 3. agent_traces.doc_type — tracer writes this column; without it every
--    insert was failing (0 rows persisted for 38 prior drafts).
--    insert was failing (0 rows persisted for 38 prior drafts).
alter table public.agent_traces
  add column if not exists doc_type text;

comment on column public.agent_traces.doc_type is
  'Document type at trace time (one of @trionic/shared DocumentType values). '
  'Nullable: pre-classifier traces may not yet have a doc_type.';

-- Helpful for per-doc-type analytics queries (Parth #329, Ayush #308).
create index if not exists agent_traces_doc_type_idx
  on public.agent_traces(doc_type)
  where doc_type is not null;
