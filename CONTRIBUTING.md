# Contributing

Welcome to the cohort. This doc covers how we work together in this repo over the next 6 weeks.

## Before your first PR

1. Accept the invite to the `Trionic-Interns` org.
2. Clone the repo: `gh repo clone Trionic-Interns/trionic-ai-adalat` (or `git clone git@github.com:Trionic-Interns/trionic-ai-adalat.git`).
3. Read [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) end-to-end.
4. Make sure you've been added to the team listed under your name in `PROJECT_BRIEF.md § 9`.
5. Comment "ack" on your Week-1 issue by EOD Monday of Week 1.

## Branching & PR rules

- **Default branch:** `main` — protected. No direct pushes.
- **Branch naming:** `<team>/<short-slug>` (e.g. `agents/citator-spec`, `frontend/citation-drawer`).
- **PRs only.** Every change goes through a Pull Request.
- **CI must pass.** Lint + typecheck + tests must be green.
- **At least 1 review** required from anyone in your team (or repo manager).
- **No force-push** on `main`.
- **Squash-merge** is the default. Keep your commit history clean within your branch, but the merge to `main` will be a single squashed commit.
- **No merging your own PR.**

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/) prefixes:

```
feat(agents): add citator gatekeeper agent
fix(pageindex): handle empty section text
docs(brief): tighten audience description
chore(deps): bump next to 15.x
test(evals): add citation-validity fixture
```

Prefixes: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `style`, `build`, `ci`.

## PR description checklist

Every PR description should answer:

- **What** does this change?
- **Why** is it needed?
- **How** to test it (commands / screenshots / loom)?
- **Linked issue:** `Closes #123` or `Refs #123`

The PR template enforces this — fill it out.

## Weekly cadence

| Day | What happens |
|---|---|
| **Mon** | Pick up your week's issues; comment "ack" on assignments |
| **Mon–Thu** | Build. Open small PRs early. Drafts are encouraged for WIP |
| **Fri 5 PM IST** | **Demo Day** — every intern shows for 60 seconds (recorded) |
| **Fri 6 PM IST** | Commit your `reports/<github-handle>/week-N.md` weekly report |
| **Fri 7 PM IST** | Repo managers leave a 1-line feedback under each weekly report |

If you're going to miss demo day, post in `#cohort-2026` at least 24h in advance with what you would have shown.

## Weekly reports

Each Friday by 6 PM IST, commit a new file at:

```
reports/<your-github-handle>/week-N.md
```

Start from [the template](./reports/_template/week-N.md). At minimum:

- What you shipped (PR links, commits)
- 30-second demo (Loom link or screenshot)
- Metrics if any (latency, accuracy %, etc.)
- Blockers
- Next week

This trail is what your institute internship report is built from. Don't skip it.

## Code review etiquette

- **Be specific.** "This breaks because X" beats "looks weird".
- **Suggest, don't dictate.** Use GitHub's suggestion blocks for line edits.
- **Approve or request changes** — don't leave PRs in limbo.
- **Reviewer SLA:** 24h within your team, 48h for cross-team reviews. Past that, ping the team lead.

## Touching another team's package

If your PR touches code outside your team's package:

1. Request review from that package's team (their team handle, e.g. `@Trionic-Interns/team-pageindex`).
2. Wait for a +1 from that team before merging.
3. Repo managers are the tiebreakers if a team blocks too long without a concrete objection.

## Secrets & environment variables

- **Never commit secrets.** `.env*` files are gitignored.
- Per-developer setup uses `.env.local` (gitignored). A `.env.example` lives in each package as a template.
- Production secrets live in Vercel and Supabase project settings (DevOps owns the manifest).

## Questions?

Ping the cohort channel or your team lead. Repo managers (Dhruv, Sohil) are the catch-all for cross-cutting questions.
