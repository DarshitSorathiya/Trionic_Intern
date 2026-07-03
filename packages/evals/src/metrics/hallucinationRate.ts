import type { EvalMetric } from "@trionic/shared";
import type { Fixture } from "../types";

export type HallucinationResult = {
  metric: "hallucination_rate";
  total_claims: number;
  uncited_claims: number;
  hallucinated_spans: string[];
  hallucination_rate: number;
  eval_metric: EvalMetric;
  status: "pass" | "fail";
};

// Phrases that indicate a real legal obligation/rights assertion.
// Kept tight to avoid over-flagging subject lines or plain list items.
const LEGAL_CLAIM_KEYWORDS = [
  "section 6",
  "section 7",
  "section 8",
  "section 11",
  "section 19",
  "section 20",
  "right to information",
  "rti act",
  "public authority must",
  "pio must",
  "must respond",
  "must provide",
  "required to",
  "is obligated",
  "shall designate",
  "mandates disclosure",
  "penalty of",
  "punishable",
  "imprisonment",
  "liable to",
  "fine of",
  "shall be provided",
  "is entitled to",
  "will attract a penalty",
  "within 30 days",
  "within forty days",
  "exempt from disclosure",
  "third party information requires",
];

/**
 * Split text into logical sentences based on end-of-sentence punctuation.
 */
function segmentSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Evaluates the hallucination rate of a draft document in a fixture.
 * Hallucination Rate = (uncited_claims / total_claims) * 100
 */
export async function hallucinationRate(
  fixture: Fixture,
): Promise<HallucinationResult> {
  const text = fixture.draft_output.text;
  const sentences = segmentSentences(text);

  let totalClaims = 0;
  let uncitedClaims = 0;
  const hallucinatedSpans: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();

    // Check if the sentence asserts a legal claim using keywords
    const isClaim = LEGAL_CLAIM_KEYWORDS.some((keyword) =>
      lower.includes(keyword),
    );

    if (isClaim) {
      totalClaims++;

      // Check if it has a [CITE:node_id] marker
      const hasCiteMarker = sentence.includes("[CITE:");

      if (!hasCiteMarker) {
        uncitedClaims++;
        hallucinatedSpans.push(sentence);
      }
    }
  }

  const rate = totalClaims === 0 ? 0 : (uncitedClaims / totalClaims) * 100;

  return {
    metric: "hallucination_rate",
    total_claims: totalClaims,
    uncited_claims: uncitedClaims,
    hallucinated_spans: hallucinatedSpans,
    hallucination_rate: rate,
    eval_metric: {
      name: "hallucination_rate",
      value: rate,
      unit: "percent",
    },
    status: rate === 0 ? "pass" : "fail",
  };
}
