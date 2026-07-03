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

import type {
  DrafterOutput,
  PageIndexNodeId,
  PlannerOutput,
} from "@trionic/shared";
import { router } from "../router/index.js";
import { DRAFTER_SYSTEM_PROMPT, RTI_DRAFTER_SYSTEM_PROMPT } from "../drafter/drafter.prompt.js";
import { normalizeRtiNodeId } from "../drafter/citations.js";

// ─── Input / Output shapes ────────────────────────────────────────────────────

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

// ─── Agent function ───────────────────────────────────────────────────────────

/**
 * Run the Drafter agent.
 *
 * Emits a markdown body with inline [CITE:<node_id>] markers.
 */
export async function runDrafterAgent(
  input: DrafterAgentInput
): Promise<DrafterOutput> {
  const { plan, retrievedNodes } = input;

  const actsBlock =
    plan.applicable_acts.length > 0
      ? plan.applicable_acts.map((a) => `  - ${a}`).join("\n")
      : "  (none specified)";

  const retrievedNodesBlock =
    retrievedNodes.length > 0
      ? retrievedNodes
          .map((n) => `- [CITE:${n.node_id}]\n  Snippet: "${n.text}"`)
          .join("\n\n")
      : "  (none retrieved)";

  const queriesBlock =
    plan.pageindex_queries.length > 0
      ? plan.pageindex_queries.map((q, i) => `  ${i + 1}. ${q}`).join("\n")
      : "  (none specified)";

  const userPrompt = `## Drafting Request

### Plan (from Planner agent)
- Document type: ${plan.document_type}
- Template: ${plan.template_id}
- Additional notes: ${plan.notes || "None"}

### Applicable Acts (use ONLY these act codes in your [CITE:...] markers)
${actsBlock}

### Retrieved Legal Sections from PageIndex (use these exact citation markers where applicable)
${retrievedNodesBlock}

### PageIndex Retrieval Hints (relevant sections to cite)
${queriesBlock}

## Your Task

Draft a complete ${plan.document_type.replace(/_/g, " ")} document in Markdown.

MANDATORY:
1. First paragraph MUST be the "AI-generated draft — not legal advice" banner (verbatim as instructed).
2. Every legal claim MUST have a [CITE:<node_id>] marker immediately after it.
3. Use the exact [CITE:<node_id>] markers from the retrieved legal sections above where applicable. If not present in the retrieved sections list, derive node IDs from the applicable acts above using the format: <ACT_CODE>/<CHAPTER_OR_PART>/<SECTION>
   For example, if the act is RTI-2005 and you cite Section 7, use: [CITE:RTI-2005/CH-II/S-7]
4. Use TODAY'S date (${new Date().toLocaleDateString("en-GB")}) as the draft date unless specified otherwise.
5. Use placeholder text [FULL NAME], [ADDRESS], [DATE], [DESIGNATION] where personal details are required.

Output ONLY the Markdown document. No preamble, no explanation, no code fences.`;

  const isRti = plan.document_type === "rti_application";
  const systemPrompt = isRti ? RTI_DRAFTER_SYSTEM_PROMPT : DRAFTER_SYSTEM_PROMPT;

  // Real LLM call via LLM Router
  const llmResponse = await router.run(
    "drafter",
    systemPrompt,
    userPrompt
  );

  // Extract CITE markers from output to populate pending_citations
  const pendingCitations: PageIndexNodeId[] = [];
  const regex = /\[CITE:([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(llmResponse.text)) !== null) {
    const rawCitation = match[1].trim();
    const citation = normalizeRtiNodeId(rawCitation) as PageIndexNodeId;
    if (!pendingCitations.includes(citation)) {
      pendingCitations.push(citation);
    }
  }

  return {
    body_markdown: llmResponse.text,
    pending_citations: pendingCitations,
  };
}

// ─── Agent class ──────────────────────────────────────────────────────────────

export class DrafterAgent {
  readonly name = "drafter" as const;

  async run(input: DrafterAgentInput): Promise<DrafterOutput> {
    return runDrafterAgent(input);
  }
}
