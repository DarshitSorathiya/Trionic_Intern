alter table public.documents
  drop constraint if exists documents_doc_type_check;

alter table public.documents
  add constraint documents_doc_type_check
  check (doc_type in (
    'rti_application',
    'legal_notice',
    'nda',
    'consumer_complaint',
    'cheque_bounce_notice',
    'employment_contract'
  ));