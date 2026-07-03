# `corpus/` — Source legal texts

Authoritative Indian legal texts that feed `packages/pageindex` tree builders.

## Team

**Owner:** Team D — PageIndex & Corpus
**Lead:** Tirth Dalal

## Allowed sources only

Corpus content comes from:

1. **IndiaCode.nic.in** — bare acts published by the Government of India.
2. **Constitution of India** — official text from the Ministry of Law.
3. **Gazette of India** — official notifications and amendments.

**No commercial-database scraping.** No proprietary legal databases. No paywalled content.

## Layout

```
corpus/
├── README.md
├── manifest.json           # canonical list of acts, snapshot dates, source URLs
├── acts/
│   ├── ipc/                # raw + cleaned text per act
│   ├── crpc/
│   ├── constitution/
│   ├── contract-act/
│   └── …
└── raw/                    # downloaded source PDFs (gitignored — fetched via scripts)
```

`raw/` is **gitignored** to keep the repo small. Fetch via `packages/pageindex/scripts/fetch-corpus.ts` (Samarth owns).

## Snapshot policy

Every act file lives in a folder named with its snapshot ID:

```
corpus/acts/contract-act/snapshot-2024-12-01/
├── source-url.txt
├── raw-source.pdf.sha256
└── cleaned-text.md
```

When an act is amended, a new snapshot folder is created. The PageIndex tree gets a new version pointing to the new snapshot. Old citations remain valid against their original snapshot.
