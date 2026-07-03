# `packages/pageindex` — PageIndex tree retrieval

Tree-based reasoning retrieval over authoritative Indian legal texts, using **PageIndex**.

## Team

**Owner:** Team D — PageIndex & Corpus
**Lead:** Tirth Dalal

| Module | Owner |
|---|---|
| PageIndex tree validator + IPC ingestion | Tirth Dalal |
| Constitution + Article-level tree | Darshit Sorathiya |
| Indian Contract Act tree | Mahi Pandey |
| CrPC tree | Aesha Kalathiya |
| Consumer Protection Act 2019 + IT Act | Khushi Dadhaniya |
| Tree query API + Agno tool wrapper | Samarth Kachhadiya |

## Why PageIndex (not vector RAG alone)

Vector RAG over legal text loses hierarchy and lets the model hallucinate citations. PageIndex builds an explicit tree (Part → Chapter → Section → Sub-section → Clause) that the agent **navigates** instead of guessing from chunks. Every citation is a structural path. The corpus is limited to authoritative bare-act sources, so the tree itself is ground truth.

## Inputs (Week 1 priority list)

The Week-1 ingestion target is the **Indian Contract Act, 1872** (well-bounded, ~266 sections — good first act). The full priority list for Weeks 2–4 lives in `docs/CORPUS.md` once authored.

## Snapshot versioning

Every tree node carries a snapshot date. Amendments produce a new tree version. Citations always include `snapshot_id` so we can show "this was the law as of YYYY-MM-DD".

## Setup (Week 1)

Bootstrapped via Tirth Dalal's Week-1 scaffold PR. Until then this README is the only file.
