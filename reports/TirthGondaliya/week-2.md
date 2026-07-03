# Week 2 — Tirth Gondaliya

**Team:** Team A — Frontend
**Module owned:** Citation drawer + tree-path links (`apps/web`)
**Week of:** 2026-05-28

---

## What I shipped this week

* **Core Citation Utility (`apps/web/lib/citation-utils.ts`)**:
  * Implemented a comprehensive parsing utility to unpack hierarchical `PageIndexNodeId` strings (e.g., `IPC-1860/CH-XVI/S-375`).
  * Mapped short act codes (e.g., `IPC`, `RTI`, `ICA`, `CPA`, `COI`) to their full, official legislative titles (e.g., `Indian Penal Code`, `Right to Information Act`).
  * Generated standard formatted legal breadcrumbs: `Indian Penal Code › Chapter XVI › Section 375`.

* **Premium Standalone Component (`apps/web/components/CitationDrawer.tsx`)**:
  * Exported `<CitationDrawer citations={Citation[]} />` which organizes the list of citations by legislative Act.
  * **Nested Collapsible Dropdown Tree**: Implemented a true nested collapsible tree layout matching the hand-drawn sketch exactly. Clicking a node unfolds the path layer-by-layer:
    * Level 0: `Act (e.g. IPC ▼)`
    * Level 1: `Chapter (e.g. Chapter XVI ▼)`
    * Level 2: `Section (e.g. Section 375 ▼)`
    * Level 3: `Explanation` (Renders the complete legal text details card).
  * **Auto-Unfolding parent branch**: Clicking any inline badge `[n]` in the editor automatically expands the entire parent chain (Act $\rightarrow$ Chapter $\rightarrow$ Section) in the sidebar to reveal the explanation, and smoothly scrolls to it.
  * Built an interactive "Pin" engine allowing users to toggle persistent popovers.
  * Designed visible focus styles and full keyboard navigation (Tab, Enter/Space, Esc).

* **Interactive Sandbox Environment (`apps/web/app/draft/sandbox/page.tsx`)**:
  * Scaffolded the `/draft/sandbox` playground.
  * **Contiguous Inline Badges (Zero Spacing)**: Removed all spaces around the inline badges so they sit exactly after the text (e.g., `Section 375[3]`), exactly matching the sketch.
  * **Accurate Hover Tooltips**: Added hovering tooltips on inline badges. Hovering reveals:
    * **Header**: `Section X, Act` (e.g., `Section 375, IPC`)
    * **Body**: `Description` (e.g., detailed legal summaries)
  * Bound bidirectional scroll-linking between editor and sidebar.

---

## Demo (Demo Gate Details)

To preview and test the complete Demo Gate locally:
1. Start the local development server by running the following command from the root of the project:
   ```bash
   pnpm dev
   ```
2. Open your web browser and navigate to the live interactive sandbox:
   [http://localhost:3000/draft/sandbox](http://localhost:3000/draft/sandbox)

### Verification Steps:
1. **Contiguous Rendering**: Navigating to `/draft/sandbox` shows the inline markers sitting immediately next to the preceding text (e.g., `Act, 2005[1]`) without any white space.
2. **Inline Tooltip Hover**: Hovering over `[1]` to `[5]` in the editor immediately shows a card formatted exactly as `Section X, Act` on line 1, and `Description` below it.
3. **True Nested Dropdown Tree**: The side panel renders Act headers (`IPC ►`). Clicking an Act node expands it to reveal Chapters (`Chapter XVI ►`). Clicking a Chapter reveals Sections (`Section 375 ►`). Clicking a Section reveals the detailed `Explanation` card downward.
4. **Auto-Unfolding Scroll**: Clicking `[1]` in the editor automatically expands `RTI-2005` $\rightarrow$ `Chapter II` $\rightarrow$ `Section 6` in the sidebar and scrolls the expanded Explanation card into view.
5. **Bidirectional Scroll**: Clicking a Section node in the tree expands it and smoothly scrolls the editor to its inline number badge.
6. **Keyboard Controls**: Fully keyboard accessible (Tab to navigate headers, Enter/Space to expand/collapse, Esc to reset).

---

## Metrics

| Metric                          | Value | Notes                                        |
| ------------------------------- | ----- | -------------------------------------------- |
| Components shipped              | 1     | Core `<CitationDrawer />`                    |
| Utility modules written         | 1     | `citation-utils.ts` parser                   |
| Demo sandbox routes created     | 1     | `/draft/sandbox`                             |
| Interactive mock citations      | 5     | Multi-Act nodes representing actual laws     |
| Bidirectional actions validated | 2     | Drawer $\rightarrow$ Editor, Editor $\rightarrow$ Drawer |
| Built successfully              | Yes   | Production Next.js build validated locally   |

---

## Blockers & Status Update

* **Blocker Resolved**: We avoided being blocked by Sohil's ongoing editor construction (`/draft/[id]`) by creating a self-contained `/draft/sandbox` playground. The component is fully modular and exposes clean React callbacks (`onCitationSelect`) and standard element identifiers, making it 100% ready for Sohil to drop into his layout.
* **PageIndex Text Fetching**: The node text API fetches are stubbed for Week 2 per guidelines; they are ready to connect to Week 3's PageIndex query tool.

---

## Next week (Week 3)

* Connect the hover popovers to real PageIndex API fetches so that it loads live legal texts dynamically instead of the mock dictionary.
* Integrate directly with Sohil's editor layout once his `/draft/[id]` routing is merged.
* Implement collapsible tree node expansion directly inside the drawer cards.
