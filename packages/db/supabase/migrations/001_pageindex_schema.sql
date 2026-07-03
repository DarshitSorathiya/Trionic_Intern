-- =============================================================================
-- Migration: 001_pageindex_schema.sql
-- Owner: DarshitSorathiya (PageIndex)
-- Purpose: Create tables for the Constitution of India ingestion.
--          Supports all 395 Articles + Schedules 1-6 (and beyond).
--          Node IDs follow the locked format: "COI-1950/<PART>/<SECTION>"
-- =============================================================================

-- Enable pgvector extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- 1. pageindex_snapshots
--    Tracks a point-in-time version of an ingested act.
--    Every ingest run creates (or reuses) a snapshot row.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pageindex_snapshots (
  id            TEXT PRIMARY KEY,          -- "YYYY-MM-DD" e.g. "2025-06-05"
  act_code      TEXT NOT NULL,             -- e.g. "COI-1950"
  label         TEXT NOT NULL,             -- human label, e.g. "Constitution of India (as of 2025-06-05)"
  source_url    TEXT,                      -- where the text was fetched from
  total_nodes   INTEGER DEFAULT 0,         -- filled after ingest completes
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. pageindex_nodes
--    One row per indexable unit (Article, sub-clause, Schedule section, etc.)
--    node_id format:  "COI-1950/<PART_CODE>/<ITEM_CODE>"
--    Examples:
--      "COI-1950/PART-III/ART-19"       — Article 19
--      "COI-1950/PART-III/ART-19/CL-1"  — Article 19(1)
--      "COI-1950/SCH-1/ENTRY-1"         — First Schedule, Entry 1
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pageindex_nodes (
  id              TEXT PRIMARY KEY,         -- PageIndexNodeId (locked format)
  snapshot_id     TEXT NOT NULL REFERENCES pageindex_snapshots(id) ON DELETE CASCADE,
  act_code        TEXT NOT NULL DEFAULT 'COI-1950',

  -- Tree structure
  parent_id       TEXT REFERENCES pageindex_nodes(id) ON DELETE CASCADE,
  depth           INTEGER NOT NULL DEFAULT 0,  -- 0=root, 1=part, 2=article, 3=clause
  sort_order      INTEGER NOT NULL DEFAULT 0,  -- for preserving canonical article order

  -- Classification
  node_type       TEXT NOT NULL,            -- 'act' | 'part' | 'article' | 'clause' | 'schedule' | 'schedule_entry'
  part_code       TEXT,                     -- e.g. "PART-III"
  part_name       TEXT,                     -- e.g. "Fundamental Rights"
  article_number  TEXT,                     -- e.g. "19"
  article_title   TEXT,                     -- e.g. "Protection of certain rights regarding freedom of speech, etc."
  clause_number   TEXT,                     -- e.g. "1", "1a"
  schedule_number INTEGER,                  -- 1–12
  schedule_title  TEXT,

  -- Content
  text_content    TEXT NOT NULL DEFAULT '', -- raw Article/clause text
  word_count      INTEGER GENERATED ALWAYS AS (
                    array_length(string_to_array(trim(text_content), ' '), 1)
                  ) STORED,

  -- Vector embedding (text-embedding-3-small = 1536 dims)
  embedding       vector(1536),

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------

-- Fast lookup by snapshot
CREATE INDEX IF NOT EXISTS idx_pageindex_nodes_snapshot
  ON pageindex_nodes(snapshot_id);

-- Tree traversal (parent → children)
CREATE INDEX IF NOT EXISTS idx_pageindex_nodes_parent
  ON pageindex_nodes(parent_id);

-- Sorted traversal within a snapshot (for descend())
CREATE INDEX IF NOT EXISTS idx_pageindex_nodes_sort
  ON pageindex_nodes(snapshot_id, sort_order);

-- Article number lookup (for validator spot-checks)
CREATE INDEX IF NOT EXISTS idx_pageindex_nodes_article
  ON pageindex_nodes(act_code, article_number)
  WHERE article_number IS NOT NULL;

-- Schedule lookup
CREATE INDEX IF NOT EXISTS idx_pageindex_nodes_schedule
  ON pageindex_nodes(act_code, schedule_number)
  WHERE schedule_number IS NOT NULL;

-- Vector similarity search (ivfflat — fine for <500k rows)
CREATE INDEX IF NOT EXISTS idx_pageindex_nodes_embedding
  ON pageindex_nodes USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ---------------------------------------------------------------------------
-- 4. pageindex_ingest_log
--    Audit trail for every ingest run. One row per run.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pageindex_ingest_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id     TEXT NOT NULL REFERENCES pageindex_snapshots(id),
  run_at          TIMESTAMPTZ DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'running',  -- 'running' | 'done' | 'failed'
  nodes_upserted  INTEGER DEFAULT 0,
  nodes_embedded  INTEGER DEFAULT 0,
  errors          JSONB DEFAULT '[]'::JSONB,
  duration_ms     INTEGER,
  triggered_by    TEXT DEFAULT 'script'             -- 'script' | 'ci' | 'manual'
);

-- ---------------------------------------------------------------------------
-- 5. Helper view: flat article list (used by agnoTool search)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW pageindex_articles_flat AS
  SELECT
    n.id              AS node_id,
    n.snapshot_id,
    n.part_code,
    n.part_name,
    n.article_number,
    n.article_title,
    n.text_content,
    n.word_count,
    n.sort_order,
    n.embedding
  FROM pageindex_nodes n
  WHERE n.node_type = 'article'
  ORDER BY n.sort_order;

-- ---------------------------------------------------------------------------
-- 6. RLS: agents + service role can read; only service role can write
-- ---------------------------------------------------------------------------
ALTER TABLE pageindex_nodes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pageindex_snapshots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pageindex_ingest_log ENABLE ROW LEVEL SECURITY;

-- Public read policy (agents call via service role key, but allow anon reads for now)
CREATE POLICY "pageindex_nodes_read"
  ON pageindex_nodes FOR SELECT
  USING (true);

CREATE POLICY "pageindex_snapshots_read"
  ON pageindex_snapshots FOR SELECT
  USING (true);

-- Write restricted to service role (ingestion script uses SUPABASE_SERVICE_KEY)
CREATE POLICY "pageindex_nodes_service_write"
  ON pageindex_nodes FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "pageindex_snapshots_service_write"
  ON pageindex_snapshots FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "pageindex_ingest_log_service_write"
  ON pageindex_ingest_log FOR ALL
  USING (auth.role() = 'service_role');
