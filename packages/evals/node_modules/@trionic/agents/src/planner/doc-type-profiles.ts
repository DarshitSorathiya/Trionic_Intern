/**
 * planner/doc-type-profiles.ts
 * Owner: Malay Sheta (Planner agent — Team C Lead)
 *
 * W4 Breadth: the per-doc-type contract.
 *
 * This registry is the SINGLE SOURCE OF TRUTH for what the Planner emits per
 * document type. Every other Agents intern depends on the shape locked here:
 *   - template_id   → maps to a row in @om-patel91's `document_templates` table
 *   - pageindex_queries → the acts/sections the Drafter must retrieve before writing
 *   - applicable_acts   → which Indian acts apply (standard act codes)
 *
 * The Planner LLM call is grounded against these profiles: the doc-type baseline
 * is injected into the prompt and the LLM refines it. If the LLM output is
 * invalid or omits a field, we fall back to the profile so the chain never
 * aborts on a malformed plan.
 *
 * Doc types (locked in PROJECT_BRIEF.md § 4):
 *   rti_application       — RTI Act 2005           (shipped W3 ✓)
 *   legal_notice          — Contract Act + CPC
 *   nda                   — Contract Act + IT Act
 *   consumer_complaint    — Consumer Protection Act 2019
 *   cheque_bounce_notice  — Negotiable Instruments Act § 138
 */

import type { DocumentType, PlannerOutput } from "@trionic/shared";

/** A doc-type-specific baseline the Planner LLM is grounded against. */
export interface DocTypeProfile {
  /** The canonical document type. */
  document_type: DocumentType;
  /** Human-readable label injected into the <doc_type> prompt slot. */
  label: string;
  /** Template row id in @om-patel91's `document_templates` table. */
  template_id: string;
  /** Standard Indian act codes that apply to this doc type. */
  applicable_acts: string[];
  /** Doc-type-specific PageIndex retrieval queries (act + section + intent). */
  pageindex_queries: string[];
  /** Default drafting notes for the Drafter. */
  notes: string;
}

/**
 * The per-doc-type contract. Keyed by DocumentType.
 *
 * Act codes follow the repo convention <ACT_CODE>-<YEAR>:
 *   RTI-2005   Right to Information Act, 2005
 *   ICA-1872   Indian Contract Act, 1872
 *   CPC-1908   Code of Civil Procedure, 1908
 *   IT-2000    Information Technology Act, 2000
 *   CPA-2019   Consumer Protection Act, 2019
 *   NI-1881    Negotiable Instruments Act, 1881
 */
export const DOC_TYPE_PROFILES: Record<DocumentType, DocTypeProfile> = {
  rti_application: {
    document_type: "rti_application",
    label: "RTI application (Right to Information Act, 2005)",
    template_id: "rti-application-v1",
    applicable_acts: ["RTI-2005"],
    pageindex_queries: [
      "RTI-2005 Section 6 — request for obtaining information",
      "RTI-2005 Section 7 — disposal of request and time limits",
      "RTI-2005 Section 8 — exemptions from disclosure",
      "RTI-2005 Section 2(j) — right to information defined",
    ],
    notes:
      "Address to the Public Information Officer (PIO). Include the ₹10 application fee declaration and a BPL exemption note. Keep the information sought specific and enumerated.",
  },

  legal_notice: {
    document_type: "legal_notice",
    label: "Legal notice (demand notice prior to suit)",
    template_id: "legal-notice-v1",
    applicable_acts: ["ICA-1872", "CPC-1908"],
    pageindex_queries: [
      "ICA-1872 Section 73 — compensation for loss caused by breach of contract",
      "ICA-1872 Section 74 — compensation for breach where penalty stipulated",
      "CPC-1908 Section 80 — notice before instituting suit against government",
      "ICA-1872 Section 39 — effect of refusal of party to perform promise wholly",
    ],
    notes:
      "State sender and recipient clearly, the cause of action, the precise demand, and a compliance deadline (typically 15 days). Reserve the right to initiate legal proceedings on non-compliance.",
  },

  nda: {
    document_type: "nda",
    label: "Non-Disclosure Agreement (NDA)",
    template_id: "nda-v1",
    applicable_acts: ["ICA-1872", "IT-2000"],
    pageindex_queries: [
      "ICA-1872 Section 27 — agreement in restraint of trade is void",
      "ICA-1872 Section 73 — compensation for loss caused by breach of contract",
      "IT-2000 Section 43A — compensation for failure to protect data",
      "IT-2000 Section 72 — penalty for breach of confidentiality and privacy",
    ],
    notes:
      "Define the parties, purpose, scope of confidential information, term and survival, permitted disclosures, and remedies. Keep restraint clauses within ICA-1872 Section 27 limits to avoid voidness.",
  },

  consumer_complaint: {
    document_type: "consumer_complaint",
    label: "Consumer complaint (Consumer Protection Act, 2019)",
    template_id: "consumer-complaint-v1",
    applicable_acts: ["CPA-2019"],
    pageindex_queries: [
      "CPA-2019 Section 2(11) — deficiency in service defined",
      "CPA-2019 Section 2(47) — unfair trade practice defined",
      "CPA-2019 Section 35 — filing of complaint before District Commission",
      "CPA-2019 Section 34 — jurisdiction of the District Commission",
    ],
    notes:
      "Identify complainant and opposite party, describe the goods/service and the deficiency or unfair trade practice, and the relief claimed. Confirm pecuniary and territorial jurisdiction of the forum.",
  },

  cheque_bounce_notice: {
    document_type: "cheque_bounce_notice",
    label: "Cheque-bounce notice (Negotiable Instruments Act, 1881 § 138)",
    template_id: "cheque-bounce-notice-v1",
    applicable_acts: ["NI-1881"],
    pageindex_queries: [
      "NI-1881 Section 138 — dishonour of cheque for insufficiency of funds",
      "NI-1881 Section 138 proviso (b) — demand notice within 30 days of dishonour",
      "NI-1881 Section 139 — presumption in favour of holder",
      "NI-1881 Section 142 — cognizance of offences",
    ],
    notes:
      "State drawer, drawee, and cheque details (number, date, amount, bank). Invoke Section 138 expressly, demand payment within 15 days of receipt, and warn that prosecution follows non-payment. The notice MUST issue within 30 days of the bank's return memo.",
  },
};

/**
 * Map a classifier sub-domain string (free-form) to a DocumentType.
 * Used when no explicit doc_type hint is provided to the Planner.
 */
const SUB_DOMAIN_TO_DOC_TYPE: Record<string, DocumentType> = {
  rti: "rti_application",
  "rti-application": "rti_application",
  rti_application: "rti_application",
  "legal-notice": "legal_notice",
  legal_notice: "legal_notice",
  notice: "legal_notice",
  "demand-notice": "legal_notice",
  nda: "nda",
  "non-disclosure": "nda",
  "non-disclosure-agreement": "nda",
  confidentiality: "nda",
  "consumer-complaint": "consumer_complaint",
  consumer_complaint: "consumer_complaint",
  consumer: "consumer_complaint",
  "cheque-bounce": "cheque_bounce_notice",
  cheque_bounce: "cheque_bounce_notice",
  "cheque-bounce-notice": "cheque_bounce_notice",
  cheque_bounce_notice: "cheque_bounce_notice",
  cheque: "cheque_bounce_notice",
};

/** Act-code hints for resolving a doc type when the sub-domain is ambiguous. */
const ACT_TO_DOC_TYPE: Record<string, DocumentType> = {
  "RTI-2005": "rti_application",
  "NI-1881": "cheque_bounce_notice",
  "CPA-2019": "consumer_complaint",
};

/**
 * Resolve the DocumentType to plan for.
 *
 * Resolution order:
 *   1. An explicit hint (e.g. ChainInput.doc_type or a UI selection).
 *   2. The classifier's free-form sub_domain string.
 *   3. A signal act code in relevant_acts.
 *   4. Fallback to "legal_notice" — the most generic demand document.
 *
 * @param hint           Optional explicit doc-type string (may be undefined).
 * @param subDomain      Classifier sub_domain (e.g. "cheque-bounce").
 * @param relevantActs   Classifier relevant_acts (e.g. ["NI-1881"]).
 */
export function resolveDocType(
  hint?: string,
  subDomain?: string,
  relevantActs: string[] = []
): DocumentType {
  const normalize = (s?: string) => (s ?? "").trim().toLowerCase().replace(/\s+/g, "-");

  // 1. Explicit hint — accept either an exact DocumentType or a known alias.
  const normalizedHint = normalize(hint);
  if (normalizedHint) {
    if (normalizedHint in DOC_TYPE_PROFILES) {
      return normalizedHint as DocumentType;
    }
    if (SUB_DOMAIN_TO_DOC_TYPE[normalizedHint]) {
      return SUB_DOMAIN_TO_DOC_TYPE[normalizedHint];
    }
  }

  // 2. Classifier sub-domain.
  const normalizedSub = normalize(subDomain);
  if (SUB_DOMAIN_TO_DOC_TYPE[normalizedSub]) {
    return SUB_DOMAIN_TO_DOC_TYPE[normalizedSub];
  }

  // 3. Signal act code.
  for (const act of relevantActs) {
    if (ACT_TO_DOC_TYPE[act]) return ACT_TO_DOC_TYPE[act];
  }

  // 4. Generic fallback.
  return "legal_notice";
}

/**
 * Build a baseline PlannerOutput from a doc-type profile.
 * This is what the LLM is grounded against, and what we fall back to if the
 * LLM returns malformed JSON.
 */
export function baselinePlan(docType: DocumentType): PlannerOutput {
  const profile = DOC_TYPE_PROFILES[docType];
  return {
    document_type: profile.document_type,
    template_id: profile.template_id,
    pageindex_queries: [...profile.pageindex_queries],
    applicable_acts: [...profile.applicable_acts],
    notes: profile.notes,
  };
}
