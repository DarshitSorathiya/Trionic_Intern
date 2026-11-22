"use strict";
/**
 * planner/index.ts
 * Owner: Malay Sheta (Planner agent — Team C Lead)
 *
 * The Planner agent decides:
 *   - Which document type to draft
 *   - Which PageIndex queries to run
 *   - Which acts apply
 *   - Which template to use
 *
 * Input:  User's intake text + ClassifierOutput
 * Output: PlannerOutput + AgentTrace (for audit trail)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerAgent = void 0;
exports.runPlanner = runPlanner;
exports.reconcilePlan = reconcilePlan;
const index_js_1 = require("../router/index.js");
const index_js_2 = require("../tracing/index.js");
const planner_prompt_js_1 = require("./planner.prompt.js");
const doc_type_profiles_js_1 = require("./doc-type-profiles.js");
// ─── Agent ────────────────────────────────────────────────────────────────────
/**
 * Run the Planner agent.
 *
 * Calls Claude (via LLM Router) with the classified intake and returns
 * a structured PlannerOutput + an AgentTrace matching packages/shared/AgentTrace.
 *
 * @throws Never — errors are captured in the trace with status "error".
 */
async function runPlanner(input) {
    const { intakeText, classifierOutput, language, documentType, session_id } = input;
    // ── Resolve the document type FIRST ──────────────────────────────────────
    // The Planner is doc-type-driven: it reads the resolved document_type and
    // emits a doc-type-specific plan grounded against DOC_TYPE_PROFILES.
    const docType = (0, doc_type_profiles_js_1.resolveDocType)(documentType, classifierOutput.sub_domain, classifierOutput.relevant_acts);
    try {
        const systemPrompt = (0, planner_prompt_js_1.buildPlannerSystemPrompt)(docType);
        const userPrompt = (0, planner_prompt_js_1.buildPlannerUserPrompt)(intakeText, classifierOutput, language, docType);
        // Route through LLM Router — DeepSeek (see router.config.ts "planner").
        const llmResponse = await index_js_1.router.run("planner", systemPrompt, userPrompt);
        // Parse JSON output from the LLM.
        // Strip markdown code fences if the LLM returned them despite instructions.
        // If the LLM returns invalid JSON, fall back to the doc-type baseline so the
        // chain never aborts on a malformed plan.
        let llmPlan = null;
        try {
            let cleanedText = llmResponse.text.trim();
            if (cleanedText.startsWith("```")) {
                cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
            }
            llmPlan = JSON.parse(cleanedText);
        }
        catch {
            console.warn(`[Planner] LLM returned invalid JSON — falling back to ${docType} baseline. Raw: ${llmResponse.text.slice(0, 120)}`);
            llmPlan = null;
        }
        // Reconcile the LLM output with the doc-type profile. document_type and
        // template_id are AUTHORITATIVE from the profile (the per-doc-type contract
        // every other Agents intern depends on). Queries/acts/notes take the LLM's
        // refinement when present, else the profile baseline.
        const plan = reconcilePlan(docType, llmPlan);
        // Build and persist trace
        const trace = (0, index_js_2.buildTrace)({
            agent: "planner",
            llmResponse,
            cited_nodes: [], // Planner does not emit citations
            status: "ok",
            session_id,
        });
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });
        return { plan, trace };
    }
    catch (error) {
        const trace = (0, index_js_2.buildErrorTrace)("planner", error, session_id);
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });
        // Re-throw with trace attached so the pipeline can surface it
        const err = error instanceof Error ? error : new Error(String(error));
        err.trace = trace;
        throw err;
    }
}
/**
 * Reconcile an LLM-produced plan with the doc-type profile.
 *
 * The per-doc-type contract is authoritative for the structural fields every
 * downstream Agents intern depends on:
 *   - document_type and template_id ALWAYS come from the profile.
 *   - applicable_acts is the union of profile acts + any extra (in-list) acts
 *     the LLM proposed, but never empty.
 *   - pageindex_queries / notes take the LLM's refinement when present and
 *     non-empty, otherwise the profile baseline.
 *
 * @param docType  The resolved document type.
 * @param llmPlan  Parsed LLM output, or null if the LLM returned invalid JSON.
 */
function reconcilePlan(docType, llmPlan) {
    const profile = doc_type_profiles_js_1.DOC_TYPE_PROFILES[docType];
    const baseline = (0, doc_type_profiles_js_1.baselinePlan)(docType);
    if (!llmPlan)
        return baseline;
    const queries = Array.isArray(llmPlan.pageindex_queries) && llmPlan.pageindex_queries.length > 0
        ? llmPlan.pageindex_queries.filter((q) => typeof q === "string" && q.trim().length > 0)
        : baseline.pageindex_queries;
    // Union profile acts with any LLM-proposed acts, de-duplicated, profile-first.
    const llmActs = Array.isArray(llmPlan.applicable_acts)
        ? llmPlan.applicable_acts.filter((a) => typeof a === "string" && a.trim().length > 0)
        : [];
    const applicable_acts = Array.from(new Set([...profile.applicable_acts, ...llmActs]));
    const notes = typeof llmPlan.notes === "string" && llmPlan.notes.trim().length > 0
        ? llmPlan.notes.trim()
        : baseline.notes;
    return {
        // Authoritative — never trust the LLM to set these.
        document_type: profile.document_type,
        template_id: profile.template_id,
        // Refined by the LLM, with profile fallbacks.
        pageindex_queries: queries.length > 0 ? queries : baseline.pageindex_queries,
        applicable_acts,
        notes,
    };
}
/**
 * PlannerAgent class wrapper (for Agno framework integration).
 * Agno expects agents to be classes with a run() method.
 * Week 1: thin wrapper around runPlanner().
 */
class PlannerAgent {
    name = "planner";
    async run(input) {
        return runPlanner(input);
    }
}
exports.PlannerAgent = PlannerAgent;
//# sourceMappingURL=index.js.map