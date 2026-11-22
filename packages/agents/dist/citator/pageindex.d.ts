import type { PageIndexNodeId, SnapshotId } from "@trionic/shared";
export declare class NodeNotFoundError extends Error {
    constructor(node_id: PageIndexNodeId);
}
export type PageIndexNode = {
    node_id: PageIndexNodeId;
    snapshot_id: SnapshotId;
    text: string;
};
/**
 * Citator PageIndex adapter.
 * Resolves a node's canonical text via the real get_text tool from
 * @trionic/pageindex, which reads the live in-memory act tree mappings
 * (ICA, NI, RTI, IPC, CrPC, CPC) instead of returning mocked data.
 *
 * If the node does not exist, PageIndex throws its own NodeNotFoundError — we
 * translate it into this module's NodeNotFoundError so the Citator can treat it
 * as a rejection. Any other error (e.g. a DB timeout) propagates untouched.
 */
declare function resolveText(node_id: PageIndexNodeId): Promise<PageIndexNode>;
/**
 * Mutable adapter object the Citator calls through. Exposing it as an object
 * (rather than only a bare function) lets tests swap out `get_text` via
 * `vi.spyOn(pageindex, "get_text")` while production keeps the real lookup.
 */
export declare const pageindex: {
    get_text: typeof resolveText;
};
/** Standalone alias for direct callers. */
export declare function get_text(node_id: PageIndexNodeId): Promise<PageIndexNode>;
export {};
//# sourceMappingURL=pageindex.d.ts.map