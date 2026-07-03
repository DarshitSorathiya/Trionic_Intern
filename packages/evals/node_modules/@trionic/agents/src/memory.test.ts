/**
 * memory.test.ts
 * Owner: Yatri Dungarani (Week 2 — Issue #39)
 *
 * Unit tests for the Memory module.
 * Tests: round-trip, load-miss, version increment, clear, optimistic concurrency.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  Memory,
  InMemoryStore,
  MemoryConflictError,
  createInitialState,
  hashIntakeText,
} from "./memory.js";
import type { ConversationState } from "@trionic/shared";

describe("Memory", () => {
  let memory: Memory;
  let store: InMemoryStore;

  beforeEach(() => {
    store = new InMemoryStore();
    memory = new Memory(store);
  });

  // ─── load ─────────────────────────────────────────────────────────────────

  it("load returns null for unknown document", async () => {
    const state = await memory.load("nonexistent-doc");
    expect(state).toBeNull();
  });

  // ─── save + load round-trip ───────────────────────────────────────────────

  it("save + load round-trip preserves state", async () => {
    const state = createInitialState("doc-1", hashIntakeText("test input"));
    await memory.save("doc-1", state);

    const loaded = await memory.load("doc-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.document_id).toBe("doc-1");
    expect(loaded!.version).toBe(1);
    expect(loaded!.last_classifier_output).toBeNull();
    expect(loaded!.last_planner_output).toBeNull();
    expect(loaded!.retrieved_nodes).toEqual([]);
    expect(loaded!.current_draft_version).toBe(0);
  });

  // ─── save increments version ──────────────────────────────────────────────

  it("save allows higher version writes", async () => {
    const v1 = createInitialState("doc-2", hashIntakeText("input"));
    await memory.save("doc-2", v1);

    const v2: ConversationState = {
      ...v1,
      version: 2,
      last_classifier_output: {
        is_legal: true,
        domain: "administrative",
        relevant_acts: ["RTI-2005"],
        severity: "medium",
        confidence: 0.92,
        reasoning: "RTI request for municipal records",
      },
    };
    await memory.save("doc-2", v2);

    const loaded = await memory.load("doc-2");
    expect(loaded!.version).toBe(2);
    expect(loaded!.last_classifier_output).not.toBeNull();
    expect(loaded!.last_classifier_output!.is_legal).toBe(true);
    expect(loaded!.last_classifier_output!.domain).toBe("administrative");
  });

  // ─── optimistic concurrency ───────────────────────────────────────────────

  it("save rejects stale version (same version)", async () => {
    const state = createInitialState("doc-3", hashIntakeText("input"));
    await memory.save("doc-3", state);

    // Try to save the same version again
    const staleWrite: ConversationState = { ...state };
    await expect(memory.save("doc-3", staleWrite)).rejects.toThrow(
      MemoryConflictError
    );
  });

  it("save rejects stale version (lower version)", async () => {
    const v2: ConversationState = {
      ...createInitialState("doc-4", hashIntakeText("input")),
      version: 2,
    };
    await memory.save("doc-4", v2);

    // Try to save version 1 (behind current version 2)
    const v1: ConversationState = {
      ...createInitialState("doc-4", hashIntakeText("input")),
      version: 1,
    };
    await expect(memory.save("doc-4", v1)).rejects.toThrow(
      MemoryConflictError
    );
  });

  it("MemoryConflictError has correct code", async () => {
    const state = createInitialState("doc-5", hashIntakeText("input"));
    await memory.save("doc-5", state);

    try {
      await memory.save("doc-5", state);
      // Should not reach here
      expect.fail("Expected MemoryConflictError");
    } catch (err) {
      expect(err).toBeInstanceOf(MemoryConflictError);
      expect((err as MemoryConflictError).code).toBe("MEMORY_VERSION_CONFLICT");
    }
  });

  // ─── clear ────────────────────────────────────────────────────────────────

  it("clear removes state", async () => {
    const state = createInitialState("doc-6", hashIntakeText("input"));
    await memory.save("doc-6", state);
    expect(await memory.load("doc-6")).not.toBeNull();

    await memory.clear("doc-6");
    expect(await memory.load("doc-6")).toBeNull();
  });

  it("clear on nonexistent document does not throw", async () => {
    await expect(memory.clear("nonexistent")).resolves.toBeUndefined();
  });

  // ─── updated_at stamping ──────────────────────────────────────────────────

  it("save stamps updated_at", async () => {
    const before = new Date().toISOString();
    const state = createInitialState("doc-7", hashIntakeText("input"));
    await memory.save("doc-7", state);

    const loaded = await memory.load("doc-7");
    expect(loaded!.updated_at).toBeDefined();
    // updated_at should be >= before (same second or later)
    expect(loaded!.updated_at >= before).toBe(true);
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

describe("createInitialState", () => {
  it("creates state with correct defaults", () => {
    const state = createInitialState("doc-init", "abc123");
    expect(state.schema_version).toBe(1);
    expect(state.document_id).toBe("doc-init");
    expect(state.version).toBe(1);
    expect(state.last_classifier_output).toBeNull();
    expect(state.last_planner_output).toBeNull();
    expect(state.retrieved_nodes).toEqual([]);
    expect(state.current_draft_version).toBe(0);
    expect(state.intake_text_hash).toBe("abc123");
    expect(state.updated_at).toBeDefined();
  });
});

describe("hashIntakeText", () => {
  it("produces consistent hash for same input", () => {
    const h1 = hashIntakeText("I need an RTI application");
    const h2 = hashIntakeText("I need an RTI application");
    expect(h1).toBe(h2);
  });

  it("produces different hashes for different inputs", () => {
    const h1 = hashIntakeText("I need an RTI application");
    const h2 = hashIntakeText("I need a legal notice");
    expect(h1).not.toBe(h2);
  });

  it("returns 8-char hex string", () => {
    const h = hashIntakeText("any text");
    expect(h).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe("staleness detection via hashIntakeText", () => {
  it("detects intake text change (different hashes → re-run needed)", () => {
    const original = hashIntakeText("I need an RTI application for municipal building records");
    const modified = hashIntakeText("I need a legal notice for non-payment of rent");
    // Different intake → different hash → cache should be invalidated
    expect(original).not.toBe(modified);
  });

  it("no change detected when intake text is identical (same hash → cache reuse)", () => {
    const text = "I need an RTI application for municipal building records";
    const h1 = hashIntakeText(text);
    const h2 = hashIntakeText(text);
    // Identical intake → same hash → classifier + planner can be served from cache
    expect(h1).toBe(h2);
  });

  it("detects minor intake change (even small edits produce a different hash)", () => {
    const original = hashIntakeText("I need an RTI application");
    const withTypo  = hashIntakeText("I need an RTi application"); // capital i → lowercase
    expect(original).not.toBe(withTypo);
  });
});

describe("InMemoryStore", () => {
  it("tracks size correctly", async () => {
    const store = new InMemoryStore();
    expect(store.size).toBe(0);

    await store.set("a", createInitialState("a", "h"));
    expect(store.size).toBe(1);

    await store.set("b", createInitialState("b", "h"));
    expect(store.size).toBe(2);

    await store.delete("a");
    expect(store.size).toBe(1);
  });
});
