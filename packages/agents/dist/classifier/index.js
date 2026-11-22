"use strict";
/**
 * classifier/index.ts
 * Owner: Yug Gandhi (Classifier agent)
 * Module: packages/agents/src/classifier
 *
 * The Classifier agent triage and domain categorizations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassifierAgent = void 0;
exports.runClassifier = runClassifier;
const index_js_1 = require("../router/index.js");
const index_js_2 = require("../tracing/index.js");
const classifier_prompt_js_1 = require("./classifier.prompt.js");
// ─── Agent ────────────────────────────────────────────────────────────────────
/**
 * Run the Classifier agent.
 *
 * Formulates the intake prompt, routes it to the LLM via the Router,
 * parses the resulting ClassifierOutput, and saves the trace logs.
 *
 * @throws Error if execution or parsing fails.
 */
async function runClassifier(input) {
    const { intakeText, language, session_id } = input;
    try {
        const userPrompt = (0, classifier_prompt_js_1.buildClassifierUserPrompt)(intakeText, language);
        // Route through the LLM Router (configured step is "classifier")
        const llmResponse = await index_js_1.router.run("classifier", classifier_prompt_js_1.CLASSIFIER_SYSTEM_PROMPT, userPrompt);
        // Parse JSON output from LLM
        let classification;
        try {
            // Remove possible markdown wrappers if LLM returned them despite instruction
            let cleanedText = llmResponse.text.trim();
            if (cleanedText.startsWith("```")) {
                cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
            }
            classification = JSON.parse(cleanedText);
        }
        catch {
            throw new Error(`Classifier LLM returned invalid JSON: ${llmResponse.text.slice(0, 200)}`);
        }
        // Standardize optional / required fields to avoid crashes
        classification.is_legal = !!classification.is_legal;
        classification.relevant_acts = classification.relevant_acts || [];
        classification.confidence = typeof classification.confidence === "number" ? classification.confidence : 1.0;
        classification.reasoning = classification.reasoning || "";
        // Build and persist trace
        const trace = (0, index_js_2.buildTrace)({
            agent: "classifier",
            llmResponse,
            cited_nodes: [], // Classifier does not emit citations
            status: "ok",
            session_id,
        });
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });
        return { classification, trace };
    }
    catch (error) {
        const trace = (0, index_js_2.buildErrorTrace)("classifier", error, session_id);
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });
        // Re-throw with trace attached so the pipeline can process it cleanly
        const err = error instanceof Error ? error : new Error(String(error));
        err.trace = trace;
        throw err;
    }
}
class ClassifierAgent {
    name = "classifier";
    async run(input) {
        return runClassifier(input);
    }
}
exports.ClassifierAgent = ClassifierAgent;
//# sourceMappingURL=index.js.map