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

import type { ConversationState } from "@trionic/shared";

// ─── Errors ───────────────────────────────────────────────────────────────────

/**
 * Thrown when a save() call detects a version conflict (optimistic concurrency).
 * The caller should re-load and retry.
 */
export class MemoryConflictError extends Error {
  readonly code = "MEMORY_VERSION_CONFLICT" as const;

  constructor(documentId: string, expected: number, actual: number) {
    super(
      `Memory version conflict for document ${documentId}: ` +
        `expected version ${expected}, found ${actual}. Re-load and retry.`,
    );
    this.name = "MemoryConflictError";
  }
}

// ─── Store interface ──────────────────────────────────────────────────────────

/**
 * Pluggable storage backend for conversation state.
 * Week 2 ships with InMemoryStore; Supabase store comes when migration #103 lands.
 */
export interface MemoryStore {
  get(documentId: string): Promise<ConversationState | null>;
  set(documentId: string, state: ConversationState): Promise<void>;
  delete(documentId: string): Promise<void>;
}

/**
 * Public Memory API shape for Team B integration.
 * This is PR-able before the DB column exists; concrete Supabase persistence
 * is intentionally deferred until migration #103 lands.
 */
export interface MemoryApi {
  load(documentId: string): Promise<ConversationState | null>;
  save(
    documentId: string,
    state: ConversationState,
  ): Promise<ConversationState>;
  clear(documentId: string): Promise<void>;
}

// ─── InMemoryStore (dev / demo fallback) ──────────────────────────────────────

/**
 * Simple in-process store backed by a Map.
 * Good enough for dev/demo; NOT suitable for production (no persistence across restarts).
 */
export class InMemoryStore implements MemoryStore {
  private readonly _store = new Map<string, ConversationState>();

  async get(documentId: string): Promise<ConversationState | null> {
    return this._store.get(documentId) ?? null;
  }

  async set(documentId: string, state: ConversationState): Promise<void> {
    this._store.set(documentId, state);
  }

  async delete(documentId: string): Promise<void> {
    this._store.delete(documentId);
  }

  /** Expose size for testing. */
  get size(): number {
    return this._store.size;
  }
}

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
export class SupabaseStore implements MemoryStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly supabase: any) {}

  async get(documentId: string): Promise<ConversationState | null> {
    const { data, error } = await this.supabase
      .from("documents")
      .select("conversation_state")
      .eq("id", documentId)
      .single();
    if (error || !data?.conversation_state) return null;
    return data.conversation_state as ConversationState;
  }

  async set(documentId: string, state: ConversationState): Promise<void> {
    const { error } = await this.supabase
      .from("documents")
      .update({ conversation_state: state })
      .eq("id", documentId);
    if (error) throw new Error(`Memory save failed: ${error.message}`);
  }

  async delete(documentId: string): Promise<void> {
    const { error } = await this.supabase
      .from("documents")
      .update({ conversation_state: null })
      .eq("id", documentId);
    if (error) throw new Error(`Memory clear failed: ${error.message}`);
  }
}

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
export class Memory implements MemoryApi {
  private readonly store: MemoryStore;

  constructor(store?: MemoryStore) {
    this.store = store ?? new InMemoryStore();
  }

  /**
   * Load conversation state for a document.
   *
   * @param documentId - UUID of the document.
   * @returns The persisted ConversationState, or null if none exists.
   */
  async load(documentId: string): Promise<ConversationState | null> {
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
  async save(
    documentId: string,
    state: ConversationState,
  ): Promise<ConversationState> {
    // Optimistic concurrency check
    const existing = await this.store.get(documentId);
    if (existing && existing.version >= state.version) {
      throw new MemoryConflictError(
        documentId,
        state.version,
        existing.version,
      );
    }

    // Stamp updated_at
    const stamped: ConversationState = {
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
  async clear(documentId: string): Promise<void> {
    await this.store.delete(documentId);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create a fresh ConversationState for a new document.
 * All cached outputs are null; version starts at 1.
 */
export function createInitialState(
  documentId: string,
  intakeTextHash: string,
): ConversationState {
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
export function hashIntakeText(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0; // hash * 33 + c
  }
  // Convert to unsigned hex
  return (hash >>> 0).toString(16).padStart(8, "0");
}
