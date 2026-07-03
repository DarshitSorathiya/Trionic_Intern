# RFC: Tamil Translation Pair + Indic Evaluation Harness

## Owner
Anshul Jangid

## Team
Indic

## Problem Statement

Legal translation for Indic languages is difficult because:
- legal terminology is domain-specific
- direct translation loses meaning
- Tamil uses a different script family
- rendering inconsistencies can break readability

## Goals

- Support Tamil legal translation pair
- Build Indic evaluation harness
- Preserve legal terminology fidelity
- Ensure citation-backed translations
- Handle Tamil script rendering correctly in frontend

## Non Goals

- Full multilingual support
- OCR improvements
- Speech translation

## Proposed Architecture

### Translation Pipeline
- Source text retrieved using PageIndex
- Citation node IDs attached
- Translation routed through provider layer
- Glossary-aware translation enforcement
- Citator gatekeeper validates citations

### Example Citation-backed Translation Flow

Example:

Source Node:
[Node ID: IPC_420_SEC_1]

English:
"Whoever cheats and dishonestly induces..."

Tamil:
"யார் ஏமாற்றி முறைகேடாக தூண்டுகிறாரோ..."

Citation retained:
IPC_420_SEC_1

Validation checks:
- citation ID preserved
- glossary terms retained
- no hallucinated legal claims
- legal meaning consistency maintained

### Glossary Enforcement

Example glossary mappings:

| English Term | Tamil Equivalent |
|---|---|
| Plaintiff | மனுதாரர் |
| Agreement | ஒப்பந்தம் |
| Enforceable | அமல்படுத்தக்கூடிய |

Glossary terms will be injected during translation and validated post-translation to ensure terminology consistency.

### Indic Evaluation Harness
Metrics:
- terminology accuracy
- citation retention
- hallucination rate
- script rendering validation
- BLEU / COMET / human review

### Evaluation Methodology

Benchmark dataset includes:
- Indian legal clauses
- Supreme Court summaries
- Acts retrieved using PageIndex
- parallel English ↔ Tamil legal samples

Human review process:
- reviewers verify legal meaning preservation
- terminology correctness
- readability
- hallucination presence
- citation consistency

Scoring thresholds:

| Metric | Target |
|---|---|
| Citation retention | >99% |
| Hallucination rate | <1% |
| Terminology accuracy | >95% |
| Rendering consistency | 100% critical screens |

### Tamil Rendering Considerations

Tamil differs from Devanagari-based scripts.

Frontend must:
- use Unicode-safe rendering
- support Tamil glyph shaping
- avoid font fallback corruption
- test across browsers/devices

Recommended fonts:
- Noto Sans Tamil
- Latha
- Catamaran

Potential issues:
- glyph clipping
- line-height inconsistencies
- mixed-script rendering bugs
- search/tokenization issues

### Tamil Rendering Validation

Rendering validation will be tested across:
- Chrome
- Firefox
- Safari
- Android WebView
- iOS Safari

Test platforms:
- macOS
- Windows
- Android
- iOS

Validation checks:
- glyph rendering correctness
- Unicode shaping
- line-height consistency
- mixed-script rendering
- font fallback behavior
- responsive layout consistency

### Fallback and Error Handling

If Tamil fonts are unsupported:
- fallback to Noto Sans Tamil
- preserve Unicode-safe rendering
- avoid transliteration fallback

Fallback font stack:

```css
font-family:
"Noto Sans Tamil",
"Latha",
"Catamaran",
sans-serif;
```

If mixed-script rendering fails:
- isolate rendering blocks
- apply script-aware font stacks
- log rendering failures for debugging

### Sample Tamil Node Example

Node ID:
TN_LEGAL_102

English:
"The agreement shall be enforceable by law."

Tamil:
"ஒப்பந்தம் சட்டப்படி அமல்படுத்தப்படும்."

Glossary-preserved term:
"agreement" → "ஒப்பந்தம்"

Citation:
TN_LEGAL_102

## Risks

- mistranslation of legal terminology
- hallucinated legal claims
- rendering inconsistencies
- provider inconsistency

## Open Questions

- Which translation provider performs best for Tamil legal text?
- Should glossary enforcement happen pre-translation or post-translation?
- Should Tamil-specific tokenization be added?

## Success Metrics

- citation retention > 99%
- reduced hallucination rate
- accurate legal terminology translation
- consistent Tamil rendering across browsers