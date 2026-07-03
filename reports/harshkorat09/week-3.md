# Week 3 — Harsh Korat

**Team:** Team B — Backend  
**Module owned:** Document storage + PDF/DOCX export API  
**Week of:** 2026-06-02

---

## What I shipped this week

- Completed the export API implementation for PDF and DOCX generation.
- Verified the route design uses Supabase auth and supports RLS-safe document retrieval.
- Confirmed the export contract returns a signed storage URL with expiration metadata.
- Prepared demo instructions for validating exported content and storage access, but could not run a live demo because the database contains no seeded document data.
- Documented the remaining work required for end-to-end product readiness.

---

## Demo

Live demo was not executed because the Supabase database currently has no seeded `documents` or `document_versions`.

Expected demo behavior once data is available:
- `POST /api/documents/{id}/export?format=pdf` returns a 5-minute signed URL.
- Generated PDF includes a top banner disclaimer and an appendix for citations.
- Only document owners can export documents due to RLS enforcement.

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Export route implemented | 1 | `apps/web/app/api/documents/[id]/export/route.ts` |
| File types supported | 2 | PDF and DOCX |
| Demo-ready status | 1 | Export logic ready for live testing |
| Blockers documented | 1 | Infrastructure and seed data |

---

## Blockers

- No seeded document data prevented live export validation.
- Supabase Storage `exports` bucket is not yet created.
- Document creation/edit flows still need real DB persistence.

---

## Next week

- Seed document and version records for complete export testing.
- Provision and configure Supabase Storage for uploads.
- Implement full document create/update routes with DB persistence.
- Execute a full export demo and verify PDF/DOCX download behavior.
- Finalize the PR for review and merge.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)
