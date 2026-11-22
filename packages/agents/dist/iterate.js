"use strict";
/**
 * iterate.ts
 * Owner: Yatri Dungarani (Week 4 — Draft Iteration)
 * Module: packages/agents/src/iterate
 *
 * The iteration chain orchestrator. Called by Team B's
 * `POST /api/draft/{document_id}/iterate` handler.
 *
 * Responsibilities:
 *   1. Load conversation memory — MUST already exist from a prior full chain run
 *   2. Skip Classifier, Planner, and PageIndex retrieval (served from cache)
 *   3. Run reviseDraft() with the user's instruction as revisionHint
 *   4. Run Citator → Reviewer → [Translator] on the revised draft
 *   5. Write memory after each step
 *   6. Emit AgentStreamEvents (same shape as full chain for frontend compat)
 *
 * Speed benefit: ~3-5× faster than full chain since 3 agents skip (Classifier,
 * Planner, PageIndex) and only Drafter + Citator + Reviewer + maybe Translator run.
 *
 * Inter-team contract (from API_CONTRACTS.md):
 *   Frontend ──POST /api/draft/{id}/iterate──▶ Backend ──runIterationChain()──▶ Agents
 *   The backend forwards AgentStreamEvent emissions straight to the SSE stream.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runIterationChain = runIterationChain;
const index_js_1 = require("./drafter/index.js");
const index_js_2 = require("./citator/index.js");
const index_js_3 = require("./reviewer/index.js");
const index_js_4 = require("./translator/index.js");
const index_js_5 = require("./tracing/index.js");
const memory_js_1 = require("./memory.js");
// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Emit a step.start event. */
function stepStart(agent) {
    return { type: "step.start", agent, ts: new Date().toISOString() };
}
/** Emit a step.done event. */
function stepDone(agent, durationMs, tokens) {
    return {
        type: "step.done",
        agent,
        ts: new Date().toISOString(),
        duration_ms: durationMs,
        tokens,
    };
}
/** Emit a step.error event. */
function stepError(agent, message) {
    return { type: "step.error", agent, ts: new Date().toISOString(), message };
}
/** Emit a cached step (start + done with 0 duration and 0 tokens). */
function* emitCachedStep(agent) {
    yield stepStart(agent);
    yield stepDone(agent, 0, 0);
}
/**
 * Persist a "cache hit" trace so Team F's evals can distinguish cached vs. fresh runs.
 */
async function persistCacheTrace(agent, sessionId, documentId) {
    const trace = {
        agent,
        model: "cache",
        tokens_in: 0,
        tokens_out: 0,
        cost_usd: 0,
        latency_ms: 0,
        cited_nodes: [],
        status: "ok",
        timestamp: new Date().toISOString(),
        session_id: sessionId,
    };
    await (0, index_js_5.persistTrace)(trace, {
        user_id: sessionId || "00000000-0000-0000-0000-000000000000",
        document_id: documentId,
    });
}
// ─── Save with retry ─────────────────────────────────────────────────────────
/**
 * Persist state, retrying once on a MemoryConflictError.
 */
async function saveWithRetry(memory, documentId, state, merge) {
    try {
        return await memory.save(documentId, state);
    }
    catch (err) {
        if (!(err instanceof memory_js_1.MemoryConflictError))
            throw err;
        const fresh = await memory.load(documentId);
        if (!fresh)
            throw err;
        const merged = merge(fresh);
        return await memory.save(documentId, merged);
    }
}
// ─── The iteration orchestrator ───────────────────────────────────────────────
/**
 * Run the iteration chain for a document that already has a completed draft.
 *
 * This is an async generator that yields `AgentStreamEvent` frames,
 * identical in shape to `runAgentChain` for frontend SSE compatibility.
 *
 * Memory integration:
 *   - On entry, loads existing ConversationState for the document.
 *   - Validates that `last_draft_content` and `last_planner_output` exist
 *     (i.e., a prior full chain run has completed).
 *   - Skips Classifier, Planner, PageIndex (emits synthetic cached events).
 *   - Runs Drafter (reviseDraft) → Citator → Reviewer → [Translator].
 *   - Saves updated state with new draft content and citations.
 *
 * @param input  - Iteration input from the API layer.
 * @param options - Optional: custom memory store, skip translation flag.
 * @yields AgentStreamEvent frames for the SSE stream.
 */
async function* runIterationChain(input, options = {}) {
    const { document_id, instruction, target_language, session_id } = input;
    const memory = new memory_js_1.Memory(options.memoryStore);
    // ── 1. Load existing memory ─────────────────────────────────────────────
    const state = await memory.load(document_id);
    if (!state) {
        yield stepError("system", `No conversation state found for document ${document_id}. ` +
            `Run the full draft chain first before iterating.`);
        return;
    }
    if (!state.last_draft_content) {
        yield stepError("system", `No prior draft found for document ${document_id}. ` +
            `The full draft chain must complete successfully before iterating.`);
        return;
    }
    if (!state.last_planner_output) {
        yield stepError("system", `No planner output found for document ${document_id}. ` +
            `The full draft chain must complete successfully before iterating.`);
        return;
    }
    // Working copy of state that we mutate and save after each step
    let currentState = state;
    // ── 2. Emit cached steps for Classifier, Planner, PageIndex ─────────────
    // These are skipped entirely — we reuse the cached state from the prior run.
    yield* emitCachedStep("classifier");
    await persistCacheTrace("classifier", session_id, document_id);
    yield* emitCachedStep("planner");
    await persistCacheTrace("planner", session_id, document_id);
    yield* emitCachedStep("pageindex");
    // ── 3. Drafter (reviseDraft — uses instruction as revisionHint) ─────────
    yield stepStart("drafter");
    const drafterStartTime = Date.now();
    try {
        // Reconstruct a DocumentDraft from the persisted state
        const previousDraft = {
            id: document_id,
            document_type: currentState.last_planner_output.document_type,
            language: "en", // Drafter always produces English
            content: currentState.last_draft_content,
            citations: currentState.last_citations ?? [],
            traces: [],
            created_at: new Date().toISOString(),
        };
        // Use the existing reviseDraft() — it sends the instruction as revisionHint
        const drafterResult = await (0, index_js_1.reviseDraft)(previousDraft, instruction, session_id);
        const drafterDuration = Date.now() - drafterStartTime;
        yield stepDone("drafter", drafterDuration, drafterResult.trace.tokens_in + drafterResult.trace.tokens_out);
        // Emit citation events for each cited node in the revised draft
        for (const citation of drafterResult.draft.citations) {
            yield {
                type: "citation.emitted",
                node_id: citation.node_id,
                ts: new Date().toISOString(),
            };
        }
        // Stream partial draft content
        yield {
            type: "draft.partial",
            markdown_chunk: drafterResult.draft.content,
            ts: new Date().toISOString(),
        };
        // Update memory with draft version
        const nextDraftVersion = currentState.current_draft_version + 1;
        currentState = {
            ...currentState,
            version: currentState.version + 1,
            current_draft_version: nextDraftVersion,
            last_draft_content: drafterResult.draft.content,
            last_citations: drafterResult.draft.citations,
        };
        currentState = await saveWithRetry(memory, document_id, currentState, (fresh) => ({
            ...fresh,
            version: fresh.version + 1,
            current_draft_version: nextDraftVersion,
            last_draft_content: drafterResult.draft.content,
            last_citations: drafterResult.draft.citations,
        }));
        // ── 4. Citator (always re-run on revised draft) ─────────────────────
        yield stepStart("citator");
        const citatorStartTime = Date.now();
        try {
            const citatorResult = await (0, index_js_2.runCitator)({
                draft: drafterResult.draft,
                session_id,
            });
            const citatorDuration = Date.now() - citatorStartTime;
            yield stepDone("citator", citatorDuration, citatorResult.trace.tokens_in + citatorResult.trace.tokens_out);
            if (!citatorResult.passed) {
                yield stepError("citator", citatorResult.rejection_reason ?? "Citations rejected");
                return; // Abort — document status becomes "failed"
            }
            // ── 5. Reviewer (always re-run on revised draft) ───────────────────
            yield stepStart("reviewer");
            const reviewerStartTime = Date.now();
            try {
                const reviewerResult = await (0, index_js_3.runReviewer)({
                    draft: {
                        ...drafterResult.draft,
                        citations: citatorResult.validatedCitations,
                    },
                    session_id,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                });
                const reviewerDuration = Date.now() - reviewerStartTime;
                yield stepDone("reviewer", reviewerDuration, reviewerResult.trace.tokens_in + reviewerResult.trace.tokens_out);
                if (!reviewerResult.approved) {
                    yield stepError("reviewer", reviewerResult.trace.error_message ?? "Draft rejected by reviewer");
                    return; // Abort
                }
                // ── 6. Translator (if target_language ≠ "en") ────────────────────
                let finalMarkdown = drafterResult.draft.content;
                if (target_language !== "en" && !options.skipTranslation) {
                    yield stepStart("translator");
                    const translatorStartTime = Date.now();
                    try {
                        const translatorResult = await (0, index_js_4.runTranslator)({
                            body_markdown: drafterResult.draft.content,
                            citations: citatorResult.validatedCitations,
                            target_language: target_language,
                            session_id,
                        });
                        const translatorDuration = Date.now() - translatorStartTime;
                        yield stepDone("translator", translatorDuration, translatorResult.trace.tokens_in + translatorResult.trace.tokens_out);
                        finalMarkdown = translatorResult.output.translated_markdown;
                    }
                    catch (error) {
                        const message = error instanceof Error ? error.message : String(error);
                        yield stepError("translator", message);
                        return;
                    }
                }
                // ── 7. Final state save + draft.final emission ───────────────────
                currentState = {
                    ...currentState,
                    version: currentState.version + 1,
                    last_draft_content: finalMarkdown,
                    last_citations: citatorResult.validatedCitations,
                };
                currentState = await saveWithRetry(memory, document_id, currentState, (fresh) => ({
                    ...fresh,
                    version: fresh.version + 1,
                    last_draft_content: finalMarkdown,
                    last_citations: citatorResult.validatedCitations,
                }));
                const finalResponse = {
                    document_id,
                    version_id: `v${currentState.current_draft_version}`,
                    body_markdown: finalMarkdown,
                    citations: citatorResult.validatedCitations,
                    trace_ids: [], // Populated by Team B from agent_traces table
                    warnings: [],
                };
                yield {
                    type: "draft.final",
                    response: finalResponse,
                    ts: new Date().toISOString(),
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                yield stepError("reviewer", message);
                return;
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            yield stepError("citator", message);
            return;
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        yield stepError("drafter", message);
        return;
    }
}
//# sourceMappingURL=iterate.js.map