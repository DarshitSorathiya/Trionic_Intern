# RFC: PageIndex Trees for Consumer Protection Act 2019 & IT Act 2000

**Author:** Khushi Dadhaniya (`@khushi23DCS017`)
**Team:** D — PageIndex & Corpus
**Lead:** Tirth Dalal (`@tiirth22`)
**Status:** Draft
**Created:** 2026-05-18
**Target merge:** Week 1 Friday

---

## 1. Context & Why This Matters

This RFC covers the design of PageIndex tree structures for two acts assigned to this module:

- **Consumer Protection Act, 2019** (CPA 2019) — a single, consolidated act with no major amendments yet; relatively stable corpus.
- **Information Technology Act, 2000** (IT Act) — a heavily amended act. The IT (Amendment) Act 2008 rewrote large portions; subsequent rules and notifications add further changes. Amendment versioning is the central design challenge here.

Both acts feed the Citator-gatekeeper agent. If a node ID in these trees is wrong, stale, or absent, the Citator will either silently pass a bad citation or wrongly reject a valid one. Both failure modes break the product's core promise.

**Authoritative sources (IndiaCode.nic.in only):**
- CPA 2019: https://www.indiacode.nic.in/handle/123456789/13594
- IT Act 2000: https://www.indiacode.nic.in/handle/123456789/1999
- IT (Amendment) Act 2008: https://www.indiacode.nic.in/handle/123456789/2009

---

## 2. PageIndex Tree Structure

PageIndex represents a document as a tree of named nodes. Each node has:
- A stable, unique `node_id`
- A `text` payload (the actual statutory text)
- A `parent_id` (for hierarchical navigation)
- Metadata (snapshot date, act version, etc.)

### 2.1 Consumer Protection Act 2019 — Tree Design

The CPA 2019 has **8 Chapters** and **107 Sections** with Schedules.

```
CPA2019                                          ← root
├── CPA2019.PREAMBLE
├── CPA2019.CH1                                  ← Chapter I: Preliminary
│   ├── CPA2019.CH1.S1                           ← S.1 Short title, extent, commencement
│   └── CPA2019.CH1.S2                           ← S.2 Definitions (large; split by clause)
│       ├── CPA2019.CH1.S2.CL1                   ← clause (1) "complainant"
│       ├── CPA2019.CH1.S2.CL2                   ← clause (2) "complaint"
│       └── ...                                   ← one leaf per definition clause
├── CPA2019.CH2                                  ← Chapter II: Consumer Protection Councils
│   ├── CPA2019.CH2.S3
│   └── ...
├── CPA2019.CH3                                  ← Chapter III: Consumer Disputes Redressal
│   ├── CPA2019.CH3.S28                          ← District Commission
│   ├── CPA2019.CH3.S29
│   └── ...
├── CPA2019.CH4                                  ← Chapter IV: State Commission
├── CPA2019.CH5                                  ← Chapter V: National Commission
├── CPA2019.CH6                                  ← Chapter VI: Mediation
├── CPA2019.CH7                                  ← Chapter VII: Product Liability
│   ├── CPA2019.CH7.S82                          ← Definitions (product liability)
│   ├── CPA2019.CH7.S83
│   └── ...
├── CPA2019.CH8                                  ← Chapter VIII: Offences and Penalties
└── CPA2019.SCHEDULE1                            ← First Schedule
```

**Splitting rules for CPA 2019:**
- Each **Section** is one node minimum.
- Sections with **sub-sections** get child nodes per sub-section (e.g., `S2.SS1`, `S2.SS2`).
- Definition clauses within S.2 and S.82 get their own leaf nodes — the Drafter needs to cite specific definitions.
- Schedules are leaf nodes under the root.

**Node ID format:** `CPA2019.<CH><N>.<S><N>[.<SS><N>][.<CL><N>]`
Example: `CPA2019.CH1.S2.CL7` → definition of "consumer" under S.2(7).

### 2.2 IT Act 2000 — Tree Design (with amendment versioning)

The IT Act 2000 structure with the 2008 Amendment overlay is the complex case.

```
ITACT                                            ← root (always points to current/latest)
├── ITACT.PREAMBLE
├── ITACT.CH1                                    ← Chapter I: Preliminary
│   ├── ITACT.CH1.S1
│   └── ITACT.CH1.S2                             ← Definitions
│       ├── ITACT.CH1.S2.CL1
│       └── ...
├── ITACT.CH2                                    ← Digital Signatures → Electronic Signatures (post-2008)
├── ITACT.CH3                                    ← Electronic Governance
├── ITACT.CH4                                    ← Attribution, Acknowledgement, Dispatch
├── ITACT.CH5                                    ← Secure Electronic Records and Signatures
├── ITACT.CH6                                    ← Regulation of Certifying Authorities
├── ITACT.CH7                                    ← Electronic Signature Certificates
├── ITACT.CH8                                    ← Duties of Subscribers
├── ITACT.CH9                                    ← Penalties, Compensation and Adjudication
│   ├── ITACT.CH9.S43                            ← Penalty for damage to computer
│   ├── ITACT.CH9.S43A                           ← [INSERTED 2008] Body corporates, sensitive data
│   ├── ITACT.CH9.S44
│   └── ...
├── ITACT.CH10                                   ← Appellate Tribunal
├── ITACT.CH11                                   ← Offences
│   ├── ITACT.CH11.S66                           ← Computer related offences
│   ├── ITACT.CH11.S66A                          ← [INSERTED 2008; STRUCK DOWN 2015 — Shreya Singhal]
│   ├── ITACT.CH11.S66B
│   └── ...
├── ITACT.CH12                                   ← Intermediaries
│   └── ITACT.CH12.S79                           ← Safe harbour [SUBSTITUTED 2008]
├── ITACT.CH13                                   ← Examiner of Electronic Evidence (2008)
├── ITACT.CH14                                   ← Miscellaneous
└── ITACT.SCHEDULE1 ... ITACT.SCHEDULE4
```

---

## 3. Amendment Versioning Strategy for the IT Act

This is the key design decision. The IT Act has three meaningful version states:

| Label | Meaning |
|---|---|
| `v2000` | Original enacted text, IT Act 2000 |
| `v2008` | Post-IT (Amendment) Act 2008 — the operative text today |
| `STRUCK_DOWN` | Sections declared unconstitutional (S.66A — Shreya Singhal v. UOI, 2015) |

### 3.1 Versioned Node IDs

Every node carries a `snapshot_id` in its metadata. The `node_id` itself is version-neutral; the snapshot record captures which version of the text is stored.

```
node_id:      ITACT.CH11.S66A
snapshot_id:  ITACT_v2008_2026-05-01          ← snapshot taken from IndiaCode on this date
status:       STRUCK_DOWN                      ← special flag
struck_down_by: "Shreya Singhal v. UOI, AIR 2015 SC 1523"
effective_from: 2000-10-17
effective_until: 2015-03-24
```

For sections that were **substituted** by the 2008 amendment, we store both versions as separate snapshots under the same `node_id`, differentiated by `snapshot_id`:

```
node_id:      ITACT.CH12.S79
snapshot_id:  ITACT_v2000_2026-05-01          ← original 2000 text
snapshot_id:  ITACT_v2008_2026-05-01          ← substituted 2008 text (DEFAULT for queries)
```

### 3.2 Snapshot ID Format

```
<ACT_CODE>_v<YEAR>_<DATE-PULLED>

Examples:
  CPA2019_v2019_2026-05-01
  ITACT_v2000_2026-05-01
  ITACT_v2008_2026-05-01
```

`DATE-PULLED` is the date the text was fetched from IndiaCode. If IndiaCode updates its authoritative PDF, we pull again and create a new snapshot. The old snapshot is never deleted — archived with `is_current = false`.

### 3.3 Default Query Resolution

When the Drafter or Citator queries a node_id without specifying a version, the resolver returns:
1. The snapshot with `is_current = true` AND `status != STRUCK_DOWN`.
2. If a section is `STRUCK_DOWN`, the resolver returns the node but sets a `warning` field: `"This provision was struck down by the Supreme Court on 2015-03-24. Do not cite as operative law."`
3. The Drafter agent is instructed to never use nodes with `status = STRUCK_DOWN` for legal claims.

### 3.4 New Rules & Notifications

The IT Act has spawned significant subordinate legislation (IT Rules 2021 — Intermediary Guidelines, DPDP Act 2023 overlap, etc.). For v1 scope, these are **excluded** from the tree. A comment in the tree root node will note: `"Subordinate rules (IT Rules 2021, etc.) are out of scope for v1. See corpus/README.md for v2 roadmap."`

---

## 4. Postgres Schema (proposed, for Team B review)

```sql
-- Acts master table
CREATE TABLE acts (
  act_code       TEXT PRIMARY KEY,          -- e.g. 'CPA2019', 'ITACT'
  full_name      TEXT NOT NULL,
  year           INT  NOT NULL,
  source_url     TEXT NOT NULL,             -- IndiaCode canonical URL
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Snapshots: one row per (act_code, version, pull_date)
CREATE TABLE act_snapshots (
  snapshot_id    TEXT PRIMARY KEY,          -- 'ITACT_v2008_2026-05-01'
  act_code       TEXT REFERENCES acts(act_code),
  version_label  TEXT NOT NULL,             -- 'v2000', 'v2008'
  pulled_at      DATE NOT NULL,
  source_url     TEXT NOT NULL,
  is_current     BOOLEAN DEFAULT false,
  notes          TEXT
);

-- PageIndex nodes
CREATE TABLE pageindex_nodes (
  node_id        TEXT NOT NULL,             -- 'ITACT.CH11.S66A'
  snapshot_id    TEXT REFERENCES act_snapshots(snapshot_id),
  parent_id      TEXT,                      -- null for root
  node_type      TEXT NOT NULL,             -- 'root','chapter','section','subsection','clause'
  label          TEXT NOT NULL,             -- human label, e.g. 'Section 66A'
  text_content   TEXT NOT NULL,             -- statutory text
  status         TEXT DEFAULT 'active',     -- 'active' | 'struck_down' | 'repealed'
  struck_down_by TEXT,                      -- citation if struck_down
  effective_from DATE,
  effective_until DATE,
  embedding      VECTOR(1536),              -- pgvector for semantic search
  PRIMARY KEY (node_id, snapshot_id)
);

-- Index for fast subtree queries
CREATE INDEX idx_nodes_parent ON pageindex_nodes(parent_id, snapshot_id);
CREATE INDEX idx_nodes_snapshot ON pageindex_nodes(snapshot_id);
```

RLS note for Team B: `pageindex_nodes` should be readable by all authenticated users (public corpus), but writable only by the ingestion service role.

---

## 5. Ingestion Pipeline (outline)

```
1. Download PDF/HTML from IndiaCode
       │
2. Parse into section/chapter hierarchy (Python, pdfplumber or BeautifulSoup)
       │
3. Assign node_ids following naming convention above
       │
4. Generate snapshot_id (act_code + version_label + today's date)
       │
5. Upsert into act_snapshots + pageindex_nodes
       │
6. Set is_current = true for new snapshot; set previous snapshot's is_current = false
       │
7. Run tree_validator (Tirth Dalal's tool) — rejects if:
       - Any node missing parent (orphan)
       - Any section referenced in the act not present in tree
       - node_id format violation
       │
8. Generate embeddings (via embedding model) → store in embedding column
       │
9. Commit + tag in git: corpus/CPA2019/v2019_2026-05-01/
```

---

## 6. Open Questions (need resolution before coding)

| # | Question | Owner | Needed by |
|---|---|---|---|
| Q1 | Does PageIndex support custom metadata fields (`status`, `struck_down_by`) or do we store these in a separate sidecar table? | Samarth Kachhadiya (tree query API) | Day 2 |
| Q2 | Which embedding model is the LLM Router using for retrieval? Affects vector dimensions in schema. | Yug Gandhi (LLM Router) | Day 3 |
| Q3 | Should S.66A be included in the tree with a `STRUCK_DOWN` flag, or excluded entirely? | Dhruv Lokadiya (PM) + Hitarth Sherathia (Citator) | Day 2 |
| Q4 | IT Rules 2021 / DPDP Act — confirm they are v1 out-of-scope. | Malay Sheta (Planner agent) | Day 2 |

---

## 7. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| IndiaCode PDF parsing is messy (inconsistent formatting) | High | Manually verify section boundaries for first 20 sections; build assertion tests |
| IT Act amendment boundaries are ambiguous in the PDF | Medium | Cross-reference the bare act from IndiaCode HTML view, not just PDF |
| S.66A included by mistake in a valid citation | Low (if Q3 resolved) | `STRUCK_DOWN` flag + Citator instruction; validator rejects drafts citing it |
| Schema change mid-project breaks Citator | Medium | Lock schema after Team B sign-off; use migrations, never manual edits |

---

## 8. Week 1 Deliverables (checklist)

- [ ] This RFC reviewed and approved by Tirth Dalal
- [ ] Q1–Q4 above answered (tagged in issue or Slack)
- [ ] `corpus/CPA2019/` directory scaffolded with `README.md` and source URL
- [ ] `corpus/ITACT/` directory scaffolded with version sub-directories
- [ ] Draft Postgres schema shared with Team B (Om Patel) for RLS review
- [ ] Node ID naming convention documented in `packages/pageindex/README.md`
- [ ] 60-second Demo Day recording showing tree structure diagram

---

## 9. Out of Scope for This RFC

- IT Rules 2021, DPDP Act 2023, and other subordinate legislation
- Case-law retrieval (deferred to v2 per project brief)
- Ingestion pipeline implementation (Week 2 deliverable; this RFC covers design only)

---

*AI-generated draft — not legal advice.*
