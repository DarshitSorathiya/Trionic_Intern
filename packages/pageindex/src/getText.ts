import rtiTree from "../data/rti-act-2005.json";

export function getText(nodeId: string) {
  function walk(node: any): any {
    if (node.node_id === nodeId) {
      return {
        text: node.text,
        snapshot_id: node.snapshot_id
      };
    }

    if (node.children) {
      for (const child of node.children) {
        const found = walk(child);

        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  return walk(rtiTree);
}