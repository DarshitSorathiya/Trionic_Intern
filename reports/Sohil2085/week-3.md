# Week 3 — Sohil Kareliya

**Team:** Frontend
**Module owned:** Editor / Draft UI
**Week of:** 2026-06-02

---

## What I shipped this week

- Wired `app/draft/[id]/page.tsx` to use `@supabase/ssr` to fetch real `documents` and `document_versions` rows from the database instead of using mocked data.
- Enhanced `DraftEditor` by adding a "Write/Preview" mode toggle to properly render Markdown.
- Implemented inline parsing of `[CITE:<node_id>]` markers in Preview mode, turning them into interactive badges.
- Wired click events on citation badges to update the Zustand store (`selectedCitationNodeId`) and open the `CitationDrawer` built by Tirth Gondaliya.
- Verified that `useAutosave` successfully debounces and dispatches `PATCH /api/documents/{id}` edits against the real backend.
- Bound `document.status` to dynamic badges in `DraftHeader` to accurately reflect the real state (`generating`, `final`, `failed`).

## Demo

[Demo Pending - Integration Day]

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Files changed | 5 | `page.tsx`, `draft-header.tsx`, `draft-editor.tsx`, `citation-drawer.tsx`, `use-draft-store.ts` |
| UI Features | 3 | Edit/Preview modes, Clickable Citations, Dynamic Status |
| Integrations | 2 | Supabase real data load, Backend Autosave PATCH |
| CI status | ✅ Passing | UI renders without crashing |

## Blockers

- No hard blockers right now. 
- *Note:* The citation drawer currently shows placeholder content until the backend returns real snapshot text for the node IDs, but the UI orchestration is complete.

## Next week

- Further refine the editor based on Demo Day feedback.
- Finalize the Citation Drawer design once verified legal texts are fully retrievable.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>
