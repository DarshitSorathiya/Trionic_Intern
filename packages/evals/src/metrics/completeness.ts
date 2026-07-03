import type { EvalMetric } from "@trionic/shared";
import type { Fixture } from "../types";

export type CompletenessResult = {
  metric: "completeness";
  required_sections: string[];
  missing_sections: string[];
  completeness_rate: number;
  completeness_score: number; // alias for run.ts compat
  eval_metric: EvalMetric;
  status: "pass" | "fail";
};

// Keyword mapping for required sections in RTI applications (W2 + W3)
const SECTION_KEYWORDS: Record<string, string[]> = {
  address:          ["pio", "public information officer", "to,", "to\n", "officer", "address"],
  pio_address:      ["pio", "public information officer", "to,", "to\n", "officer", "address"],
  subject:          ["subject:", "sub:", "subject –", "subject-", "regarding", "re:"],
  sections_sought:  ["information sought", "particulars of information", "information sought:", "information requested"],
  information_requested: ["information sought", "particulars of information", "information requested:"],
  "info sought":    ["information sought", "particulars of information", "information sought:"],
  info_sought:      ["information sought", "particulars of information", "information sought:"],
  declaration:      ["declare", "i am a citizen", "citizen of india", "fee", "ipo", "postal order", "payment", "rs. 10", "rs 10"],
  payment_details_declaration: ["declare", "citizen of india", "fee", "ipo", "postal order", "payment"],
  applicant_details: ["applicant", "name of applicant", "i,"],
  appeal_grounds:   ["appeal", "grounds", "aggrieved", "rejection", "first appeal"],
  date:             ["date:", "date :", "2025", "2026", "dated"],
  signature:        ["signature:", "sincerely", "faithfully", "yours truly", "applicant"],
  // W3 composite field: date AND signature must both be present
  "date+signature": ["date:", "date :", "2025", "2026", "dated", "signature:", "sincerely", "faithfully"],
  date_signature:   ["date:", "date :", "2025", "2026", "dated", "signature:", "sincerely", "faithfully", "yours faithfully", "yours sincerely"],
};

/**
 * Checks if a specific section key is present in the draft text.
 */
function isSectionPresent(sectionKey: string, text: string): boolean {
  const lowerText = text.toLowerCase();

  // 1. Direct match for header or label (e.g. "### Subject" or "**Subject**" or "Subject:")
  const cleanKey = sectionKey.replace(/_/g, " ").trim().toLowerCase();
  const directHeaderRegex = new RegExp(
    `(#+|\\*\\*|__)\\s*${cleanKey.replace(/[+]/g, "\\+")}\\s*(#+|\\*\\*|__)?`,
    "i",
  );
  const directLabelRegex = new RegExp(
    `^\\s*${cleanKey.replace(/[+]/g, "\\+")}\\s*:`,
    "mi",
  );

  if (directHeaderRegex.test(text) || directLabelRegex.test(text)) {
    return true;
  }

  // 2. Keyword/phrase fallback
  const keywords = SECTION_KEYWORDS[sectionKey] || [cleanKey];
  return keywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Evaluates the structural completeness of a draft document in a fixture.
 * Completeness Rate = (present_sections / required_sections) * 100
 */
export async function completeness(
  fixture: Fixture,
): Promise<CompletenessResult> {
  const text = fixture.draft_output.text;
  let requiredSections = fixture.ground_truth.required_sections || [];

  // Fallback to default W3 required sections for RTI applications if empty
  if (requiredSections.length === 0 && fixture.doc_type === "rti_application") {
    requiredSections = ["pio_address", "subject", "info_sought", "declaration", "date_signature"];
  }

  const missingSections: string[] = [];

  for (const section of requiredSections) {
    if (!isSectionPresent(section, text)) {
      missingSections.push(section);
    }
  }

  const totalRequired = requiredSections.length;
  const presentRequired = totalRequired - missingSections.length;
  const rate = totalRequired === 0 ? 100 : (presentRequired / totalRequired) * 100;

  return {
    metric: "completeness",
    required_sections: requiredSections,
    missing_sections: missingSections,
    completeness_rate: rate,
    completeness_score: rate,
    eval_metric: {
      name: "completeness_rate",
      value: rate,
      unit: "percent",
    },
    status: rate === 100 ? "pass" : "fail",
  };
}
