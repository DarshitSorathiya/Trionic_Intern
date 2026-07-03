# `packages/shared` — Shared types & utilities

Cross-cutting TypeScript types, constants, and pure utility functions consumed by other packages.

## Team

No single owner. Anyone may add to it, but changes require review from **at least one repo manager** (Dhruv or Sohil) because changes here ripple across all teams.

## What lives here

- Domain types: `Citation`, `PageIndexNodeId`, `AgentTrace`, `DocumentDraft`, etc.
- Constants: supported languages, supported document types, snapshot conventions.
- Pure helpers: ID generators, redaction patterns, formatting utilities.

## What does NOT live here

- Anything with side effects (no SDKs, no fetch calls, no React).
- Anything specific to one team — keep it in that team's package.

## Setup (Week 1)

Initial type definitions land as part of the Week-1 scaffold; types are seeded from `packages/db` once the schema RFC is approved.
