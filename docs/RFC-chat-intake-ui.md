# RFC: Chat / Intake UI

**File:** `apps/web/docs/RFC-chat-intake-ui.md`  
**Author:** Veer Bhalodia (@Veer-2910) — Frontend Team  
**Status:** Draft → Ready for Review  
**Created:** Week 1 — May 2026  
**Coordinated with:** Sohil Kareliya (Frontend Lead)  
**Issue:** `<paste-your-issue-link-here>`

---

## 1. Context

Trionic Adalat needs a user-facing chat and intake surface where users can describe routine legal drafting needs in their preferred language.

The chat/intake UI is the first visible product surface after sign-in. It must support multilingual input, streaming agent responses, legal-disclaimer visibility, citation-aware output rendering, and accessible interaction patterns.

This UI connects the user journey from intake to agent classification, planning, drafting, citation validation, review, translation, and eventually document editing/export.

The product is a drafting aid, not legal advice. Therefore, the intake UI must avoid implying lawyer-like advice and should clearly show that generated content is AI-generated and citation-grounded.

---

## 2. Proposal

Build a chat/intake interface inside `apps/web` using Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.

### Proposed route

```txt
apps/web/app/intake/page.tsx