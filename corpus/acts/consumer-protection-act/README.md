# Consumer Protection Act, 2019 (`CPA-2019`)

**Source:** [IndiaCode — Act 35 of 2019](https://www.indiacode.nic.in/bitstream/123456789/16939/1/a2019-35.pdf)

**Snapshot ID:** `CPA-2019_v2019_2026-06-03`

**Raw PDF (local, gitignored):** `corpus/raw/consumer-protection-act-2019.pdf`

## Tree artifact

- `tree.json` — flat PageIndex node list (root → 8 chapters → 107 sections)
- Node ID format: `CPA-2019/CH-<ROMAN>/S-<N>` (e.g. `CPA-2019/CH-IV/S-35`)

## Regenerate

```bash
pip install pdfplumber
python packages/pageindex/scripts/parse_cpa2019.py
pnpm --filter @trionic/pageindex validate --tree corpus/acts/consumer-protection-act/tree.json
```
