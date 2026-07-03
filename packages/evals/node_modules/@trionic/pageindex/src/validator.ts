import { TreeNode } from "./types";

const visited = new Set<string>();

export function validateTree(node: TreeNode): string[] {
  const errors: string[] = [];

  function walk(current: TreeNode) {
    // Duplicate node ID check
    if (visited.has(current.node_id)) {
      errors.push(`Duplicate node_id found: ${current.node_id}`);
    }

    visited.add(current.node_id);

    // Empty title check
    if (!current.title || current.title.trim() === "") {
      errors.push(`Missing title for node: ${current.node_id}`);
    }

    // Section text validation
    if (current.level === "section" && !current.text) {
      errors.push(`Missing text for section: ${current.node_id}`);
    }

    // Snapshot validation
    if (!current.snapshot_id) {
      errors.push(`Missing snapshot_id for node: ${current.node_id}`);
    }

    // Parent-child validation
    if (current.children) {
      for (const child of current.children) {
        if (child.parent_id !== current.node_id) {
          errors.push(
            `Invalid parent_id for ${child.node_id}`
          );
        }

        walk(child);
      }
    }
  }

  walk(node);

  return errors;
}