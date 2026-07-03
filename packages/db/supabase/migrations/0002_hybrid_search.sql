-- Migration: 0002_hybrid_search.sql
-- Description: Adds node_id and act_code, plus hybrid search RPC
-- Author: Antigravity

ALTER TABLE public.pageindex_trees ADD COLUMN IF NOT EXISTS act_code text;
CREATE INDEX IF NOT EXISTS pageindex_trees_act_code_idx ON public.pageindex_trees(act_code);

ALTER TABLE public.pageindex_nodes ADD COLUMN IF NOT EXISTS node_id text;
CREATE INDEX IF NOT EXISTS pageindex_nodes_node_id_idx ON public.pageindex_nodes(node_id);

CREATE OR REPLACE FUNCTION public.match_pageindex_nodes(
  query_text text,
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter_scopes text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  node_id text,
  heading text,
  body_text text,
  similarity float,
  bm25_score float,
  score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH matches AS (
    SELECT
      pn.id,
      pn.node_id,
      pn.heading,
      pn.body_text,
      pn.tree_id,
      1 - (pn.embedding <=> query_embedding) AS similarity,
      ts_rank(
        to_tsvector('english', coalesce(pn.heading, '') || ' ' || pn.body_text),
        plainto_tsquery('english', query_text)
      ) AS bm25_score
    FROM public.pageindex_nodes pn
    WHERE pn.embedding IS NOT NULL
  )
  SELECT
    m.id,
    m.node_id,
    m.heading,
    m.body_text,
    m.similarity,
    m.bm25_score,
    -- Simple ensemble: 0.5 * similarity + 0.5 * normalized BM25
    (0.5 * m.similarity) + (0.5 * (m.bm25_score / (m.bm25_score + 1.0))) AS score
  FROM matches m
  JOIN public.pageindex_trees pt ON pt.id = m.tree_id
  WHERE filter_scopes IS NULL OR array_length(filter_scopes, 1) IS NULL OR pt.act_code = ANY(filter_scopes)
  ORDER BY score DESC
  LIMIT match_count;
END;
$$;
