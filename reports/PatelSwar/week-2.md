# Week‑2 Report — Patel Swar

**Team:** Team E — Indic

**Issue:** #124 — Gujarati glossary seed (Week 2)

**Branch:** `week-2` (draft)

**Week of:** 2026-05-26

---

## Summary

- Seeded the first Gujarati glossary fixture and added entries to the shared seed so translation infra can consume Gujarati terms during Week‑2 work.

## What I changed

- Added `packages/translation/data/glossary.gu.json` — initial Gujarati seed entries (EN→GU).
- Appended Gujarati entries into `packages/translation/data/glossary.json` (shared seed).

## Files added/updated

- `packages/translation/data/glossary.gu.json` — Gujarati glossary entries (draft + approved statuses).
- `packages/translation/data/glossary.json` — shared seed updated with Gujarati entries.

## Acceptance criteria (from issue)

- [ ] First 30 EN→Gujarati legal terms present in `packages/translation/data/glossary.gu.json` (seeded).
- [ ] At least 5 terms anchored to PageIndex node IDs (Contract Act if Mahi's tree is ready) — pending review; several entries include `node_id` but please confirm anchors with Megh.
- [ ] i18n message file for Gujarati seeded with 30 UI strings (coordinate with @vrajmevawala) — pending (see `apps/web/messages/gu.json` for current seed; confirm keys with Vraj).

## How I tested

- Validated JSON syntax for `packages/translation/data/glossary.gu.json` and `packages/translation/data/glossary.json`.
- Manually inspected entry shape to match `glossary.hi.json` contract used by the translation lookup.

## Next steps

1. Confirm `node_id` anchors with Megh and update entries where necessary.
2. Seed/verify `apps/web/messages/gu.json` contains 30 UI strings and matches `hi.json` key structure; coordinate with @vrajmevawala.
3. Create branch `week-2`, commit any remaining edits and push a draft PR for review.

## Notes

- Entries currently use `status: "draft"` where translations need signoff. Reviewers should update statuses to `approved` after review.

Owner: Patel Swar
