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
        (0, vitest_1.it)("should retrieve Contract Act sections used by notice and employment profiles", async () => {
            const contractFormation = await (0, query_js_1.get_text)("contract-act:s10");
            const lawfulTerms = await (0, query_js_1.get_text)("contract-act:s23");
            const breachCompensation = await (0, query_js_1.get_text)("contract-act:s73");
            (0, vitest_1.expect)(contractFormation.text).toBeTruthy();
            (0, vitest_1.expect)(lawfulTerms.text).toBeTruthy();
            (0, vitest_1.expect)(breachCompensation.title.toLowerCase()).toContain("compensation");
        });
        (0, vitest_1.it)("should retrieve a valid RTI Act section node", async () => {
            const node = await (0, query_js_1.get_text)("RTI-2005/CH-II/S-6");
            (0, vitest_1.expect)(node).toBeDefined();
            (0, vitest_1.expect)(node.node_id).toBe("RTI-2005/CH-II/S-6");
            (0, vitest_1.expect)(node.act_code).toBe("RTI-2005");
            (0, vitest_1.expect)(node.title).toContain("Request for obtaining information");
        });
        (0, vitest_1.it)("should retrieve a valid Negotiable Instruments Act section node", async () => {
            const node = await (0, query_js_1.get_text)("NI-1881/S-138");
            (0, vitest_1.expect)(node.act_code).toBe("NI-1881");
            (0, vitest_1.expect)(node.title).toContain("Dishonour of cheque");
        });
        (0, vitest_1.it)("should retrieve a valid CPC section node", async () => {
            const node = await (0, query_js_1.get_text)("CPC-1908/S-80");
            (0, vitest_1.expect)(node.act_code).toBe("CPC-1908");
            (0, vitest_1.expect)(node.title).toContain("Notice");
        });
        (0, vitest_1.it)("should retrieve relevant CPA and IT Act nodes", async () => {
            const consumerNode = await (0, query_js_1.get_text)("CPA-2019/CH-IV/S-35");
            const dataProtectionNode = await (0, query_js_1.get_text)("ITA-2000/CH-IX/S-43A");
            const itNode = await (0, query_js_1.get_text)("ITA-2000/CH-XI/S-72");
            (0, vitest_1.expect)(consumerNode.act_code).toBe("CPA-2019");
            (0, vitest_1.expect)(consumerNode.text.toLowerCase()).toContain("complaint");
            (0, vitest_1.expect)(dataProtectionNode.act_code).toBe("ITA-2000");
            (0, vitest_1.expect)(dataProtectionNode.title).toContain("data");
            (0, vitest_1.expect)(itNode.act_code).toBe("ITA-2000");
            (0, vitest_1.expect)(itNode.text.toLowerCase()).toContain("confidentiality");
        });
        (0, vitest_1.it)("should retrieve an intermediary-rule node", async () => {
            const node = await (0, query_js_1.get_text)("IT-RULES-2021/RULE-4");
            (0, vitest_1.expect)(node.act_code).toBe("IT-RULES-2021");
            (0, vitest_1.expect)(node.title).toContain("Additional due diligence");
        });
        (0, vitest_1.it)("should retrieve Public Records and Whistleblower Act nodes", async () => {
            const recordsNode = await (0, query_js_1.get_text)("PublicRecords-1993/S-11");
            const whistleblowerNode = await (0, query_js_1.get_text)("Whistleblower-2014/CH-IV/S-11");
            (0, vitest_1.expect)(recordsNode.act_code).toBe("PublicRecords-1993");
            (0, vitest_1.expect)(recordsNode.title).toContain("Access to public records");
            (0, vitest_1.expect)(whistleblowerNode.act_code).toBe("Whistleblower-2014");
            (0, vitest_1.expect)(whistleblowerNode.title).toContain("victimisation");
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
        (0, vitest_1.it)("should keep cheque dishonour results inside the NI Act", async () => {
            const results = await (0, query_js_1.search)("dishonour of cheque", { act_code: "NI-1881" });
            (0, vitest_1.expect)(results.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(results.every((result) => result.node.act_code === "NI-1881")).toBe(true);
            (0, vitest_1.expect)(results.some((result) => result.node.node_id === "NI-1881/S-138")).toBe(true);
        });
        (0, vitest_1.it)("should keep notice-before-suit results inside the CPC", async () => {
            const results = await (0, query_js_1.search)("notice before instituting suit", { act_code: "CPC-1908" });
            (0, vitest_1.expect)(results.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(results.every((result) => result.node.act_code === "CPC-1908")).toBe(true);
            (0, vitest_1.expect)(results.some((result) => result.node.node_id === "CPC-1908/S-80")).toBe(true);
        });
        (0, vitest_1.it)("should keep consumer complaint results inside the CPA", async () => {
            const results = await (0, query_js_1.search)("filing complaint District Commission", { act_code: "CPA-2019" });
            (0, vitest_1.expect)(results.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(results.every((result) => result.node.act_code === "CPA-2019")).toBe(true);
            (0, vitest_1.expect)(results.some((result) => result.node.node_id === "CPA-2019/CH-IV/S-35")).toBe(true);
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
    (0, vitest_1.describe)("getPageIndexActScope()", () => {
        (0, vitest_1.it)("maps the Contract Act's planner code to its actual node prefix", () => {
            (0, vitest_1.expect)((0, query_js_1.getPageIndexActScope)("ICA-1872")).toEqual({
                act_code: "ICA-1872",
                node_prefix: "contract-act:",
            });
        });
        (0, vitest_1.it)("maps the Consumer Protection Act to its canonical prefix", () => {
            (0, vitest_1.expect)((0, query_js_1.getPageIndexActScope)("CPA-2019")).toEqual({
                act_code: "CPA-2019",
                node_prefix: "CPA-2019",
            });
        });
        (0, vitest_1.it)("maps a scoped node prefix back to its local act code", () => {
            (0, vitest_1.expect)((0, query_js_1.getPageIndexActScopeFromNodePrefix)("contract-act:s73")).toEqual({
                act_code: "ICA-1872",
                node_prefix: "contract-act:",
            });
        });
    });
});
//# sourceMappingURL=query.test.js.map