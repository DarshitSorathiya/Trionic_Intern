from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber

SNAPSHOT_ID = "ITA-2000_v2008_2026-06-03"
EFFECTIVE_FROM = "2000-10-17"

ROOT = Path(__file__).resolve().parents[3]
SOURCE_PDF = ROOT / "corpus/raw/it-act-2000.pdf"
OUTPUT_JSON = ROOT / "corpus/acts/it-act/tree.json"

CHAPTER_META = [
    ("CH-I", "Chapter I — Preliminary", {1, 2}),
    ("CH-II", "Chapter II — Digital Signature and Electronic Signature", {3}),
    ("CH-III", "Chapter III — Electronic Governance", set(range(4, 11)) | {10}),
    ("CH-IV", "Chapter IV — Attribution, Acknowledgement and Despatch", set(range(11, 14))),
    ("CH-V", "Chapter V — Secure Electronic Records and Signatures", set(range(14, 17))),
    ("CH-VI", "Chapter VI — Regulation of Certifying Authorities", set(range(17, 35))),
    ("CH-VII", "Chapter VII — Electronic Signature Certificates", set(range(35, 40))),
    ("CH-VIII", "Chapter VIII — Duties of Subscribers", set(range(40, 43))),
    ("CH-IX", "Chapter IX — Penalties, Compensation and Adjudication", set(range(43, 48))),
    ("CH-X", "Chapter X — The Appellate Tribunal", set(range(48, 65))),
    ("CH-XI", "Chapter XI — Offences", set(range(65, 79))),
    ("CH-XII", "Chapter XII — Intermediaries (safe harbour)", {79}),
    ("CH-XIIA", "Chapter XIIA — Examiner of Electronic Evidence", set()),
    ("CH-XIII", "Chapter XIII — Miscellaneous", set(range(80, 95))),
]

SECTION_PATTERN = re.compile(
    r"(?m)(?:^|\n)\s*\[?(\d+[A-Z]?)\.\s+(.*?)(?=(?:^|\n)\s*\[?\d+[A-Z]?\.\s+|\Z)",
    re.DOTALL,
)

STRUCK_DOWN = {
    "66A": {
        "status": "struck_down",
        "struck_down_by": "Shreya Singhal v. Union of India, AIR 2015 SC 1523",
        "effective_until": "2015-03-24",
    }
}


def make_node(
    node_id: str,
    parent_id: str | None,
    node_type: str,
    label: str,
    text: str,
    *,
    status: str = "active",
    extra: dict | None = None,
) -> dict:
    node = {
        "node_id": node_id,
        "snapshot_id": SNAPSHOT_ID,
        "parent_id": parent_id,
        "node_type": node_type,
        "label": label,
        "text_content": text.strip(),
        "status": status,
        "effective_from": EFFECTIVE_FROM,
    }
    if extra:
        node.update(extra)
    return node


def section_sort_key(section_id: str) -> tuple[int, str]:
    match = re.match(r"^(\d+)([A-Z]*)$", section_id)
    if not match:
        return (9999, section_id)
    return (int(match.group(1)), match.group(2))


def chapter_for_section(section_id: str) -> tuple[str, str]:
    if section_id == "79A":
        return "CH-XIIA", "Chapter XIIA — Examiner of Electronic Evidence"

    base, _ = section_sort_key(section_id)

    if base == 3:
        return "CH-II", "Chapter II — Digital Signature and Electronic Signature"
    if 4 <= base <= 10 or section_id in {"6A", "7A", "10A"}:
        return "CH-III", "Chapter III — Electronic Governance"
    if 11 <= base <= 13:
        return "CH-IV", "Chapter IV — Attribution, Acknowledgement and Despatch"
    if 14 <= base <= 16:
        return "CH-V", "Chapter V — Secure Electronic Records and Signatures"
    if 17 <= base <= 34:
        return "CH-VI", "Chapter VI — Regulation of Certifying Authorities"
    if 35 <= base <= 39:
        return "CH-VII", "Chapter VII — Electronic Signature Certificates"
    if 40 <= base <= 42 or section_id == "40A":
        return "CH-VIII", "Chapter VIII — Duties of Subscribers"
    if 43 <= base <= 47 or section_id == "43A":
        return "CH-IX", "Chapter IX — Penalties, Compensation and Adjudication"
    if 48 <= base <= 64:
        return "CH-X", "Chapter X — The Appellate Tribunal"
    if 65 <= base <= 78 or section_id in {"77A", "77B"}:
        return "CH-XI", "Chapter XI — Offences"
    if section_id == "79":
        return "CH-XII", "Chapter XII — Intermediaries (safe harbour)"
    if 80 <= base <= 94:
        return "CH-XIII", "Chapter XIII — Miscellaneous"

    raise ValueError(f"Section {section_id} outside known chapter ranges")


def extract_body_text(full_text: str) -> str:
    marker = "BE it enacted by Parliament"
    idx = full_text.find(marker)
    if idx == -1:
        raise ValueError("Could not locate operative text start in PDF")
    return full_text[idx:]


def normalize_body(text: str) -> str:
    """Unwrap IndiaCode bracketed section headers (insertions and struck-down text)."""

    def unwrap(match: re.Match[str]) -> str:
        return f"\n{match.group(1)}. "

    return re.sub(r"\[(\d+[A-Z]?)\.\s+", unwrap, text)


def clean_section_text(text: str) -> str:
    if re.search(r"\[Omitted\.\]", text[:80], re.IGNORECASE):
        return ""
    text = re.sub(r"^\[|\]$", "", text.strip())
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def main() -> None:
    if not SOURCE_PDF.exists():
        raise FileNotFoundError(
            f"Missing source PDF: {SOURCE_PDF}. "
            "Download from IndiaCode into corpus/raw/."
        )

    with pdfplumber.open(SOURCE_PDF) as pdf:
        full_text = "\n".join(
            page.extract_text() or "" for page in pdf.pages
        )

    body = normalize_body(extract_body_text(full_text))
    nodes: list[dict] = []

    nodes.append(
        make_node(
            "ITA-2000",
            None,
            "root",
            "Information Technology Act, 2000",
            "",
        )
    )

    chapter_ids = [
        "CH-I",
        "CH-II",
        "CH-III",
        "CH-IV",
        "CH-V",
        "CH-VI",
        "CH-VII",
        "CH-VIII",
        "CH-IX",
        "CH-X",
        "CH-XI",
        "CH-XII",
        "CH-XIIA",
        "CH-XIII",
    ]
    chapter_labels = {ch_id: label for ch_id, label, _ in CHAPTER_META}
    chapter_labels["CH-XIIA"] = (
        "Chapter XIIA — Examiner of Electronic Evidence"
    )

    for ch_id in chapter_ids:
        nodes.append(
            make_node(
                f"ITA-2000/{ch_id}",
                "ITA-2000",
                "chapter",
                chapter_labels.get(ch_id, ch_id),
                "",
            )
        )

    sections = SECTION_PATTERN.findall(body)
    seen: set[str] = set()

    for section_id, raw_content in sections:
        if section_id in seen:
            continue
        seen.add(section_id)

        content = clean_section_text(raw_content)
        if not content:
            continue

        try:
            ch_id, _ = chapter_for_section(section_id)
        except ValueError:
            continue

        meta = dict(STRUCK_DOWN.get(section_id, {}))
        status = meta.get("status", "active")
        extra = {k: v for k, v in meta.items() if k != "status"}

        sec_node_id = f"ITA-2000/{ch_id}/S-{section_id}"
        title_line = content.split("\n", 1)[0].strip()
        label = f"Section {section_id}"
        if title_line and len(title_line) < 120:
            label = f"Section {section_id} — {title_line.split('.—')[0].split('.-')[0]}"

        nodes.append(
            make_node(
                sec_node_id,
                f"ITA-2000/{ch_id}",
                "section",
                label,
                content,
                status=status,
                extra=extra or None,
            )
        )

    section_nodes = [n for n in nodes if n["node_type"] == "section"]
    if len(section_nodes) < 60:
        raise SystemExit(
            f"Expected at least 60 sections, got {len(section_nodes)}. "
            "Check SECTION_PATTERN against the PDF."
        )

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(nodes, f, indent=2, ensure_ascii=False)

    print(
        f"Done - {len(nodes)} nodes ({len(section_nodes)} sections) -> {OUTPUT_JSON}"
    )


if __name__ == "__main__":
    main()
