# RFC: PageIndex Query API & Agno Tool Wrapper

| Field        | Value                                       |
|--------------|---------------------------------------------|
| **RFC ID**   | RFC-pageindex-query-api                     |
| **Author**   | Samarth Kachhadiya (`@Samarth305`)          |
| **Team**     | Team D — PageIndex & Corpus                 |
| **Status**   | Draft                                       |
| **Created**  | 2026-05-18                                  |
| **Relates to** | `packages/pageindex`, `packages/agents`   |

---

## 1. Summary

This RFC defines the **Tree Query API** for the PageIndex package and the **Agno tool wrapper** that exposes this API to Team C's agents (Drafter, Citator-gatekeeper, Planner).

The query API is the contract between the stored legal trees (built by Team D) and the agent pipeline (built by Team C). Getting this interface right is critical: if the API is wrong, every downstream agent that calls it will silently get the wrong legal text, breaking the citation-or-die guarantee.

---

## 2. Background & Motivation

PageIndex stores Indian legal acts (Constitution, IPC, CrPC, Indian Contract Act, etc.) as **explicit trees** of the form:

```
Act → Part → Chapter → Section → Sub-section → Clause
```

Every node in this tree has a stable `node_id` (e.g., `ICA-1872/CH-VI/S-73`). When the Drafter agent writes a legal claim, it must embed a `[CITE:<node_id>]` marker. The Citator-gatekeeper then resolves that marker by calling this API to confirm the node is real and fetch the authoritative text.

Without a well-defined query API, Team C's agents have no way to:
- Search for which sections of which acts are relevant to a user's request.
- Navigate from a chapter down to its individual sections.
- Retrieve the exact canonical text for a node to verify it against the draft.
- Reconstruct the full structural path of a citation for the export appendix.

---

## 3. Data Model

All types are defined in `packages/shared/src/types.ts` (owned by Team B). This RFC proposes the following additions:

```typescript
/** Stable identifier for a node in the PageIndex tree.
 *  Format: <ACT_CODE>/<LEVEL_CODE>-<NUMBER>
 *  Example: "ICA-1872/CH-VI/S-73"
 */
type PageIndexNodeId = string;

/** The date the act snapshot was ingested. Citations carry this. */
type SnapshotId = string; // e.g., "2024-12-01"

/** The hierarchy level of a node within an act. */
type NodeLevel = "act" | "part" | "chapter" | "section" | "sub_section" | "clause";

/** A single node in the PageIndex tree. */
interface PageIndexNode {
  node_id:       PageIndexNodeId;   // e.g., "ICA-1872/CH-VI/S-73"
  snapshot_id:   SnapshotId;        // e.g., "2024-12-01"
  act_code:      string;            // e.g., "ICA-1872"
  act_name:      string;            // e.g., "Indian Contract Act, 1872"
  level:         NodeLevel;
  number:        string;            // e.g., "73", "VI", "2A"
  title:         string;            // e.g., "Compensation for loss or damage caused by breach of contract"
  text:          string;            // Full canonical text of this node only
  parent_id:     PageIndexNodeId | null;
  children_ids:  PageIndexNodeId[];
  path:          PageIndexNodeId[]; // Root → this node (for breadcrumbs)
  source_url:    string;            // e.g., "https://indiacode.nic.in/..."
}

/** Scope to restrict a search query. */
interface SearchScope {
  act_code?:    string;   // Restrict to a specific act, e.g., "ICA-1872"
  level?:       NodeLevel; // Restrict to a specific hierarchy level
  snapshot_id?: SnapshotId; // Restrict to a specific snapshot
}

/** A single search result from the search() method. */
interface SearchResult {
  node:         PageIndexNode;
  relevance:    number;         // 0.0 – 1.0 score
  match_reason: string;         // Brief human-readable explanation of why this matched
}
```

---

## 4. API Methods

The four methods below form the public interface of `packages/pageindex`. They are implemented in `packages/pageindex/src/query.ts` and exported from `packages/pageindex/src/index.ts`.

---

### 4.1 `search(query, scope?)`

**Purpose:** Find nodes whose text or title matches a natural-language or keyword query. This is the **entry point** for agents — they call this when they don't yet know which specific node_id they need.

```typescript
function search(
  query: string,
  scope?: SearchScope
): Promise<SearchResult[]>
```

**Behaviour:**
- Performs **hybrid BM25 + keyword matching** over node titles and text in the Supabase Postgres table.
- Optionally restricted to a specific `act_code`, `level`, or `snapshot_id` via `scope`.
- Returns results sorted by `relevance` descending, capped at **20 results** per call.
- Never returns nodes from multiple snapshot versions of the same act (always returns the latest snapshot unless `scope.snapshot_id` is specified).

**Example call:**
```typescript
const results = await search("compensation for breach of contract", {
  act_code: "ICA-1872",
  level: "section"
});
// → [{ node: { node_id: "ICA-1872/CH-VI/S-73", title: "Compensation for loss...", ... }, relevance: 0.94, ... }, ...]
```

**Error cases:**
- `query` is empty → throws `InvalidQueryError`
- `scope.act_code` does not exist in the database → returns empty array (no error)

---

### 4.2 `descend(node_id)`

**Purpose:** Given a parent node, return **its immediate children**. Agents use this to browse a tree level-by-level (e.g., "I know I need Chapter VI of the ICA, but which sections are inside it?").

```typescript
function descend(
  node_id: PageIndexNodeId
): Promise<PageIndexNode[]>
```

**Behaviour:**
- Returns all direct children of the given node, ordered by their natural position in the act.
- Only returns child nodes one level deep (not grandchildren).
- Returns an empty array if the node is a leaf (e.g., a clause with no children).

**Example call:**
```typescript
const sections = await descend("ICA-1872/CH-VI");
// → [{ node_id: "ICA-1872/CH-VI/S-73", title: "Compensation...", ... }, ...]
```

**Error cases:**
- `node_id` does not exist → throws `NodeNotFoundError`

---

### 4.3 `get_text(node_id)`

**Purpose:** Retrieve the **exact canonical legal text** of a specific node. This is the method used by the **Citator-gatekeeper agent** to validate that a citation is real and to obtain the authoritative text for export appendices.

```typescript
function get_text(
  node_id: PageIndexNodeId
): Promise<PageIndexNode>
```

**Behaviour:**
- Returns the full `PageIndexNode` object for the given ID, including `text`, `title`, `act_name`, `snapshot_id`, `source_url`, and structural metadata.
- The `text` field contains **only the text of this specific node**, not its descendants.
- The `snapshot_id` is always included so citations can be versioned.

**Example call:**
```typescript
const node = await get_text("ICA-1872/CH-VI/S-73");
// → {
//     node_id: "ICA-1872/CH-VI/S-73",
//     title: "Compensation for loss or damage caused by breach of contract",
//     text: "When a contract has been broken, the party who suffers by such breach...",
//     snapshot_id: "2024-12-01",
//     source_url: "https://indiacode.nic.in/...",
//     ...
//   }
```

**Error cases:**
- `node_id` does not exist → throws `NodeNotFoundError`

---

### 4.4 `expand_path(node_id)`

**Purpose:** Given any node, return its **full ancestor chain** from the act root down to this node. This is used to build the citation path shown in the UI's citation drawer (Team A) and the PDF citation appendix (Team B).

```typescript
function expand_path(
  node_id: PageIndexNodeId
): Promise<PageIndexNode[]>
```

**Behaviour:**
- Returns an ordered array of nodes: `[act_root, ..., parent, this_node]`.
- Each node in the returned array contains its `title` and `node_id` (minimal representation; full `text` is included).
- A root-level node (the act itself) returns an array of length 1 containing just itself.

**Example call:**
```typescript
const path = await expand_path("ICA-1872/CH-VI/S-73");
// → [
//     { node_id: "ICA-1872",        title: "Indian Contract Act, 1872", level: "act" },
//     { node_id: "ICA-1872/CH-VI",  title: "Chapter VI — Of the Consequences...", level: "chapter" },
//     { node_id: "ICA-1872/CH-VI/S-73", title: "Compensation for loss...", level: "section" }
//   ]
```

**Error cases:**
- `node_id` does not exist → throws `NodeNotFoundError`

---

## 5. Error Types

All errors are exported from `packages/pageindex/src/errors.ts`:

```typescript
class PageIndexError extends Error {}

/** Thrown when a node_id is queried but does not exist in the database. */
class NodeNotFoundError extends PageIndexError {
  constructor(node_id: string) {
    super(`PageIndex node not found: "${node_id}"`);
  }
}

/** Thrown when the search() query string is invalid (empty, too long, etc.). */
class InvalidQueryError extends PageIndexError {}
```

---

## 6. Agno Tool Wrapper

**Team C's agents are built with the [Agno](https://docs.agno.com) agent framework (Python).** Agno exposes "tools" to agents by wrapping functions with structured metadata (name, description, input/output schema). The LLM reads these descriptions at runtime to decide when and how to call each tool.

The Agno tool wrapper will be placed at `packages/pageindex/src/agno_tools.py` (Python, since Agno is Python-native). It will call the TypeScript query API via an **internal HTTP endpoint** exposed by the Next.js API routes (Team B will expose `/api/pageindex/*`). This keeps the Python agent layer decoupled from the TypeScript DB layer.

### 6.1 Tool Definitions

```python
from agno.tools import tool
import httpx

PAGEINDEX_BASE_URL = "http://localhost:3000/api/pageindex"  # injected via env var in prod


@tool(
    name="pageindex_search",
    description=(
        "Search the PageIndex tree of Indian legal acts for nodes relevant to a query. "
        "Use this when you need to find which sections of which act apply to a legal situation. "
        "Returns a list of matching nodes with their node_id, title, and text. "
        "Always use node_ids from the results of this tool when citing legal sections."
    ),
)
async def pageindex_search(query: str, act_code: str | None = None) -> list[dict]:
    """
    Args:
        query: Natural language or keyword search string, e.g. 'compensation for breach'.
        act_code: Optional. Restrict search to a specific act, e.g. 'ICA-1872'.

    Returns:
        List of matching PageIndex nodes with node_id, title, text, act_name, relevance.
    """
    params = {"query": query}
    if act_code:
        params["act_code"] = act_code
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{PAGEINDEX_BASE_URL}/search", params=params)
        r.raise_for_status()
        return r.json()["results"]


@tool(
    name="pageindex_descend",
    description=(
        "List the immediate children of a PageIndex node. "
        "Use this to explore a chapter's sections, or a section's sub-sections. "
        "For example: if you have the node_id of a chapter, call this to see all sections in it."
    ),
)
async def pageindex_descend(node_id: str) -> list[dict]:
    """
    Args:
        node_id: The node_id to descend into, e.g. 'ICA-1872/CH-VI'.

    Returns:
        List of immediate child nodes with node_id, title, level.
    """
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{PAGEINDEX_BASE_URL}/descend/{node_id}")
        r.raise_for_status()
        return r.json()["children"]


@tool(
    name="pageindex_get_text",
    description=(
        "Retrieve the exact canonical legal text for a specific PageIndex node by its node_id. "
        "Use this to get the authoritative text before writing a legal claim. "
        "IMPORTANT: you must have obtained the node_id from pageindex_search or pageindex_descend first. "
        "Never guess or construct a node_id yourself."
    ),
)
async def pageindex_get_text(node_id: str) -> dict:
    """
    Args:
        node_id: The exact node_id to retrieve, e.g. 'ICA-1872/CH-VI/S-73'.

    Returns:
        Full PageIndexNode with node_id, title, text, act_name, snapshot_id, source_url.
    """
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{PAGEINDEX_BASE_URL}/node/{node_id}")
        r.raise_for_status()
        return r.json()


@tool(
    name="pageindex_expand_path",
    description=(
        "Return the full structural path from the act root to a specific node. "
        "Use this to build a human-readable citation breadcrumb, e.g. "
        "'Indian Contract Act, 1872 → Chapter VI → Section 73'. "
        "Team A uses this for the Citation Drawer UI and Team B uses it for PDF export."
    ),
)
async def pageindex_expand_path(node_id: str) -> list[dict]:
    """
    Args:
        node_id: The node_id to expand the path for, e.g. 'ICA-1872/CH-VI/S-73'.

    Returns:
        Ordered list from act root → this node. Each item has node_id, title, level.
    """
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{PAGEINDEX_BASE_URL}/path/{node_id}")
        r.raise_for_status()
        return r.json()["path"]
```

### 6.2 How Team C Uses These Tools

Team C registers the four tools above when constructing their agents. Example (Drafter agent):

```python
from agno import Agent
from packages.pageindex.agno_tools import (
    pageindex_search,
    pageindex_descend,
    pageindex_get_text,
    pageindex_expand_path,
)

drafter_agent = Agent(
    name="Drafter",
    model=llm_router.get_model("drafter"),
    tools=[pageindex_search, pageindex_descend, pageindex_get_text, pageindex_expand_path],
    instructions=(
        "You are a legal document drafter. "
        "Before writing any legal claim, you MUST call pageindex_search to find the relevant section, "
        "then call pageindex_get_text to retrieve its exact text. "
        "Every legal claim in your output must be tagged [CITE:<node_id>]. "
        "Never cite a node_id you did not obtain from a pageindex_ tool call in this session."
    ),
)
```

---

## 7. API Route Contract (for Team B)

Team B will expose the following Next.js API routes at `apps/web/app/api/pageindex/`:

| Route | Method | Calls |
|---|---|---|
| `/api/pageindex/search?query=...&act_code=...` | `GET` | `search(query, scope)` |
| `/api/pageindex/descend/[node_id]` | `GET` | `descend(node_id)` |
| `/api/pageindex/node/[node_id]` | `GET` | `get_text(node_id)` |
| `/api/pageindex/path/[node_id]` | `GET` | `expand_path(node_id)` |

All routes return JSON. All routes are **authenticated** (Supabase session required) and covered by RLS. Errors return `{ "error": "<message>", "code": "<ErrorType>" }` with appropriate HTTP status codes (`404` for `NodeNotFoundError`, `400` for `InvalidQueryError`).

---

## 8. Node ID Format Convention

Proposed format to align with how Tirth Dalal's ingestion pipeline names nodes:

```
<ACT_CODE>/<LEVEL_ABBR>-<NUMBER>[/<LEVEL_ABBR>-<NUMBER>...]
```

| Act                              | Code       | Example node_id                |
|----------------------------------|------------|-------------------------------|
| Indian Contract Act, 1872        | `ICA-1872` | `ICA-1872/CH-VI/S-73`        |
| Indian Penal Code, 1860          | `IPC-1860` | `IPC-1860/CH-XX/S-378`       |
| Constitution of India            | `COI`      | `COI/PART-III/ART-19`        |
| CrPC, 1973                       | `CRPC-1973`| `CRPC-1973/CH-XIV/S-154`     |
| Consumer Protection Act, 2019    | `CPA-2019` | `CPA-2019/CH-II/S-35`        |
| Information Technology Act, 2000 | `ITA-2000` | `ITA-2000/CH-XI/S-66A`       |
| RTI Act, 2005                    | `RTI-2005` | `RTI-2005/S-6`               |

> **Note:** The exact format should be confirmed with Tirth Dalal (Team D lead) before ingestion begins, since the tree structure he builds will determine how node IDs are assigned. This RFC proposes the format; Tirth's ingestion PR is the source of truth.

---

## 9. What is NOT in scope for this RFC

- **Ingestion pipeline** — out of scope. Owned by Tirth Dalal.
- **Tree construction / act parsing** — out of scope. Owned by Darshit, Mahi, Aesha, Khushi.
- **Supabase schema** (`pageindex_trees`, `pageindex_nodes` tables) — out of scope. Owned by Team B (Om Patel).
- **Vector/semantic search** — explicitly deferred to v2 per `PROJECT_BRIEF.md`. BM25 + keyword is sufficient for Week 1.
- **Case-law retrieval** — explicitly out of scope for v1.

---

## 10. Open Questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| Q1 | Confirm the node_id format with Tirth Dalal before ingestion starts. | @tiirth22 + @Samarth305 | **Yes** — the ingestion pipeline sets the format |
| Q2 | Does Team B want a separate `/api/pageindex` Next.js route file, or should these be tRPC procedures? | @Om_Patel (Team B lead) | Yes — affects implementation |
| Q3 | Should `search()` use full-text search via Postgres `tsvector` or a simpler `ILIKE`? | @Samarth305 | No — can start with ILIKE, upgrade later |
| Q4 | Maximum number of search results per call — 20 acceptable for Team C? | @Malay_Sheta (Team C lead) | No — can be made configurable |

---

## 11. Acceptance Criteria

This RFC is considered implemented when:

- [ ] `packages/pageindex/src/query.ts` exports all four functions with TypeScript types.
- [ ] `packages/pageindex/src/agno_tools.py` exports all four Agno tools.
- [ ] All four `/api/pageindex/*` routes are live (Team B dependency).
- [ ] `NodeNotFoundError` and `InvalidQueryError` are thrown correctly on bad inputs.
- [ ] Team C can successfully call `pageindex_search` from the Drafter agent in a local integration test.
- [ ] A citation path returned by `expand_path` is shown in the Citation Drawer (Team A dependency — Week 2+).

---

## 12. References

- [PROJECT_BRIEF.md](../PROJECT_BRIEF.md) — full project scope and goals
- [docs/ARCHITECTURE.md](ARCHITECTURE.md) — system diagram showing where PageIndex fits
- [VectifyAI/PageIndex on GitHub](https://github.com/VectifyAI/PageIndex) — the tree-based retrieval library this is modelled on
- [Agno Documentation](https://docs.agno.com) — agent framework used by Team C
- [Conventional Commits](https://www.conventionalcommits.org) — PR title format
- `packages/pageindex/README.md` — team ownership table
