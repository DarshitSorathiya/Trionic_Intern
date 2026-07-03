# Week 3 — Tirth Gondaliya

**Team:** Team A — Frontend
**Module owned:** Citation drawer + editor integration + PageIndex connection (`apps/web`)
**Week of:** 2026-06-06

---

## What I shipped this week

* **Real PageIndex Integration & Proxy API (`apps/web/app/api/pageindex/node/[...node_id]/route.ts`)**:
  * Connected frontend hover popovers and drawer explanation panels to a server-side catch-all proxy API route.
  * Correctly parsed slash-separated Indian Act node IDs (e.g., `RTI-2005/CH-II/S-6`) and called `pageindex.get_text()` from `@trionic/pageindex` to retrieve official texts dynamically from the Sqlite database.

* **Markdown Editor Edit/Preview Toggle (`apps/web/components/editor/draft-editor.tsx`)**:
  * Built a premium tabs interface allowing users to switch between "Edit" (raw markdown textarea) and "Preview" views.
  * In Preview mode, replaced all raw `[CITE:<node_id>]` markers in the document body with 1-indexed interactive HTML badge triggers.
  * Integrated hover popups on the badges which perform dynamic asynchronous network requests to fetch legal texts.
  * Wired click handlers on badges to invoke Zustand store selections that scroll to and expand specific citation paths in the sidebar.

* **Zustand Workspace State (`apps/web/hooks/use-draft-store.ts`)**:
  * Wired the `activeCitationNodeId` state and `setActiveCitationNodeId` action to allow bidirectional communication between the editor preview and the citation drawer.

* **Hierarchical Drawer Expansion (`apps/web/components/editor/citation-drawer.tsx`)**:
  * Upgraded the drawer to parse `PageIndexNodeId` and format dynamic breadcrumbs (e.g., `Indian Penal Code › Chapter XVI › Section 375`).
  * Implemented collapsible expansion down to level 3: Act name $\rightarrow$ Chapter $\rightarrow$ Section explanation, with proper keyboard controls (Tab, Space/Enter, Esc) and focus outlines.

* **Autosave and DB Version Sync (`apps/web/hooks/use-autosave.ts` & `apps/web/app/api/documents/[id]/route.ts`)**:
  * Aligned the autosave hook payload structure to `body_markdown` matching the backend database schema.
  * Implemented database-connected GET and PATCH routes in the web application using Supabase SSR client to fetch documents, insert rows into `document_versions` on autosave, and update `documents.current_version_id`.

* **Build and Typesafety Integrity**:
  * Corrected TypeScript build-time typecheck and Next.js page export errors, enabling the monorepo build command (`pnpm build`) to finish successfully with 100% success.

---

## Demo

To run and verify the PageIndex and citation editor integration locally:
1. Start the local server:
   ```bash
   pnpm dev
   ```
2. Open your web browser and navigate to the draft editor page with a document ID:
   `http://localhost:3000/draft/[id]` (e.g., `/draft/sandbox` or `/draft/some-uuid-id`)

### Verification Steps:
1. **Edit/Preview Modes**: Click "Preview" tab in the editor. The document renders headers, text, and active, 1-indexed citation badges contiguously with text.
2. **Hover Tooltip Fetching**: Hovering over any citation badge initiates an API call to `/api/pageindex/node/[node_id]` and renders the live Indian Act text in a premium card.
3. **Collapsible Navigation Tree**: The sidebar renders the list of citations grouped by Act. Clicking any row unfolds details layer-by-layer.
4. **Editor/Sidebar Sync**: Clicking a citation badge in Preview mode automatically scrolls and expands the corresponding legal text inside the sidebar drawer.
5. **Autosave Rows**: Making edits triggers an autosave that inserts new rows into `document_versions` in Supabase.

---

## Metrics

| Metric                          | Value | Notes                                        |
| ------------------------------- | ----- | -------------------------------------------- |
| Files modified/added            | 15    | Component integration and typescript fixes   |
| API proxy routes added          | 1     | Catch-all route for PageIndex                |
| Build compilation status        | 100%  | Builds and typechecks successfully           |
| Unit and integration tests run  | 143   | All tests pass                               |

---

## Blockers & Status Update

* **All Blockers Resolved**: The backend proxy routes are fully connected to `@trionic/pageindex`, and Next.js page/route errors are resolved, making the entire monorepo builds typesafe.

---

## Next week (Week 4)
* Incorporate user feedback on editor interface layout.
* Implement PDF and DOCX exports for drafts.
