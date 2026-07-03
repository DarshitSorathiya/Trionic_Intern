# Information Technology Act, 2000 (`ITA-2000`)

**Source:** [IndiaCode — Act 21 of 2000 (updated)](https://www.indiacode.nic.in/bitstream/123456789/13116/1/it_act_2000_updated.pdf)

**Snapshot ID:** `ITA-2000_v2008_2026-06-03` (post-2008 amendment consolidated text)

**Raw PDF (local, gitignored):** `corpus/raw/it-act-2000.pdf`

## Tree artifact

- `tree.json` — flat PageIndex node list
- Node ID format: `ITA-2000/CH-<ROMAN>/S-<N>` (e.g. `ITA-2000/CH-XII/S-79`)

## Version notes

- Operative text reflects the IT (Amendment) Act, 2008 consolidated PDF from IndiaCode.
- `S.66A` is included with `status: struck_down` (Shreya Singhal v. UOI, 2015).

## Regenerate

```bash
pip install pdfplumber
python packages/pageindex/scripts/parse_itact.py
pnpm --filter @trionic/pageindex validate --tree corpus/acts/it-act/tree.json
```
