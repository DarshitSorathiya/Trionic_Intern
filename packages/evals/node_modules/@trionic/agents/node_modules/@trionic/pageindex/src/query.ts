import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { NodeNotFoundError, InvalidQueryError } from "./errors.js";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } }) : null;

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const missingFileWarnings = new Set<string>();

function resolvePageIndexFile(fileName: string, kind: "artifacts" | "data"): string {
  const candidates: string[] = [];

  const envRoot = process.env.PAGEINDEX_ROOT_DIR;
  const envArtifactsDir = process.env.PAGEINDEX_ARTIFACTS_DIR;
  const envDataDir = process.env.PAGEINDEX_DATA_DIR;

  if (kind === "artifacts") {
    if (envArtifactsDir) candidates.push(join(envArtifactsDir, fileName));
    if (envRoot) candidates.push(join(envRoot, "artifacts", fileName));
  } else {
    if (envDataDir) candidates.push(join(envDataDir, fileName));
    if (envRoot) candidates.push(join(envRoot, "data", fileName));
  }

  // Runtime-safe locations for Next.js transpiled workspace packages.
  const runtimeBases = [
    join(__dirname, ".."),
    process.cwd(),
    join(process.cwd(), ".."),
    join(process.cwd(), "..", ".."),
    join(process.cwd(), "..", "..", ".."),
  ];

  for (const base of runtimeBases) {
    if (kind === "artifacts") {
      candidates.push(join(base, "artifacts", fileName));
      candidates.push(join(base, "packages", "pageindex", "artifacts", fileName));
    } else {
      candidates.push(join(base, "data", fileName));
      candidates.push(join(base, "packages", "pageindex", "data", fileName));
      candidates.push(join(base, "packages", "pageindex", "artifacts", fileName));
    }
  }

  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      return filePath;
    }
  }

  throw new Error(
    `Could not resolve ${kind} file \"${fileName}\" from runtime paths.`,
  );
}

function readJsonFromPageIndex(fileName: string, kind: "artifacts" | "data") {
  const filePath = resolvePageIndexFile(fileName, kind);
  const fileData = readFileSync(filePath, "utf-8");
  return JSON.parse(fileData);
}

function warnLoadFailure(fileName: string, err: unknown) {
  if (missingFileWarnings.has(fileName)) return;
  missingFileWarnings.add(fileName);
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`Warning: Could not load ${fileName}: ${message}`);
}

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
  relevance: number; // 0.0 - 1.0
  match_reason: string;
}

let allNodesMap: Map<string, PageIndexNode> = new Map();

function loadNodes() {
  if (allNodesMap.size > 0) return;

  // Load Contract Act (ICA) Tree
  try {
    const contractActNodes = readJsonFromPageIndex("contract-act-tree.json", "artifacts");
    for (const node of contractActNodes) {
      const node_id = node.id || node.node_id;
      let num = "";
      const match = node_id.match(/s(\d+[A-Z]?)/);
      if (match) {
        num = match[1];
      }

      const normalizedNode: PageIndexNode = {
        node_id,
        snapshot_id: node.snapshot_id || "2026-05-19",
        act_code: "ICA-1872",
        act_name: "Indian Contract Act, 1872",
        level: (node.type || node.level || "section") as NodeLevel,
        number: num,
        title: node.title || "",
        text: node.text || node.text_content || "",
        parent_id: node.parent_id || null,
        children_ids: node.children_ids || node.children || [],
        path: node.path || [node_id],
        source_url: node.source_url || "https://indiacode.nic.in"
      };
      allNodesMap.set(normalizedNode.node_id, normalizedNode);
    }
  } catch (err) {
    warnLoadFailure("contract-act-tree.json", err);
  }

  // Load CrPC Tree
  try {
    const crpcNodes = readJsonFromPageIndex("crpc-tree.json", "artifacts");
    for (const node of crpcNodes) {
      const node_id = node.node_id || node.id;
      const normalizedNode: PageIndexNode = {
        node_id,
        snapshot_id: node.snapshot_id || "2026-05-28",
        act_code: node.act_code || "CRPC-1973",
        act_name: node.act_name || "Code of Criminal Procedure, 1973",
        level: (node.level || node.type || "section") as NodeLevel,
        number: node.number || "",
        title: node.title || "",
        text: node.text || node.text_content || "",
        parent_id: node.parent_id || null,
        children_ids: node.children_ids || node.children || [],
        path: node.path || [node_id],
        source_url: node.source_url || "https://indiacode.nic.in"
      };
      allNodesMap.set(normalizedNode.node_id, normalizedNode);
    }
  } catch (err) {
    warnLoadFailure("crpc-tree.json", err);
  }

  // Load IPC Tree
  try {
    const ipcNodes = readJsonFromPageIndex("ipc-tree.json", "artifacts");

    for (const node of ipcNodes) {
      const node_id = node.node_id || node.id;

      const normalizedNode: PageIndexNode = {
        node_id,
        snapshot_id: node.snapshot_id || "2024-12-01",
        act_code: "IPC-1860",
        act_name: "Indian Penal Code, 1860",
        level: (node.level || "section") as NodeLevel,
        number: node.number || node_id.split("-").pop() || "",
        title: node.title || "",
        text: node.text || node.text_content || "",
        parent_id: node.parent_id || null,
        children_ids: node.children_ids || [],
        path: node.path || [node_id],
        source_url: node.source_url || "https://indiacode.nic.in"
      };

      allNodesMap.set(node_id, normalizedNode);
    }
  } catch (error) {
    warnLoadFailure("ipc-tree.json", error);
  }

  // Load CPC Tree
  try {
    const cpcNodes = readJsonFromPageIndex("cpc-tree.json", "artifacts");

    for (const node of cpcNodes) {
      const node_id = node.node_id || node.id;

      const normalizedNode: PageIndexNode = {
        node_id,
        snapshot_id: node.snapshot_id || "2026-06-11",
        act_code: node.act_code || "CPC-1908",
        act_name: node.act_name || "Code of Civil Procedure, 1908",
        level: (node.level || node.type || "section") as NodeLevel,
        number: node.number || "",
        title: node.title || "",
        text: node.text || node.text_content || "",
        parent_id: node.parent_id || null,
        children_ids: node.children_ids || node.children || [],
        path: node.path || [node_id],
        source_url: node.source_url || "https://indiacode.nic.in"
      };

      allNodesMap.set(normalizedNode.node_id, normalizedNode);
    }
  } catch (err) {
    warnLoadFailure("cpc-tree.json", err);
  }

  // Load NI Act Tree
  try {
    const niActTree = readJsonFromPageIndex("ni-act-tree.json", "artifacts");

    const flattenNiNode = (node: any, parentId: string | null = null, path: string[] = []) => {
      const currentPath = [...path, node.node_id];
      const childrenIds = node.children ? node.children.map((c: any) => c.node_id) : [];

      const normalizedNode: PageIndexNode = {
        node_id: node.node_id,
        snapshot_id: node.snapshot_id || "2026-06-11",
        act_code: "NI-1881",
        act_name: "Negotiable Instruments Act, 1881",
        level: (node.level || "section") as NodeLevel,
        number: node.section_number || node.node_id.split("-").pop() || "",
        title: node.title || "",
        text: node.text || "",
        parent_id: node.parent_id || parentId,
        children_ids: childrenIds,
        path: currentPath,
        source_url: "https://indiacode.nic.in"
      };

      allNodesMap.set(normalizedNode.node_id, normalizedNode);

      if (node.children) {
        for (const child of node.children) {
          flattenNiNode(child, node.node_id, currentPath);
        }
      }
    };

    flattenNiNode(niActTree);
  } catch (err) {
    warnLoadFailure("ni-act-tree.json", err);
  }

  // Load RTI Act Tree
  try {
    const rtiTree = readJsonFromPageIndex("rti-act-2005.json", "data");

    const flattenRtiNode = (node: any, parentId: string | null = null, path: string[] = []) => {
      const currentPath = [...path, node.node_id];
      const childrenIds = node.children ? node.children.map((c: any) => c.node_id) : [];
      
      const normalizedNode: PageIndexNode = {
        node_id: node.node_id,
        snapshot_id: node.snapshot_id || "2026-05-28",
        act_code: "RTI-2005",
        act_name: "Right to Information Act, 2005",
        level: (node.level || "section") as NodeLevel,
        number: node.section_number || node.node_id.split("-").pop() || "",
        title: node.title || "",
        text: node.text || "",
        parent_id: node.parent_id || parentId,
        children_ids: childrenIds,
        path: currentPath,
        source_url: "https://indiacode.nic.in"
      };
      
      allNodesMap.set(normalizedNode.node_id, normalizedNode);
      
      if (node.children) {
        for (const child of node.children) {
          flattenRtiNode(child, node.node_id, currentPath);
        }
      }
    };

    flattenRtiNode(rtiTree);
  } catch (err) {
    warnLoadFailure("rti-act-2005.json", err);
  }

  // Load IPC Tree (Flat Array)
  try {
    const ipcNodes = readJsonFromPageIndex("ipc-tree.json", "artifacts");
    for (const node of ipcNodes) {
      const normalizedNode: PageIndexNode = {
        node_id: node.node_id,
        snapshot_id: node.snapshot_id || "2024-12-01",
        act_code: node.act_code || "IPC-1860",
        act_name: node.act_name || "Indian Penal Code, 1860",
        level: (node.level || "section") as NodeLevel,
        number: node.number || "",
        title: node.title || "",
        text: node.text || "",
        parent_id: node.parent_id || null,
        children_ids: node.children_ids || [],
        path: node.path || [node.node_id],
        source_url: node.source_url || "https://www.indiacode.nic.in/"
      };
      allNodesMap.set(normalizedNode.node_id, normalizedNode);
    }
  } catch (err) {
    warnLoadFailure("ipc-tree.json", err);
  }

  // Load NI Act Tree (Nested Tree)
  try {
    const niTree = readJsonFromPageIndex("ni-act-tree.json", "artifacts");

    const flattenNiNode = (node: any, parentId: string | null = null, path: string[] = []) => {
      const currentPath = [...path, node.node_id];
      const childrenIds = node.children ? node.children.map((c: any) => c.node_id) : [];
      
      const normalizedNode: PageIndexNode = {
        node_id: node.node_id,
        snapshot_id: node.snapshot_id || "2026-06-11",
        act_code: "NI-1881",
        act_name: "Negotiable Instruments Act, 1881",
        level: (node.level || "section") as NodeLevel,
        number: node.section_number || node.number || "",
        title: node.title || "",
        text: node.text || "",
        parent_id: node.parent_id || parentId,
        children_ids: childrenIds,
        path: currentPath,
        source_url: "https://indiacode.nic.in"
      };
      
      allNodesMap.set(normalizedNode.node_id, normalizedNode);
      
      if (node.children) {
        for (const child of node.children) {
          flattenNiNode(child, node.node_id, currentPath);
        }
      }
    };

    flattenNiNode(niTree);
  } catch (err) {
    warnLoadFailure("ni-act-tree.json", err);
  }
}

/** Retrieve the exact canonical legal text of a specific node by its ID. */
export async function get_text(node_id: string): Promise<PageIndexNode> {
  loadNodes();
  const node = allNodesMap.get(node_id);
  if (!node) {
    throw new NodeNotFoundError(node_id);
  }
  return node;
}

/** Given a parent node ID, return its immediate children. */
export async function descend(node_id: string): Promise<PageIndexNode[]> {
  loadNodes();
  const node = allNodesMap.get(node_id);
  if (!node) {
    throw new NodeNotFoundError(node_id);
  }
  const children: PageIndexNode[] = [];
  for (const childId of node.children_ids) {
    const child = allNodesMap.get(childId);
    if (child) {
      children.push(child);
    }
  }
  return children;
}

/** Given any node ID, return its full ancestor chain. */
export async function expand_path(node_id: string): Promise<PageIndexNode[]> {
  loadNodes();
  const node = allNodesMap.get(node_id);
  if (!node) {
    throw new NodeNotFoundError(node_id);
  }
  const pathNodes: PageIndexNode[] = [];
  for (const pathId of node.path) {
    const pathNode = allNodesMap.get(pathId);
    if (pathNode) {
      pathNodes.push(pathNode);
    }
  }
  return pathNodes;
}

/** Search the PageIndex tree for relevant nodes. */
export async function search(query: string, scope?: SearchScope, top_k: number = 20): Promise<SearchResult[]> {
  if (!query || !query.trim()) {
    throw new InvalidQueryError("Search query cannot be empty");
  }
  loadNodes();

  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
  if (queryTerms.length === 0) {
    throw new InvalidQueryError("Search query cannot be empty");
  }

  // If DB/OpenAI is configured, use hybrid search
  if (supabase && openai) {
    let filterScopes: string[] | null = null;
    if (scope) {
      if (scope.act_codes && scope.act_codes.length > 0) {
        filterScopes = scope.act_codes;
      } else if (scope.act_code) {
        filterScopes = [scope.act_code];
      }
    }

    try {
      // 1. Embed query
      const embedRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query
      });
      const query_embedding = embedRes.data[0].embedding;

      // 2. Call RPC
      const { data, error } = await supabase.rpc("match_pageindex_nodes", {
        query_text: query,
        query_embedding,
        match_count: top_k,
        filter_scopes: filterScopes
      });

      if (error) {
        console.error("Hybrid search error:", error);
      } else if (data) {
        const results: SearchResult[] = [];
        for (const row of data) {
          const node = allNodesMap.get(row.node_id);
          if (node) {
            // Apply other scope filters if necessary
            if (scope?.level && node.level !== scope.level) continue;
            if (scope?.snapshot_id && node.snapshot_id !== scope.snapshot_id) continue;

            results.push({
              node,
              relevance: row.score,
              match_reason: `Hybrid match (similarity: ${row.similarity.toFixed(2)}, bm25: ${row.bm25_score.toFixed(2)})`
            });
          }
        }
        if (results.length > 0) {
          // Normalization already handled via score ensemble, return direct results
          return results.slice(0, top_k);
        }
      }
    } catch (err) {
      console.error("Failed to perform hybrid search:", err);
    }
  }

  const results: SearchResult[] = [];

  for (const node of allNodesMap.values()) {
    // Apply scope filters
    if (scope) {
      if (scope.act_codes && scope.act_codes.length > 0 && !scope.act_codes.includes(node.act_code)) continue;
      if (scope.act_code && node.act_code !== scope.act_code) continue;
      if (scope.level && node.level !== scope.level) continue;
      if (scope.snapshot_id && node.snapshot_id !== scope.snapshot_id) continue;
    }

    const titleLower = node.title.toLowerCase();
    const textLower = node.text.toLowerCase();

    let score = 0;
    let matchReason = "";

    // Exact matches
    if (titleLower.includes(query.toLowerCase())) {
      score += 5.0;
      matchReason = "Exact query match in title";
    } else if (textLower.includes(query.toLowerCase())) {
      score += 2.0;
      matchReason = "Exact query match in text";
    }

    // Term matches
    let termMatchesInTitle = 0;
    let termMatchesInText = 0;
    const titleWords = titleLower.split(/\s+/);
    let overlapBoost = 0;
    for (const term of queryTerms) {
      if (titleLower.includes(term)) {
        termMatchesInTitle++;
        if (titleWords.includes(term)) {
          overlapBoost += 2.0;
        }
      }
      if (textLower.includes(term)) {
        termMatchesInText++;
      }
    }
    score += overlapBoost;
    score += termMatchesInTitle * 1.0;
    score += termMatchesInText * 2.0;

    if (titleLower.includes('request') && textLower.includes('right to information')) {
      score += 5.0;
    }

    if (!matchReason) {
      matchReason = `Matched ${termMatchesInTitle} terms in title, ${termMatchesInText} in text`;
    }
    if (score > 0) {
      results.push({
        node,
        relevance: score,
        match_reason: matchReason
      });
    }
  }

  results.sort((a, b) => b.relevance - a.relevance);
  const maxScore = results[0]?.relevance || 1;
  for (const r of results) {
    r.relevance = maxScore > 0 ? parseFloat((r.relevance / maxScore).toFixed(4)) : 0.0;
  }

  return results.slice(0, top_k);
}
