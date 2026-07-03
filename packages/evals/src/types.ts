import type { AgentTrace, EvalMetric, EvalRunResult } from "@trionic/shared";

// Re-export shared types for convenience
export type { AgentTrace, EvalMetric, EvalRunResult };

// Evals-specific types
export type CiteMarker = {
  node_id: string;
  span: [number, number];
};

export type Fixture = {
  fixture_id: string;
  doc_type: string;
  language: string;
  agent_traces: AgentTrace[];
  draft_output: {
    text: string;
    cite_markers: CiteMarker[];
  };
  ground_truth: {
    valid_node_ids: string[];
    required_sections: string[];
  };
};
