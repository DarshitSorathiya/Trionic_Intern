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
const VALID_DOMAINS = new Set([
    "criminal",
    "civil",
    "consumer",
    "contract",
    "labour",
    "family",
    "constitutional",
    "administrative",
    "other",
]);
const ACT_CODE_ALIASES = {
    "NIA-1881": "NI-1881",
    "NEGOTIABLE-INSTRUMENTS-ACT-1881": "NI-1881",
    "ITA-2000": "IT-2000",
};
const TYPE_CLASSIFICATIONS = {
    rti_application: {
        is_legal: true,
        domain: "administrative",
        sub_domain: "rti",
        relevant_acts: ["RTI-2005"],
        severity: "medium",
        confidence: 1,
        reasoning: "Classification follows the selected RTI application document type.",
    },
    legal_notice: {
        is_legal: true,
        domain: "civil",
        sub_domain: "legal-notice",
        relevant_acts: ["ICA-1872", "CPC-1908"],
        severity: "medium",
        confidence: 1,
        reasoning: "Classification follows the selected legal notice document type.",
    },
    nda: {
        is_legal: true,
        domain: "contract",
        sub_domain: "nda",
        relevant_acts: ["ICA-1872", "IT-2000"],
        severity: "low",
        confidence: 1,
        reasoning: "Classification follows the selected NDA document type.",
    },
    consumer_complaint: {
        is_legal: true,
        domain: "consumer",
        sub_domain: "consumer-complaint",
        relevant_acts: ["CPA-2019"],
        severity: "medium",
        confidence: 1,
        reasoning: "Classification follows the selected consumer complaint document type.",
    },
    cheque_bounce_notice: {
        is_legal: true,
        domain: "criminal",
        sub_domain: "cheque-bounce",
        relevant_acts: ["NI-1881"],
        severity: "high",
        confidence: 1,
        reasoning: "Classification follows the selected cheque bounce notice document type.",
    },
    employment_contract: {
        is_legal: true,
        domain: "labour",
        sub_domain: "employment-contract",
        relevant_acts: ["ICA-1872"],
        severity: "medium",
        confidence: 1,
        reasoning: "Classification follows the selected employment contract document type.",
    },
};
function extractJsonObject(text) {
    const start = text.indexOf("{");
    if (start < 0)
        return null;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index++) {
        const character = text[index];
        if (inString) {
            if (escaped)
                escaped = false;
            else if (character === "\\")
                escaped = true;
            else if (character === '"')
                inString = false;
            continue;
        }
        if (character === '"')
            inString = true;
        else if (character === "{")
            depth++;
        else if (character === "}" && --depth === 0)
            return text.slice(start, index + 1);
    }
    return null;
}
function normalizeClassification(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Classifier response must be a JSON object");
    }
    const raw = value;
    const domain = typeof raw.domain === "string" && VALID_DOMAINS.has(raw.domain)
        ? raw.domain
        : "other";
    const severity = raw.severity === "low" || raw.severity === "medium" || raw.severity === "high"
        ? raw.severity
        : "medium";
    const relevantActs = Array.isArray(raw.relevant_acts)
        ? raw.relevant_acts
            .filter((act) => typeof act === "string")
            .map((act) => ACT_CODE_ALIASES[act.toUpperCase()] ?? act)
        : [];
    const confidence = typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
        ? Math.max(0, Math.min(1, raw.confidence))
        : 0.5;
    return {
        is_legal: typeof raw.is_legal === "boolean" ? raw.is_legal : true,
        domain,
        sub_domain: typeof raw.sub_domain === "string" ? raw.sub_domain : undefined,
        relevant_acts: relevantActs,
        severity,
        confidence,
        reasoning: typeof raw.reasoning === "string" ? raw.reasoning : "Classification returned without reasoning.",
    };
}
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
    const { intakeText, language, documentType, session_id } = input;
    try {
        const userPrompt = (0, classifier_prompt_js_1.buildClassifierUserPrompt)(intakeText, language);
        // Route through the LLM Router (configured step is "classifier")
        const llmResponse = await index_js_1.router.run("classifier", classifier_prompt_js_1.CLASSIFIER_SYSTEM_PROMPT, userPrompt);
        // Parse JSON output from LLM
        let classification;
        try {
            const jsonText = extractJsonObject(llmResponse.text);
            if (!jsonText)
                throw new Error("No complete JSON object found");
            classification = normalizeClassification(JSON.parse(jsonText));
        }
        catch (parseError) {
            const selectedType = documentType && documentType in TYPE_CLASSIFICATIONS
                ? TYPE_CLASSIFICATIONS[documentType]
                : undefined;
            if (!selectedType) {
                throw new Error(`Classifier LLM returned invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
            }
            console.warn(`[Classifier] Invalid model response; using selected document type "${documentType}".`);
            classification = { ...selectedType };
        }
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