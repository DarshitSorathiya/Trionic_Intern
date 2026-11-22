"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitAgentStreamEvent = emitAgentStreamEvent;
/**
 * Emit an AgentStream event for a validated citation.
 *
 * This is currently a stubbed implementation; the real event bus should be
 * wired in Week 2 once the streaming contract is available.
 */
function emitAgentStreamEvent(event) {
    console.info(`[AgentStreamEvent] ${event.type} node_id=${event.node_id} span=${event.span[0]},${event.span[1]}`);
}
//# sourceMappingURL=events.js.map