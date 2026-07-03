# RFC: Indic Legal Glossary Schema and Translator Handoff

| Field | Value |
|---|---|
| **Author** | Megh Patel (`@Meghpatel2810`) |
| **Team** | Team E - Indic |
| **Status** | Draft - Week 1 |
| **Created** | 2026-05-19 |
| **Issue** | Week 1 Indic glossary RFC |
| **Related** | `packages/translation`, `docs/rfcs/RFC-translator-agent.md`, `docs/ARCHITECTURE.md` |

---

## 1. Context

Trionic Adalat is a multilingual legal drafting assistant. The English drafting pipeline is grounded through PageIndex citations, but the product only works for Indian users if legal terms survive translation into Hindi, Gujarati, Marathi, and Tamil.

Generic translation is not reliable enough for legal drafting. For example, "consideration" in everyday Hindi may be translated as "विचार", but in contract law the correct legal sense is "प्रतिफल". If the translator chooses the everyday meaning, the draft can become misleading even when the English source text was citation-grounded.

Team E owns the Indic translation support package at `packages/translation`. This RFC defines the legal glossary schema, the Hindi seed glossary, and the handoff contract that Team C's Translator Agent calls before sending text to an LLM.

---

## 2. Proposal

Team E will provide a PageIndex-aware legal glossary. The glossary maps English legal terms to approved Indic equivalents, with optional links to the PageIndex node and snapshot that define or support the term.

The Translator Agent remains owned by Team C. Team E owns:

- glossary entry schema and seed data;
- lookup API exposed from `packages/translation`;
- per-language post-processing API;
- glossary coverage and translation fixture quality checks;
- Hindi seed glossary for Week 1, then Gujarati, Marathi, and Tamil expansion.

The glossary will start as versioned JSON files committed under `packages/translation/data/`. This is feasible for Week 1 and Week 2 because it avoids blocking on Supabase schema work. The same schema can later move to Supabase when Team B is ready to add migrations and RLS.

### Initial file layout

```text
packages/translation/
  data/
    glossary.hi.json
    glossary.gu.json
    glossary.mr.json
    glossary.ta.json
  src/
    glossary.ts
    postprocess.ts
    index.ts
```

Week 1 may land only the RFC and seed table. Week 2 implementation can create the files above.

---

## 3. Goals

- Define a stable glossary schema keyed by PageIndex node IDs where possible.
- Seed the Hindi pair with about 50 high-frequency legal terms.
- Define `lookupGlossary()` for the Translator Agent handoff.
- Preserve citation integrity by treating `[CITE:<node_id>]` as protected machine text.
- Support future Gujarati, Marathi, and Tamil entries without changing the API.
- Provide a testable path for glossary coverage and translation consistency.

## 4. Non-goals

- This RFC does not implement the Translator Agent. Team C owns that in `docs/rfcs/RFC-translator-agent.md`.
- This RFC does not validate citations. The Citator-gatekeeper owns citation validity.
- This RFC does not define frontend i18n or `next-intl` routing.
- This RFC does not translate the full legal corpus.
- This RFC does not add Supabase tables in Week 1.
- This RFC does not claim that glossary translations are legal advice.

---

## 5. API / Contracts

Types should live in `packages/translation` first. If other packages need them directly, a later PR may promote the shared subset to `packages/shared` with repo-manager review.

```ts
import type {
  PageIndexNodeId,
  SnapshotId,
  SupportedLanguage,
} from "@trionic/shared";

export type IndicLanguage = Exclude<SupportedLanguage, "en">;

export type GlossaryStatus =
  | "approved"
  | "needs_review"
  | "deprecated";

export interface GlossaryEntry {
  /** Stable glossary entry ID, e.g. "hi-ica-1872-consideration". */
  id: string;

  /** English source term or phrase. */
  term_en: string;

  /** Approved target-language legal translation. */
  term_indic: string;

  /** Target language for this entry. */
  language: IndicLanguage;

  /** PageIndex node that defines or strongly supports this term, when known. */
  node_id?: PageIndexNodeId;

  /** Snapshot of the legal source used for this entry, when known. */
  snapshot_id?: SnapshotId;

  /** Act code, e.g. "ICA-1872", "CPA-2019", "RTI-2005". */
  act_code?: string;

  /** Legal domain used for search and eval grouping. */
  domain?: "contract" | "consumer" | "rti" | "employment" | "procedure" | "general";

  /** Whether the term is ready to enforce as a hard glossary constraint. */
  status: GlossaryStatus;

  /** Optional reviewer note for ambiguous terms. */
  notes?: string;
}

export interface GlossaryLookupInput {
  /** Citation nodes present in the draft, usually collected from [CITE:<node_id>] markers. */
  node_ids: PageIndexNodeId[];

  /** Target Indic language. */
  target_language: IndicLanguage;

  /** Optional fallback terms extracted from the draft text. */
  terms?: string[];

  /** Optional domain hint from Classifier or Planner. */
  domain?: GlossaryEntry["domain"];
}

export interface GlossaryLookupResult {
  /** Entries matching cited nodes or requested terms. */
  entries: GlossaryEntry[];

  /** Cited nodes for which no glossary entry was found. */
  missing_node_ids: PageIndexNodeId[];

  /** Terms requested by the caller but not present in the glossary. */
  missing_terms: string[];

  /** True when lookup completed normally. False only in fallback mode. */
  glossary_available: boolean;
}

export async function lookupGlossary(
  input: GlossaryLookupInput
): Promise<GlossaryLookupResult>;

export async function postProcessIndicText(
  language: IndicLanguage,
  text: string
): Promise<string>;
```

### Translator Agent handoff

The Translator Agent should call Team E before the LLM call:

```ts
const glossary = await lookupGlossary({
  node_ids: citedNodeIds,
  target_language: "hi",
  domain: "contract",
});
```

It then injects `glossary.entries` into the translation prompt as hard constraints:

```text
GLOSSARY CONSTRAINTS:
- "consideration" -> "प्रतिफल" (node: ICA-1872/S-2, status: approved)
- "plaintiff" -> "वादी" (status: approved)
```

Only entries with `status: "approved"` should be enforced as exact terms. Entries with `needs_review` may be shown to the model as suggestions but must be logged for human review.

After the LLM returns translated text and Team C restores citation placeholders, the Translator Agent calls:

```ts
const cleaned = await postProcessIndicText("hi", translatedText);
```

Post-processing must never modify text inside `[CITE:...]` markers.

---

## 6. Glossary Lookup Rules

Lookup should use these rules in order:

1. **Exact node match:** return entries where `entry.node_id` is in `input.node_ids`.
2. **Term match:** if `input.terms` is provided, return entries matching `term_en`.
3. **Domain fallback:** if a domain is provided, return high-frequency approved terms for that domain.
4. **No match:** return `missing_node_ids` or `missing_terms`; do not throw.

The glossary must be case-insensitive for English term matching, but it must preserve the exact stored spelling for output.

If the glossary file cannot be loaded, `lookupGlossary()` returns:

```ts
{
  entries: [],
  missing_node_ids: input.node_ids,
  missing_terms: input.terms ?? [],
  glossary_available: false
}
```

This allows the Translator Agent to continue in degraded mode and record the missing glossary coverage in its trace metadata.

---

## 7. Hindi Seed Glossary

The first Hindi seed targets high-frequency terms across the five v1 document types: RTI application, legal notice, NDA, consumer complaint, and employment contract.

Where a PageIndex node is not known yet, `node_id` may stay empty until Team D finalizes the act tree. Entries without a confirmed source should use `status: "needs_review"` if the term is ambiguous.

| # | English term | Hindi term | Domain | Suggested source |
|---|---|---|---|---|
| 1 | consideration | प्रतिफल | contract | Indian Contract Act, 1872 |
| 2 | contract | अनुबंध | contract | Indian Contract Act, 1872 |
| 3 | agreement | करार | contract | Indian Contract Act, 1872 |
| 4 | proposal | प्रस्ताव | contract | Indian Contract Act, 1872 |
| 5 | acceptance | स्वीकृति | contract | Indian Contract Act, 1872 |
| 6 | promise | वचन | contract | Indian Contract Act, 1872 |
| 7 | promisor | वचनदाता | contract | Indian Contract Act, 1872 |
| 8 | promisee | वचनग्रहीता | contract | Indian Contract Act, 1872 |
| 9 | breach | उल्लंघन | contract | Indian Contract Act, 1872 |
| 10 | damages | हर्जाना | contract | Indian Contract Act, 1872 |
| 11 | compensation | क्षतिपूर्ति | general | Contract/consumer law |
| 12 | indemnity | क्षतिपूर्ति अनुबंध | contract | Indian Contract Act, 1872 |
| 13 | guarantee | गारंटी | contract | Indian Contract Act, 1872 |
| 14 | surety | जमानतदार | contract | Indian Contract Act, 1872 |
| 15 | principal debtor | मुख्य ऋणी | contract | Indian Contract Act, 1872 |
| 16 | creditor | लेनदार | contract | Indian Contract Act, 1872 |
| 17 | agency | अभिकरण | contract | Indian Contract Act, 1872 |
| 18 | agent | अभिकर्ता | contract | Indian Contract Act, 1872 |
| 19 | principal | प्रधान | contract | Indian Contract Act, 1872 |
| 20 | plaintiff | वादी | procedure | Civil procedure |
| 21 | defendant | प्रतिवादी | procedure | Civil procedure |
| 22 | complainant | शिकायतकर्ता | consumer | Consumer Protection Act, 2019 |
| 23 | opposite party | विपक्षी पक्ष | consumer | Consumer Protection Act, 2019 |
| 24 | consumer | उपभोक्ता | consumer | Consumer Protection Act, 2019 |
| 25 | complaint | शिकायत | consumer | Consumer Protection Act, 2019 |
| 26 | deficiency | सेवा में कमी | consumer | Consumer Protection Act, 2019 |
| 27 | goods | वस्तुएं | consumer | Consumer Protection Act, 2019 |
| 28 | service | सेवा | consumer | Consumer Protection Act, 2019 |
| 29 | unfair trade practice | अनुचित व्यापार व्यवहार | consumer | Consumer Protection Act, 2019 |
| 30 | product liability | उत्पाद दायित्व | consumer | Consumer Protection Act, 2019 |
| 31 | jurisdiction | अधिकार-क्षेत्र | procedure | General/procedure |
| 32 | district commission | जिला आयोग | consumer | Consumer Protection Act, 2019 |
| 33 | state commission | राज्य आयोग | consumer | Consumer Protection Act, 2019 |
| 34 | national commission | राष्ट्रीय आयोग | consumer | Consumer Protection Act, 2019 |
| 35 | legal notice | विधिक नोटिस | general | Legal notice template |
| 36 | notice | नोटिस | general | General |
| 37 | cause of action | वाद हेतुक | procedure | Civil procedure |
| 38 | relief | राहत | procedure | General/procedure |
| 39 | remedy | उपचार | procedure | General/procedure |
| 40 | evidence | साक्ष्य | procedure | Evidence law |
| 41 | affidavit | शपथपत्र | procedure | General/procedure |
| 42 | declaration | घोषणा | general | General |
| 43 | undertaking | उपक्रम | general | General |
| 44 | confidentiality | गोपनीयता | employment | NDA/employment |
| 45 | confidential information | गोपनीय जानकारी | employment | NDA |
| 46 | disclosure | प्रकटीकरण | employment | NDA |
| 47 | non-disclosure agreement | गोपनीयता समझौता | employment | NDA |
| 48 | employer | नियोक्ता | employment | Employment contract |
| 49 | employee | कर्मचारी | employment | Employment contract |
| 50 | termination | समाप्ति | employment | Employment contract |
| 51 | salary | वेतन | employment | Employment contract |
| 52 | public authority | लोक प्राधिकारी | rti | RTI Act, 2005 |
| 53 | information | सूचना | rti | RTI Act, 2005 |
| 54 | applicant | आवेदक | rti | RTI Act, 2005 |
| 55 | appeal | अपील | rti | RTI/procedure |

### Seed entry example

```json
{
  "id": "hi-ica-1872-consideration",
  "term_en": "consideration",
  "term_indic": "प्रतिफल",
  "language": "hi",
  "node_id": "ICA-1872/S-2",
  "snapshot_id": "2026-05-19",
  "act_code": "ICA-1872",
  "domain": "contract",
  "status": "approved",
  "notes": "Use the contract-law sense, not the everyday meaning of thought."
}
```

---

## 8. Language Expansion Rules

Gujarati, Marathi, and Tamil should use the same schema and add one file per language. Each language owner may add language-specific notes but should not change the shared `GlossaryEntry` shape.

| Language | Owner | Week 2 expectation |
|---|---|---|
| Hindi (`hi`) | Megh Patel | 50+ seed terms and lookup implementation |
| Gujarati (`gu`) | Patel Swar | 20+ reviewed terms using the same schema |
| Marathi (`mr`) | Swara Jariwala | 20+ reviewed terms using the same schema |
| Tamil (`ta`) | Anshul Jangid | 20+ reviewed terms plus eval fixture plan |

Post-processing rules must protect citation markers:

- Do not translate or normalize text inside `[CITE:...]`.
- Do not convert ASCII characters inside node IDs.
- Do not replace `/`, `-`, `:`, or digits inside citation markers.
- Language-specific punctuation cleanup may only run outside protected spans.

---

## 9. Alternatives Considered

| Alternative | Decision |
|---|---|
| Keep glossary only in prompts | Rejected. Prompt-only glossaries are not versioned or testable. |
| Store glossary directly in Supabase in Week 1 | Deferred. It creates DB/RLS dependency before Team B schema is ready. |
| Key only by English term | Rejected. Some terms have different legal meanings depending on the Act and PageIndex node. |
| Key only by PageIndex node | Rejected for v1. Some useful high-frequency terms may not have confirmed node IDs yet. |
| Block translation when glossary is missing | Rejected for early weeks. Missing terms should warn and be logged, not stop the whole pipeline. |

---

## 10. Rollout Plan

| Week | Deliverable |
|---|---|
| Week 1 | RFC merged; Hindi seed glossary table reviewed; handoff contract agreed with Translator owner. |
| Week 2 | Implement JSON glossary files, `lookupGlossary()`, no-op `postProcessIndicText()`, and unit tests. |
| Week 3 | Integrate with Translator Agent on the RTI/English-to-Hindi vertical slice. |
| Week 4 | Expand glossary toward top 200 terms across Hindi, Gujarati, Marathi, and Tamil. |
| Week 5 | Add Indic eval fixtures and report glossary coverage for generated drafts. |
| Week 6 | Final terminology coverage report and handover notes. |

---

## 11. Evaluation Plan

Team E will measure:

- **Glossary coverage:** percentage of cited nodes in a draft with at least one glossary entry.
- **Term consistency:** approved glossary terms appear unchanged in translated output.
- **Citation preservation:** `[CITE:<node_id>]` markers remain byte-for-byte unchanged after post-processing.
- **Missing-term backlog:** missing terms are collected from Translator Agent traces for later glossary expansion.
- **Human review sample:** each language owner reviews a fixed set of legal sentences per week.

Initial Week 2 fixture:

```text
Input: "The agreement requires valid consideration. [CITE:ICA-1872/S-2]"
Expected Hindi term: "प्रतिफल"
Protected marker: "[CITE:ICA-1872/S-2]"
```

---

## 12. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| A Hindi term has multiple valid legal translations | Mark as `needs_review`; do not enforce until approved. |
| PageIndex node IDs change during Team D ingestion | Keep `node_id` optional at first; backfill after node format is stable. |
| LLM ignores glossary constraints | Translator Agent validates approved terms on known fixtures and logs misses. |
| Post-processing corrupts citation markers | Protect `[CITE:...]` spans before normalization and test byte-for-byte preservation. |
| Glossary becomes stale after legal amendments | Keep `snapshot_id` on entries when source-backed; review entries when snapshots change. |

---

## 13. Open Questions

1. Should `snapshot_id` be mandatory for all approved entries, or only for entries tied to a specific Act definition?
2. Should `needs_review` entries be passed to the Translator Agent as suggestions, or hidden until approved?
3. Should glossary coverage below a threshold block production Indic drafts in Week 5?
4. Should the first implementation live only in `packages/translation`, or should shared types be promoted immediately to `packages/shared`?
5. Who gives final approval for canonical translations that have multiple acceptable legal Hindi forms?

---

## 14. Acceptance Criteria

- [ ] RFC reviewed by Team E, Team C Translator owner, and repo manager.
- [ ] Glossary schema supports `node_id`, `snapshot_id`, `language`, and review status.
- [ ] Translator Agent handoff for `lookupGlossary()` is defined.
- [ ] Hindi seed list includes at least 50 legal terms.
- [ ] Missing glossary terms have a non-blocking fallback policy.
- [ ] Citation marker protection is explicitly required for post-processing.
- [ ] Week 2 implementation path is clear for `packages/translation`.

---

## 15. References

- `PROJECT_BRIEF.md` - multilingual support and citation integrity goals.
- `docs/ARCHITECTURE.md` - Translator and glossary placement in the pipeline.
- `docs/rfcs/RFC-translator-agent.md` - Team C Translator Agent design.
- `packages/translation/README.md` - Team E ownership and package purpose.
- `packages/shared/src/types.ts` - existing `PageIndexNodeId`, `SnapshotId`, and `SupportedLanguage` contracts.
