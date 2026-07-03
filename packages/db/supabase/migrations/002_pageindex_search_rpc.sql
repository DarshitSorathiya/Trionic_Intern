-- =============================================================================
-- Migration: 002_pageindex_search_rpc.sql
-- Owner: DarshitSorathiya (PageIndex)
-- Purpose: Supabase RPC for pgvector cosine similarity search.
--          Called by agnoTool.ts pageindex.search()
-- =============================================================================

CREATE OR REPLACE FUNCTION pageindex_search(
  query_embedding vector(1536),
  p_snapshot_id   TEXT,
  p_scope         TEXT DEFAULT NULL,    -- optional node_id prefix filter
  p_top_k         INTEGER DEFAULT 5
)
RETURNS TABLE (
  id           TEXT,
  snapshot_id  TEXT,
  node_type    TEXT,
  parent_id    TEXT,
  part_code    TEXT,
  part_name    TEXT,
  article_number TEXT,
  article_title  TEXT,
  clause_number  TEXT,
  schedule_number INTEGER,
  schedule_title TEXT,
  text_content TEXT,
  sort_order   INTEGER,
  similarity   FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    n.id,
    n.snapshot_id,
    n.node_type,
    n.parent_id,
    n.part_code,
    n.part_name,
    n.article_number,
    n.article_title,
    n.clause_number,
    n.schedule_number,
    n.schedule_title,
    n.text_content,
    n.sort_order,
    1 - (n.embedding <=> query_embedding) AS similarity
  FROM pageindex_nodes n
  WHERE
    n.snapshot_id = p_snapshot_id
    AND n.embedding IS NOT NULL
    AND n.node_type IN ('article', 'clause', 'schedule_entry')
    -- Scope filter: if provided, only search within that subtree
    AND (p_scope IS NULL OR n.id LIKE (p_scope || '%'))
  ORDER BY n.embedding <=> query_embedding
  LIMIT p_top_k;
$$;

-- Grant access to authenticated users and service role
GRANT EXECUTE ON FUNCTION pageindex_search TO authenticated, service_role, anon;
