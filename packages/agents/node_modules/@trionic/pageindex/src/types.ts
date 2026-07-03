import { PageIndexNodeId, SnapshotId } from "@trionic/shared";

export type TreeNodeLevel =
  | "act"
  | "chapter"
  | "section"
  | "clause";

export type TreeNode = {
  node_id: PageIndexNodeId;

  title: string;

  text?: string;

  parent_id?: PageIndexNodeId;

  snapshot_id: SnapshotId;

  level: TreeNodeLevel;

  children?: TreeNode[];
};