from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber

SNAPSHOT_ID = "CPA-2019_v2019_2026-06-03"
EFFECTIVE_FROM = "2019-08-09"

ROOT = Path(__file__).resolve().parents[3]
SOURCE_PDF = ROOT / "corpus/raw/consumer-protection-act-2019.pdf"
OUTPUT_JSON = ROOT / "corpus/acts/consumer-protection-act/tree.json"

ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]

CHAPTER_META = [
    ("CH-I", "Chapter I — Preliminary", 1, 2),
    ("CH-II", "Chapter II — Consumer Protection Councils", 3, 9),
    ("CH-III", "Chapter III — Central Consumer Protection Authority", 10, 27),
    ("CH-IV", "Chapter IV — Consumer Disputes Redressal Commission", 28, 73),
    ("CH-V", "Chapter V — Mediation", 74, 81),
    ("CH-VI", "Chapter VI — Product Liability", 82, 87),
    ("CH-VII", "Chapter VII — Offences and Penalties", 88, 93),
    ("CH-VIII", "Chapter VIII — Miscellaneous", 94, 107),
]

SECTION_PATTERN = re.compile(
    r"(?m)^\s*(\d+)\.\s+(.*?)(?=^\s*\d+\.\s+|\Z)",
    re.DOTALL,
)


def make_node(
    node_id: str,
    parent_id: str | None,
    node_type: str,
    label: str,
    text: str,
) -> dict:
    return {
        "node_id": node_id,
        "snapshot_id": SNAPSHOT_ID,
        "parent_id": parent_id,
        "node_type": node_type,
        "label": label,
        "text_content": text.strip(),
        "status": "active",
        "effective_from": EFFECTIVE_FROM,
    }


def chapter_for_section(section_num: int) -> tuple[str, str]:
    for ch_id, ch_label, start, end in CHAPTER_META:
        if start <= section_num <= end:
            return ch_id, ch_label
    raise ValueError(f"Section {section_num} outside known chapter ranges")


def extract_body_text(full_text: str) -> str:
    marker = "BE it enacted by Parliament"
    idx = full_text.find(marker)
    if idx == -1:
        raise ValueError("Could not locate operative text start in PDF")
    return full_text[idx:]


def clean_section_text(text: str) -> str:
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

    body = extract_body_text(full_text)
    nodes: list[dict] = []

    nodes.append(
        make_node(
            "CPA-2019",
            None,
            "root",
            "Consumer Protection Act, 2019",
            "",
        )
    )

    for ch_id, ch_label, _, _ in CHAPTER_META:
        nodes.append(
            make_node(
                f"CPA-2019/{ch_id}",
                "CPA-2019",
                "chapter",
                ch_label,
                "",
            )
        )

    sections = SECTION_PATTERN.findall(body)
    seen: set[str] = set()

    for section_number, raw_content in sections:
        sec_num = int(section_number)
        if sec_num < 1 or sec_num > 107:
            continue
        if section_number in seen:
            continue
        seen.add(section_number)

        content = clean_section_text(raw_content)
        if not content:
            continue

        ch_id, _ = chapter_for_section(sec_num)
        sec_id = f"CPA-2019/{ch_id}/S-{section_number}"

        title_line = content.split("\n", 1)[0].strip()
        label = f"Section {section_number}"
        if title_line and len(title_line) < 120:
            label = f"Section {section_number} — {title_line.split('.—')[0]}"

        nodes.append(
            make_node(
                sec_id,
                f"CPA-2019/{ch_id}",
                "section",
                label,
                content,
            )
        )

    section_nodes = [n for n in nodes if n["node_type"] == "section"]
    if len(section_nodes) < 107:
        raise SystemExit(
            f"Expected at least 107 sections, got {len(section_nodes)}. "
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
