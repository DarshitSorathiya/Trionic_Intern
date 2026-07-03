# Week 4 — Evan Gregor

**Team:** Team C — Agent Layer
**Module owned:** Reviewer agent (`packages/agents/src/reviewer/`)
**Week of:** 2026-06-08

---

## What I shipped this week

- **Extended Reviewer to 5 Document Types (Issue #277):** Upgraded `REQUIRED_SECTIONS` from RTI-only to encompass all 5 W4 v1 document types (`rti_application`, `legal_notice`, `nda`, `consumer_complaint`, `cheque_bounce_notice`).
- **Shared Constants (AC1):** `REQUIRED_SECTIONS` is an exported constant. `Reviewer.requiredSections(doc_type)` returns the correct list per type. Sohil's editor can import and call either.
- **Per-Doc-Type Tone Rules (AC2):** Added a `TONE_RULES` map in `reviewer.prompt.ts` with document-specific tone guidance (NDA = "Formal-precise", Consumer Complaint = "Firm-but-respectful", Cheque Bounce = "Statutory-formal"). `buildToneUserPrompt()` now injects the correct tone rule per `doc_type` before sending to the LLM.
- **Multilingual Disclaimer Banner Detection (AC3):** Integrated `@trionic/translation`'s glossary lookup into `checkBanner()`. The banner check first tries the English exact-string, then falls back to the glossary-translated banner for non-English drafts.
- **Rejection Pipeline (AC4):** If any doc type has `missing_required_sections.length > 0`, the Reviewer returns `approved: false` with `rejection_reason`. `chain.ts` already calls `stepError("reviewer", ...)` on `!approved`, marking the document as `failed`.
- **Test Suite Expansion (AC5):** Added 5 unit tests (one per doc type), each creating a draft missing exactly one required section and asserting `approved: false`. Also added multilingual banner tests with mocked glossary lookups.
- PR #317 opened against `main`.

---

## Demo

**Scenario 1 — Per-doc-type required sections:** Call `Reviewer.requiredSections('nda')` → returns 7 sections (Parties, Definitions, Confidential Information, Obligations, Term and Termination, Governing Law, Signatures). Submit an NDA draft missing "Confidential Information" → Reviewer returns `approved: false`, `missing_required_sections: ["Confidential Information"]`.

**Scenario 2 — Tone enforcement:** Submit a Consumer Complaint draft with aggressive language ("You will pay for this!"). The LLM receives the firm-but-respectful tone rule and flags it as a tone issue. Reviewer returns `approved: false`.

**Scenario 3 — Multilingual banner:** Submit a Hindi-translated draft with the banner `एआई-जनरेटेड ड्राफ्ट — कानूनी सलाह नहीं`. The Reviewer looks up the glossary, finds the translation, and returns `banner_present: true`.

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Unit tests | 34 | All passing (up from 28 in W3) |
| TypeScript errors | 0 | Our module is clean; pre-existing `ConversationState` errors in `chain.ts`/`memory.ts` are unrelated |
| Files modified | 3 | `index.ts`, `reviewer.prompt.ts`, `reviewer.test.ts` |
| LLM calls per review | 2 | Completeness + Tone (unchanged from W3) |
| Supported document types | 5 | All v1 types per `PROJECT_BRIEF.md § 4` |

---

## Blockers

- `tsc --noEmit` fails globally in `packages/agents` due to unrelated `ConversationState` imports in `src/chain.ts` and `src/memory.ts`. Our module (`reviewer/`) is clean. Needs addressing by repo managers.

---

## Next week

- Coordinate with Sohil's editor team on consuming the shared `REQUIRED_SECTIONS` constant.
- Refine `TONE_RULES` based on real user feedback and edge-case testing.
- Evaluate parallelizing the 2 sequential LLM calls (completeness + tone) if latency becomes a concern.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> _pending_
