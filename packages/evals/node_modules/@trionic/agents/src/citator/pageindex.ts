import type { PageIndexNodeId, SnapshotId } from "@trionic/shared";
import {
  get_text as pageindexGetText,
  NodeNotFoundError as PageIndexNodeNotFoundError,
} from "@trionic/pageindex";

export class NodeNotFoundError extends Error {
  constructor(node_id: PageIndexNodeId) {
    super(`PageIndex node not found: ${node_id}`);
    this.name = "NodeNotFoundError";
  }
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
async function resolveText(node_id: PageIndexNodeId): Promise<PageIndexNode> {
  let result;
  try {
    result = await pageindexGetText(node_id);
  } catch (error) {
    if (
      error instanceof PageIndexNodeNotFoundError ||
      (error as { name?: string })?.name === "NodeNotFoundError"
    ) {
      throw new NodeNotFoundError(node_id);
    }
    throw error;
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
export const pageindex = {
  get_text: resolveText,
};

/** Standalone alias for direct callers. */
export async function get_text(node_id: PageIndexNodeId): Promise<PageIndexNode> {
  return pageindex.get_text(node_id);
}
