<!-- Thanks for the PR! Fill this in so reviewers can move fast. -->

## What

<!-- One-paragraph description of what this PR changes. -->

## Why

<!-- Why is this needed? Link the issue. -->

Closes #

## How to test

<!-- Commands to run locally, screenshots, or a Loom link. -->

```bash
# example
pnpm --filter @trionic/agents test
```

## Checklist

- [ ] CI is green (lint + typecheck + tests)
- [ ] PR title uses a Conventional Commit prefix (`feat:`, `fix:`, `docs:`, etc.)
- [ ] No secrets / `.env` files committed
- [ ] If touching another team's package, I requested review from that team
- [ ] If this is user-facing, the "AI-generated draft — not legal advice" banner is preserved
- [ ] If this is an agent change, the citation-or-die rule is upheld
- [ ] If this is a DB change, the migration is reversible and RLS policies are updated
