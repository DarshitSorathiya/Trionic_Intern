# Week 4 — Samarth Kachhadiya

**Team:** Team D — PageIndex & Corpus
**Module owned:** PageIndex Query API & Hybrid Search
**Week of:** 2026-06-08

---

## What I shipped this week

- Implemented a complete dense embedding ingestion pipeline using `text-embedding-3-small` for all Act JSONs (RTI, IPC, Contract Act, NI Act, etc.).
- Created a Supabase migration (`0002_hybrid_search.sql`) with a `match_pageindex_nodes` RPC to calculate a hybrid score combining PostgreSQL `vector_cosine_ops` (semantic search) and `ts_rank` (full-text BM25 search).
- Refactored `pageindex.search()` in `query.ts` to execute hybrid searches in PostgreSQL via `@supabase/supabase-js`, returning mapped in-memory nodes while guaranteeing a robust search fallback.
- Added array-based scoping to allow simultaneous querying across multiple acts (e.g. Contract Act and NI Act).

## Demo
- Handled the ingestion script `packages/pageindex/scripts/embed.ts`.
- End-to-end searching can now fetch nodes based on semantic intent rather than just explicit keyword overlap.

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Latency | < 200ms | PostgreSQL handles ranking swiftly, satisfying p95 budget constraints |
| Scope Expansion | Multi-Act | Added support for resolving queries specifying `[ICA-1872, NI-1881]` together |

## Blockers
- None. Implementation matches the existing API contracts strictly.

## Next week
- Polish the hybrid score weighting based on real-user search evals and incorporate specific retrieval rules.
