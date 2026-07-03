# Week 4 — Tirth Gondaliya

**Team:** Team A — Frontend
**Module owned:** Citation Drawer Improvements & Sandbox Multi-Doc Integration (`apps/web`)
**Week of:** 2026-06-13

---

## What I shipped this week

* **Ingested and Loaded Missing Acts in PageIndex (`packages/pageindex/src/query.ts`)**:
  * Updated query loader logic to load `ipc-tree.json` and `ni-act-tree.json` to enable querying and displaying legal text details for Indian Penal Code and Negotiable Instruments Act.
  * Re-compiled and built `@trionic/pageindex` successfully.

* **Upgraded Shared Citation Utilities (`apps/web/lib/citation-utils.ts`)**:
  * Extended abbreviations map `ACT_MAP` to properly resolve IPC, RTI, ICA, CPA, CRPC, COI, and NI to their full, official year-qualified Act names.
  * Implemented a unified `getHumanBreadcrumb` helper that builds legal path breadcrumbs dynamically, automatically handling both 3-segment paths (e.g. `Act › Chapter › Section`) and 2-segment paths (e.g. `Act › Section`).

* **Workspace Editor Citation Drawer Upgrades (`apps/web/components/editor/citation-drawer.tsx`)**:
  * Integrated asynchronous prefetching of legal node metadata from the backend `/api/pageindex/node/[node_id]` endpoint.
  * Re-engineered the citation list to group citations dynamically by their parent Act.
  * Replaced raw slash-separated node paths with full human-readable breadcrumb paths including section titles (e.g. `Section 6 (Request for obtaining information)`).
  * Added absolute hover tooltips to display the legal snapshot date (`as of YYYY-MM-DD`).
  * Implemented a citation density badge (`Low Density`, `Medium Density`, `High Density`) using the `citations.length / body_word_count` ratio with tailored, harmonic colors.

* **Sandbox Citation Drawer Parity (`apps/web/components/CitationDrawer.tsx`)**:
  * Replicated all upgrades (grouping by Act, human breadcrumbs, hover tooltips, and density badges) in the sandbox drawer.
  * Included a robust fallback mechanism that gracefully falls back to structured mock data if live API routes fail to load node details.

* **Sandbox Multi-Doc Interactive Toggle (`apps/web/app/draft/sandbox/page.tsx`)**:
  * Implemented an interactive toggle header in the sandbox view allowing users to switch between a mock "RTI Application" draft and a "Mutual NDA" draft.
  * Updated state to dynamically swap mock body contents and corresponding citation spans.
  * Fixed syntax errors (duplicate closing brackets) at the end of the sandbox page.

* **Workspace & Build Fixes**:
  * Resolved pnpm lockfile and next-intl package version mismatches via clean installation.

---

## Verification & Manual Testing (To see the output of the project)

1. Run the local dev server:
   ```bash
   pnpm dev
   ```
2. Open the sandbox route in your browser:
   `http://localhost:3000/draft/sandbox`
3. Toggle between RTI Application and Mutual NDA:
   * **For RTI Mode**: Notice the drawer groups under "Right to Information Act, 2005" and shows sections with detailed titles.
   * **For NDA Mode**: Notice the drawer groups under "Indian Contract Act, 1872" and "Indian Penal Code, 1860".
   * Hover over drawer elements to confirm tooltips displaying the snapshot dates appear correctly.
   * Notice the density badge color and text dynamically updating when swapping documents.


---

## Metrics

| Metric                          | Value | Notes                                        |
| ------------------------------- | ----- | -------------------------------------------- |
| Files modified                  | 5     | Query logic, citation drawer, sandbox, utils |
| API integration endpoints       | 1     | PageIndex node query fetcher                 |
| Build compilation status        | 100%  | Next.js server compiles and runs             |
| Act trees support added         | 2     | IPC and NI Act tree loading support          |

---

## Blockers & Status Update
* **None**: All week 4 features are implemented and the dev server runs successfully.

---

## Next week (Week 5)
* Optimize citations parsing speed for larger drafts.
* Add manual search input to look up acts and add citation links directly from the drawer.
