import json
import re
import time
import tracemalloc
from pathlib import Path

ACT_CODE = "IPC-1860"
ACT_NAME = "Indian Penal Code, 1860"
SNAPSHOT_ID = "2024-12-01"

BASE_DIR = Path(__file__).resolve().parents[3]

INPUT_FILE = (
    BASE_DIR
    / "corpus"
    / "acts"
    / "ipc"
    / f"snapshot-{SNAPSHOT_ID}"
    / "cleaned-text.md"
)

ARTIFACT_FILE = (
    BASE_DIR
    / "packages"
    / "pageindex"
    / "artifacts"
    / "ipc-tree.json"
)

METRICS_FILE = (
    BASE_DIR
    / "packages"
    / "pageindex"
    / "reports"
    / "ipc-metrics.json"
)

VALIDATION_FILE = (
    BASE_DIR
    / "packages"
    / "pageindex"
    / "reports"
    / "ipc-validation-report.json"
)

SOURCE_URL = "https://www.indiacode.nic.in/"


def normalize_text(text: str) -> str:
    text = re.sub(r"\r", "", text)

    # Remove TOC junk
    text = re.sub(
        r"CONTENTS.*?CHAPTER I",
        "CHAPTER I",
        text,
        flags=re.DOTALL,
    )

    # Normalize whitespace
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)

    return text.strip()


def extract_sections(text: str):
    pattern = re.compile(
        r"\n(?P<number>\d+[A-Z]?)\.\s+(?P<content>.*?)(?=\n\d+[A-Z]?\.\s+|\Z)",
        re.DOTALL,
    )

    matches = pattern.finditer(text)

    sections = []
    seen_sections = set()

    for match in matches:
        section_number = match.group("number").strip()

        # Skip duplicates
        if section_number in seen_sections:
            continue

        seen_sections.add(section_number)

        section_content = normalize_text(
            match.group("content")
        )

        if len(section_content) < 20:
            continue

        lines = [
            line.strip()
            for line in section_content.split("\n")
            if line.strip()
        ]

        combined = " ".join(lines)

        combined = re.sub(r"\s+", " ", combined)

        # Skip chapter junk
        if (
            "chapter" in combined.lower()
            and len(combined) < 80
        ):
            continue

        # Better title/body extraction
        parts = combined.split(".", 1)

        if len(parts) == 2:
            title = parts[0].strip()
            body = parts[1].strip()
        else:
            title = f"Section {section_number}"
            body = combined.strip()

        # Fallback if body too short
        if len(body) < 20:
            body = combined.strip()

        sections.append(
            {
                "section_number": section_number,
                "title": title,
                "text": body,
            }
        )

    return sections


def build_node(section):
    node_id = f"{ACT_CODE}/S-{section['section_number']}"

    return {
        "node_id": node_id,
        "snapshot_id": SNAPSHOT_ID,
        "act_code": ACT_CODE,
        "act_name": ACT_NAME,
        "level": "section",
        "number": section["section_number"],
        "title": section["title"],
        "text": section["text"],
        "parent_id": ACT_CODE,
        "children_ids": [],
        "path": [
            ACT_CODE,
            node_id,
        ],
        "source_url": SOURCE_URL,
    }


def validate_nodes(nodes):
    duplicate_ids = len(nodes) != len(
        set(node["node_id"] for node in nodes)
    )

    empty_titles = [
        node["node_id"]
        for node in nodes
        if not node["title"].strip()
    ]

    empty_text_nodes = [
        node["node_id"]
        for node in nodes
        if not node["text"].strip()
    ]

    return {
        "duplicate_ids_found": duplicate_ids,
        "empty_titles": empty_titles,
        "empty_text_nodes": empty_text_nodes,
        "validated_node_count": len(nodes),
    }


def main():
    tracemalloc.start()

    start_time = time.time()

    raw_text = INPUT_FILE.read_text(
        encoding="utf-8"
    )

    normalized_text = normalize_text(raw_text)

    sections = extract_sections(normalized_text)

    nodes = [
        build_node(section)
        for section in sections
    ]

    ARTIFACT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        ARTIFACT_FILE,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            nodes,
            f,
            indent=2,
            ensure_ascii=False,
        )

    current, peak = tracemalloc.get_traced_memory()

    build_time = round(
        time.time() - start_time,
        2,
    )

    metrics = {
        "snapshot_id": SNAPSHOT_ID,
        "build_time_seconds": build_time,
        "peak_memory_mb": round(
            peak / 1024 / 1024,
            2,
        ),
        "total_nodes": len(nodes),
    }

    with open(
        METRICS_FILE,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(metrics, f, indent=2)

    validation_report = validate_nodes(nodes)

    with open(
        VALIDATION_FILE,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            validation_report,
            f,
            indent=2,
        )

    tracemalloc.stop()

    print("IPC ingestion complete.")
    print(f"Generated nodes: {len(nodes)}")
    print(f"Artifact: {ARTIFACT_FILE}")


if __name__ == "__main__":
    main()