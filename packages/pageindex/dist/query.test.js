"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const query_js_1 = require("./query.js");
const errors_js_1 = require("./errors.js");
(0, vitest_1.describe)("PageIndex Query API Tests", () => {
    (0, vitest_1.describe)("get_text()", () => {
        (0, vitest_1.it)("should retrieve a valid CrPC section node", async () => {
            const node = await (0, query_js_1.get_text)("CRPC-1973/CH-I/S-1");
            (0, vitest_1.expect)(node).toBeDefined();
            (0, vitest_1.expect)(node.node_id).toBe("CRPC-1973/CH-I/S-1");
            (0, vitest_1.expect)(node.act_code).toBe("CRPC-1973");
            (0, vitest_1.expect)(node.level).toBe("section");
            (0, vitest_1.expect)(node.title).toContain("Short title");
            (0, vitest_1.expect)(node.text).toContain("Code of Criminal Procedure");
        });
        (0, vitest_1.it)("should retrieve a valid Contract Act section node", async () => {
            const node = await (0, query_js_1.get_text)("contract-act:s5");
            (0, vitest_1.expect)(node).toBeDefined();
            (0, vitest_1.expect)(node.node_id).toBe("contract-act:s5");
            (0, vitest_1.expect)(node.act_code).toBe("ICA-1872");
            (0, vitest_1.expect)(node.title).toContain("Revocation of proposals");
        });
        (0, vitest_1.it)("should retrieve a valid RTI Act section node", async () => {
            const node = await (0, query_js_1.get_text)("RTI-2005/CH-II/S-6");
            (0, vitest_1.expect)(node).toBeDefined();
            (0, vitest_1.expect)(node.node_id).toBe("RTI-2005/CH-II/S-6");
            (0, vitest_1.expect)(node.act_code).toBe("RTI-2005");
            (0, vitest_1.expect)(node.title).toContain("Request for obtaining information");
        });
        (0, vitest_1.it)("should throw NodeNotFoundError for an invalid node ID", async () => {
            await (0, vitest_1.expect)((0, query_js_1.get_text)("CRPC-1973/CH-I/S-999")).rejects.toThrow(errors_js_1.NodeNotFoundError);
        });
    });
    (0, vitest_1.describe)("descend()", () => {
        (0, vitest_1.it)("should return the Chapter children of the CrPC Act root node", async () => {
            const children = await (0, query_js_1.descend)("CRPC-1973");
            (0, vitest_1.expect)(children.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(children[0].node_id).toBe("CRPC-1973/CH-I");
            (0, vitest_1.expect)(children[0].level).toBe("chapter");
        });
        (0, vitest_1.it)("should return the Chapter children of the RTI Act root node", async () => {
            const children = await (0, query_js_1.descend)("RTI-2005");
            (0, vitest_1.expect)(children.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(children[0].node_id).toBe("RTI-2005/CH-I");
            (0, vitest_1.expect)(children[0].level).toBe("chapter");
        });
        (0, vitest_1.it)("should return the Section children of a CrPC Chapter node", async () => {
            const children = await (0, query_js_1.descend)("CRPC-1973/CH-I");
            (0, vitest_1.expect)(children).toHaveLength(5);
            (0, vitest_1.expect)(children[0].node_id).toBe("CRPC-1973/CH-I/S-1");
            (0, vitest_1.expect)(children[0].level).toBe("section");
        });
        (0, vitest_1.it)("should return the Section children of a RTI Chapter node", async () => {
            const children = await (0, query_js_1.descend)("RTI-2005/CH-I");
            (0, vitest_1.expect)(children).toHaveLength(2);
            (0, vitest_1.expect)(children[0].node_id).toBe("RTI-2005/CH-I/S-1");
            (0, vitest_1.expect)(children[0].level).toBe("section");
        });
        (0, vitest_1.it)("should return an empty list for a leaf section node", async () => {
            const children = await (0, query_js_1.descend)("CRPC-1973/CH-I/S-1");
            (0, vitest_1.expect)(children).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)("expand_path()", () => {
        (0, vitest_1.it)("should return the full ancestor path from Act to Section", async () => {
            const path = await (0, query_js_1.expand_path)("CRPC-1973/CH-I/S-1");
            (0, vitest_1.expect)(path).toHaveLength(3);
            (0, vitest_1.expect)(path[0].node_id).toBe("CRPC-1973");
            (0, vitest_1.expect)(path[1].node_id).toBe("CRPC-1973/CH-I");
            (0, vitest_1.expect)(path[2].node_id).toBe("CRPC-1973/CH-I/S-1");
        });
        (0, vitest_1.it)("should return the full ancestor path for RTI section", async () => {
            const path = await (0, query_js_1.expand_path)("RTI-2005/CH-II/S-6");
            (0, vitest_1.expect)(path).toHaveLength(3);
            (0, vitest_1.expect)(path[0].node_id).toBe("RTI-2005");
            (0, vitest_1.expect)(path[1].node_id).toBe("RTI-2005/CH-II");
            (0, vitest_1.expect)(path[2].node_id).toBe("RTI-2005/CH-II/S-6");
        });
    });
    (0, vitest_1.describe)("search()", () => {
        (0, vitest_1.it)("should find nodes matching query keywords", async () => {
            const results = await (0, query_js_1.search)("arrest without warrant", { act_code: "CRPC-1973" });
            (0, vitest_1.expect)(results.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(results[0].node.node_id).toContain("CRPC-1973");
            (0, vitest_1.expect)(results[0].relevance).toBe(1.0); // Highest matches are normalized to 1.0
            (0, vitest_1.expect)(results[0].match_reason).toBeDefined();
        });
        (0, vitest_1.it)("should find RTI nodes matching search queries", async () => {
            const results = await (0, query_js_1.search)("request for obtaining information", { act_code: "RTI-2005" });
            (0, vitest_1.expect)(results.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(results[0].node.node_id).toBe("RTI-2005/CH-II/S-6");
        });
        (0, vitest_1.it)("should restrict search by level if scoped", async () => {
            const results = await (0, query_js_1.search)("Preliminary", { level: "chapter" });
            (0, vitest_1.expect)(results.length).toBeGreaterThan(0);
            for (const r of results) {
                (0, vitest_1.expect)(r.node.level).toBe("chapter");
            }
        });
        (0, vitest_1.it)("should throw InvalidQueryError for empty search string", async () => {
            await (0, vitest_1.expect)((0, query_js_1.search)("")).rejects.toThrow(errors_js_1.InvalidQueryError);
            await (0, vitest_1.expect)((0, query_js_1.search)("   ")).rejects.toThrow(errors_js_1.InvalidQueryError);
        });
    });
});
//# sourceMappingURL=query.test.js.map