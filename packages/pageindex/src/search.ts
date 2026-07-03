
import rtiTree from "../data/rti-act-2005.json";
import ipcTree from "../artifacts/ipc-tree.json";
import niActTree from "../artifacts/ni-act-tree.json";

type SearchResult = {
  node_id: string;
  snippet: string;
  score: number;
};

function scoreNode(
  node: any,
  terms: string[],
  results: SearchResult[]
) {
  const title = (node.title || "").toLowerCase();
  const text = (node.text || "").toLowerCase();

  const keywords = (
    node.retrieval_keywords || []
  )
    .join(" ")
    .toLowerCase();

  const searchable =
    `${title} ${text} ${keywords}`;

  let score = 0;

  for (const term of terms) {
    if (searchable.includes(term)) {
      score++;
    }
  }

  if (score > 0) {
    results.push({
      node_id: node.node_id,
      snippet: node.text || node.title,
      score,
    });
  }
}

function walkTree(
  node: any,
  terms: string[],
  results: SearchResult[]
) {
  scoreNode(node, terms, results);

  if (node.children) {
    for (const child of node.children) {
      walkTree(child, terms, results);
    }
  }
}

function searchFlatNodes(
  nodes: any[],
  terms: string[],
  results: SearchResult[]
) {
  for (const node of nodes) {
    scoreNode(node, terms, results);
  }
}

export function search(
  query: string
): SearchResult[] {
  const results: SearchResult[] = [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  // RTI
  walkTree(
    rtiTree,
    terms,
    results
  );

  // IPC
  searchFlatNodes(
    ipcTree as any[],
    terms,
    results
  );

  // NI Act
  walkTree(
    niActTree,
    terms,
    results
  );

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
