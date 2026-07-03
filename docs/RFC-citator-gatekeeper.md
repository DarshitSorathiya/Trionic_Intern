# RFC: Citator-Gatekeeper Protocol Spec

**File:** `docs/RFC-citator-gatekeeper.md`
**Author:** Dhruv Lokadiya (@Dhruv5353) — Repo Manager
**Status:** Draft → Ready for Review
**Created:** Week 1 — May 2026
**Coordinated with:** Hitarth (agent implementation owner)
**Issue:** [#33](https://github.com/Trionic-Interns/trionic-ai-adalat/issues/33)

---

## 1. Purpose

This document defines the rules that the **Citator-gatekeeper agent** enforces on every AI-generated response in Trionic Adalat.

The core rule — called **"Citation-or-die"** — states:

> **No legal claim may be delivered to the user unless it is backed by a PageIndex node ID pointing to an authoritative Indian legal source.**

This RFC answers three questions:
1. What exactly counts as a "legal claim" that must be cited?
2. How does the gatekeeper validate whether a claim is correctly cited?
3. What happens at each edge case?

---

## 2. Background & Motivation

Trionic Adalat answers legal questions in Indian languages. Users may act on these answers in real legal situations. An uncited or incorrectly cited legal claim can cause serious harm.

**Example of the problem:**

> ❌ AI says: "A landlord must give 30 days notice before eviction."
> → No citation. User relies on it. Law may have changed, or apply differently in their state.

> ✅ AI says: "A landlord must give 30 days notice before eviction. [Source: Transfer of Property Act, 1882 — Section 106 · PageIndex node: `TPA_S106_v1`]"
> → Cited. User can verify.

The Citator-gatekeeper is the enforcement layer that ensures only the second form of output ever reaches the user.

---

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Legal claim** | Any statement that asserts a specific legal right, obligation, penalty, procedure, or interpretation grounded in Indian law |
| **Free prose** | General explanatory text, analogies, summaries, or conversational framing that does not assert a specific legal position |
| **PageIndex node ID** | A unique identifier (e.g. `IPC_S302_v2`) pointing to a verified passage in the legal corpus via the PageIndex retrieval system |
| **Citation** | A PageIndex node ID attached to a legal claim, formatted as `[Source: <Act Name> — <Section> · node: <node_id>]` |
| **Gatekeeper** | The Agno-based agent that intercepts AI output and validates citations before delivery |

---

## 4. What Counts as a Legal Claim?

### 4.1 — Claim: MUST be cited

A sentence is a **legal claim** if it does ANY of the following:

| Pattern | Example |
|---------|---------|
| References a specific section, article, or clause of a law | "Under Section 302 IPC..." |
| States a legal obligation or prohibition | "A tenant is legally required to give one month's notice..." |
| States a penalty or punishment | "This offence is punishable by up to 7 years imprisonment..." |
| Cites a court judgment or precedent | "The Supreme Court held in Kesavananda Bharati that..." |
| Defines legal eligibility or rights | "Every citizen has the right to..." |
| Makes a time-bound legal deadline claim | "FIR must be filed within 3 years of the offence..." |
| States jurisdiction-specific law | "Under Maharashtra Rent Control Act..." |

### 4.2 — Free Prose: NO citation needed

A sentence is **free prose** if it:

| Pattern | Example |
|---------|---------|
| Explains a general concept without citing law | "Contract law generally requires both parties to agree." |
| Gives an analogy or illustration | "Think of bail as a security deposit to ensure you return to court." |
| Asks a clarifying question | "Can you tell me which state the property is in?" |
| Summarises the user's question back | "You're asking about tenant rights in a rental dispute." |
| Provides procedural advice without legal assertion | "You should consult a lawyer before signing." |
| Uses hedging language without claiming law | "In most cases, landlords prefer to..." |

### 4.3 — The Grey Zone (borderline cases)

These require the gatekeeper to **flag for human review** rather than hard-block:

| Situation | Rule |
|-----------|------|
| Paraphrased law without naming the Act or section | **Flag** — likely a legal claim in disguise |
| "Generally" or "usually" before a legal-sounding claim | **Flag** — cannot verify generality without citation |
| Legal claim in a question form | **Allow** — questions do not assert; answers do |
| Comparison between two laws | **Both** sides must be cited individually |

---

## 5. The Validation Algorithm

This is the step-by-step process the Citator-gatekeeper agent runs on **every sentence** of AI output before it reaches the user.

```
FOR each sentence S in AI_output:

  STEP 1 — Classify S
    Run legal-claim classifier on S
    → Output: CLAIM | FREE_PROSE | BORDERLINE

  STEP 2 — If FREE_PROSE:
    → Pass. No citation needed. Move to next sentence.

  STEP 3 — If BORDERLINE:
    → Flag sentence with warning tag
    → Attach suggested citation if PageIndex returns a match (confidence > 0.75)
    → If no match: insert [CITATION NEEDED] marker
    → Deliver to user with visible disclaimer

  STEP 4 — If CLAIM:
    → Look up PageIndex for matching node
    → If node found (confidence > 0.80):
        Attach citation: [Source: <Act> — <Section> · node: <node_id>]
        → PASS
    → If node found but confidence 0.50–0.80:
        Attach citation WITH low-confidence warning
        → PASS WITH WARNING
    → If no node found (confidence < 0.50):
        → BLOCK response for this sentence
        → Replace with: "I was unable to find a verified legal source for this claim.
           Please consult a qualified lawyer."

  STEP 5 — Assemble final response
    Sentences that PASSED → include as-is with citation
    Sentences that BLOCKED → include fallback message
    Sentences that FLAGGED → include with [VERIFY] marker

  STEP 6 — Log all decisions
    Write to telemetry: sentence, classification, node_id (if any),
    confidence score, final action (PASS / BLOCK / FLAG)
```

---

## 6. Citation Format

All citations in the final response must follow this format:

**English:**
```
[Source: <Full Act Name>, <Year> — <Section/Article> · PageIndex: <node_id>]
```

**Example:**
```
[Source: Indian Penal Code, 1860 — Section 302 · PageIndex: IPC_S302_v2]
```

**Hindi / Indic languages:**
The citation remains in English even when the surrounding text is in Hindi or Gujarati. This ensures it is machine-readable by the gatekeeper and verifiable by the user.

---

## 7. Edge Cases

| Edge Case | Defined Behaviour |
|-----------|------------------|
| AI cites a section that does not exist in corpus | BLOCK — treat as no node found |
| AI cites correct Act but wrong section number | BLOCK — node ID mismatch |
| Legal claim is in Hindi but citation is in English | ALLOW — citation language is always English |
| AI paraphrases a law without naming it | BORDERLINE — run classifier, flag if score > 0.6 |
| Multiple claims in one sentence | Each clause is validated independently; one failure = sentence flagged |
| User explicitly asks AI not to cite | Override not permitted — citation-or-die is non-negotiable |
| Act has been amended; old section cited | FLAG with amendment warning: "Note: This section was amended in [year]." |
| Regional/state law (e.g. Maharashtra Shops Act) | Validate against state corpus; if not in corpus, BLOCK with note |
| Citation exists but PageIndex is temporarily down | BLOCK response; return error: "Legal source verification is temporarily unavailable." |
| AI output is a question, not a statement | ALLOW — questions do not make legal claims |

---

## 8. Agent Contract (for Hitarth — implementation)

The gatekeeper agent must expose the following interface to the rest of the system:

```typescript
interface CitatorGatekeeperResult {
  sentences: {
    original: string;
    classification: "CLAIM" | "FREE_PROSE" | "BORDERLINE";
    action: "PASS" | "BLOCK" | "FLAG";
    citation?: {
      nodeId: string;
      actName: string;
      section: string;
      confidence: number;
    };
    fallbackText?: string; // shown to user if BLOCK
  }[];
  finalResponse: string;   // assembled output safe to deliver
  blocked: boolean;        // true if ANY sentence was blocked
  flagged: boolean;        // true if ANY sentence was flagged
}
```

**The agent must NOT:**
- Allow any BLOCK-classified sentence to reach the user as a legal claim
- Skip logging — every decision must be written to the evals telemetry pipeline (Kirtan's team)
- Modify the PageIndex node ID — use it exactly as returned

---

## 9. What "Done" Looks Like (Acceptance Criteria)

- [ ] Given a response with a valid cited legal claim → gatekeeper PASses it with citation attached
- [ ] Given a response with an uncited legal claim → gatekeeper BLOCKs and returns fallback
- [ ] Given a response with only free prose → gatekeeper passes without modification
- [ ] Given a borderline sentence → gatekeeper flags it and attaches [VERIFY] marker
- [ ] All decisions are logged to telemetry with node_id and confidence score
- [ ] Works for output in English, Hindi, and Gujarati
- [ ] Handles PageIndex downtime gracefully (does not crash; blocks safely)

---

## 10. Open Questions (to resolve with Hitarth)

- [ ] What confidence threshold does PageIndex return — is 0.80 realistic for Week 2?
- [ ] Should BORDERLINE sentences be shown to the user at all, or held for review?
- [ ] How does the classifier handle mixed-language sentences (Hinglish)?
- [ ] Do we need a separate corpus index for state-level laws in Week 1 scope?

---

## 11. Out of Scope (for this RFC)

- The PageIndex tree-building logic (owned by Tirth — `packages/pageindex`)
- The translation layer for Indic languages (owned by Megh — `packages/translation`)
- UI rendering of citations (owned by Sohil — `apps/web`)
- Eval harness for measuring citation accuracy (owned by Kirtan — `packages/evals`)

---

*Last updated: Week 1, May 2026 — Dhruv Lokadiya*
*Next review: Week 2 sync with Hitarth after agent skeleton is wired up*