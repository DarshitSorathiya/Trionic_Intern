"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getText = getText;
const rti_act_2005_json_1 = __importDefault(require("../data/rti-act-2005.json"));
function getText(nodeId) {
    function walk(node) {
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
    return walk(rti_act_2005_json_1.default);
}
//# sourceMappingURL=getText.js.map