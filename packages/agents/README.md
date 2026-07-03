# `packages/agents` — Agent layer (Agno)

The agent orchestration layer. Built on **Agno** using Trionic's multi-LLM PR.

## Team

**Owner:** Team C — Agent Layer
**Lead:** Malay Sheta

| Agent / module | Owner |
|---|---|
| Planner agent | Malay Sheta |
| Drafter agent | Jenil Sutariya |
| **Citator-gatekeeper agent** | Hitarth Sherathia |
| Classifier agent | Kathan Purohit |
| Reviewer agent | Evan Gregor |
| Translator handoff agent | Maharshi Patel |
| LLM Router (multi-LLM) | Yug Gandhi |
| Tracing / observability layer | Umrania Yug |

## The non-negotiable rule

**Citation-or-die.** The Citator-gatekeeper agent rejects any draft span containing a legal claim that does not carry a valid PageIndex node ID. This is enforced *in code*, not in prompts. If you change the Drafter or Reviewer, you cannot bypass the Citator.

The Citator-gatekeeper protocol spec is authored by **Dhruv Lokadiya** (repo manager) — see `docs/RFC-citator-gatekeeper.md` once it lands.

## Setup (Week 1)

Bootstrapped via the Week-1 scaffold PR. Until then this README is the only file.
