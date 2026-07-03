# Week 2 — Harsh Korat

**Team:** Team B — Backend  
**Module owned:** Document storage + PDF/DOCX export API  
**Week of:** 2026-05-26

---

## What I shipped this week

- Implemented the export API route in `apps/web/app/api/documents/[id]/export/route.ts`.
- Added Markdown parsing and citation appendix resolution for `[CITE:node_id]` markers.
- Built the PDF generator using Puppeteer with the legal disclaimer banner injected into output.
- Built the DOCX generator using the `docx` package with structured headers and appendix support.
- Defined the export contract using shared types from `@trionic/shared`.
- Added error handling for invalid format values, missing documents, and storage failures.

---

## Demo

The export route is ready to generate a PDF or DOCX from the latest `DocumentVersion.body_markdown` once document data and Supabase storage are in place.

Key demo points:
- `POST /api/documents/{id}/export?format=pdf` returns a signed storage URL.
- Output includes a visible banner and citation appendix.
- RLS is enforced via Supabase auth when fetching the latest document version.

---

## Blockers

- Supabase database currently lacks seeded `documents` and `document_versions` data.
- Supabase Storage `exports` bucket has not yet been provisioned for file uploads.
- Document creation/edit routes are still mocked and do not persist data to the database.

---

## Next week

- Seed test documents and versions for export validation.
- Create the Supabase Storage `exports` bucket and configure signed URL access.
- Implement `POST /api/documents` and `PATCH /api/documents/{id}` with real persistence.
- Run an end-to-end demo to download the generated PDF and verify banner + appendix.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)
