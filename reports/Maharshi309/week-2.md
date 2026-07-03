# Week-2 Report — Maharshi Patel (@Maharshi309)

**Issue:** #51 — Translator Agent (Week-2 spec)  
**Branch:** `agents/translator-week-2`  
**PR Status:** In progress  
**Date:** 2026-05-27

---

## What I Built

### Translator Agent (`packages/agents/src/translator/`)

Fully implemented the Translator agent per the Week-2 spec and `docs/rfcs/RFC-translator-agent.md`.

**Files:**
- `translator.agent.ts` — core agent logic (strip→translate→reinject, glossary integration, pass-through)
- `translator.prompt.ts` — system/user prompt builders, glossary constraint block formatter
- `index.ts` — barrel with `TranslatorInput`, `TranslatorResult` exports
- `translator.test.ts` — 25 tests covering all acceptance criteria

### Translation Package Scaffold (`packages/translation/`)

Scaffolded the `@trionic/translation` package since it only had a README. This is Megh's (Team E) domain, but the Translator Agent can't call `lookupGlossary` without it.

**Files:**
- `src/glossary.ts` — `lookupGlossary()` with 4-tier lookup (node match → term match → domain fallback → graceful missing)
- `src/postprocess.ts` — citation-marker-safe post-processing stubs with `splitAroundCiteMarkers()`
- `src/index.ts` — barrel export
- `data/glossary.hi.json` — 55 Hindi seed terms from RFC-indic-legal-glossary.md

---

## Acceptance Criteria — All Met ✅

| Criterion | Status | Evidence |
|---|---|---|
| `TranslatorAgent` exported from `packages/agents/src/translator` | ✅ | `index.ts` → `src/index.ts` barrel |
| Accepts `{ body_markdown, target_language, citations }` | ✅ | `TranslatorInput` interface |
| Calls `glossary.lookup(term, target_language)` before LLM | ✅ | `translator.agent.ts` step 3; test "calls glossary.lookup before LLM" |
| Returns `TranslatorOutput { target_language, translated_markdown, glossary_hits }` | ✅ | Wraps `@trionic/shared` `TranslatorOutput` |
| `[CITE:<node_id>]` markers survive translation | ✅ | `"[CITATION PRESERVATION TEST]"` test + `"[CITE MARKERS SURVIVE]"` test |
| `target_language === 'en'` passes through unchanged | ✅ | `"[EN PASS-THROUGH]"` test; no LLM call |

---

## Demo Gate Results

**Fixture:** 200-word English RTI draft with 5 `[CITE:...]` markers → Hindi

```
Input markers:
  [CITE:RTI-2005/S-6]  (Section 6 — RTI application)
  [CITE:RTI-2005/S-2]  (Section 2 — public authority definition)
  [CITE:RTI-2005/S-7]  (Section 7 — 30-day response period)
  [CITE:RTI-2005/S-19] (Section 19 — first appeal)
  [CITE:RTI-2005/S-8]  (Section 8 — exemptions)

Output: All 5 markers present in Hindi output ✅
glossary_hits: 6 entries (public authority, information, applicant, appeal, notice, jurisdiction) ✅
```

Test evidence: `"[DEMO GATE] glossary_hits shows at least 5 legal-term replacements for RTI→Hindi"` — **PASS**

---

## Test Results

```
✓ src/translator/translator.test.ts (25 tests)
  ✓ stripCitations() (4)
  ✓ validatePlaceholders() (4)
  ✓ reinjectCitations() (2)   ← includes [CITATION PRESERVATION TEST]
  ✓ runTranslator() (11)      ← includes [CITE MARKERS SURVIVE], [DEMO GATE], [EN PASS-THROUGH]
  ✓ TranslatorAgent class (3)

Total: 85 tests passed (all packages)
```

---

## How Citation Preservation Works

Per `docs/rfcs/RFC-translator-agent.md §4`:

```
[CITE:RTI-2005/S-6]  →  strip  →  ⟦CITE_0⟧  →  LLM  →  ⟦CITE_0⟧  →  reinject  →  [CITE:RTI-2005/S-6]
```

The `⟦⟧` delimiters (U+27E6/U+27E7) are never present in Indian legal text and are never tokenized across boundaries. After translation, every placeholder is validated (CitationDropError/CitationDuplicateError) before re-injection. We never silently return a draft with missing citations.

---

## Inter-Team Handoffs

| Team | Status | Notes |
|---|---|---|
| **Megh (Team E)** — glossary | ✅ Scaffolded | `packages/translation` now has `lookupGlossary()` with Hindi seed data. Megh to fill in Gujarati/Marathi/Tamil glossaries and post-processing logic. |
| **Yug (Team C)** — LLM Router | ✅ Integrated | Uses `router.run("translator", ...)` — config in `router.config.ts` already has `translator` entry (Gemini 1.5 Pro). |

---

## Files Changed

```
packages/agents/
  src/translator/
    index.ts              (rewritten — TranslatorInput, TranslatorResult, barrel exports)
    translator.agent.ts   (NEW — core logic)
    translator.prompt.ts  (rewritten — full prompt templates)
    translator.test.ts    (rewritten — 25 tests)
  package.json            (added @trionic/translation dependency)
  tsconfig.json           (added @trionic/translation path alias)
  tsconfig.test.json      (added @trionic/translation path alias)

packages/translation/
  package.json            (NEW)
  tsconfig.json           (NEW)
  src/
    index.ts              (NEW)
    glossary.ts           (NEW)
    postprocess.ts        (NEW)
  data/
    glossary.hi.json      (NEW — 55 Hindi seed terms)
```
