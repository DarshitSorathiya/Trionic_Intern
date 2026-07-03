# Week 1 — Darshit Sorathiya

**Team:** Team D — PageIndex & Corpus
**Module owned:** Constitution of India — Article-level PageIndex tree
**Week of:** 2026-05-20

---

## What I shipped this week

- Opened draft PR `pageindex/constitution-rfc` with `docs/RFC-constitution-pageindex-tree.md` _(paste PR link once open)_
  - Designed full node hierarchy: Preamble → Parts → Chapters → Articles → Clauses → Sub-clauses → Schedules → Lists → Entries
  - Defined node ID format: `COI/<snapshot_id>/<part>/<chapter?>/<article>/<clause?>` — e.g. `COI/2024-12-01/PT-III/A-19/CL-1/SC-a` for Article 19(1)(a)
  - Documented 8 structural quirks in the Constitution text and resolution strategy for each (see RFC §6)
  - Proposed `ConstitutionNode` TypeScript schema that extends `packages/shared` types
  - Mapped tree output to `pageindex_trees` / `pageindex_nodes` DB tables (Team B schema)
  - Raised 4 open questions for cross-team alignment (RFC §11)

## Demo

<!-- Loom link, screenshot, or short paragraph. 30–60 seconds. -->
_Add Loom link before Friday 6 PM IST._

Suggested 60-second flow: (1) open the RFC in editor, (2) walk the tree diagram — point to a Part, a Chapter, an Article, (3) read out the node ID for Art. 19(1)(a) and for Seventh Schedule List I Entry 1, (4) show the Part VII tombstone quirk section.

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Constitution Parts covered in tree design | 25 | Includes letter-suffix variants IVA, IXA, IXB, XIVA |
| Schedules covered | 12 | All 12 active Schedules (Schedules 1–12) |
| Structural quirks documented | 8 | Tombstone nodes, repealed Part VII, inline amendments, Seventh Schedule sub-lists, Ninth Schedule snapshot-pinning, Preamble leaf, omitted articles, letter-suffix Parts |
| Cross-team open questions raised | 4 | Blocking items surfaced early for Week 2 resolution |

## Blockers

- **Team B — Om Patel:** Confirmation needed on whether `amendment_note` field can be added to `pageindex_nodes` without a breaking migration. Blocking Week 2 normalization script. Linked: RFC §9.
- **LLM Router — Yug Gandhi:** Need the model string available for PageIndex tree generation before running `run_pageindex.py`. Linked: RFC §11 Q3.

## Next week

- Resolve all 4 RFC open questions with Tirth Dalal, Om Patel, and Yug Gandhi
- Download official Ministry of Law Constitution PDF; count articles to verify RFC assumptions
- Run `run_pageindex.py` on the PDF; post-process raw output into the `COI/` node ID scheme
- Write normalization script to auto-flag tombstone nodes (omitted articles, repealed Parts)
- Target: working JSON tree for Parts I–III committed by end of Week 2

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> Excellent Week-1 architectural work. The Constitution tree hierarchy, node ID design, and handling of structural legal quirks are very detailed and show strong foresight for scalable PageIndex retrieval workflows.

