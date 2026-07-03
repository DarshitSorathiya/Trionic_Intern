# RFC-translator-agent — Translator Agent Design

| Field            | Value                              |
|------------------|------------------------------------|
| **RFC Number**   | RFC-2026-002                       |
| **Title**        | Translator Agent Design            |
| **Author**       | Maharshi Patel (@Maharshi309)      |
| **Team**         | Team C — Agents                    |
| **Status**       | Draft — Open for Review            |
| **GitHub Issue** | #TBD                               |
| **Branch**       | `agents/translator-agent-rfc`      |



## 1. Summary

We need an agent that takes a finished English legal draft and translates it into Hindi, Gujarati, Marathi, or Tamil — without breaking the `[CITE:<node_id>]` citation markers and without getting legal terms wrong.

This RFC is my plan for building it. The agent sits at the end of the draft pipeline, right before the user sees output. It works with two other parts of the system: Yug's LLM Router (which does the actual translation call) and Megh's glossary in `packages/translation` (which tells us the correct legal term translations before we even prompt the model).

---

## 2. Why we need this at all

I tried asking a plain LLM to translate an NDA clause into Hindi with no setup. It translated "consideration" as "विचार" — which in everyday Hindi means "thought", not the legal term. In a draft that's citing the Indian Contract Act's definition of consideration, that's actively misleading.

I also realized the `[CITE:<node_id>]` markers are a big deal. If even one of them goes missing after translation, the Citator-gatekeeper rejects the whole draft. So I can't just hope the LLM keeps them intact — I need to actually make sure they survive.

Three things break without a dedicated agent:

1. **Terms drift** — legal words get translated using everyday meanings, not their statutory definitions.
2. **Citation markers get lost** — the LLM doesn't know what `[CITE:ICA-1872/CH-VI/S-73]` is, so it might just drop it.
3. **Script-level issues slip through** — formatting and grammar problems that need per-language post-processing, not prompt tweaks.

---

## 3. Glossary Handoff with Team E

### 3.1 How it works

Before I touch the LLM, I call Team E's glossary first. The question I'm asking it is simple: for the node IDs that appear in this draft, what's the correct translation of each legal term they define? Once I know that, I can lock those translations in the prompt so the model can't go off and choose its own words.

Here's the interface I'm proposing (Megh, happy to change the field names — just needs to be agreed before Week 2):

```ts
// packages/translation — Team E owns this
export interface GlossaryEntry {
  term_en: string;             // e.g. "consideration"
  term_indic: string;          // the correct translation in the target script
  node_id: string;             // the node that defines this term, e.g. "ICA-1872/CH-II/S-2"
  language: SupportedLanguage; // "hi" | "gu" | "mr" | "ta"
}

export type SupportedLanguage = "hi" | "gu" | "mr" | "ta";

export async function lookupGlossary(
  nodeIds: string[],
  targetLang: SupportedLanguage
): Promise<GlossaryEntry[]>;
```

Once I have those entries, I paste them into the LLM's system prompt as hard constraints. Not "prefer these" — "use exactly these":

```
GLOSSARY CONSTRAINTS (do not deviate from these translations):
- "consideration" → "प्रतिफल"  (node: ICA-1872/CH-II/S-2)
- "specific performance" → "विनिर्दिष्ट पालन"  (node: SRA-1963/CH-II/S-10)
```

### 3.2 What happens if the glossary isn't available

Two cases I want to handle gracefully:

- **A term has no entry** — we fall back to whatever the LLM picks for that word and log a warning. The draft still goes out. It's not ideal but it's better than blocking the user over one missing term.
- **The glossary call fails entirely** (Team E's service is down, network issue, whatever) — the agent doesn't crash. It sets `glossary_available: false` in the output and keeps going without the constraints. The pipeline upstream can decide whether to retry or flag it for review. I really don't want one failing service to break a user's draft.

### 3.3 Stub for while Team E is building theirs

I don't want to be blocked waiting for Team E's glossary to be ready before I can test my agent. So there's a local stub that returns an empty array, swapped in with an env var:

```ts
// packages/agents/src/__mocks__/glossary.stub.ts
export async function lookupGlossary(
  nodeIds: string[],
  targetLang: SupportedLanguage
): Promise<GlossaryEntry[]> {
  return []; // empty → agent falls through to raw LLM translation
}
```

Flip `TRANSLATION_GLOSSARY_STUB=true` to use it. When Team E ships the real glossary, we just drop the env var — nothing changes in the agent code.

---

## 4. Keeping PageIndex Node IDs Alive Through Translation

This is the section I spent the most time on. If we get it wrong, we end up with a draft that looks fine but has missing citations — and the Citator-gatekeeper catches it only after the whole pipeline has already run.

### 4.1 The strategy: strip, swap in placeholders, translate, re-inject

My approach: never send `[CITE:<node_id>]` to the LLM. Before translation, replace every citation with a short numbered placeholder. After translation, swap them back in code — where it's fully deterministic.

I did think about just telling the LLM "don't touch anything inside square brackets", but I decided against it. LLMs paraphrase. When they see a bracket-enclosed string they don't recognize, they sometimes drop it or restructure the sentence so the marker ends up in the wrong place. I'd much rather solve this with string manipulation — maybe 15 lines of code — than hope a prompt instruction holds up across every translation.

For the placeholder format I'm using `⟦CITE_0⟧`, `⟦CITE_1⟧`, etc. The `⟦⟧` characters (Unicode `U+27E6`/`U+27E7`) are basically never going to appear in an Indian legal document, and none of the three LLM providers we use will split them across token boundaries — so the model always sees each placeholder as one clean token.

**The steps:**

```
1. Scan the draft for [CITE:...] tokens, record each one with its position → CitationMap
2. Replace each [CITE:...] with ⟦CITE_0⟧, ⟦CITE_1⟧, … (indexed)
3. Send the cleaned text to the LLM Router for translation
4. Get back the translated text — placeholders should still be in there
5. Swap each ⟦CITE_N⟧ back to its original [CITE:<node_id>] token
6. Record where each citation landed in the translated text (translated_span)
7. Validate: every placeholder from step 2 must appear exactly once in the output
```

Step 7 is the safety net. If anything is off — a placeholder missing, a placeholder appearing twice — we throw right away. We never silently hand back a broken draft.

### 4.2 The CitationSpan type

This is the shape of one entry in the citation map — basically a record of where a citation was, what it pointed to, and where it ended up after translation:

```ts
// packages/agents/src/types/citation.ts

export type CitationSpan = {
  /** Which placeholder number this corresponds to (⟦CITE_N⟧). */
  index: number;

  /** The PageIndex node ID, e.g. "ICA-1872/CH-VI/S-73" */
  node_id: string;

  /** Snapshot date of the act version cited, e.g. "2024-12-01" */
  snapshot_id: string;

  /** Where this citation appeared in the original English draft [start, end). */
  original_span: [number, number];

  /** Where it ended up in the translated draft [start, end).
   *  Only filled in after re-injection. */
  translated_span?: [number, number];
};

export type CitationMap = CitationSpan[];
```

### 4.3 Edge cases I've thought through

| Situation | What we do |
|---|---|
| `[CITE:...]` is inside a quoted string that the LLM reformats | The placeholder is still there verbatim inside the reformatted string. Safe. |
| LLM duplicates a placeholder (hallucination) | Validation catches it → throw `CitationDuplicateError` → retry once through the Router at temperature 0. |
| LLM drops a placeholder | Validation catches it → throw `CitationDropError` → log the broken draft → surface to pipeline. Retry policy pending Q3. We never silently return a draft with missing citations. |
| The draft has no citations at all | CitationMap is empty. Strip and re-inject steps are no-ops. Everything continues normally. |
| The same node is cited twice | Each occurrence gets its own `CitationSpan` with a unique index. Both get preserved separately. |

---

## 5. Per-Language Post-Processing

### 5.1 The handoff

After the citations are re-injected, I make one more call — into Team E's `postProcess` function:

```ts
// packages/translation — Team E owns this
export async function postProcess(
  lang: SupportedLanguage,
  text: string
): Promise<string>;
```

I'm not writing the per-language logic myself. Megh, Patel Swar, Swara, and Anshul know these languages; I don't. My job here is just to call this function at the right moment — after citations are back in the text — and return whatever comes out.

### 5.2 What each language needs

| Language | Team E Owner | What needs fixing after raw LLM translation |
|---|---|---|
| **Hindi** (`hi`) | Megh Patel | Devanagari numeral formatting (`73` → `७३` in body text, but keep Arabic inside `[CITE:...]`); `Section 73` → `धारा 73`; strip stray ZWJ/ZWNJ characters some LLM tokenisers insert. |
| **Gujarati** (`gu`) | Patel Swar | Numeral handling by context; honorific formatting (`આ.`); nukta normalisation for borrowed terms. |
| **Marathi** (`mr`) | Swara Jariwala | Gender agreement — LLMs default to masculine but Marathi legal writing uses neuter for entities; `।।` → `।` punctuation fix. |
| **Tamil** (`ta`) | Anshul Jangid | Numeral format; gender suffixes on legal actor nouns (`பிரதிவாதி` vs `பிரதிவாதினி`); consistent grantha `ஸ்` usage. |

### 5.3 When a language doesn't have a post-processor yet

If someone calls `postProcess` for a language that isn't implemented yet, it just returns the text unchanged and logs a debug message. That way we can add a new language code to `SupportedLanguage` on day one without anything breaking — the actual post-processor just lands in a later PR.

---

## 6. How the whole agent runs

Here's the full flow from start to finish:

```
TranslatorAgent.translate(draft: string, targetLang: SupportedLanguage)
│
├─ 1. Pull all [CITE:...] node_ids from the draft
│
├─ 2. Ask Team E: lookupGlossary(nodeIds, targetLang)
│      → get back pinned term translations
│      → if this fails, continue in fallback mode (no glossary constraints)
│
├─ 3. Build CitationMap; swap [CITE:...] tokens for ⟦CITE_N⟧ placeholders
│
├─ 4. Assemble the LLM prompt:
│      - System: target language, legal register, glossary constraint block
│      - User: the placeholder-substituted draft
│
├─ 5. Call the LLM Router (Yug's module)
│      → model is resolved by the Router, not hardcoded here
│      → get back translated text with ⟦CITE_N⟧ still in place
│
├─ 6. Validate placeholder completeness
│      → missing placeholder → CitationDropError → surface to pipeline (retry policy pending Q3)
│      → duplicate placeholder → CitationDuplicateError (retry once at temp 0)
│
├─ 7. Swap ⟦CITE_N⟧ back to [CITE:<node_id>]; record translated_span
│
├─ 8. Ask Team E: postProcess(targetLang, translatedText)
│      → get back the language-corrected final text
│
├─ 9. Return the result (see output type below)
│
└─ 10. Write a row to agent_traces:
        { agent_name: "translator", model (from Router),
          tokens_in, tokens_out, cost_usd, latency_ms,
          cited_node_ids (from CitationMap), status }
```

Step 10 is a hard requirement — `PROJECT_BRIEF.md §10` says every agent call gets logged to `agent_traces`, no exceptions.

**Output type:**

```ts
export interface TranslationResult {
  translatedDraft: string;
  citationMap: CitationMap;
  translationMetadata: {
    targetLang: SupportedLanguage;
    glossaryAvailable: boolean;      // false if lookupGlossary failed
    glossaryEntriesApplied: number;
    model: string;                   // whatever the Router resolved
    durationMs: number;
  };
}
```

---

## 7. Open Questions

These are blockers for me — I can't finalize the implementation until they're answered. If you're tagged, please drop a comment on the PR whenever you have a moment.

| # | Question | Who I'm asking | When I need it |
|---|---|---|---|
| Q1 | Does `GlossaryEntry` carry a `snapshot_id`, or do we assume it always refers to the latest snapshot for that node? | Megh Patel | Week 2 kickoff |
| Q2 | Should `postProcess` be async? Some languages might need external normalisation APIs. | Team E | Week 2 |
| Q3 | For `CitationDropError` — is one retry at temperature 0 the right call, or should we just fail immediately? | @malaysheta | During RFC review |
| Q4 | Will the citation format stay as `[CITE:<node_id>]`, or will we move to `[CITE:<node_id>@<snapshot_id>]`? This changes the CitationSpan type. | Hitarth Sherathia | Week 2 |
| Q5 | Should Arabic numerals inside `[CITE:...]` tokens always stay ASCII regardless of target language? | Hitarth Sherathia | Week 2 |

---

## 8. Things I considered and decided against

**Just telling the LLM "don't touch the markers":**
Rejected — LLMs paraphrase, and on longer drafts at least one marker will get dropped without any way to detect it before the Citator-gatekeeper fails. The placeholder approach adds ~15 lines of string handling and makes citation loss impossible.

**Keeping per-language post-processing inside this agent:**
Rejected — the linguistic edge cases (Marathi gender agreement, Tamil grantha usage, Gujarati nukta handling) belong with Team E's native-speaker contributors. A `postProcess(lang, text)` interface keeps that knowledge in the right place without coupling the agent to the internals.

**One prompt covering all four languages at once:**
Rejected — glossary constraints and post-processing rules are language-specific, making a single prompt hard to debug when one language regresses. Separate `translate()` calls per language are cleaner and can be parallelised.

---

## 9. Review & Approval

This RFC will be considered accepted after approval from the Team C lead, Team E lead, and Citator-gatekeeper owner, with no blocking objections within 5 business days of circulation.

| Role | Name | Status | Date |
|---|---|---|---|
| Author | Maharshi Patel (@Maharshi309) |  Submitted | 2026-05-19 |
| Team C Lead | Malay Sheta (@malaysheta) |  Pending | — |
| Team E Lead (glossary) | Megh Patel |  Pending | — |
| Citator-gatekeeper | Hitarth Sherathia |  Pending | — |

> Tag @malaysheta as reviewer on the PR. Do not self-merge.

---



*RFC-2026-002 | Translator Agent Design | Trionic Adalat — Internal Document*
