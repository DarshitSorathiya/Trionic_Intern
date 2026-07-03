# Week 1 — Tulsi Dhameliya

**Team:** Team A — Frontend
**Module owned:** Dashboard + History
**Week of:** 2026-05-22

---

## What I shipped this week

* Opened draft PR `frontend/dashboard-history` with `docs/RFC-dashboard-history.md`
* Designed the initial frontend UX structure for the Dashboard + History module
* Proposed dashboard layout strategy using:

  * table layout for desktop
  * stacked card layout for mobile responsiveness
* Defined document metadata structure for dashboard history:

  * title
  * status
  * language
  * timestamps
  * export state
* Documented supported quick actions:

  * view
  * edit
  * export
  * duplicate
  * delete
* Added filtering and sorting considerations:

  * language filter
  * status filter
  * search behavior
  * latest modified sorting
* Added accessibility considerations:

  * keyboard navigation
  * semantic HTML
  * focus states
  * accessible labels
* Proposed frontend component structure using shadcn/ui components
* Updated RFC after reviewer feedback and successfully merged the PR into `main`

## Demo

Suggested 60-second flow:

1. Open merged RFC PR on GitHub
2. Walk through dashboard layout decisions
3. Show filtering/sorting planning
4. Explain dashboard navigation flow
5. Show merged PR status

## Metrics

| Metric                         | Value | Notes                                                      |
| ------------------------------ | ----- | ---------------------------------------------------------- |
| RFCs created                   | 1     | Dashboard + History RFC                                    |
| PRs merged                     | 1     | Week-1 frontend RFC PR                                     |
| UX sections documented         | 8+    | Layout, filters, accessibility, responsive design, actions |
| GitHub review cycles completed | 1     | Reviewer feedback incorporated successfully                |

## Learnings

* Learned GitHub collaboration workflow
* Learned feature branches and PR handling
* Understood RFC-based engineering planning
* Explored monorepo frontend structure
* Learned basics of frontend architecture planning
* Understood review/update workflow in collaborative development

## Blockers

* Initial difficulty understanding GitHub workflow and PR updates
* Local dependency installation issues during frontend setup
* Understanding monorepo workspace structure for the first time

## Next week

* Complete frontend local setup fully
* Explore existing frontend component structure
* Understand routing and layout flow inside `apps/web`
* Begin actual dashboard/history implementation planning
* Learn more about Next.js App Router, Tailwind CSS, and shadcn/ui

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> *Pending*
