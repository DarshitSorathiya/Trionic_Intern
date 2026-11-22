"use strict";
/**
 * memory.ts
 * Owner: Yatri Dungarani (Week 2 — Issue #39)
 * Module: packages/agents/src/memory
 *
 * Persistence layer for multi-turn conversation state.
 * Provides save / load / clear operations keyed by document_id.
 *
 * Storage strategy:
 *   Primary:  JSONB column `conversation_state` on the `documents` table
 *             (added by @om-patel91's Supabase migration).
 *   Fallback: In-process Map<string, ConversationState> for dev/demo
 *             before the DB column exists.
 *
 * The Memory class is stateless — all state lives in the store.
 * Optimistic concurrency: save() checks the version field and rejects
 * stale writes with a MemoryConflictError.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = exports.SupabaseStore = exports.InMemoryStore = exports.MemoryConflictError = void 0;
exports.createInitialState = createInitialState;
exports.hashIntakeText = hashIntakeText;
// ─── Errors ───────────────────────────────────────────────────────────────────
/**
 * Thrown when a save() call detects a version conflict (optimistic concurrency).
 * The caller should re-load and retry.
 */
class MemoryConflictError extends Error {
    code = "MEMORY_VERSION_CONFLICT";
    constructor(documentId, expected, actual) {
        super(`Memory version conflict for document ${documentId}: ` +
            `expected version ${expected}, found ${actual}. Re-load and retry.`);
        this.name = "MemoryConflictError";
    }
}
exports.MemoryConflictError = MemoryConflictError;
// ─── InMemoryStore (dev / demo fallback) ──────────────────────────────────────
/**
 * Simple in-process store backed by a Map.
 * Good enough for dev/demo; NOT suitable for production (no persistence across restarts).
 */
class InMemoryStore {
    _store = new Map();
    async get(documentId) {
        return this._store.get(documentId) ?? null;
    }
    async set(documentId, state) {
        this._store.set(documentId, state);
    }
    async delete(documentId) {
        this._store.delete(documentId);
    }
    /** Expose size for testing. */
    get size() {
        return this._store.size;
    }
}
exports.InMemoryStore = InMemoryStore;
// ─── SupabaseStore (production — requires migration #103) ─────────────────────
/**
 * Production store backed by the `documents.conversation_state` JSONB column.
 *
 * Prerequisites:
 *   1. @om-patel91's migration must add `conversation_state JSONB` to the
 *      `documents` table before this store can be used in production.
 *   2. Pass a Supabase client initialised with the service_role key (server-side
 *      only). The Memory class must never run in the browser.
 *
 * The `supabase` param is typed `any` to avoid coupling this file to a specific
 * version of @supabase/supabase-js. Callers provide a properly typed client.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class SupabaseStore {
    supabase;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(supabase) {
        this.supabase = supabase;
    }
    async get(documentId) {
        const { data, error } = await this.supabase
            .from("documents")
            .select("conversation_state")
            .eq("id", documentId)
            .single();
        if (error || !data?.conversation_state)
            return null;
        return data.conversation_state;
    }
    async set(documentId, state) {
        const { error } = await this.supabase
            .from("documents")
            .update({ conversation_state: state })
            .eq("id", documentId);
        if (error)
            throw new Error(`Memory save failed: ${error.message}`);
    }
    async delete(documentId) {
        const { error } = await this.supabase
            .from("documents")
            .update({ conversation_state: null })
            .eq("id", documentId);
        if (error)
            throw new Error(`Memory clear failed: ${error.message}`);
    }
}
exports.SupabaseStore = SupabaseStore;
// ─── Memory API ───────────────────────────────────────────────────────────────
/**
 * Multi-turn conversation memory.
 *
 * Usage:
 * ```ts
 * const memory = new Memory();           // uses InMemoryStore
 * const memory = new Memory(supaStore);  // uses SupabaseStore (production)
 *
 * // Load existing state (null on first run)
 * const state = await memory.load("doc-123");
 *
 * // Save state after each agent step
 * const saved = await memory.save("doc-123", updatedState);
 *
 * // Clear on archive / export
 * await memory.clear("doc-123");
 * ```
 */
class Memory {
    store;
    constructor(store) {
        this.store = store ?? new InMemoryStore();
    }
    /**
     * Load conversation state for a document.
     *
     * @param documentId - UUID of the document.
     * @returns The persisted ConversationState, or null if none exists.
     */
    async load(documentId) {
        return this.store.get(documentId);
    }
    /**
     * Persist conversation state for a document.
     *
     * Uses optimistic concurrency: if the stored version is higher than
     * `state.version - 1`, a MemoryConflictError is thrown.
     *
     * @param documentId - UUID of the document.
     * @param state - The ConversationState to persist.
     * @throws MemoryConflictError if a concurrent write bumped the version.
     */
    async save(documentId, state) {
        // Optimistic concurrency check
        const existing = await this.store.get(documentId);
        if (existing && existing.version >= state.version) {
            throw new MemoryConflictError(documentId, state.version, existing.version);
        }
        // Stamp updated_at
        const stamped = {
            ...state,
            updated_at: new Date().toISOString(),
        };
        await this.store.set(documentId, stamped);
        return stamped;
    }
    /**
     * Remove conversation state for a document.
     * Called on archive / export / cleanup.
     *
     * @param documentId - UUID of the document.
     */
    async clear(documentId) {
        await this.store.delete(documentId);
    }
}
exports.Memory = Memory;
// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Create a fresh ConversationState for a new document.
 * All cached outputs are null; version starts at 1.
 */
function createInitialState(documentId, intakeTextHash) {
    return {
        schema_version: 1,
        document_id: documentId,
        version: 1,
        last_classifier_output: null,
        last_planner_output: null,
        retrieved_nodes: [],
        current_draft_version: 0,
        last_draft_content: null,
        last_citations: null,
        intake_text_hash: intakeTextHash,
        updated_at: new Date().toISOString(),
    };
}
/**
 * Compute a simple hash of intake text for staleness detection.
 * Uses a basic DJB2-style hash — NOT cryptographic, just for comparison.
 * (We avoid importing Node crypto to keep this file isomorphic.)
 */
function hashIntakeText(text) {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0; // hash * 33 + c
    }
    // Convert to unsigned hex
    return (hash >>> 0).toString(16).padStart(8, "0");
}
//# sourceMappingURL=memory.js.map