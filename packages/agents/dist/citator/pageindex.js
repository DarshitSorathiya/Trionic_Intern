"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageindex = exports.NodeNotFoundError = void 0;
exports.get_text = get_text;
const pageindex_1 = require("@trionic/pageindex");
class NodeNotFoundError extends Error {
    constructor(node_id) {
        super(`PageIndex node not found: ${node_id}`);
        this.name = "NodeNotFoundError";
    }
}
exports.NodeNotFoundError = NodeNotFoundError;
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
async function resolveText(node_id) {
    let result;
    try {
        result = await (0, pageindex_1.get_text)(node_id);
    }
    catch (error) {
        const isMissingNode = error instanceof pageindex_1.NodeNotFoundError ||
            error?.name === "NodeNotFoundError";
        if (!isMissingNode)
            throw error;
        // The local PageIndex artifact set is intentionally small. When a node is
        // absent from it, validate against the configured live PageIndex before
        // rejecting a citation that exists in the database.
        try {
            const liveNode = await (0, pageindex_1.getPageIndex)().get_text({ node_id });
            return {
                node_id,
                snapshot_id: liveNode.snapshot_id,
                text: liveNode.text,
            };
        }
        catch (liveError) {
            if (liveError instanceof pageindex_1.NodeNotFoundError ||
                liveError?.name === "NodeNotFoundError") {
                throw new NodeNotFoundError(node_id);
            }
            // A missing live PageIndex configuration is equivalent to no additional
            // authoritative source being available; retain the original 404 result.
            if (liveError?.message?.startsWith("PageIndex:")) {
                throw new NodeNotFoundError(node_id);
            }
            throw liveError;
        }
    }
    return {
        node_id: result.node_id,
        snapshot_id: result.snapshot_id,
        text: result.text,
    };
}
/**
 * Mutable adapter object the Citator calls through. Exposing it as an object
 * (rather than only a bare function) lets tests swap out `get_text` via
 * `vi.spyOn(pageindex, "get_text")` while production keeps the real lookup.
 */
exports.pageindex = {
    get_text: resolveText,
};
/** Standalone alias for direct callers. */
async function get_text(node_id) {
    return exports.pageindex.get_text(node_id);
}
//# sourceMappingURL=pageindex.js.map