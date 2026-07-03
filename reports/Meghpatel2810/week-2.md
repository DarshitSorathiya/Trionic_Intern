# Week 2 — Megh Patel

**Team:** Team E — Indic

**Module owned:** Hindi pair + legal glossary infrastructure

**Week of:** 2026-05-26

---

## What I shipped this week

- Productionised the Week-1 RFCs (#55, #79) by building the glossary lookup module.
- Implemented and exported the `glossary.lookup` pure function in `packages/translation/src/glossary.ts` to enable the Translator Agent handoff.
- Created `packages/translation/data/glossary.json` and successfully seeded 56 high-frequency EN→Hindi legal terms, tying them directly to PageIndex nodes (e.g., Contract Act `ICA-1872/S-2`).
- Implemented `splitAroundCiteMarkers` in `postprocess.ts` to strictly protect `[CITE:<node_id>]` markers from being mutated during Indic post-processing.
- Seeded the `apps/web/messages/hi.json` i18n message file to integrate with Vraj M's `next-intl` setup.

---

## Demo

Demo focus: Walk through the `glossary.lookup` function successfully extracting a precise Hindi legal term (e.g., "consideration" → "प्रतिफल") from the JSON data. Demonstrate the frontend UI localized in Hindi using the newly seeded `hi.json` messages.

Demo recording: TBD

---

## Metrics

| Metric | Value | Notes |
|---|---:|---|
| Hindi glossary terms seeded | 56 | Tied to active PageIndex nodes |
| APIs shipped | 1 | `glossary.lookup` ready for Team C |
| Core i18n message files | 1 | `apps/web/messages/hi.json` |
| Protected citation methods | 1 | `splitAroundCiteMarkers` implemented |

---

## Blockers

- None for the core infrastructure. Waiting for other language owners (Gujarati, Marathi, Tamil) to add their glossary entries and implement their specific post-processing rules in `postprocess.ts`.

---

## Next week

- Coordinate with Maharshi to test the end-to-end integration of the Translator Agent pipeline with the live Hindi glossary.
- Implement Hindi-specific post-processing logic (e.g., Devanagari numeral formatting, "Section N" → "धारा N", and stripping stray ZWJ/ZWNJ characters).
- Support Team E members as they build out their respective language glossary data.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

