# Week 1 — Tirth Gondaliya

**Team:** Team A — Frontend
**Module owned:** Citation drawer + tree-path links (`apps/web`)
**Week of:** 2026-05-21

---

## What I shipped this week

* Authored `docs/RFC-citation-drawer.md` — complete RFC defining the citation drawer UX, PageIndex tree-path rendering model, hover preview behavior, click-to-pin interactions, expand/collapse navigation, and accessibility support.

* Designed low-fidelity mockup for the citation drawer UI and added it to `docs/assets/citation-drawer-mock.png`.

* Defined hierarchical PageIndex rendering flow for legal citations such as:

  `IPC › Chapter XVI › Section 375 › Explanation 2`

* Proposed keyboard accessibility interactions for citation navigation:

  * Arrow key navigation
  * Expand/collapse behavior
  * Focus handling
  * ESC close interaction

* Planned component-level frontend architecture for the citation system:

  * `CitationBadge`
  * `CitationTooltip`
  * `CitationDrawer`
  * `CitationTree`
  * `CitationNode`

* Proposed integration approach using:

  * Next.js App Router
  * Tailwind CSS
  * shadcn/ui `Sheet`, `Tooltip`, and `Collapsible` components

* Created and submitted Draft PR for early frontend review and feedback.

---

## Demo

The proposed citation drawer allows users to inspect legal references directly inside the editor workflow.

Features demonstrated in the mockup:

* Inline citation badges inside drafted legal text
* Hover preview for quick legal inspection
* Right-side citation drawer for detailed hierarchy navigation
* Expandable/collapsible PageIndex tree structure
* Persistent click-to-pin citation behavior during editing
* Keyboard-accessible navigation flow

Example citation path rendered in the drawer:

```text
IPC
└── Chapter XVI
    └── Section 375
        └── Explanation 2
```

The drawer design is intended to support deep legal hierarchies without disrupting the drafting experience.

---

## Metrics

| Metric                          | Value | Notes                                      |
| ------------------------------- | ----- | ------------------------------------------ |
| RFC documents written           | 1     | Citation drawer RFC                        |
| Mockups created                 | 1     | Low-fidelity citation drawer UI            |
| Interaction flows defined       | 5+    | Hover, expand, collapse, pin, keyboard nav |
| Accessibility behaviors planned | 6     | Keyboard + ARIA interactions               |
| Proposed frontend components    | 5     | Citation UI architecture                   |
| Draft PRs opened                | 1     | RFC review workflow                        |

---

## Blockers

* Need confirmation from editor/redline UI owner (Sohil Kareliya) regarding exact editor integration points for citation badges.
* Waiting for finalized PageIndex node response structure from Team D to validate tree rendering assumptions.
* Citation metadata structure (snapshot/version fields) not finalized yet.

---

## Next week

* Begin implementation scaffold for citation drawer components inside `apps/web`.
* Create reusable citation tree component with expandable node support.
* Implement hover tooltip prototype using shadcn/ui components.
* Coordinate with editor module owner for citation badge rendering integration.
* Explore responsive/mobile behavior for deeply nested legal trees.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <!-- repo manager writes 1 line here -->
