# Week 1 — Khushi Dadhaniya

**Team:** D — PageIndex & Corpus
**Module owned:** Consumer Protection Act 2019 + IT Act 2000 trees
**Week of:** 2026-05-10

---

## What I shipped this week

- Wrote and opened RFC for PageIndex tree design covering Consumer Protection Act 2019 and IT Act 2000 — `docs/RFC-consumer-protection-it-act-pageindex.md` · PR: `feat(pageindex): Consumer Protection Act 2019 and IT Act 2000 tree RFC`
- Defined node-ID naming convention for both acts (`CPA2019.CH<N>.S<N>.SS<N>.CL<N>` and `ITACT.CH<N>.S<N>...`) and documented it in the RFC
- Designed snapshot-based versioning strategy for IT Act amendments — `v2000` / `v2008` / `STRUCK_DOWN` states with `snapshot_id` format and default query resolution logic
- Proposed Postgres schema for `acts`, `act_snapshots`, and `pageindex_nodes` tables (including `pgvector` embedding column); shared with Team B (@om-patel) for RLS review
- Scaffolded `corpus/CPA2019/` and `corpus/ITACT/` directories with `README.md` and source URLs from IndiaCode.nic.in
- Raised 4 open questions (Q1–Q4) in the RFC tagging Samarth Kachhadiya, Yug Gandhi, Dhruv Lokadiya, and Hitarth Sherathia for unblocking before Week 2

## Demo

RFC walkthrough — tree hierarchy diagrams for both acts, versioning strategy for the IT Act (v2000 → v2008 → STRUCK\_DOWN for S.66A), and proposed schema. [Loom link to be added before Friday 5 PM IST Demo Day]

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Acts covered in RFC | 2 | CPA 2019 + IT Act 2000 |
| Node-ID levels defined | 5 | root → chapter → section → sub-section → clause |
| IT Act version states modelled | 3 | v2000, v2008, STRUCK_DOWN |
| Open questions raised | 4 | Q1–Q4, all tagged to owners |
| PRs opened | 1 | RFC-only; ingestion code deferred to Week 2 |

## Blockers

- **Q1** — Waiting on Samarth Kachhadiya to confirm whether PageIndex supports custom metadata fields (`status`, `struck_down_by`) natively or if a sidecar table is needed. Blocks finalising the schema. · [Issue comment tagged @samarth]
- **Q3** — Waiting on Dhruv Lokadiya + Hitarth Sherathia to decide whether S.66A should be included in the tree with a `STRUCK_DOWN` flag or excluded entirely. Blocks ingestion script for Chapter 11. · [Issue comment tagged @dhruv5353 @hitarth]
- **Q2** — Embedding model / vector dimensions not confirmed by Yug Gandhi yet. `VECTOR(1536)` used as placeholder in schema.

## Next week

- Resolve Q1–Q4 and lock schema with Team B sign-off
- Implement ingestion script for CPA 2019 (download PDF from IndiaCode, parse chapter/section hierarchy, assign node IDs, upsert into Postgres)
- Start IT Act v2008 ingestion; apply `STRUCK_DOWN` flag to S.66A once Q3 is resolved
- Run Tirth Dalal's tree validator against both ingested trees and fix any orphan nodes or format violations
- Generate embeddings for ingested nodes and populate `embedding` column

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>
