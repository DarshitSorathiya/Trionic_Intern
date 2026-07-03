# Week 1 — Megh Patel

**Team:** Team E — Indic

**Module owned:** Hindi pair + legal glossary infrastructure

**Week of:** 2026-05-19

---

## What I shipped this week

- Authored `docs/RFC-indic-legal-glossary.md` for my assigned Hindi/legal glossary issue.
- Defined the legal glossary schema for `packages/translation`, including `node_id`, `snapshot_id`, target language, review status, domain, and notes.
- Seeded the Hindi pair with 55 high-frequency legal terms covering contract, consumer, RTI, employment, and general procedural vocabulary.
- Defined the Translator Agent handoff through `lookupGlossary()` and `postProcessIndicText()`.
- Documented citation-marker protection rules so `[CITE:<node_id>]` tokens remain machine-readable during Indic translation.
- Authored `docs/RFC-team-e-indic-translation-module.md` as the Team E umbrella RFC for Indic translation scope, shared flow, ownership, decisions, dependencies, and implementation direction.

---

## Demo

Demo focus: walk through the two RFCs and show how Team E fits into the product pipeline.

Summary:

- `RFC-indic-legal-glossary.md` explains the Hindi glossary schema and why terms like "consideration" must use legal Hindi, not everyday translation.
- `RFC-team-e-indic-translation-module.md` connects the Team E modules: glossary, Hindi, Gujarati, Marathi, Tamil, post-processing, eval fixtures, and Translator Agent handoff.

Demo recording: TBD

---

## Metrics

| Metric | Value | Notes |
|---|---:|---|
| RFCs authored | 2 | Hindi glossary RFC + Team E umbrella RFC |
| Hindi glossary seed terms | 55 | Covers v1 document domains |
| Translation handoff APIs specified | 2 | `lookupGlossary()` and `postProcessIndicText()` |
| Existing Team E member RFCs linked | 2 | Marathi RFC and Tamil/eval RFC |
| Cross-team dependencies documented | 6 | Translator, PageIndex, Citator, Frontend, Evals, Supabase |

---

## Blockers

- Gujarati translation pair details are still pending and need a follow-up RFC or implementation plan from the Gujarati owner.
- Final PageIndex node IDs and snapshot IDs are still evolving, so some glossary entries may need backfilling once Team D finalizes tree IDs.
- Need reviewer agreement on whether glossary data stays JSON-backed for the internship or later moves into Supabase.
- Need final approval process for canonical legal translations when multiple Hindi terms are acceptable.

---

## Next week

- Scaffold the initial `packages/translation` source structure if approved.
- Convert the Hindi seed glossary from RFC table into a JSON fixture.
- Implement a first-pass `lookupGlossary()` using local JSON data.
- Add no-op `postProcessIndicText()` handlers for all Indic languages.
- Coordinate with Maharshi on the Translator Agent handoff and with language owners on their glossary expansion.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>