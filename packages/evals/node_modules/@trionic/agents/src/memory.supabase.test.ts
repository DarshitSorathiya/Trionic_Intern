/**
 * memory.supabase.test.ts
 * Owner: Yatri Dungarani (Week 3 — Issue #39)
 *
 * Integration tests for SupabaseStore using a mock Supabase client.
 * These tests verify the SQL shape and error-handling of SupabaseStore
 * WITHOUT requiring a live database or the SUPABASE_SERVICE_ROLE_KEY.
 *
 * Approach: build a lightweight fake Supabase client that records every
 * .from().select().eq() etc. call and returns canned responses.
 * This lets us assert the query shape, not just the result.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseStore } from "./memory.js";
import { createInitialState, hashIntakeText } from "./memory.js";
import type { ConversationState } from "@trionic/shared";

// ─── Mock Supabase client builder ─────────────────────────────────────────────

/**
 * Builds a minimal mock Supabase client that intercepts the query chain
 * used by SupabaseStore: .from(table).select(col).eq(col, val).single()
 *                        .from(table).update(patch).eq(col, val)
 *
 * `responses` is a map from method name to the value that call should resolve with.
 */
function buildMockClient(responses: {
  selectData?: ConversationState | null;
  selectError?: { message: string } | null;
  updateError?: { message: string } | null;
}) {
  const { selectData = null, selectError = null, updateError = null } = responses;

  // All builder methods return `this` to support chaining.
  // The terminal methods (single, implicit promise) resolve with the canned value.
  const queryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: selectData !== null ? { conversation_state: selectData } : null,
      error: selectError,
    }),
    // update() is awaited directly (no .single()) — resolve via the builder itself
    then: vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: null, error: updateError })
    ),
  };

  return {
    from: vi.fn().mockReturnValue(queryBuilder),
    _queryBuilder: queryBuilder, // exposed for assertion
  };
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SAMPLE_STATE: ConversationState = createInitialState(
  "doc-supabase-001",
  hashIntakeText("I need an RTI application")
);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SupabaseStore", () => {
  // ── get() ─────────────────────────────────────────────────────────────────

  describe("get()", () => {
    it("returns null when no state row exists", async () => {
      const client = buildMockClient({ selectData: null, selectError: null });
      const store = new SupabaseStore(client);

      const result = await store.get("doc-supabase-001");

      expect(result).toBeNull();
      expect(client.from).toHaveBeenCalledWith("documents");
      expect(client._queryBuilder.select).toHaveBeenCalledWith("conversation_state");
      expect(client._queryBuilder.eq).toHaveBeenCalledWith("id", "doc-supabase-001");
    });

    it("returns null when Supabase returns an error", async () => {
      const client = buildMockClient({
        selectError: { message: "row not found" },
      });
      const store = new SupabaseStore(client);

      const result = await store.get("doc-nonexistent");
      expect(result).toBeNull(); // error → null, not throw
    });

    it("returns ConversationState when row has state column populated", async () => {
      const client = buildMockClient({ selectData: SAMPLE_STATE });
      const store = new SupabaseStore(client);

      const result = await store.get("doc-supabase-001");

      expect(result).not.toBeNull();
      expect(result!.document_id).toBe("doc-supabase-001");
      expect(result!.schema_version).toBe(1);
      expect(result!.last_classifier_output).toBeNull();
      expect(result!.retrieved_nodes).toEqual([]);
    });
  });

  // ── set() ─────────────────────────────────────────────────────────────────

  describe("set()", () => {
    it("calls UPDATE on documents table with the serialised state", async () => {
      const client = buildMockClient({ updateError: null });
      const store = new SupabaseStore(client);

      await store.set("doc-supabase-001", SAMPLE_STATE);

      expect(client.from).toHaveBeenCalledWith("documents");
      expect(client._queryBuilder.update).toHaveBeenCalledWith({ conversation_state: SAMPLE_STATE });
      expect(client._queryBuilder.eq).toHaveBeenCalledWith("id", "doc-supabase-001");
    });

    it("throws when Supabase UPDATE returns an error", async () => {
      const client = buildMockClient({ updateError: { message: "RLS denied" } });
      const store = new SupabaseStore(client);

      await expect(store.set("doc-supabase-001", SAMPLE_STATE)).rejects.toThrow(
        "Memory save failed: RLS denied"
      );
    });
  });

  // ── delete() ──────────────────────────────────────────────────────────────

  describe("delete()", () => {
    it("calls UPDATE with conversation_state: null (soft clear)", async () => {
      const client = buildMockClient({ updateError: null });
      const store = new SupabaseStore(client);

      await store.delete("doc-supabase-001");

      expect(client._queryBuilder.update).toHaveBeenCalledWith({ conversation_state: null });
      expect(client._queryBuilder.eq).toHaveBeenCalledWith("id", "doc-supabase-001");
    });

    it("throws when Supabase UPDATE returns an error on clear", async () => {
      const client = buildMockClient({ updateError: { message: "connection timeout" } });
      const store = new SupabaseStore(client);

      await expect(store.delete("doc-supabase-001")).rejects.toThrow(
        "Memory clear failed: connection timeout"
      );
    });
  });

  // ── round-trip via Memory API ──────────────────────────────────────────────

  describe("round-trip: save state → load it back", () => {
    it("set() then get() returns the exact same state (smoke test)", async () => {
      // Two separate mock calls — set then get — using InMemoryStore as
      // the reference truth since we can't do a real DB round-trip here.
      // The SupabaseStore-specific round-trip is covered by the unit tests above;
      // this test just confirms the Memory wrapper is correctly plumbing through.
      const { Memory, InMemoryStore } = await import("./memory.js");
      const store = new InMemoryStore();
      const memory = new Memory(store);

      // Save
      const saved = await memory.save("doc-supabase-001", SAMPLE_STATE);
      expect(saved.document_id).toBe("doc-supabase-001"); // matches SAMPLE_STATE
      expect(saved.updated_at).toBeDefined();

      // Load back
      const loaded = await memory.load("doc-supabase-001");
      expect(loaded).not.toBeNull();
      expect(loaded!.document_id).toBe("doc-supabase-001");
      expect(loaded!.version).toBe(SAMPLE_STATE.version);
      expect(loaded!.last_classifier_output).toBeNull();
      expect(loaded!.retrieved_nodes).toEqual([]);
      expect(loaded!.current_draft_version).toBe(0);
    });
  });
});
