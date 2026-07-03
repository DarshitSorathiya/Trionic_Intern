# Week-3 Report — Patel Swar

**Team:** Team E — Indic

**Issue:** #197 — Gujarati glossary seed (Week 3)

**Branch:** `week-3` (draft)

**Week of:** 2026-06-01

---

## What I shipped

- Seeded and expanded `packages/translation/data/glossary.gu.json` to ~76 EN→Gujarati legal terms (mix of `approved` and `draft` statuses).
- Confirmed `apps/web/messages/gu.json` exists and contains UI strings required by the frontend (seeded for Gujarati locale).
- Anchored multiple glossary entries to PageIndex node IDs (examples below) so `lookupGlossary()` can return node anchors during integration.

---

## Acceptance criteria — status

- First 30 EN→Gujarati legal terms in `packages/translation/data/glossary.gu.json`: **Complete** (file contains ~76 entries).
- At least 5 terms anchored to PageIndex node IDs: **Complete** (examples: `ICA-1872/S-2`, `ICA-1872/S-148`, `RTI-2005/S-2`, `CPA-2019/CH-I/S-2`, `ICA-1872/S-15`).
- i18n message file for Gujarati seeded with 30 UI strings: **Complete** (`apps/web/messages/gu.json` seeded; please confirm keys with @vrajmevawala if needed).
- Comment "back from leave" on the issue

---

## Files changed / evidence

- `packages/translation/data/glossary.gu.json` — Gujarati glossary (EN→GU) with `node_id` anchors and snapshot metadata.
- `packages/translation/data/glossary.json` — shared seed updated with Gujarati entries.
- `apps/web/messages/gu.json` — Gujarati UI messages (seeded).

## How I verified

- Validated JSON files are syntactically correct and follow the same `glossary.hi.json` shape used by Megh.
- Counted entries and node anchors (glossary includes many `node_id` fields; anchored examples listed above).

---

Owner: Patel Swar
