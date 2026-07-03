import { describe, it, expect } from "vitest";
import { get_text, descend, expand_path, search } from "./query.js";
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

    it("should retrieve a valid RTI Act section node", async () => {
      const node = await get_text("RTI-2005/CH-II/S-6");
      expect(node).toBeDefined();
      expect(node.node_id).toBe("RTI-2005/CH-II/S-6");
      expect(node.act_code).toBe("RTI-2005");
      expect(node.title).toContain("Request for obtaining information");
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

});
