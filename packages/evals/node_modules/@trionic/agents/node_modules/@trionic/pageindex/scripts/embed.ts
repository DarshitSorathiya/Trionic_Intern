import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load from root .env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

type TreeNode = {
  node_id: string;
  title: string;
  text?: string;
  parent_id?: string;
  snapshot_id: string;
  level: string;
  retrieval_keywords?: string[];
  children?: TreeNode[];
};

async function processTree(treePath: string) {
  console.log(`Processing tree: ${treePath}`);
  const content = fs.readFileSync(treePath, "utf-8");
  const tree = JSON.parse(content) as TreeNode;

  // Insert tree
  const actName = tree.title;
  const actCode = tree.node_id;

  const { data: treeData, error: treeError } = await supabase
    .from("pageindex_trees")
    .upsert(
      {
        act_name: actName,
        act_code: actCode,
        language: "en",
        metadata: { snapshot_id: tree.snapshot_id },
      },
      { onConflict: "act_name" } // Ensure we have a unique constraint or just insert if missing.
    )
    .select("id")
    .single();

  if (treeError && treeError.code !== "PGRST116") {
    // If upsert fails, try to select
    console.error(`Error inserting tree ${actName}:`, treeError);
  }

  let treeId = treeData?.id;

  if (!treeId) {
    const { data: existingTree } = await supabase
      .from("pageindex_trees")
      .select("id")
      .eq("act_name", actName)
      .single();
    if (existingTree) {
      treeId = existingTree.id;
    } else {
      // Direct insert
      const { data: insertedTree, error: insertErr } = await supabase
        .from("pageindex_trees")
        .insert({
          act_name: actName,
          act_code: actCode,
          language: "en",
          metadata: { snapshot_id: tree.snapshot_id },
        })
        .select("id")
        .single();
      
      if (insertErr) {
         console.error(`Error inserting tree ${actName}:`, insertErr);
         return;
      }
      treeId = insertedTree.id;
    }
  }

  const nodesToProcess: TreeNode[] = [];
  function collect(node: TreeNode) {
    nodesToProcess.push(node);
    if (node.children) {
      for (const child of node.children) {
        collect(child);
      }
    }
  }
  collect(tree);

  console.log(`Found ${nodesToProcess.length} nodes for ${actName}`);

  for (const node of nodesToProcess) {
    // Check if node exists
    const { data: existing } = await supabase
      .from("pageindex_nodes")
      .select("id")
      .eq("node_id", node.node_id)
      .single();

    if (existing) {
      console.log(`Skipping existing node: ${node.node_id}`);
      continue;
    }

    const title = (node.title || "").toLowerCase();
    const text = (node.text || "").toLowerCase();
    const keywords = (node.retrieval_keywords || []).join(" ").toLowerCase();
    const searchable = `${title} ${text} ${keywords}`.trim();

    if (!searchable) continue;

    console.log(`Embedding node: ${node.node_id}`);
    const embedding = await embedText(searchable);

    const { error: nodeError } = await supabase.from("pageindex_nodes").insert({
      tree_id: treeId,
      node_id: node.node_id,
      node_path: node.node_id, // simple path
      heading: node.title,
      body_text: node.text || "",
      embedding,
    });

    if (nodeError) {
      console.error(`Error inserting node ${node.node_id}:`, nodeError);
    }
  }

  console.log(`Finished processing tree: ${treePath}`);
}

async function main() {
  const dataDir = path.resolve(__dirname, "../data");
  const artifactsDir = path.resolve(__dirname, "../artifacts");

  const processDir = async (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith(".json")) {
        await processTree(path.join(dir, file));
      }
    }
  };

  await processDir(dataDir);
  await processDir(artifactsDir);
}

main().catch(console.error);
