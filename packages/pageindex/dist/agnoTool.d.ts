/**
 * packages/pageindex/src/agnoTool.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The locked PageIndex tool surface consumed by Team C (Agents).
 * Owner: DarshitSorathiya (PageIndex / Team D)
 *
 * Exposes three functions:
 *   pageindex.search()    — semantic search over Article/Schedule text
 *   pageindex.descend()   — tree traversal (node → children)
 *   pageindex.get_text()  — fetch full text of one node by ID
 *
 * The shapes of these functions are LOCKED per API_CONTRACTS.md.
 * Do NOT change function signatures without repo-manager (Dhruv/Sohil) review.
 *
 * Implementation: calls Supabase RPC / table queries backed by pgvector.
 * Embedding for search queries: text-embedding-3-small via OpenAI.
 */
export type PageIndexNodeId = string;
export type SnapshotId = string;
export interface SearchResult {
    node_id: PageIndexNodeId;
    snapshot_id: SnapshotId;
    /** Short excerpt of the matching text (max ~400 chars). */
    snippet: string;
    /** Cosine similarity score, 0–1. Higher = more relevant. */
    score: number;
}
export interface TreeNode {
    node_id: PageIndexNodeId;
    node_type: "act" | "part" | "article" | "clause" | "schedule" | "schedule_entry";
    label: string;
    has_children: boolean;
    sort_order: number;
}
export interface NodeText {
    text: string;
    snapshot_id: SnapshotId;
}
export interface SearchParams {
    /** Natural-language query string. Will be embedded before search. */
    query: string;
    /**
     * Optional scope to narrow search.
     * Examples: "COI-1950/PART-III" (Fundamental Rights only)
     *           "COI-1950/SCH-1"    (First Schedule only)
     */
    scope?: PageIndexNodeId;
    /** Number of results to return. Default 5, max 20. */
    top_k?: number;
    /** Snapshot to search in. Defaults to latest. */
    snapshot_id?: SnapshotId;
}
export interface DescendParams {
    node_id: PageIndexNodeId;
    /** Snapshot to query. Defaults to latest. */
    snapshot_id?: SnapshotId;
}
export interface GetTextParams {
    node_id: PageIndexNodeId;
    /** Snapshot to query. Defaults to latest. */
    snapshot_id?: SnapshotId;
}
export declare class PageIndex {
    private supabase;
    private embeddingApiKey;
    private latestSnapshotId;
    constructor(supabaseUrl: string, supabaseKey: string, embeddingApiKey: string);
    /**
     * Semantic search over Constitution text.
     * Used by the Drafter agent to find relevant Articles before writing.
     *
     * @example
     *   const results = await pageindex.search({
     *     query: "right to information government records",
     *     scope: "COI-1950/PART-III",
     *     top_k: 5,
     *   });
     */
    search(params: SearchParams): Promise<SearchResult[]>;
    /**
     * Return direct children of a node (tree traversal).
     * Used by the Drafter to drill into a Part → Articles, or Article → Clauses.
     *
     * @example
     *   const children = await pageindex.descend({ node_id: "COI-1950/PART-III" });
     *   // → [ { node_id: "COI-1950/PART-III/ART-12", label: "Article 12...", ... }, ... ]
     */
    descend(params: DescendParams): Promise<{
        children: TreeNode[];
    }>;
    /**
     * Fetch the full text of a single node.
     * Used by the Citator to validate that a cited node actually exists and
     * retrieve its text for context.
     *
     * @example
     *   const { text, snapshot_id } = await pageindex.get_text({
     *     node_id: "COI-1950/PART-III/ART-19",
     *   });
     */
    get_text(params: GetTextParams): Promise<NodeText>;
    private getLatestSnapshotId;
    private embed;
    private normalizeEmbeddingLength;
    private makeSnippet;
    private makeLocalSnippet;
    private makeLabel;
}
/**
 * Get (or create) the singleton PageIndex instance.
 * Reads credentials from environment variables.
 *
 * @example
 *   import { getPageIndex } from "@trionic/pageindex";
 *   const pageindex = getPageIndex();
 *   const results = await pageindex.search({ query: "right to information" });
 */
export declare function getPageIndex(): PageIndex;
export default getPageIndex;
//# sourceMappingURL=agnoTool.d.ts.map