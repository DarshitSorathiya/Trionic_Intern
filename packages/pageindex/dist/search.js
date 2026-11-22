"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const rti_act_2005_json_1 = __importDefault(require("../data/rti-act-2005.json"));
const ipc_tree_json_1 = __importDefault(require("../artifacts/ipc-tree.json"));
const ni_act_tree_json_1 = __importDefault(require("../artifacts/ni-act-tree.json"));
function scoreNode(node, terms, results) {
    const title = (node.title || "").toLowerCase();
    const text = (node.text || "").toLowerCase();
    const keywords = (node.retrieval_keywords || [])
        .join(" ")
        .toLowerCase();
    const searchable = `${title} ${text} ${keywords}`;
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
function walkTree(node, terms, results) {
    scoreNode(node, terms, results);
    if (node.children) {
        for (const child of node.children) {
            walkTree(child, terms, results);
        }
    }
}
function searchFlatNodes(nodes, terms, results) {
    for (const node of nodes) {
        scoreNode(node, terms, results);
    }
}
function search(query) {
    const results = [];
    const terms = query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
    // RTI
    walkTree(rti_act_2005_json_1.default, terms, results);
    // IPC
    searchFlatNodes(ipc_tree_json_1.default, terms, results);
    // NI Act
    walkTree(ni_act_tree_json_1.default, terms, results);
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}
//# sourceMappingURL=search.js.map