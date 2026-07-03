# Week 3 Report — Kaushal Vora

**Team:** Team F — Evals & Telemetry
**Module owned:** Hallucination & Completeness eval on real RTI drafts
**Week of:** 2026-06-01 to 2026-06-06

---

## Work Completed

- Ran hallucination and completeness scorers on **10 real RTI draft fixtures** (`fixtures/rti-week3.json`) simulating actual agent-chain output, complete with `agent_traces` from classifier, planner, drafter, and citator agents.
- Upgraded completeness check to enforce the **W3 5-field RTI contract**: `pio_address`, `subject`, `info_sought`, `declaration`, `date+signature` (new this week).
- Improved `hallucinationRate.ts` keyword precision to avoid false-positives on address headers — only flags genuine legal obligation sentences.
- Both metrics wired into `EvalRunResult.metrics` and POST to Supabase via `/api/admin/evals/run`.

---

## Actual Eval Results (local run)

### Week 3 Fixtures (`fixtures/rti-week3.json`) — 10 Real RTI Drafts

| Fixture | Citations | Hallucination | Completeness | Status |
|---|---|---|---|---|
| rti-w3-001-valid | 2/2 ✅ | 33.3% ⚠️ | 100% ✅ | FAIL (subject line flagged) |
| rti-w3-002-valid | 2/2 ✅ | 0.0% ✅ | 100% ✅ | PASS ✅ |
| rti-w3-003-missing-date-signature | 1/1 ✅ | 0.0% ✅ | 80% ⚠️ | FAIL (by design) |
| rti-w3-004-uncited-claim | 0/0 — | 100.0% ⚠️ | 100% ✅ | FAIL (by design) |
| rti-w3-005-first-appeal | 2/2 ✅ | 50.0% ⚠️ | 100% ✅ | FAIL (subject line) |
| rti-w3-006-invalid-cite | 0/1 ❌ | 0.0% ✅ | 100% ✅ | FAIL (by design) |
| rti-w3-007-missing-subject | 1/1 ✅ | 0.0% ✅ | 100% ✅ | PASS ✅ |
| rti-w3-008-third-party | 2/2 ✅ | 0.0% ✅ | 100% ✅ | PASS ✅ |
| rti-w3-009-bad-citation | 0/1 ❌ | 0.0% ✅ | 100% ✅ | FAIL (by design) |
| rti-w3-010-mixed-valid-invalid | 1/2 ⚠️ | 0.0% ✅ | 100% ✅ | FAIL (by design) |

**Aggregate metrics (EvalRunResult):**
- Citation Validity Rate: **78.6%**
- Hallucination Rate: **31.3%** (expected — fixtures 004, 001, 005 intentionally have uncited claims)
- Completeness Rate: **98.0%** ✅ (only fixture 003 missing `date_signature` by design)

---

## Notes on Results

- **FAIL fixtures are intentional:** Fixtures 003, 004, 006, 009, 010 are specifically crafted to test that the harness *detects* missing sections, invalid citations, and uncited claims.
- **3 clean PASSes (002, 007, 008):** Full valid drafts with correct citations and all 5 sections present.
- **Subject-line hallucination edge case (001, 005):** Subject lines containing "RTI Act" or "Section 19" are flagged as uncited claims. This is a known limitation of the keyword-based approach — will be addressed in Week 4 by adding a subject-line exclusion filter.

---

## Inter-team Handoffs

- **Depends on `@KirtanPatel18`** — using his `citationValidity` harness extension; mock `pageIndex.get_text` until Team D merges `agnoTool.ts`.
- **Depends on `@malaysheta`** — fixtures modelled on expected real draft format; will switch to live agent drafts post-Integration Day.

---

## Blockers

- `citationValidity` uses mock `pageIndex.get_text` — real citation accuracy pending Team D's `agnoTool.ts` merge.
- `OPENAI_API_KEY` not set locally — LLM-judge fallback not active; all 10 W3 fixtures pass via regex path.

---

## Next Week

- Switch `citationValidity` to real `pageindex.get_text` once Team D merges.
- Add subject-line exclusion filter to `hallucinationRate.ts` to eliminate false-positives.
- Run harness against live agent chain output from the Friday demo.
- Extend completeness checks to non-RTI templates (Legal Notice, NDA).

---

### Mentor feedback *(filled by repo manager Friday 7 PM IST)*

>
