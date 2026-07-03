-- =============================================================================
-- Migration: 0004_doc_type_text.sql
-- Applied: 2026-06-23 (in Om's absence)
-- Purpose:   Convert documents.doc_type from the legacy `document_type` enum
--            to TEXT with a CHECK constraint matching the @trionic/shared
--            DocumentType union.
--
-- Why this matters:
--   The legacy `document_type` enum (petition | affidavit | notice | agreement
--   | complaint | reply | other) does not include any of the 5 values the
--   shared contract names. apps/web/app/api/documents/route.ts had been
--   working around this with lossy helpers `sharedToDbDocType` /
--   `dbToSharedDocType` that:
--     - collapse legal_notice + cheque_bounce_notice -> 'notice' (ambiguous)
--     - use a title regex (/cheque/i) to recover cheque_bounce_notice on read
--   Both helpers are removed in the same commit as this migration.
--
-- Backfill mapping (preview confirmed against the 40 rows present at apply time):
--   petition    (11) -> rti_application
--   other       (10) -> rti_application      (safe demo default)
--   complaint   ( 9) -> consumer_complaint
--   agreement   ( 6) -> nda
--   notice      ( 3) -> cheque_bounce_notice (title matches /cheque/i)
--   notice      ( 1) -> legal_notice         (no cheque match)
--   affidavit   ( 0)
--   reply       ( 0)
-- =============================================================================

begin;

-- 1. Drop the column default so ALTER TYPE can run.
alter table public.documents
  alter column doc_type drop default;

-- 2. Convert the column to TEXT with a backfill that maps old enum values
--    to the shared contract values.
alter table public.documents
  alter column doc_type type text using (
    case doc_type::text
      when 'petition'   then 'rti_application'
      when 'complaint'  then 'consumer_complaint'
      when 'agreement'  then 'nda'
      when 'notice'     then
        case when title ~* 'cheque' then 'cheque_bounce_notice' else 'legal_notice' end
      when 'affidavit'  then 'rti_application'
      when 'reply'      then 'rti_application'
      when 'other'      then 'rti_application'
      else 'rti_application'
    end
  );

-- 3. Add the CHECK constraint pinning the column to the shared union.
alter table public.documents
  add constraint documents_doc_type_check
  check (doc_type in (
    'rti_application',
    'legal_notice',
    'nda',
    'consumer_complaint',
    'cheque_bounce_notice'
  ));

-- 4. Restore NOT NULL with a sensible default for new rows.
alter table public.documents
  alter column doc_type set default 'rti_application',
  alter column doc_type set not null;

-- 5. Drop the legacy enum type (nothing else references it).
drop type public.document_type;

-- 6. Document the column.
comment on column public.documents.doc_type is
  'Document type — one of @trionic/shared DocumentType. '
  'CHECK constraint enforces the union; do not reintroduce a PG enum here.';

commit;
