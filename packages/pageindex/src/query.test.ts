import { describe, it, expect } from "vitest";
import {
  get_text,
  descend,
  expand_path,
  getPageIndexActScope,
  getPageIndexActScopeFromNodePrefix,
  search,
} from "./query.js";
import { NodeNotFoundError, InvalidQueryError } from "./errors.js";

describe("PageIndex Query API Tests", () => {
  
  describe("get_text()", () => {
    it("should retrieve a valid CrPC section node", async () => {
      const node = await get_text("CRPC-1973/CH-I/S-1");
      expect(node).toBeDefined();
      expect(node.node_id).toBe("CRPC-1973/CH-I/S-1");
      expect(node.act_code).toBe("CRPC-1973");
      expect(node.level).toBe("section");
      expect(node.title).toContain("Short title");
      expect(node.text).toContain("Code of Criminal Procedure");
    });

    it("should retrieve a valid Contract Act section node", async () => {
      const node = await get_text("contract-act:s5");
      expect(node).toBeDefined();
      expect(node.node_id).toBe("contract-act:s5");
      expect(node.act_code).toBe("ICA-1872");
      expect(node.title).toContain("Revocation of proposals");
    });

    it("should retrieve Contract Act sections used by notice and employment profiles", async () => {
      const contractFormation = await get_text("contract-act:s10");
      const lawfulTerms = await get_text("contract-act:s23");
      const breachCompensation = await get_text("contract-act:s73");

      expect(contractFormation.text).toBeTruthy();
      expect(lawfulTerms.text).toBeTruthy();
      expect(breachCompensation.title.toLowerCase()).toContain("compensation");
    });

    it("should retrieve a valid RTI Act section node", async () => {
      const node = await get_text("RTI-2005/CH-II/S-6");
      expect(node).toBeDefined();
      expect(node.node_id).toBe("RTI-2005/CH-II/S-6");
      expect(node.act_code).toBe("RTI-2005");
      expect(node.title).toContain("Request for obtaining information");
    });

    it("should retrieve a valid Negotiable Instruments Act section node", async () => {
      const node = await get_text("NI-1881/S-138");
      expect(node.act_code).toBe("NI-1881");
      expect(node.title).toContain("Dishonour of cheque");
    });

    it("should retrieve a valid CPC section node", async () => {
      const node = await get_text("CPC-1908/S-80");
      expect(node.act_code).toBe("CPC-1908");
      expect(node.title).toContain("Notice");
    });

    it("should retrieve relevant CPA and IT Act nodes", async () => {
      const consumerNode = await get_text("CPA-2019/CH-IV/S-35");
      const dataProtectionNode = await get_text("ITA-2000/CH-IX/S-43A");
      const itNode = await get_text("ITA-2000/CH-XI/S-72");

      expect(consumerNode.act_code).toBe("CPA-2019");
      expect(consumerNode.text.toLowerCase()).toContain("complaint");
      expect(dataProtectionNode.act_code).toBe("ITA-2000");
      expect(dataProtectionNode.title).toContain("data");
      expect(itNode.act_code).toBe("ITA-2000");
      expect(itNode.text.toLowerCase()).toContain("confidentiality");
    });

    it("should retrieve an intermediary-rule node", async () => {
      const node = await get_text("IT-RULES-2021/RULE-4");
      expect(node.act_code).toBe("IT-RULES-2021");
      expect(node.title).toContain("Additional due diligence");
    });

    it("should retrieve Public Records and Whistleblower Act nodes", async () => {
      const recordsNode = await get_text("PublicRecords-1993/S-11");
      const whistleblowerNode = await get_text("Whistleblower-2014/CH-IV/S-11");

      expect(recordsNode.act_code).toBe("PublicRecords-1993");
      expect(recordsNode.title).toContain("Access to public records");
      expect(whistleblowerNode.act_code).toBe("Whistleblower-2014");
      expect(whistleblowerNode.title).toContain("victimisation");
    });

    it("should throw NodeNotFoundError for an invalid node ID", async () => {
      await expect(get_text("CRPC-1973/CH-I/S-999")).rejects.toThrow(NodeNotFoundError);
    });
  });

  describe("descend()", () => {
    it("should return the Chapter children of the CrPC Act root node", async () => {
      const children = await descend("CRPC-1973");
      expect(children.length).toBeGreaterThan(0);
      expect(children[0].node_id).toBe("CRPC-1973/CH-I");
      expect(children[0].level).toBe("chapter");
    });

    it("should return the Chapter children of the RTI Act root node", async () => {
      const children = await descend("RTI-2005");
      expect(children.length).toBeGreaterThan(0);
      expect(children[0].node_id).toBe("RTI-2005/CH-I");
      expect(children[0].level).toBe("chapter");
    });

    it("should return the Section children of a CrPC Chapter node", async () => {
      const children = await descend("CRPC-1973/CH-I");
      expect(children).toHaveLength(5);
      expect(children[0].node_id).toBe("CRPC-1973/CH-I/S-1");
      expect(children[0].level).toBe("section");
    });

    it("should return the Section children of a RTI Chapter node", async () => {
      const children = await descend("RTI-2005/CH-I");
      expect(children).toHaveLength(2);
      expect(children[0].node_id).toBe("RTI-2005/CH-I/S-1");
      expect(children[0].level).toBe("section");
    });

    it("should return an empty list for a leaf section node", async () => {
      const children = await descend("CRPC-1973/CH-I/S-1");
      expect(children).toHaveLength(0);
    });
  });

  describe("expand_path()", () => {
    it("should return the full ancestor path from Act to Section", async () => {
      const path = await expand_path("CRPC-1973/CH-I/S-1");
      expect(path).toHaveLength(3);
      expect(path[0].node_id).toBe("CRPC-1973");
      expect(path[1].node_id).toBe("CRPC-1973/CH-I");
      expect(path[2].node_id).toBe("CRPC-1973/CH-I/S-1");
    });

    it("should return the full ancestor path for RTI section", async () => {
      const path = await expand_path("RTI-2005/CH-II/S-6");
      expect(path).toHaveLength(3);
      expect(path[0].node_id).toBe("RTI-2005");
      expect(path[1].node_id).toBe("RTI-2005/CH-II");
      expect(path[2].node_id).toBe("RTI-2005/CH-II/S-6");
    });
  });

  describe("search()", () => {
    it("should find nodes matching query keywords", async () => {
      const results = await search("arrest without warrant", { act_code: "CRPC-1973" });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].node.node_id).toContain("CRPC-1973");
      expect(results[0].relevance).toBe(1.0); // Highest matches are normalized to 1.0
      expect(results[0].match_reason).toBeDefined();
    });

    it("should find RTI nodes matching search queries", async () => {
      const results = await search("request for obtaining information", { act_code: "RTI-2005" });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].node.node_id).toBe("RTI-2005/CH-II/S-6");
    });

    it("should keep cheque dishonour results inside the NI Act", async () => {
      const results = await search("dishonour of cheque", { act_code: "NI-1881" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((result) => result.node.act_code === "NI-1881")).toBe(true);
      expect(results.some((result) => result.node.node_id === "NI-1881/S-138")).toBe(true);
    });

    it("should keep notice-before-suit results inside the CPC", async () => {
      const results = await search("notice before instituting suit", { act_code: "CPC-1908" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((result) => result.node.act_code === "CPC-1908")).toBe(true);
      expect(results.some((result) => result.node.node_id === "CPC-1908/S-80")).toBe(true);
    });

    it("should keep consumer complaint results inside the CPA", async () => {
      const results = await search("filing complaint District Commission", { act_code: "CPA-2019" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((result) => result.node.act_code === "CPA-2019")).toBe(true);
      expect(results.some((result) => result.node.node_id === "CPA-2019/CH-IV/S-35")).toBe(true);
    });

    it("should restrict search by level if scoped", async () => {
      const results = await search("Preliminary", { level: "chapter" });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.node.level).toBe("chapter");
      }
    });

    it("should throw InvalidQueryError for empty search string", async () => {
      await expect(search("")).rejects.toThrow(InvalidQueryError);
      await expect(search("   ")).rejects.toThrow(InvalidQueryError);
    });
  });

  describe("getPageIndexActScope()", () => {
    it("maps the Contract Act's planner code to its actual node prefix", () => {
      expect(getPageIndexActScope("ICA-1872")).toEqual({
        act_code: "ICA-1872",
        node_prefix: "contract-act:",
      });
    });

    it("maps the Consumer Protection Act to its canonical prefix", () => {
      expect(getPageIndexActScope("CPA-2019")).toEqual({
        act_code: "CPA-2019",
        node_prefix: "CPA-2019",
      });
    });

    it("maps a scoped node prefix back to its local act code", () => {
      expect(getPageIndexActScopeFromNodePrefix("contract-act:s73")).toEqual({
        act_code: "ICA-1872",
        node_prefix: "contract-act:",
      });
    });
  });

});
