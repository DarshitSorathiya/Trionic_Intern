/**
 * classifier/index.ts
 * Owner: Yug Gandhi (Classifier agent)
 * Module: packages/agents/src/classifier
 *
 * The Classifier agent triage and domain categorizations.
 */

import type { AgentTrace, ClassifierOutput, DocumentType, SupportedLanguage } from "@trionic/shared";
import { router } from "../router/index.js";
import { buildTrace, buildErrorTrace, persistTrace } from "../tracing/index.js";
import { CLASSIFIER_SYSTEM_PROMPT, buildClassifierUserPrompt } from "./classifier.prompt.js";

// ─── Input / Output shapes ────────────────────────────────────────────────────

export interface ClassifierInput {
  /** Raw intake text from the user. */
  intakeText: string;
  /** Language the user wants the output document in. */
  language: SupportedLanguage;
  /** Explicit document type selected by the user, when available. */
  documentType?: string;
  /** Optional session ID for trace attribution. */
  session_id?: string;
}

const VALID_DOMAINS = new Set<ClassifierOutput["domain"]>([
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

const ACT_CODE_ALIASES: Record<string, string> = {
  "NIA-1881": "NI-1881",
  "NEGOTIABLE-INSTRUMENTS-ACT-1881": "NI-1881",
  "ITA-2000": "IT-2000",
};

const TYPE_CLASSIFICATIONS: Record<DocumentType, ClassifierOutput> = {
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

function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index++) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') inString = true;
    else if (character === "{") depth++;
    else if (character === "}" && --depth === 0) return text.slice(start, index + 1);
  }

  return null;
}

function normalizeClassification(value: unknown): ClassifierOutput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Classifier response must be a JSON object");
  }

  const raw = value as Record<string, unknown>;
  const domain = typeof raw.domain === "string" && VALID_DOMAINS.has(raw.domain as ClassifierOutput["domain"])
    ? raw.domain as ClassifierOutput["domain"]
    : "other";
  const severity = raw.severity === "low" || raw.severity === "medium" || raw.severity === "high"
    ? raw.severity
    : "medium";
  const relevantActs = Array.isArray(raw.relevant_acts)
    ? raw.relevant_acts
        .filter((act): act is string => typeof act === "string")
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

export interface ClassifierResult {
  /** Structured classification output. */
  classification: ClassifierOutput;
  /** Audit trace for this agent call. */
  trace: AgentTrace;
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
export async function runClassifier(input: ClassifierInput): Promise<ClassifierResult> {
  const { intakeText, language, documentType, session_id } = input;

  try {
    const userPrompt = buildClassifierUserPrompt(intakeText, language);

    // Route through the LLM Router (configured step is "classifier")
    const llmResponse = await router.run("classifier", CLASSIFIER_SYSTEM_PROMPT, userPrompt);

    // Parse JSON output from LLM
    let classification: ClassifierOutput;
    try {
      const jsonText = extractJsonObject(llmResponse.text);
      if (!jsonText) throw new Error("No complete JSON object found");
      classification = normalizeClassification(JSON.parse(jsonText));
    } catch (parseError) {
      const selectedType = documentType && documentType in TYPE_CLASSIFICATIONS
        ? TYPE_CLASSIFICATIONS[documentType as DocumentType]
        : undefined;
      if (!selectedType) {
        throw new Error(
          `Classifier LLM returned invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        );
      }
      console.warn(`[Classifier] Invalid model response; using selected document type "${documentType}".`);
      classification = { ...selectedType };
    }

    // Build and persist trace
    const trace = buildTrace({
      agent: "classifier",
      llmResponse,
      cited_nodes: [], // Classifier does not emit citations
      status: "ok",
      session_id,
    });
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });

    return { classification, trace };
  } catch (error) {
    const trace = buildErrorTrace("classifier", error, session_id);
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });

    // Re-throw with trace attached so the pipeline can process it cleanly
    const err = error instanceof Error ? error : new Error(String(error));
    (err as any).trace = trace;
    throw err;
  }
}

export class ClassifierAgent {
  readonly name = "classifier";

  async run(input: ClassifierInput): Promise<ClassifierResult> {
    return runClassifier(input);
  }
}
