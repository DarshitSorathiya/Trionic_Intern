/**
 * classifier/index.ts
 * Owner: Yug Gandhi (Classifier agent)
 * Module: packages/agents/src/classifier
 *
 * The Classifier agent triage and domain categorizations.
 */
import type { AgentTrace, ClassifierOutput, SupportedLanguage } from "@trionic/shared";
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
export interface ClassifierResult {
    /** Structured classification output. */
    classification: ClassifierOutput;
    /** Audit trace for this agent call. */
    trace: AgentTrace;
}
/**
 * Run the Classifier agent.
 *
 * Formulates the intake prompt, routes it to the LLM via the Router,
 * parses the resulting ClassifierOutput, and saves the trace logs.
 *
 * @throws Error if execution or parsing fails.
 */
export declare function runClassifier(input: ClassifierInput): Promise<ClassifierResult>;
export declare class ClassifierAgent {
    readonly name = "classifier";
    run(input: ClassifierInput): Promise<ClassifierResult>;
}
//# sourceMappingURL=index.d.ts.map