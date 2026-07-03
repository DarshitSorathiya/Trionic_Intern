/**
 * classifier/index.ts
 * Owner: Yug Gandhi (Classifier agent)
 * Module: packages/agents/src/classifier
 *
 * The Classifier agent triage and domain categorizations.
 */

import type { AgentTrace, ClassifierOutput, SupportedLanguage } from "@trionic/shared";
import { router } from "../router/index.js";
import { buildTrace, buildErrorTrace, persistTrace } from "../tracing/index.js";
import { CLASSIFIER_SYSTEM_PROMPT, buildClassifierUserPrompt } from "./classifier.prompt.js";

// ─── Input / Output shapes ────────────────────────────────────────────────────

export interface ClassifierInput {
  /** Raw intake text from the user. */
  intakeText: string;
  /** Language the user wants the output document in. */
  language: SupportedLanguage;
  /** Optional session ID for trace attribution. */
  session_id?: string;
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
  const { intakeText, language, session_id } = input;

  try {
    const userPrompt = buildClassifierUserPrompt(intakeText, language);

    // Route through the LLM Router (configured step is "classifier")
    const llmResponse = await router.run("classifier", CLASSIFIER_SYSTEM_PROMPT, userPrompt);

    // Parse JSON output from LLM
    let classification: ClassifierOutput;
    try {
      // Remove possible markdown wrappers if LLM returned them despite instruction
      let cleanedText = llmResponse.text.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      classification = JSON.parse(cleanedText) as ClassifierOutput;
    } catch {
      throw new Error(
        `Classifier LLM returned invalid JSON: ${llmResponse.text.slice(0, 200)}`
      );
    }

    // Standardize optional / required fields to avoid crashes
    classification.is_legal = !!classification.is_legal;
    classification.relevant_acts = classification.relevant_acts || [];
    classification.confidence = typeof classification.confidence === "number" ? classification.confidence : 1.0;
    classification.reasoning = classification.reasoning || "";

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
