"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageIndex = void 0;
exports.getPageIndex = getPageIndex;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const query_js_1 = require("./query.js");
const errors_js_1 = require("./errors.js");
// ─── PageIndex class ─────────────────────────────────────────────────────────
class PageIndex {
    supabase;
    embeddingApiKey;
    latestSnapshotId = null;
    constructor(supabaseUrl, supabaseKey, embeddingApiKey) {
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.embeddingApiKey = embeddingApiKey;
    }
    // ─── Public API (locked interface) ────────────────────────────────────────
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
    async search(params) {
        const { query, scope, top_k = 5, snapshot_id } = params;
        const k = Math.min(top_k, 20);
        const snapshotId = snapshot_id ?? (await this.getLatestSnapshotId());
        if (!snapshotId) {
            // Graceful fallback for local/dev environments where DB snapshots are not seeded.
            const fallback = await (0, query_js_1.search)(query, undefined, k);
            return fallback.map((item) => ({
                node_id: item.node.node_id,
                snapshot_id: item.node.snapshot_id,
                snippet: this.makeLocalSnippet(item.node.title, item.node.text),
                score: item.relevance,
            }));
        }
        try {
            // Embed the query
            const queryEmbedding = await this.embed(query);
            // Call Supabase RPC for vector similarity search
            const { data, error } = await this.supabase.rpc("pageindex_search", {
                query_embedding: queryEmbedding,
                p_snapshot_id: snapshotId,
                p_scope: scope ?? null,
                p_top_k: k,
            });
            if (error) {
                throw new Error(`PageIndex search RPC failed: ${error.message}`);
            }
            return data.map((row) => ({
                node_id: row.id,
                snapshot_id: row.snapshot_id,
                snippet: this.makeSnippet(row),
                score: row.similarity ?? 0,
            }));
        }
        catch (err) {
            console.warn("PageIndex vector search failed; using local search fallback:", err);
            const fallback = await (0, query_js_1.search)(query, undefined, k);
            return fallback.map((item) => ({
                node_id: item.node.node_id,
                snapshot_id: item.node.snapshot_id,
                snippet: this.makeLocalSnippet(item.node.title, item.node.text),
                score: item.relevance,
            }));
        }
    }
    /**
     * Return direct children of a node (tree traversal).
     * Used by the Drafter to drill into a Part → Articles, or Article → Clauses.
     *
     * @example
     *   const children = await pageindex.descend({ node_id: "COI-1950/PART-III" });
     *   // → [ { node_id: "COI-1950/PART-III/ART-12", label: "Article 12...", ... }, ... ]
     */
    async descend(params) {
        const { node_id, snapshot_id } = params;
        const snapshotId = snapshot_id ?? (await this.getLatestSnapshotId());
        const { data, error } = await this.supabase
            .from("pageindex_nodes")
            .select("id, node_type, article_number, article_title, clause_number, schedule_number, schedule_title, part_name, sort_order, parent_id, snapshot_id")
            .eq("parent_id", node_id)
            .eq("snapshot_id", snapshotId)
            .order("sort_order", { ascending: true });
        if (error) {
            throw new Error(`PageIndex descend failed: ${error.message}`);
        }
        const rows = data;
        // Check which nodes have children (one extra query)
        const childIds = rows.map((r) => r.id);
        const { data: grandchildren } = childIds.length > 0
            ? await this.supabase
                .from("pageindex_nodes")
                .select("parent_id")
                .in("parent_id", childIds)
            : { data: [] };
        const hasChildSet = new Set((grandchildren ?? []).map((r) => r.parent_id));
        return {
            children: rows.map((row) => ({
                node_id: row.id,
                node_type: row.node_type,
                label: this.makeLabel(row),
                has_children: hasChildSet.has(row.id),
                sort_order: row.sort_order,
            })),
        };
    }
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
    async get_text(params) {
        const { node_id, snapshot_id } = params;
        let query = this.supabase
            .from("pageindex_nodes")
            .select("id, snapshot_id, text_content")
            .eq("id", node_id);
        if (snapshot_id) {
            query = query.eq("snapshot_id", snapshot_id);
        }
        const { data, error } = await query.maybeSingle();
        if (!error && data) {
            const row = data;
            return { text: row.text_content, snapshot_id: row.snapshot_id };
        }
        // Local artifacts remain the development fallback, but they are never
        // treated as a successful lookup for an unknown node.
        try {
            const localNode = await (0, query_js_1.get_text)(node_id);
            return { text: localNode.text, snapshot_id: localNode.snapshot_id };
        }
        catch (localError) {
            if (localError instanceof errors_js_1.NodeNotFoundError) {
                throw localError;
            }
            throw error ?? localError;
        }
    }
    // ─── Private helpers ───────────────────────────────────────────────────────
    async getLatestSnapshotId() {
        if (this.latestSnapshotId)
            return this.latestSnapshotId;
        const { data, error } = await this.supabase
            .from("pageindex_snapshots")
            .select("id")
            .eq("act_code", "COI-1950")
            .order("id", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error || !data)
            return null;
        this.latestSnapshotId = data.id;
        return this.latestSnapshotId;
    }
    async embed(text) {
        if (this.embeddingApiKey === "dummy-key") {
            return Array(1536).fill(0.0);
        }
        if (this.embeddingApiKey.startsWith("gemini:")) {
            const geminiKey = this.embeddingApiKey.slice("gemini:".length);
            const response = await globalThis.fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${encodeURIComponent(geminiKey)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "models/text-embedding-004",
                    content: {
                        parts: [{ text: text.slice(0, 2048) }],
                    },
                }),
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Gemini embed failed: ${err}`);
            }
            const json = (await response.json());
            const values = json.embedding?.values ?? [];
            if (values.length === 0) {
                throw new Error("Gemini embed returned empty vector");
            }
            return this.normalizeEmbeddingLength(values, 1536);
        }
        const openaiKey = this.embeddingApiKey.startsWith("openai:")
            ? this.embeddingApiKey.slice("openai:".length)
            : this.embeddingApiKey;
        const response = await globalThis.fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${openaiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "text-embedding-3-small",
                input: text.slice(0, 2048), // hard cap
                encoding_format: "float",
            }),
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI embed failed: ${err}`);
        }
        const json = (await response.json());
        return json.data[0].embedding;
    }
    normalizeEmbeddingLength(values, targetLength) {
        if (values.length === targetLength) {
            return values;
        }
        if (values.length > targetLength) {
            return values.slice(0, targetLength);
        }
        return values.concat(Array(targetLength - values.length).fill(0));
    }
    makeSnippet(row) {
        const parts = [];
        if (row.article_number && row.article_title) {
            parts.push(`Art. ${row.article_number} — ${row.article_title}`);
        }
        else if (row.schedule_number) {
            parts.push(`Schedule ${row.schedule_number}`);
        }
        parts.push(row.text_content.slice(0, 300));
        return parts.join(": ").trim();
    }
    makeLocalSnippet(title, text) {
        const trimmedTitle = (title || "").trim();
        const trimmedText = (text || "").trim();
        if (trimmedTitle && trimmedText) {
            return `${trimmedTitle}: ${trimmedText.slice(0, 300)}`;
        }
        if (trimmedTitle) {
            return trimmedTitle;
        }
        return trimmedText.slice(0, 300);
    }
    makeLabel(row) {
        if (row.node_type === "article") {
            return `Article ${row.article_number}${row.article_title ? ` — ${row.article_title}` : ""}`;
        }
        if (row.node_type === "clause") {
            return `Article ${row.article_number}(${row.clause_number})`;
        }
        if (row.node_type === "schedule") {
            return `Schedule ${row.schedule_number} — ${row.schedule_title ?? ""}`;
        }
        if (row.node_type === "schedule_entry") {
            return row.text_content.slice(0, 80);
        }
        if (row.node_type === "part") {
            return row.part_name ?? row.id;
        }
        return row.id;
    }
}
exports.PageIndex = PageIndex;
// ─── Singleton factory (for use by agents) ───────────────────────────────────
let _instance = null;
/**
 * Workspace packages are executed by Next from the monorepo root, where Next
 * does not automatically load `apps/web/.env`. Load the usual local files only
 * when the variables have not already been injected by the host (for example,
 * Vercel's production environment).
 */
function loadPageIndexEnvironment() {
    if (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
        return;
    const cwd = process.cwd();
    (0, dotenv_1.config)({ path: (0, path_1.join)(cwd, ".env.local") });
    (0, dotenv_1.config)({ path: (0, path_1.join)(cwd, ".env") });
    (0, dotenv_1.config)({ path: (0, path_1.join)(cwd, "apps", "web", ".env.local") });
    (0, dotenv_1.config)({ path: (0, path_1.join)(cwd, "apps", "web", ".env") });
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
function getPageIndex() {
    if (_instance)
        return _instance;
    loadPageIndexEnvironment();
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY ??
        process.env.SUPABASE_SERVICE_ROLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("PageIndex: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be set.");
    }
    if (!openaiKey && !geminiKey) {
        console.warn("PageIndex: OPENAI_API_KEY/GEMINI_API_KEY not set. Vector search may fall back to local search.");
    }
    const embeddingApiKey = openaiKey
        ? `openai:${openaiKey}`
        : geminiKey
            ? `gemini:${geminiKey}`
            : "dummy-key";
    _instance = new PageIndex(supabaseUrl, supabaseKey, embeddingApiKey);
    return _instance;
}
// Default export for convenience
exports.default = getPageIndex;
//# sourceMappingURL=agnoTool.js.map