/**
 * router.config.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Maps each agent step to its preferred LLM provider + model.
 * Change the values here to reroute any agent to a different model —
 * no code changes required in the agents themselves.
 */
export type ModelProvider = "claude" | "gemini" | "gpt" | "deepseek";
export interface ModelConfig {
    /** Which provider to use. */
    provider: ModelProvider;
    /** Exact model string to pass to the provider SDK. */
    model: string;
    /** Max tokens for the completion. */
    maxTokens: number;
    /** Temperature (0 = deterministic, 1 = creative). Legal drafts want low temp. */
    temperature: number;
}
export interface StepRouteConfig {
    /** The primary model that should handle this step under normal circumstances. */
    preferred: ModelConfig;
    /** The backup model to call if the primary model fails. */
    fallback?: ModelConfig;
}
export declare const ROUTER_CONFIG: Record<string, StepRouteConfig>;
/** Default config used if a step is not found in ROUTER_CONFIG. */
export declare const DEFAULT_ROUTE_CONFIG: StepRouteConfig;
//# sourceMappingURL=router.config.d.ts.map