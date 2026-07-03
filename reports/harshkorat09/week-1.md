# Week 1 — Harsh Korat

**Team:** Team B — Backend  
**Module owned:** Document storage + PDF/DOCX export API  
**Week of:** 2026-05-19

---

## What I shipped this week

- Authored `docs/RFC-export-api.md` — design specification for the Export API covering:
  - Markdown → PDF/DOCX conversion flow
  - Puppeteer vs server-side PDF generation comparison
  - citation appendix rendering strategy
  - “AI-generated draft — not legal advice” banner injection
  - Supabase Storage path structure
  - signed URL-based download access
- Opened the Week-1 RFC PR for the export pipeline module.
- Designed the proposed export flow architecture:
  - Markdown parsing and sanitization
  - HTML template rendering
  - Puppeteer-based PDF generation
  - DOCX export generation using the `docx` package
  - secure export upload flow using Supabase Storage
- Studied repository contribution workflow, backend structure, and development setup using Git, pnpm, and VS Code.
- Successfully merged the RFC PR into the main branch.

---

## Demo

Successfully designed the backend export architecture for Trionic AI-Adalat through the Export API RFC.

Key design areas documented in the RFC:

- **PDF Export Flow:** Markdown → HTML → Puppeteer → PDF rendering pipeline.
- **DOCX Export Strategy:** Editable Word document generation using structured Markdown parsing.
- **Citation Appendix Rendering:** Reference extraction and appendix generation for citation integrity.
- **Secure Storage Design:** Private Supabase Storage buckets with signed URL-based access control.
- **Disclaimer Injection:** Mandatory “AI-generated draft — not legal advice” banner handling across all exports.

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| RFCs completed | 1 | Export API RFC |
| PRs opened | 1 | Draft PR submitted |
| PRs merged | 1 | RFC merged into `main` |
| Export formats planned | 2 | PDF and DOCX |
| Backend concepts explored | 5+ | Puppeteer, Markdown rendering, Supabase Storage, signed URLs, DOCX generation |

---

## Blockers

- Needed additional understanding of Puppeteer rendering flow before implementation planning.
- Research required for handling multilingual PDF rendering and document formatting consistency.
- Exploring best practices for secure file upload and signed URL access using Supabase Storage.

---

## Next week

- Start implementation scaffolding for export API routes inside `apps/web/app/api/`.
- Learn Markdown → HTML rendering workflow in more detail.
- Begin Puppeteer-based PDF export prototype.
- Explore Supabase Storage upload utilities and signed URL generation flow.
- Research DOCX generation using the `docx` npm package.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)
