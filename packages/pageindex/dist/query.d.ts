export type NodeLevel = "act" | "part" | "chapter" | "section" | "sub_section" | "clause";
export interface PageIndexNode {
    node_id: string;
    snapshot_id: string;
    act_code: string;
    act_name: string;
    level: NodeLevel;
    number: string;
    title: string;
    text: string;
    parent_id: string | null;
    children_ids: string[];
    path: string[];
    source_url: string;
}
export interface SearchScope {
    act_code?: string;
    act_codes?: string[];
    level?: NodeLevel;
    snapshot_id?: string;
}
export interface SearchResult {
    node: PageIndexNode;
    relevance: number;
    match_reason: string;
}
/** Retrieve the exact canonical legal text of a specific node by its ID. */
export declare function get_text(node_id: string): Promise<PageIndexNode>;
/** Given a parent node ID, return its immediate children. */
export declare function descend(node_id: string): Promise<PageIndexNode[]>;
/** Given any node ID, return its full ancestor chain. */
export declare function expand_path(node_id: string): Promise<PageIndexNode[]>;
/** Search the PageIndex tree for relevant nodes. */
export declare function search(query: string, scope?: SearchScope, top_k?: number): Promise<SearchResult[]>;
//# sourceMappingURL=query.d.ts.map