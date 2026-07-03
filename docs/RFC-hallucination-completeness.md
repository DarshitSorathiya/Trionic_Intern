# RFC: Hallucination & Completeness Evaluation

**Issue:** #31
**Author:** Kaushal Vora (@KaushalVora193)
**Team:** F — Evals & Telemetry
**Status:** Draft
**Date:** 2026-05-22

---

## 1. Why this RFC exists

To meet the absolute requirement of **"Citation-or-die"** and ensure that no AI-generated legal draft contains fabricated or ungrounded claims, we must build a robust, standardized framework to measure **Hallucination Rate** and **Completeness**.

While citation validity (implemented by Kirtan Patel) checks whether cited node IDs exist, it does not detect:
1. **Hallucinations**: Sentences that make active legal claims (prohibitions, deadlines, penalties) but contain **no citation marker at all**.
2. **Incompleteness**: Drafts that lack essential sections required for the specific document type (e.g., an RTI application missing the applicant details or PIO address).

This RFC defines the mathematical formulas, evaluation pipelines, and **LLM-as-judge prompt architectures** required to run these evaluations in `packages/evals/`.

---

## 2. Metric 1: Hallucination Rate (P1)

### 2.1 Definition & Math
A **hallucination** in Trionic Adalat is defined as:
> Any span of text in the generated draft that asserts a specific legal claim (right, obligation, penalty, procedure, or interpretation under Indian law) but does not carry an accompanying, valid citation marker `[CITE:<node_id>]`.

We calculate the **Hallucination Rate** as:

$$\text{Hallucination Rate} = \frac{\text{Uncited Claim Spans}}{\text{Total Claim Spans}} \times 100$$

* **Target**: **0%** (Enforced strictly in production by Week 4).
* **Free Prose** (e.g., greetings, summaries of the user's issue, general transitions) does **not** require citations and is excluded from the denominator.

---

### 2.2 LLM-as-Judge Prompt for Hallucination Detection
Since mapping arbitrary text to "legal claims" is a semantic task, we utilize an LLM-as-Judge (using Claude/Gemini) to perform span extraction and classification.

```markdown
SYSTEM:
You are an expert Indian Legal Evaluator and Auditor. Your job is to analyze AI-generated legal drafts and identify all "Legal Claims" and verify if they are properly cited.

A "Legal Claim" is defined as any statement that:
1. Asserts a specific legal right, obligation, duty, or prohibition.
2. Identifies a legal penalty, punishment, or consequence.
3. Specifies a time-bound legal deadline or procedural rule.
4. References specific sections, articles, or judgments of law.

"Free Prose" includes:
1. Conversational greetings or endings.
2. Summaries of the user's situation without asserting legal rules.
3. General advice to hire a lawyer.
4. Syntactic transitions.

INPUT:
1. Generated Draft Text:
<draft_text>
{{DRAFT_TEXT}}
</draft_text>

2. Valid Ground-Truth Node IDs:
<valid_nodes>
{{VALID_NODE_IDS}}
</valid_nodes>

TASK:
1. Segment the Draft Text into individual sentences or logical clauses.
2. Classify each segment as:
   - "FREE_PROSE" (No legal claim made)
   - "CLAIM" (Active legal claim made)
3. For every "CLAIM" segment:
   - Check if a `[CITE:<node_id>]` tag is appended or integrated.
   - If a tag is present, check if the `<node_id>` matches one of the IDs in the <valid_nodes> list.
   - Mark the claim as:
     - "CITED_AND_VALID": Has a cite tag that exists in <valid_nodes>.
     - "CITED_BUT_INVALID": Has a cite tag, but the ID is missing from <valid_nodes>.
     - "UNCITED" (Hallucination): No cite tag exists for this active legal claim.
4. Output your analysis in the strict JSON format below:

{
  "segments": [
    {
      "text": "The sentence or clause text",
      "type": "CLAIM" | "FREE_PROSE",
      "citation_status": "CITED_AND_VALID" | "CITED_BUT_INVALID" | "UNCITED" | "N/A",
      "cited_node_id": "node_id_or_null",
      "reasoning": "Brief explanation of classification"
    }
  ],
  "summary": {
    "total_claims": 0,
    "uncited_claims": 0,
    "hallucination_rate_percent": 0.0
  }
}
```

### 2.3 Concrete Example of Prompt Variables & JSON Output

To assist engineers implementing the evaluator in Week 2, here is a concrete example of populated prompt variables and the resulting JSON assessment:

#### Populated `{{DRAFT_TEXT}}`:
```markdown
Under Section 6(1) of the RTI Act [CITE:RTI-2005/S-6/CL-1], I hereby request the land acquisition details of Sector 15. The public authority must provide this information within 30 days of receipt.
```

#### Populated `{{VALID_NODE_IDS}}`:
```json
["RTI-2005/S-6/CL-1", "RTI-2005/S-7/CL-1"]
```

#### Expected LLM Output:
```json
{
  "segments": [
    {
      "text": "Under Section 6(1) of the RTI Act [CITE:RTI-2005/S-6/CL-1], I hereby request the land acquisition details of Sector 15.",
      "type": "CLAIM",
      "citation_status": "CITED_AND_VALID",
      "cited_node_id": "RTI-2005/S-6/CL-1",
      "reasoning": "States an active legal right to request information under Section 6(1), which is valid in the grounding corpus."
    },
    {
      "text": "The public authority must provide this information within 30 days of receipt.",
      "type": "CLAIM",
      "citation_status": "UNCITED",
      "cited_node_id": null,
      "reasoning": "Asserts a strict procedural obligation and deadline (30-day turnaround under Section 7(1) of the RTI Act) but lacks any accompanying [CITE] marker."
    }
  ],
  "summary": {
    "total_claims": 2,
    "uncited_claims": 1,
    "hallucination_rate_percent": 50.0
  }
}
```

---

## 3. Metric 2: Completeness (P1)

### 3.1 Definition & Math
Completeness ensures that all required structural sections of a selected document template are present in the drafted document.

We calculate the **Completeness Score** as:

$$\text{Completeness Score} = \frac{\text{Present Required Sections}}{\text{Total Required Sections}} \times 100$$

* **Target**: **100%** (The draft must be structurally complete).
* **Required Sections** vary by `DocumentType` (stored in ground-truth fixtures and template schemas).

### 3.2 Required Sections by Document Type (Goal G2)

| Document Type (`document_type`) | Required Sections / Fields |
|---|---|
| `rti_application` | `pio_address`, `applicant_details`, `information_requested`, `payment_details_declaration` |
| `legal_notice` | `sender_details`, `recipient_details`, `cause_of_action`, `legal_demands`, `notice_period` |
| `nda` | `party_details`, `definition_of_confidentiality`, `exclusions`, `obligations`, `term_duration` |
| `consumer_complaint` | `complainant_details`, `opposite_party_details`, `facts_of_complaint`, `legal_grounds`, `relief_sought` |
| `employment_contract` | `employer_employee_details`, `job_title_duties`, `compensation_benefits`, `termination_clause`, `governing_law` |

---

### 3.3 Evaluation Strategy
To ensure speed and accuracy, we implement a hybrid pipeline:

```
                  ┌───────────────────────────────┐
                  │   Required Sections Check     │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                     [ Heuristic Regex Matcher ]
                     Does the markdown contain key
                     headers/terms for each section?
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
             (All Found)                    (Some Missing)
                  │                               │
                  ▼                               ▼
            [ Score = 100% ]             [ LLM-as-Judge Pass ]
                                         Verify if sections are
                                         present but named differently
                                                  │
                                          ┌───────┴───────┐
                                          ▼               ▼
                                      [ Present ]     [ Missing ]
                                      Score=100%      Score < 100%
```

#### LLM-as-Judge Prompt for Completeness Check
```markdown
SYSTEM:
You are an expert Legal Auditor verifying the structural completeness of a legal document.
You are given a drafted legal document and a list of required section keys. Your job is to verify whether the semantic content of each required section is present in the draft, even if the section header is named slightly differently.

INPUT:
1. Document Type: {{DOC_TYPE}}
2. Required Sections:
<required_sections>
{{REQUIRED_SECTIONS_JSON}}
</required_sections>
3. Draft Text:
<draft_text>
{{DRAFT_TEXT}}
</draft_text>

TASK:
For each required section key:
1. Inspect the draft text to see if the content matching that requirement is present.
2. Determine if it is:
   - "PRESENT": The content is clearly written in the document.
   - "MISSING": The content is omitted or severely incomplete.
3. Provide the specific text snippet proving presence, or explain why it is missing.
4. Output your analysis in this strict JSON format:

{
  "sections_evaluation": [
    {
      "section_key": "required_section_key",
      "status": "PRESENT" | "MISSING",
      "matching_snippet": "Snippet of text from the draft showing this content, or null",
      "explanation": "Reasoning for the status"
    }
  ],
  "summary": {
    "total_required": 0,
    "total_present": 0,
    "completeness_score_percent": 0.0
  }
}
```

### 3.4 Concrete Example of Prompt Variables & JSON Output

To assist engineers implementing the completeness evaluator in Week 2, here is a concrete example of populated prompt variables and the resulting JSON assessment:

#### Populated `{{DOC_TYPE}}`:
```json
"rti_application"
```

#### Populated `{{REQUIRED_SECTIONS_JSON}}`:
```json
["pio_address", "applicant_details", "information_requested", "payment_details_declaration"]
```

#### Populated `{{DRAFT_TEXT}}`:
```markdown
# Application under Section 6(1) of the Right to Information Act, 2005

To,
The Public Information Officer,
Department of Revenue, Delhi Administration, Delhi.

Subject: Request for information regarding Sector 15 land acquisition.

Dear Sir/Madam,
I hereby request the following information under the RTI Act:
1. Copy of the land acquisition survey report for Sector 15.
2. Total compensation disbursed to landowners.

Thank you.
John Doe,
22 Rajpur Road, Civil Lines, Delhi - 110054.
```

#### Expected LLM Output:
```json
{
  "sections_evaluation": [
    {
      "section_key": "pio_address",
      "status": "PRESENT",
      "matching_snippet": "To,\nThe Public Information Officer,\nDepartment of Revenue, Delhi Administration, Delhi.",
      "explanation": "The recipient officer and address are clearly specified at the top of the application."
    },
    {
      "section_key": "applicant_details",
      "status": "PRESENT",
      "matching_snippet": "John Doe,\n22 Rajpur Road, Civil Lines, Delhi - 110054.",
      "explanation": "Applicant's name and residential postal address are correctly included at the bottom."
    },
    {
      "section_key": "information_requested",
      "status": "PRESENT",
      "matching_snippet": "1. Copy of the land acquisition survey report for Sector 15.\n2. Total compensation disbursed to landowners.",
      "explanation": "Specific items of information sought are clearly itemized in the body."
    },
    {
      "section_key": "payment_details_declaration",
      "status": "MISSING",
      "matching_snippet": null,
      "explanation": "The required declaration regarding the application fee payment (e.g., IPO details or BPL status) is completely missing from the draft."
    }
  ],
  "summary": {
    "total_required": 4,
    "total_present": 3,
    "completeness_score_percent": 75.0
  }
}
```

---

## 4. Harness Integration (`packages/evals/src/metrics`)

We will introduce two new modules in the eval package:
1. `src/metrics/hallucinationRate.ts`: Invokes the LLM-judge for span classification, calculates the hallucination rate, and reports uncited spans.
2. `src/metrics/completeness.ts`: Performs regex check of headers; falls back to LLM-judge if regex fails to achieve 100%.

### 4.1 Combined Metric Runner Contract
We will update `src/types.ts` to include these evaluations. The runner output will extend the console report and log results directly to the Supabase `eval_runs` table:

```typescript
export interface HallucinationResult {
  metric: "hallucination_rate";
  total_claims: number;
  uncited_claims: number;
  hallucinated_spans: string[];
  score_percent: number; // 100 - hallucination_rate (Target: 100%)
  status: "pass" | "fail";
}

export interface CompletenessResult {
  metric: "completeness";
  required_sections: string[];
  missing_sections: string[];
  score_percent: number; // (present / required) * 100 (Target: 100%)
  status: "pass" | "fail";
}
```

---

## 5. Dependencies

1. **LLM Router** (`packages/agents/src/router`): Evals must use the shared LLM router to invoke judges (avoid direct Anthropic/Google SDK imports).
2. **Supabase Schema** (`packages/db`): Evals will persist run records to `eval_runs`.

---

## 6. Open Questions for Team Leads

1. **LLM-Judge Model Choice**: Should we run the LLM-judge on `gemini-1.5-pro` or a smaller, faster model (e.g. `gemini-1.5-flash`) to save cost during bulk runs? 
   * *Recommendation*: Use `gemini-1.5-flash` for initial heuristic evaluations, escalating to larger models only if classification confidence drops.
2. **Cost Attribution**: Should the tokens consumed by eval-judges be billed separately, or tracked under a single Evals cost center in `agent_traces`?

---

*Last updated: Week 1, May 2026 — Kaushal Vora*
*Next review: Week 2 sync with Evals Team Lead (Kirtan Patel)*
