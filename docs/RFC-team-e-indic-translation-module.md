# RFC: Team E Indic Translation Module

| Field | Value |
|---|---|
| **Author** | Megh Patel (`@Meghpatel2810`) |
| **Team** | Team E - Indic |
| **Status** | Draft |
| **Created** | 2026-05-21 |
| **Scope** | `packages/translation` |

---

## 1. Summary

This RFC defines the high-level scope and flow for Team E's Indic translation module.

Team E owns the language support layer that helps Trionic Adalat produce Hindi, Gujarati, Marathi, and Tamil legal drafts while preserving legal meaning, glossary terms, and PageIndex citations.

This is an umbrella RFC. It does not replace member-specific RFCs. It only defines the shared module boundary, common decisions, and implementation direction so each language owner can continue with their own detailed work.

---

## 2. Module Scope

Team E owns `packages/translation`.

The module includes:

- shared legal glossary infrastructure;
- Hindi glossary and Hindi translation support;
- Gujarati translation support;
- Marathi translation support;
- Tamil translation support;
- language-specific post-processing;
- Indic translation evaluation fixtures and quality checks;
- handoff contracts with the Translator Agent.

The module does not own:

- the Translator Agent orchestration in `packages/agents`;
- PageIndex tree building;
- citation validation;
- frontend routing or language switcher UI;
- PDF/DOCX export;
- legal advice or legal correctness decisions.

---

## 3. Existing Sub-RFCs

| Area | Owner | Status | Reference |
|---|---|---|---|
| Legal glossary + Hindi seed | Megh Patel | Draft merged | `docs/RFC-indic-legal-glossary.md` |
| Marathi translation pair | Swara Jariwala | Draft merged | `docs/RFC-marathi-translation.md` |
| Tamil pair + Indic eval | Anshul Jangid | Draft merged | `docs/RFC-tamil-indic-eval.md` |
| Gujarati glossary + translation pair | Patel Swar | Draft | `docs/RFC-indic-gujarati-legal-glossary.md` |
| Translator Agent | Team C / Maharshi Patel | Draft merged | `docs/rfcs/RFC-translator-agent.md` |
| Frontend i18n shell | Team A | Draft merged | `docs/RFC-i18n-infrastructure.md` |

Member-specific RFCs may add more detail later without changing this umbrella RFC.

---

## 4. Translation Flow

```text
Reviewed English draft
    |
    v
Extract PageIndex citation node IDs
    |
    v
Team E glossary lookup
    |
    v
Translator Agent translates through LLM Router
    |
    v
Restore / preserve citation markers
    |
    v
Team E language-specific post-processing
    |
    v
Indic quality checks
    |
    v
Final Indic draft for editor/export
```

The English draft remains the source of truth. Indic translation happens after citation validation and reviewer approval.

---

## 5. Shared Decisions

1. **English-first pipeline**  
   The system drafts and validates in English first. Indic output is generated after the English draft passes review.

2. **Glossary-aware translation**  
   Legal terms should be translated using the Team E glossary whenever possible.

3. **PageIndex-linked terminology**  
   Glossary entries should include PageIndex node IDs and snapshot IDs when those sources are known.

4. **Citation markers are protected**  
   Strings such as `[CITE:<node_id>]` must remain machine-readable and unchanged.

5. **JSON-first implementation**  
   Glossaries can start as JSON files in `packages/translation`. A database-backed glossary can be added later.

6. **Language-specific rules stay modular**  
   Hindi, Gujarati, Marathi, and Tamil can each have their own post-processing rules, but they should use the same shared API.

7. **Missing glossary terms should not block early development**  
   Missing terms should be logged or flagged for review. Blocking behavior can be revisited after coverage improves.

---

## 6. Shared Package Shape

The expected package direction is:

```text
packages/translation/
  data/
    glossary.hi.json
    glossary.gu.json
    glossary.mr.json
    glossary.ta.json
  src/
    glossary.ts
    postprocess.ts
    index.ts
```

The exact files may change during implementation, but the package should expose two common capabilities:

```ts
lookupGlossary(input)
postProcessIndicText(language, text)
```

The detailed type contract is defined in `docs/RFC-indic-legal-glossary.md`.

---

## 7. Team Ownership

| Module | Owner | Notes |
|---|---|---|
| Shared glossary infrastructure | Megh Patel | Common schema and lookup path |
| Hindi pair | Megh Patel | First seed language |
| Gujarati pair | Patel Swar | Pending detailed RFC |
| Marathi pair | Swara Jariwala | See Marathi RFC |
| Tamil pair | Anshul Jangid | See Tamil RFC |
| Indic eval support | Anshul Jangid + Team F coordination | Starts with Tamil/eval RFC |

Owners may update their module details through follow-up RFCs or implementation PRs.

---
## 8. Implementation Approach

### Phase 1 — RFC alignment
- Confirm shared scope and ownership.
- Link member-specific RFCs.
- Agree on glossary and post-processing handoff.

### Phase 2 — Package scaffold
- Add `packages/translation` source structure.
- Add glossary JSON files.
- Implement shared lookup and no-op post-processing APIs.

### Phase 3 — Language expansion
- Add Hindi, Gujarati, Marathi, and Tamil glossary entries.
- Add language-specific post-processing where needed.

### Phase 4 — Integration and evaluation
- Integrate with Translator Agent.
- Add fixtures for citation preservation, terminology consistency, and readability.
---

## 9. Cross-Team Dependencies

| Dependency | Team | Why it matters |
|---|---|---|
| Translator Agent | Team C | Calls glossary and post-processing APIs |
| PageIndex node IDs | Team D | Glossary entries should map to source nodes |
| Citation validation | Team C / Citator | Ensures translated drafts preserve citations |
| Frontend i18n/rendering | Team A | Displays Indic text correctly |
| Evals dashboard | Team F | Tracks quality and coverage |
| Supabase schema | Team B | Needed only if glossary moves from JSON to DB |

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Different languages need different rules | Keep post-processing modular per language |
| Glossary entries are incomplete | Start with high-frequency terms and log missing terms |
| LLM changes legal meaning | Use glossary constraints and evaluation fixtures |
| Citation markers get changed | Treat citation markers as protected text |
| Gujarati RFC is not ready yet | Keep Gujarati slot open and allow follow-up RFC |

---

## 11. Open Questions

1. Should the glossary remain JSON-backed for the full internship, or move to Supabase later?
2. What minimum glossary coverage is required before each language is considered ready?
3. Should translated drafts be re-reviewed after translation, or only evaluated through fixtures?
4. Who gives final approval for canonical legal translations in each language?
5. What is the first non-Hindi language to integrate end-to-end?

---

## 12. Acceptance Criteria

- [ ] Team E scope is clearly documented.
- [ ] Existing member RFCs are linked.
- [ ] Translation flow is documented.
- [ ] Shared decisions are recorded.
- [ ] Implementation approach is week-by-week and flexible.
- [ ] Pending language-specific details can be added later without rewriting this RFC.

---

## 13. References

- `PROJECT_BRIEF.md`
- `docs/ARCHITECTURE.md`
- `packages/translation/README.md`
- `docs/RFC-indic-legal-glossary.md`
- `docs/RFC-marathi-translation.md`
- `docs/RFC-tamil-indic-eval.md`
- `docs/rfcs/RFC-translator-agent.md`
- `docs/RFC-i18n-infrastructure.md`
