/**
 * packages/agents/src/agents/drafter.ts
 * Owner: Jenil Sutariya · Agents
 *
 * Week-2 DrafterAgent.
 *
 * Contract per issue ticket:
 *   - Exported from packages/agents/src/agents/drafter.ts
 *   - Accepts: PlannerOutput + retrieved PageIndex nodes ({ node_id, text }[])
 *   - Returns: DrafterOutput (body_markdown with [CITE:node_id] inline + list of pending_citations)
 *   - Real LLM call via the LLM Router
 *   - Imports PlannerOutput, DrafterOutput, PageIndexNodeId from @trionic/shared
 */
import type { DrafterOutput, PlannerOutput } from "@trionic/shared";
export interface PageIndexNodeInput {
    node_id: string;
    text: string;
}
export interface DrafterAgentInput {
    /** Structured plan from the Planner agent. */
    plan: PlannerOutput;
    /** Retrieved PageIndex node list. */
    retrievedNodes: PageIndexNodeInput[];
}
/**
 * Run the Drafter agent.
 *
 * Emits a markdown body with inline [CITE:<node_id>] markers.
 */
export declare function runDrafterAgent(input: DrafterAgentInput): Promise<DrafterOutput>;
export declare class DrafterAgent {
    readonly name: "drafter";
    run(input: DrafterAgentInput): Promise<DrafterOutput>;
}
//# sourceMappingURL=drafter.d.ts.map