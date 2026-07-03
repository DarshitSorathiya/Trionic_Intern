# Week 1 — Patel Swar

**Team:** Team E — Indic

**Module owned:** Gujarati glossary + legal translation handoff

**Week of:** 18-05-2026

---

## What I shipped this week

- Drafted the Gujarati glossary RFC for issue #26 and aligned it with the shared Team E glossary contract.
- Defined the Gujarati seed glossary scope for contract, consumer, RTI, employment, and general procedural terms.
- Documented how `lookupGlossary()` should hand Gujarati constraints to the Translator Agent.
- Added citation-marker protection rules so `[CITE:<node_id>]` text stays unchanged during post-processing.
- Linked the Gujarati RFC back into the Team E umbrella module so the ownership table no longer points to TBD.

---

## Demo

Demo focus: walk through the Gujarati RFC and show how the glossary will sit inside the Indic translation pipeline.

Summary:

- The RFC defines a Gujarati glossary slice with the same shared schema as the Hindi glossary.
- It keeps legal terms like "consideration" and "agreement" anchored to their legal Gujarati equivalents.
- It makes citation markers machine-safe for the translation flow.

Demo recording: TBD

---

## Metrics

| Metric | Value | Notes |
|---|---:|---|
| RFCs drafted | 1 | Gujarati Legal Glossary RFC |
| Seed terms scoped | 54 | Gujarati legal terms across core v1 domains |
| Translation handoff APIs documented | 2 | `lookupGlossary()` and `postProcessIndicText()` |
| Protected citation rules documented | 4 | preserve `[CITE:...]` spans and node IDs |
| Cross-team dependency references | 4 | Team C, Team D, Team E, repo manager |

---

## Blockers

- Final Gujarati canonical terms still need review for a few ambiguous words.
- PageIndex node IDs are not fully stable yet, so some glossary entries will stay term-only for now.
- Need reviewer agreement on whether the Gujarati glossary ships as JSON first or moves to Supabase later.

---

## Next week

- Convert the Gujarati seed glossary from RFC table into a JSON fixture.
- Implement the first pass of `lookupGlossary()` for Gujarati entries.
- Add Gujarati-safe post-processing stubs that skip protected citation spans.
- Coordinate with Team E on glossary review and with Team C on Translator Agent integration.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>