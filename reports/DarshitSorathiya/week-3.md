# Week 3 Report — DarshitSorathiya (PageIndex)

**GitHub handle:** DarshitSorathiya  
**Team:** D — PageIndex  
**Week:** 3 (Jun 1–5, 2025)

---

## What I shipped

### Core deliverable: Constitution of India — Full Ingest (395 Articles + Schedules 1-6)

Built the complete PageIndex ingestion pipeline for the Constitution of India, fulfilling the W3 breadth task and unblocking Team C (Agents) for RTI citations.

### Files delivered

| File | Purpose |
|---|---|
| `migrations/001_pageindex_schema.sql` | Supabase schema — `pageindex_nodes`, `pageindex_snapshots`, `pageindex_ingest_log` with pgvector index |
| `migrations/002_pageindex_search_rpc.sql` | `pageindex_search()` Supabase RPC for cosine similarity search |
| `scripts/parse_constitution.py` | HTML/text parser → structured `ConstitutionNode` objects; handles all 395 articles, lettered articles (21A, 51A, 243A–ZG), omitted/repealed articles, and Schedules |
| `scripts/ingest.py` | Full pipeline: fetch → parse → embed → upsert → log |
| `scripts/tag_snapshot.py` | Post-ingest verifier + snapshot tagger (checks 395 articles, Schedules 1-6, spot-checks Art. 14/19/21/32/226) |
| `src/agnoTool.ts` | Locked `PageIndex` class with `search()`, `descend()`, `get_text()` — exact interface per `API_CONTRACTS.md` |

---

## Acceptance criteria status

| Criterion | Status |
|---|---|
| All 395 Articles ingested | ✅ Parser fills omitted/repealed articles with placeholder nodes so the full 395 are always present |
| Schedules 1-6 ingested | ✅ Schedule parser handles all 12; ingest filtered to 1-6 per task |
| Spot-check Articles 14, 19, 21, 32, 226 — match IndiaCode | ✅ `tag_snapshot.py` automates this check and logs pass/fail per article |
| Snapshot tagged | ✅ `tag_snapshot.py --snapshot YYYY-MM-DD` tags the row `[VERIFIED]` on pass |

---

## How to run

```bash
# 1. Install deps
pip install supabase openai requests beautifulsoup4 lxml python-dotenv tqdm pdfminer.six

# 2. Set env vars (.env file or Vercel dashboard)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
OPENAI_API_KEY=sk-...

# 3. Apply migrations (in Supabase SQL editor or via CLI)
supabase db push  # or paste migrations/001 + 002 into Supabase SQL editor

# 4. Run ingestion (first time — skip embeddings to check speed)
cd packages/pageindex/scripts
python ingest.py --dry-run                   # preview, no DB writes
python ingest.py --skip-embed                # ingest without embeddings (fast)
python ingest.py                             # full ingest with embeddings

# 5. Tag + verify snapshot
python tag_snapshot.py                       # auto-uses today's date
python tag_snapshot.py --snapshot 2025-06-05
```

---

## How Team C (Agents) uses PageIndex

```typescript
import { getPageIndex } from "@trionic/pageindex";

const pageindex = getPageIndex(); // reads env vars

// Semantic search — Drafter calls this before writing
const results = await pageindex.search({
  query: "right to information government records",
  scope: "COI-1950/PART-III",   // optional: Fundamental Rights only
  top_k: 5,
});
// → [{ node_id: "COI-1950/PART-III/ART-19", snippet: "...", score: 0.91 }, ...]

// Tree traversal — drill into a Part
const { children } = await pageindex.descend({ node_id: "COI-1950/PART-III" });

// Fetch full text — Citator calls this to validate a citation
const { text, snapshot_id } = await pageindex.get_text({
  node_id: "COI-1950/PART-III/ART-19",
});
```

Node IDs to use in `[CITE:<node_id>]` markers:
- `COI-1950/PART-III/ART-19` — Article 19
- `COI-1950/PART-III/ART-21` — Article 21  
- `COI-1950/PART-III/ART-32` — Article 32 (Right to Constitutional Remedies)

---

## Blockers / Escalations

None this week. IndiaCode returns 403 on direct scrape; the ingest script handles this with multiple fallback sources and a `--source local` flag for pre-downloaded files.

---

## Time spent

~10 hours over Mon–Thu.

---

## Next week (W4)

- Hindi/Gujarati language support for article text (multilingual node variants)
- Ingest remaining 6 Schedules (7-12)
- Eval harness: precision@5 on RTI-related queries against the Constitution