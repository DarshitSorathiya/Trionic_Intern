# RFC: Indic Gujarati Legal Glossary Schema and Translator Handoff

| Field | Value |
|---|---|
| **Author** | Patel Swar |
| **Team** | Team E - Indic |
| **Status** | Draft - Week 1 |
| **Created** | 2026-06-04 |
| **Issue** | #26 - Gujarati glossary |
| **Related** | `packages/translation`, `docs/RFC-indic-legal-glossary.md`, `docs/RFC-team-e-indic-translation-module.md` |

---

## 1. Context

Trionic Adalat is an English-first legal drafting system that must remain citation-grounded while serving Indic users. Gujarati speakers need legal terminology that preserves the precise meaning of the source draft instead of using generic dictionary translation.

In legal writing, the wrong Gujarati term can change the meaning of a clause even when the translation sounds natural. For example, contract-law terms such as "consideration", "agreement", and "breach" should be translated consistently and in a way that matches legal usage, not everyday speech.

This RFC defines the Gujarati glossary slice for Team E. It follows the shared Indic glossary schema and adds the Gujarati owner-specific seed list, review policy, and Translator Agent handoff behavior for `packages/translation`.

---

## 2. Proposal

Team E will ship a Gujarati glossary that maps English legal terms to approved Gujarati equivalents. The glossary is PageIndex-aware when source nodes are known, but it can start with term-level entries while Team D finalizes stable node IDs.

This RFC covers:

- Gujarati glossary entry shape and review status;
- lookup behavior for the Translator Agent;
- protected citation-marker handling during post-processing;
- a seed list of high-frequency Gujarati legal terms;
- week-by-week rollout toward JSON-backed glossary data in `packages/translation`.

The first implementation should remain local to `packages/translation` so the Gujarati glossary can be iterated quickly without waiting on database migrations.

---

## 3. Goals

- Provide a Gujarati glossary that preserves legal meaning in translation.
- Support both node-backed entries and term-only entries during early rollout.
- Keep citation placeholders such as `[CITE:<node_id>]` byte-for-byte stable through post-processing.
- Define a Gujarati lookup path that the Translator Agent can call before translation.
- Allow future expansion to more Gujarati terms without changing the API.
- Make glossary coverage measurable through fixture-based evaluation.

## 4. Non-goals

- This RFC does not implement the Translator Agent.
- This RFC does not add Supabase tables in Week 1.
- This RFC does not define frontend routing or `next-intl` behavior.
- This RFC does not guarantee legal correctness beyond approved glossary usage.
- This RFC does not block translation when a glossary match is missing.

---

## 5. API / Contracts

The Gujarati glossary should use the same shared contracts defined for Team E. The Gujarati slice only specializes the language data and the lookup/post-processing behavior.

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
  id: string;
  term_en: string;
  term_indic: string;
  language: IndicLanguage;
  node_id?: PageIndexNodeId;
  snapshot_id?: SnapshotId;
  act_code?: string;
  domain?: "contract" | "consumer" | "rti" | "employment" | "procedure" | "general";
  status: GlossaryStatus;
  notes?: string;
}

export interface GlossaryLookupInput {
  node_ids: PageIndexNodeId[];
  target_language: IndicLanguage;
  terms?: string[];
  domain?: GlossaryEntry["domain"];
}

export interface GlossaryLookupResult {
  entries: GlossaryEntry[];
  missing_node_ids: PageIndexNodeId[];
  missing_terms: string[];
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

The Translator Agent should retrieve Gujarati glossary entries before the LLM call:

```ts
const glossary = await lookupGlossary({
  node_ids: citedNodeIds,
  target_language: "gu",
  domain: "contract",
});
```

Approved entries are injected into the prompt as exact-term constraints. Entries marked `needs_review` may be surfaced as guidance for the model, but they should not be treated as hard constraints until reviewed.

After translation and citation restoration, the Gujarati post-processing step runs:

```ts
const cleaned = await postProcessIndicText("gu", translatedText);
```

Text inside `[CITE:...]` markers must remain unchanged.

---

## 6. Glossary Lookup Rules

Lookup should follow this order:

1. **Exact node match**: return entries where `entry.node_id` appears in `input.node_ids`.
2. **Exact term match**: if `input.terms` is provided, match `term_en` case-insensitively.
3. **Domain fallback**: if a domain is provided, return approved high-frequency Gujarati legal terms for that domain.
4. **No match**: return missing node IDs or terms without throwing.

If the glossary data cannot be loaded, `lookupGlossary()` must return a safe degraded result:

```ts
{
  entries: [],
  missing_node_ids: input.node_ids,
  missing_terms: input.terms ?? [],
  glossary_available: false
}
```

---

## 7. Gujarati Glossary

The initial Gujarati glossary should cover the most common legal terms across contract drafting, consumer complaints, RTI workflows, and general procedural language.

| # | English term | Gujarati term | Domain | Suggested source |
|---|---|---|---|---|
| 1 | consideration | પ્રતિફળ | contract | Indian Contract Act, 1872 |
| 2 | contract | કરાર | contract | Indian Contract Act, 1872 |
| 3 | agreement | સમજૂતી | contract | Indian Contract Act, 1872 |
| 4 | proposal | પ્રસ્તાવ | contract | Indian Contract Act, 1872 |
| 5 | acceptance | સ્વીકાર | contract | Indian Contract Act, 1872 |
| 6 | promise | વચન | contract | Indian Contract Act, 1872 |
| 7 | promisor | વચનદાતા | contract | Indian Contract Act, 1872 |
| 8 | promisee | વચનગ્રાહી | contract | Indian Contract Act, 1872 |
| 9 | breach | ભંગ | contract | Indian Contract Act, 1872 |
| 10 | damages | હર્જાનો | contract | Indian Contract Act, 1872 |
| 11 | compensation | વળતર | general | Contract / consumer law |
| 12 | indemnity | હાનિપૂર્તિ | contract | Indian Contract Act, 1872 |
| 13 | guarantee | ગેરંટી | contract | Indian Contract Act, 1872 |
| 14 | surety | જામીનદાર | contract | Indian Contract Act, 1872 |
| 15 | principal debtor | મુખ્ય ઋણી | contract | Indian Contract Act, 1872 |
| 16 | creditor | લેણદાર | contract | Indian Contract Act, 1872 |
| 17 | agency | એજન્સી | contract | Indian Contract Act, 1872 |
| 18 | agent | એજન્ટ | contract | Indian Contract Act, 1872 |
| 19 | principal | પ્રધાન | contract | Indian Contract Act, 1872 |
| 20 | plaintiff | વાદી | procedure | Civil procedure |
| 21 | defendant | પ્રતિવાદી | procedure | Civil procedure |
| 22 | complainant | ફરિયાદી | consumer | Consumer Protection Act, 2019 |
| 23 | opposite party | વિરોધી પક્ષ | consumer | Consumer Protection Act, 2019 |
| 24 | consumer | ઉપભોક્તા | consumer | Consumer Protection Act, 2019 |
| 25 | complaint | ફરિયાદ | consumer | Consumer Protection Act, 2019 |
| 26 | deficiency | સેવા માં ખામી | consumer | Consumer Protection Act, 2019 |
| 27 | goods | માલ | consumer | Consumer Protection Act, 2019 |
| 28 | service | સેવા | consumer | Consumer Protection Act, 2019 |
| 29 | unfair trade practice | અયોગ્ય વેપાર પ્રથા | consumer | Consumer Protection Act, 2019 |
| 30 | jurisdiction | અધિકારક્ષેત્ર | procedure | General / procedure |
| 31 | district commission | જિલ્લા આયોગ | consumer | Consumer Protection Act, 2019 |
| 32 | state commission | રાજ્ય આયોગ | consumer | Consumer Protection Act, 2019 |
| 33 | national commission | રાષ્ટ્રીય આયોગ | consumer | Consumer Protection Act, 2019 |
| 34 | legal notice | કાનૂની નોટિસ | general | Legal notice template |
| 35 | public authority | જાહેર સત્તા | rti | RTI Act, 2005 |
| 36 | information | માહિતી | rti | RTI Act, 2005 |
| 37 | applicant | અરજદાર | rti | RTI Act, 2005 |
| 38 | appeal | અપીલ | rti | RTI / procedure |

### Seed entry example

```json
{
  "id": "gu-ica-1872-consideration",
  "term_en": "consideration",
  "term_indic": "પ્રતિફળ",
  "language": "gu",
  "node_id": "ICA-1872/S-2",
  "snapshot_id": "2026-06-04",
  "act_code": "ICA-1872",
  "domain": "contract",
  "status": "approved",
  "notes": "Use the contract-law sense, not the everyday meaning of consideration."
}
```

---

## 8. Language Expansion Rules

Gujarati should use the same schema as the rest of Team E. The only language-specific changes should be glossary content, notes, and post-processing rules.

| Language | Owner | Week 2 expectation |
|---|---|---|
| Hindi (`hi`) | Megh Patel | 50+ seed terms and lookup implementation |
| Gujarati (`gu`) | Patel Swar | 20+ reviewed terms using the same schema |
| Marathi (`mr`) | Swara Jariwala | 20+ reviewed terms using the same schema |
| Tamil (`ta`) | Anshul Jangid | 20+ reviewed terms plus eval fixture plan |

Post-processing rules must protect citation markers:

- Do not translate or normalize text inside `[CITE:...]`.
- Do not change ASCII characters inside node IDs.
- Do not replace `/`, `-`, `:`, or digits inside citation markers.
- Only apply Gujarati punctuation cleanup outside protected spans.

---

## 9. Alternatives Considered

| Alternative | Decision |
|---|---|
| Keep Gujarati glossary only in prompts | Rejected. Prompt-only glossaries are not versioned or testable. |
| Store Gujarati glossary in Supabase in Week 1 | Deferred. It adds DB and RLS dependency too early. |
| Key only by English term | Rejected. Gujarati legal meaning can vary by act and citation context. |
| Block translation when the glossary is missing | Rejected for early rollout. Missing terms should warn, not stop the pipeline. |

---

## 10. Rollout Plan

| Week | Deliverable |
|---|---|
| Week 1 | RFC reviewed; Gujarati seed glossary approved; ownership aligned with Team E. |
| Week 2 | Implement JSON glossary file, `lookupGlossary()`, and no-op `postProcessIndicText()` for Gujarati. |
| Week 3 | Wire Gujarati lookup into the Translator Agent for the first vertical slice. |
| Week 4 | Expand the Gujarati glossary toward the top 100 terms. |
| Week 5 | Add Gujarati eval fixtures for citation preservation and terminology consistency. |
| Week 6 | Publish glossary coverage and handover notes. |

---

## 11. Evaluation Plan

Team E should measure the Gujarati glossary using:

- glossary coverage for cited nodes;
- terminology consistency for approved Gujarati terms;
- byte-for-byte preservation of `[CITE:<node_id>]` markers;
- missing-term backlog captured from Translator Agent traces;
- human review of ambiguous terms.

Initial Week 2 fixture:

```text
Input: "The agreement requires valid consideration. [CITE:ICA-1872/S-2]"
Expected Gujarati term: "પ્રતિફળ"
Protected marker: "[CITE:ICA-1872/S-2]"
```

---

## 12. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| A Gujarati term has more than one acceptable legal translation | Mark the entry `needs_review` until the team approves one canonical form. |
| PageIndex node IDs are still changing | Keep `node_id` optional and backfill later. |
| LLM ignores glossary constraints | Validate approved-term usage against fixtures and trace misses. |
| Post-processing corrupts citation markers | Protect `[CITE:...]` spans before cleanup and test preservation explicitly. |
| Glossary coverage is too low for the first vertical slice | Start with high-frequency terms and expand weekly. |

---

## 13. Open Questions

1. Should `snapshot_id` be mandatory for every approved Gujarati entry, or only for source-backed act definitions?
2. Should `needs_review` entries be passed as suggestions or hidden until approval?
3. What minimum glossary coverage should gate the first Gujarati draft demo?
4. Should the Gujarati glossary remain local JSON for the internship or move to Supabase later?
5. Who signs off on the canonical Gujarati form when multiple legal variants are acceptable?

---

## 14. Acceptance Criteria

- [ ] Gujarati glossary schema matches the shared Team E shape.
- [ ] Translator Agent handoff for `lookupGlossary()` is documented.
- [ ] At least 20 Gujarati legal terms are seeded for Week 2 implementation.
- [ ] Missing glossary terms have a non-blocking fallback policy.
- [ ] Citation marker protection is explicitly required for post-processing.
- [ ] Week 2 implementation path is clear for `packages/translation`.

---

## 15. References

- `docs/RFC-indic-legal-glossary.md` - shared Indic glossary schema and Hindi seed pattern.
- `docs/RFC-team-e-indic-translation-module.md` - Team E umbrella scope and ownership.
- `docs/RFC-marathi-translation.md` - language-specific translation pair example.
- `docs/RFC-tamil-indic-eval.md` - language-specific eval and translation example.
- `packages/translation/README.md` - Team E package purpose.
- `packages/shared/src/types.ts` - shared PageIndex and language contracts.
