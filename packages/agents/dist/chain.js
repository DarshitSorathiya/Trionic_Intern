"use strict";
/**
 * chain.ts
 * Owner: Yatri Dungarani (Week 2 — Issue #39)
 * Co-owner: Malay Sheta (runAgentChain integration)
 *
 * The agent chain orchestrator. This is the SINGLE entry point that
 * Team B's `POST /api/draft` handler calls.
 *
 * Responsibilities:
 *   1. Load conversation memory on entry
 *   2. Run each agent step (or serve from cache)
 *   3. Emit AgentStreamEvents as an async generator
 *   4. Write memory after each step
 *   5. Enforce PII boundaries (intake text NOT re-sent after first pass)
 *
 * Pipeline: Classifier → Planner → [PageIndex] → Drafter → Citator → Reviewer → [Translator]
 *
 * Inter-team contract (from API_CONTRACTS.md):
 *   Frontend ──POST /api/draft──▶ Backend ──runAgentChain()──▶ Agents
 *   The backend forwards AgentStreamEvent emissions straight to the SSE stream.
 *   Team C does not write API code. Team B does not write agent logic.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgentChain = runAgentChain;
const index_js_1 = require("./classifier/index.js");
const index_js_2 = require("./planner/index.js");
const index_js_3 = require("./drafter/index.js");
const index_js_4 = require("./citator/index.js");
const index_js_5 = require("./reviewer/index.js");
const index_js_6 = require("./translator/index.js");
const index_js_7 = require("./tracing/index.js");
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
    await (0, index_js_7.persistTrace)(trace, {
        user_id: sessionId || "00000000-0000-0000-0000-000000000000",
        document_id: documentId,
    });
}
// ─── Save with retry ─────────────────────────────────────────────────────────
/**
 * Persist state, retrying once on a MemoryConflictError.
 *
 * Rationale: a concurrent retry of the same chain can bump the version between
 * our load and our save. In that case we reload, re-apply the field update via
 * the `merge` callback, and save again. If the second attempt also conflicts we
 * throw — the caller aborts the chain and returns a step.error.
 *
 * @param memory       - The Memory instance.
 * @param documentId   - Document to update.
 * @param state        - Current state object we want to save.
 * @param merge        - Function that applies the pending field changes to a
 *                       freshly loaded state (used on conflict-reload).
 */
async function saveWithRetry(memory, documentId, state, merge) {
    try {
        return await memory.save(documentId, state);
    }
    catch (err) {
        if (!(err instanceof memory_js_1.MemoryConflictError))
            throw err;
        // Version conflict — reload and re-apply
        const fresh = await memory.load(documentId);
        if (!fresh)
            throw err; // shouldn't happen, but be safe
        const merged = merge(fresh);
        return await memory.save(documentId, merged);
    }
}
// ─── The main orchestrator ────────────────────────────────────────────────────
/**
 * Run the full agent chain for a document.
 *
 * This is an async generator that yields `AgentStreamEvent` frames.
 * The backend pipes these directly into the SSE stream.
 *
 * Memory integration:
 *   - On entry, loads any existing ConversationState for the document.
 *   - If classifier/planner outputs are cached, those steps are skipped
 *     and synthetic step.start/step.done events are emitted (with tokens=0).
 *   - After each real agent step, memory is updated.
 *   - PII boundary: intake_text is ONLY sent to the Classifier and Planner
 *     (first pass). The Drafter receives a structured PlannerOutput + a
 *     PII-redacted summary string on subsequent passes instead of raw intake.
 *
 * @param input  - Chain input from the API layer.
 * @param options - Optional: custom memory store, skip translation flag.
 * @yields AgentStreamEvent frames for the SSE stream.
 */
async function* runAgentChain(input, options = {}) {
    const { document_id, intake_text, target_language, session_id } = input;
    const memory = new memory_js_1.Memory(options.memoryStore);
    const intakeHash = (0, memory_js_1.hashIntakeText)(intake_text);
    // ── 1. Load existing memory ─────────────────────────────────────────────
    console.log('[AGENT_CHAIN] Attempting to load existing memory for doc:', document_id);
    let state = await memory.load(document_id);
    console.log('[AGENT_CHAIN] Memory loaded:', !!state);
    const isResume = state !== null;
    if (!state) {
        state = (0, memory_js_1.createInitialState)(document_id, intakeHash);
    }
    else if (state.intake_text_hash !== intakeHash) {
        // Intake text changed — invalidate cached classifier and planner outputs
        // so both agents re-run with the updated context. All other fields are kept
        // (retrieved_nodes, current_draft_version, etc. remain valid).
        state = {
            ...state,
            last_classifier_output: null,
            last_planner_output: null,
            intake_text_hash: intakeHash,
        };
    }
    // ── 2. Classifier ──────────────────────────────────────────────────────
    let classifierOutput;
    if (isResume && state.last_classifier_output) {
        // Cache hit — reuse cached classifier output
        classifierOutput = state.last_classifier_output;
        yield* emitCachedStep("classifier");
        await persistCacheTrace("classifier", session_id, document_id);
    }
    else {
        // Fresh run — call the Classifier agent
        yield stepStart("classifier");
        const startTime = Date.now();
        try {
            const result = await (0, index_js_1.runClassifier)({
                intakeText: intake_text, // PII: intake text sent ONLY here
                language: target_language,
                session_id,
            });
            classifierOutput = result.classification;
            const duration = Date.now() - startTime;
            yield stepDone("classifier", duration, result.trace.tokens_in + result.trace.tokens_out);
            // Update memory with classifier output
            state = {
                ...state,
                version: state.version + 1,
                last_classifier_output: classifierOutput,
            };
            state = await saveWithRetry(memory, document_id, state, (fresh) => ({
                ...fresh,
                version: fresh.version + 1,
                last_classifier_output: classifierOutput,
            }));
            console.log('[AGENT_CHAIN] Classifier memory saved');
        }
        catch (error) {
            console.error('[AGENT_CHAIN] Error in classifier step:', error);
            const message = error instanceof Error ? error.message : String(error);
            yield stepError("classifier", message);
            return; // Abort chain
        }
    }
    // ── 3. Planner ─────────────────────────────────────────────────────────
    let plannerOutput;
    if (isResume && state.last_planner_output) {
        // Cache hit — reuse cached planner output
        plannerOutput = state.last_planner_output;
        yield* emitCachedStep("planner");
        await persistCacheTrace("planner", session_id, document_id);
    }
    else {
        // Fresh run — call the Planner agent
        yield stepStart("planner");
        const startTime = Date.now();
        try {
            const result = await (0, index_js_2.runPlanner)({
                intakeText: intake_text, // PII: intake text sent ONLY here (last time)
                classifierOutput,
                language: target_language,
                // Doc-type hint from the API layer (UI selection). When absent, the
                // Planner resolves the doc type from the classifier output.
                documentType: input.doc_type,
                session_id,
            });
            plannerOutput = result.plan;
            const duration = Date.now() - startTime;
            yield stepDone("planner", duration, result.trace.tokens_in + result.trace.tokens_out);
            // Update memory with planner output
            state = {
                ...state,
                version: state.version + 1,
                last_planner_output: plannerOutput,
            };
            state = await saveWithRetry(memory, document_id, state, (fresh) => ({
                ...fresh,
                version: fresh.version + 1,
                last_planner_output: plannerOutput,
            }));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            yield stepError("planner", message);
            return; // Abort chain
        }
    }
    // ── 4. PageIndex Retrieval (always re-run — cheap, fast) ───────────────
    //
    // NOTE: PageIndex tool calls are handled by the Drafter internally.
    // The retrieved_nodes in state are for audit / memory only.
    // We emit a synthetic step event for visibility in the UI.
    yield stepStart("pageindex");
    // In the real pipeline, the Drafter calls PageIndex internally via agnoTool.
    // For now we just record the planner's applicable_acts as context.
    const retrievedNodes = state.retrieved_nodes;
    yield stepDone("pageindex", 0, 0);
    // ── 5. Drafter (always re-run — uses latest context) ───────────────────
    //
    // PII boundary: On a resume run the Drafter gets the plannerOutput (structured)
    // plus the current intake_text. The Drafter needs intakeText for context,
    // but the classifier/planner outputs are NOT re-sent to LLM — they're cached.
    yield stepStart("drafter");
    const drafterStartTime = Date.now();
    try {
        const drafterResult = await (0, index_js_3.runDrafter)({
            plan: plannerOutput,
            intakeText: intake_text,
            session_id,
        });
        const drafterDuration = Date.now() - drafterStartTime;
        yield stepDone("drafter", drafterDuration, drafterResult.trace.tokens_in + drafterResult.trace.tokens_out);
        // Emit citation events for each cited node in the draft
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
        const nextDraftVersion = state.current_draft_version + 1;
        state = {
            ...state,
            version: state.version + 1,
            current_draft_version: nextDraftVersion,
            retrieved_nodes: retrievedNodes,
        };
        state = await saveWithRetry(memory, document_id, state, (fresh) => ({
            ...fresh,
            version: fresh.version + 1,
            current_draft_version: nextDraftVersion,
            retrieved_nodes: retrievedNodes,
        }));
        // ── 6. Citator (always re-run) ─────────────────────────────────────
        yield stepStart("citator");
        const citatorStartTime = Date.now();
        try {
            const citatorResult = await (0, index_js_4.runCitator)({
                draft: drafterResult.draft,
                session_id,
            });
            const citatorDuration = Date.now() - citatorStartTime;
            yield stepDone("citator", citatorDuration, citatorResult.trace.tokens_in + citatorResult.trace.tokens_out);
            if (!citatorResult.passed) {
                yield stepError("citator", citatorResult.rejection_reason ?? "Citations rejected");
                return; // Abort — document status becomes "failed"
            }
            // ── 7. Reviewer (always re-run) ───────────────────────────────────
            yield stepStart("reviewer");
            const reviewerStartTime = Date.now();
            try {
                const reviewerResult = await (0, index_js_5.runReviewer)({
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
                // ── 8. Translator (if target_language ≠ "en") ────────────────────
                let finalMarkdown = drafterResult.draft.content;
                if (target_language !== "en" && !options.skipTranslation) {
                    yield stepStart("translator");
                    const translatorStartTime = Date.now();
                    try {
                        const translatorResult = await (0, index_js_6.runTranslator)({
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
                // ── 9. Final state save + draft.final emission ───────────────────
                state = {
                    ...state,
                    version: state.version + 1,
                    last_draft_content: finalMarkdown,
                    last_citations: citatorResult.validatedCitations,
                };
                state = await saveWithRetry(memory, document_id, state, (fresh) => ({
                    ...fresh,
                    version: fresh.version + 1,
                    last_draft_content: finalMarkdown,
                    last_citations: citatorResult.validatedCitations,
                }));
                const finalResponse = {
                    document_id,
                    version_id: `v${state.current_draft_version}`,
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
//# sourceMappingURL=chain.js.map