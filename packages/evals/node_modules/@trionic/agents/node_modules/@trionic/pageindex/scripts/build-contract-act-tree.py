from __future__ import annotations

import json
import re
import time
from pathlib import Path

import psutil

SNAPSHOT_ID = "2026-05-19"

ROOT = Path(__file__).resolve().parents[3]

CORPUS_DIR = (
    ROOT
    / "corpus"
    / "acts"
    / "contract-act"
    / f"snapshot-{SNAPSHOT_ID}"
)

INPUT_FILE = CORPUS_DIR / "cleaned-text.md"

ARTIFACT_FILE = (
    ROOT
    / "packages"
    / "pageindex"
    / "artifacts"
    / "contract-act-tree.json"
)

METRICS_FILE = (
    ROOT
    / "packages"
    / "pageindex"
    / "reports"
    / "contract-act-metrics.json"
)

VALIDATION_FILE = (
    ROOT
    / "packages"
    / "pageindex"
    / "reports"
    / "validation-report.json"
)

SECTION_PATTERN = re.compile(
    r"(?m)^\s*(\d+[A-Z]?)\.\s*(.*?)(?=^\s*\d+[A-Z]?\.\s*|\Z)",
    re.DOTALL,
)


def load_text() -> str:
    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Missing corpus file: {INPUT_FILE}"
        )

    return INPUT_FILE.read_text(encoding="utf-8")


def normalize_text(text: str) -> str:
    text = text.replace("\r", "\n")

    text = re.sub(r"[ \t]+", " ", text)

    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def clean_section_text(text: str) -> str:
    lines = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        if re.fullmatch(r"\d+", line):
            continue

        if line == "SECTIONS":
            continue

        lines.append(line)

    return "\n".join(lines).strip()


def extract_sections(text: str) -> list[dict]:
    matches = SECTION_PATTERN.findall(text)

    parsed_nodes = []

    # Common footnote patterns to filter out footnotes parsed as sections
    footnote_patterns = [
        r"^Subs\b",
        r"^Omitted\b",
        r"^Ins\b",
        r"^For\b",
        r"^The\b",
        r"^See\b",
        r"^C\.?f\.?\b",
        r"^Amended\b",
        r"^This\s+Act\s+has\s+been",
        r"^the\s+Sonthal",
        r"^Panth\s+Piploda",
        r"^It\s+has\s+been\s+declared",
        r"^The\s+Tarai",
        r"^the\s+Districts\s+of",
        r"^Rep\b",
        r"^Gazette\b",
        r"^Chapter\s+and\s+sections\s+of",
        r"^Ss\b",
        r"^S\b",
        r"^As\s+to\b",
        r"^Added\b",
        r"^But\b",
        r"^Paragraph\b",
        r"^Exceptions\b",
    ]

    for section_number, raw_content in matches:
        content = clean_section_text(raw_content)

        if not content:
            continue

        lines = [
            line.strip()
            for line in content.splitlines()
            if line.strip()
        ]

        if not lines:
            continue

        # Check if it matches a footnote pattern
        first_line = lines[0]
        is_footnote = False
        for pattern in footnote_patterns:
            if re.search(pattern, first_line, re.IGNORECASE):
                is_footnote = True
                break
        
        if is_footnote:
            continue

        # Normalise typo section numbers (1151 -> 151, 1161 -> 161)
        if section_number == "1151":
            section_number = "151"
        elif section_number == "1161":
            section_number = "161"

        title = lines[0]

        node = {
            "id": f"contract-act:s{section_number}",
            "type": "section",
            "title": title,
            "snapshot_id": SNAPSHOT_ID,
            "text": content,
            "children": [],
        }

        parsed_nodes.append(node)

    return parsed_nodes


def deduplicate_nodes(nodes: list[dict]) -> list[dict]:
    deduped = {}

    for node in nodes:
        deduped[node["id"]] = node

    return list(deduped.values())


def validate_nodes(nodes: list[dict]) -> dict:
    ids = [node["id"] for node in nodes]

    duplicate_ids_found = len(ids) != len(set(ids))

    empty_titles = [
        node["id"]
        for node in nodes
        if not node["title"].strip()
    ]

    empty_text_nodes = [
        node["id"]
        for node in nodes
        if not node["text"].strip()
    ]

    return {
        "duplicate_ids_found": duplicate_ids_found,
        "empty_titles": empty_titles,
        "empty_text_nodes": empty_text_nodes,
        "validated_node_count": len(nodes),
    }


def write_json(path: Path, payload: dict | list) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as fp:
        json.dump(
            payload,
            fp,
            indent=2,
            ensure_ascii=False,
        )


def build_metrics(
    start_time: float,
    node_count: int,
) -> dict:
    process = psutil.Process()

    build_time = round(
        time.perf_counter() - start_time,
        2,
    )

    peak_memory_mb = round(
        process.memory_info().rss / 1024 / 1024,
        2,
    )

    return {
        "snapshot_id": SNAPSHOT_ID,
        "build_time_seconds": build_time,
        "peak_memory_mb": peak_memory_mb,
        "total_nodes": node_count,
    }


def main() -> None:
    start_time = time.perf_counter()

    raw_text = load_text()

    # Skip Arrangement of Sections
    parts = raw_text.split("ACT NO. 9 OF 1872", 1)
    body_text = parts[1] if len(parts) > 1 else raw_text

    # Strip footnote markers like 1[, 2[
    body_text = re.sub(r"\d+\[", "", body_text)

    normalized_text = normalize_text(body_text)

    nodes = extract_sections(normalized_text)

    nodes = deduplicate_nodes(nodes)

    validation_report = validate_nodes(nodes)

    metrics = build_metrics(
        start_time=start_time,
        node_count=len(nodes),
    )

    write_json(ARTIFACT_FILE, nodes)

    write_json(METRICS_FILE, metrics)

    write_json(VALIDATION_FILE, validation_report)

    print("\nPageIndex build completed.\n")

    print(
        json.dumps(metrics, indent=2)
    )

    print("\nValidation:\n")

    print(
        json.dumps(validation_report, indent=2)
    )

    if nodes:
        print("\nSample node:\n")

        print(
            json.dumps(
                nodes[0],
                indent=2,
                ensure_ascii=False,
            )
        )


if __name__ == "__main__":
    main()