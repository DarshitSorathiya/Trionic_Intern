import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseArgs(argv) {
  const treeFlag = argv.indexOf("--tree");
  if (treeFlag === -1 || !argv[treeFlag + 1]) {
    console.error("Usage: validate --tree <path-to-tree.json>");
    process.exit(1);
  }
  return resolve(argv[treeFlag + 1]);
}

/** Flatten a hierarchical tree node into an array of flat node objects compatible with the validator */
function flattenNode(node, parentId = null, path = []) {
  const currentPath = [...path, node.node_id];
  const childrenIds = node.children ? node.children.map((c) => c.node_id) : [];
  const flatNode = {
    node_id: node.node_id,
    parent_id: node.parent_id ?? parentId,
    snapshot_id: node.snapshot_id,
    title: node.title,
    label: node.title, // validator expects a label field
    text_content: node.text, // validator expects text_content for sections
    node_type: node.level, // use level as node_type for validation checks
    level: node.level,
    children: node.children || [],
    children_ids: childrenIds,
  };

  let flatArray = [flatNode];
  if (node.children) {
    for (const child of node.children) {
      flatArray = flatArray.concat(flattenNode(child, node.node_id, currentPath));
    }
  }
  return flatArray;
}

function validateFlatTree(nodes) {
  const errors = [];
  const byId = new Map();

  for (const node of nodes) {
    if (byId.has(node.node_id)) {
      errors.push(`Duplicate node_id: ${node.node_id}`);
    }
    byId.set(node.node_id, node);
  }

  const roots = nodes.filter((n) => n.parent_id === null);
  if (roots.length !== 1) {
    errors.push(`Expected exactly 1 root node, found ${roots.length}`);
  }

  for (const node of nodes) {
    if (!node.snapshot_id?.trim()) {
      errors.push(`Missing snapshot_id: ${node.node_id}`);
    }
    if (!node.label?.trim()) {
      errors.push(`Missing label: ${node.node_id}`);
    }
    if (node.parent_id !== null && !byId.has(node.parent_id)) {
      errors.push(`Orphan node ${node.node_id}: parent ${node.parent_id} not found`);
    }
    if (node.node_type === "section" && !node.text_content?.trim()) {
      errors.push(`Empty text_content for section: ${node.node_id}`);
    }
    if (
      node.node_type === "section" &&
      node.status === "struck_down" &&
      !node.struck_down_by
    ) {
      errors.push(`struck_down section missing struck_down_by: ${node.node_id}`);
    }
  }

  return errors;
}

function main() {
  const treePath = parseArgs(process.argv.slice(2));
  const raw = readFileSync(treePath, "utf-8");
  let nodes = JSON.parse(raw);

  // If the file contains a hierarchical object (not an array), flatten it first.
  if (!Array.isArray(nodes)) {
    nodes = flattenNode(nodes);
  }

  if (!Array.isArray(nodes)) {
    console.error("Tree file must be a JSON array of nodes.");
    process.exit(1);
  }

  const errors = validateFlatTree(nodes);
  const sections = nodes.filter((n) => n.node_type === "section");

  console.log(`Tree: ${treePath}`);
  console.log(`Total nodes: ${nodes.length}`);
  console.log(`Sections: ${sections.length}`);

  if (errors.length > 0) {
    console.error(`\n${errors.length} validation error(s):\n`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log("\nValidation passed (0 errors).");
}

main();
