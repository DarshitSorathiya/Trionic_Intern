import type { PageIndexNodeId } from "@trionic/shared";
export type CitationEmittedEvent = {
    type: "citation.emitted";
    node_id: PageIndexNodeId;
    span: [number, number];
    timestamp: string;
};
/**
 * Emit an AgentStream event for a validated citation.
 *
 * This is currently a stubbed implementation; the real event bus should be
 * wired in Week 2 once the streaming contract is available.
 */
export declare function emitAgentStreamEvent(event: CitationEmittedEvent): void;
//# sourceMappingURL=events.d.ts.map