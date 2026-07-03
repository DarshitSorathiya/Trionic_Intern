# `packages/translation` — Indic translation

EN ↔ Indic language pairs with a legal-terminology glossary keyed by PageIndex nodes.

## Team

**Owner:** Team E — Indic
**Lead:** Megh Patel

| Language pair / module | Owner |
|---|---|
| Hindi pair + glossary infrastructure | Megh Patel |
| Gujarati pair | Patel Swar |
| Marathi pair | Swara Jariwala |
| Tamil pair + Indic eval harness | Anshul Jangid |

## Approach

- Translation runs through the LLM Router (in `packages/agents`) — translation is just another routed step.
- The **glossary** is the secret sauce. Generic LLM translation mangles legal terms ("consideration" → unstable Hindi). Megh owns a curated bilingual glossary keyed to **PageIndex nodes** — when an Act defines a term, that node's canonical translation is pinned.
- The Translator agent does a glossary lookup before drafting in Indic.

## Setup (Week 1)

Bootstrapped via Megh's Week-1 scaffold PR. Until then this README is the only file.
