# Week-4 Report — Patel Swar

**Team:** Team E — Indic

**Issue:** Gujarati glossary breadth and Negotiable Instruments Act expansion (Week 4)

**Branch:** `week-4`

**Week of:** 08-06-2026

---

## What I shipped

- Expanded `packages/translation/data/glossary.gu.json` to 105 total entries covering all 5 main document types (`contract`, `consumer`, `procedure`, `rti`, `general`, `negotiable-instruments`, `legal-notice`).
- Added 15 cheque-bounce / NI Act § 138 Gujarati terms including drawer/drawee equivalents, dishonour, demand notice, account-closed, and insufficient-funds, complete with `node_id` mappings mapped to `NIA-1881/S-138`.
- Added 10 legal notice Gujarati salutations and closings, providing proper Gujarati formal address forms for legal documents.

---

## Acceptance criteria — status

- Expand Gujarati glossary to cover all 5 doc types (~80 terms): **Complete** (80 terms present in the file covering `contract`, `consumer`, `procedure`, `rti`, and `general`).
- Add cheque-bounce / NI Act § 138 Gujarati terms (~15) with equivalents for drawer, drawee, dishonour, demand notice, account-closed, insufficient-funds: **Complete** (15 terms added under the `negotiable-instruments` domain).
- Add legal notice Gujarati salutations + closings (~10 phrases): **Complete** (10 phrases added under the `legal-notice` domain).
- Each entry: en source, gu target, optional node_id to PageIndex: **Complete** (All entries successfully mapped with translations, and NI Act § 138 entries mapped with `node_id` anchors to `NIA-1881/S-138`).

---

## Files changed / evidence

- [glossary.gu.json] — Gujarati glossary updated with 25 new entries (totaling 105 entries).

## How I verified

- Counted all glossary entries category wise and validated the exact 105 entries.
- Validated the JSON structure and syntax of `packages/translation/data/glossary.gu.json`.

---

Owner: Patel Swar
