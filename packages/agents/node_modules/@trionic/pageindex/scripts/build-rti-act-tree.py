from __future__ import annotations

import json
import re
from pathlib import Path

SNAPSHOT_ID = "2026-05-28"

ROOT = Path(__file__).resolve().parents[3]

INPUT_FILE = (
    ROOT
    / "corpus"
    / "acts"
    / "rti-act"
    / f"snapshot-{SNAPSHOT_ID}"
    / "cleaned-text.md"
)

OUTPUT_FILE = (
    ROOT
    / "packages"
    / "pageindex"
    / "artifacts"
    / "rti-act-2005.json"
)

SECTION_PATTERN = re.compile(
    r"(?m)^(\d+)\.\s+(.*?)(?=^\d+\.\s+|\Z)",
    re.DOTALL
)


def load_text():
    return INPUT_FILE.read_text(
        encoding="utf-8"
    )


def get_chapter(section_number: int, chapters: dict):

    if 1 <= section_number <= 2:
        return chapters["CH-I"]

    if 3 <= section_number <= 11:
        return chapters["CH-II"]

    if 12 <= section_number <= 14:
        return chapters["CH-III"]

    if 15 <= section_number <= 18:
        return chapters["CH-IV"]

    if 19 <= section_number <= 23:
        return chapters["CH-V"]

    return chapters["CH-VI"]


def build_tree(text):

    root = {
        "node_id": "RTI-2005",
        "title": "Right to Information Act, 2005",
        "snapshot_id": SNAPSHOT_ID,
        "level": "act",
        "children": []
    }

    chapters = {
        "CH-I": {
            "node_id": "RTI-2005/CH-I",
            "title": "Preliminary",
            "snapshot_id": SNAPSHOT_ID,
            "level": "chapter",
            "parent_id": "RTI-2005",
            "children": []
        },
        "CH-II": {
            "node_id": "RTI-2005/CH-II",
            "title": "Right to Information and Obligations of Public Authorities",
            "snapshot_id": SNAPSHOT_ID,
            "level": "chapter",
            "parent_id": "RTI-2005",
            "children": []
        },
        "CH-III": {
            "node_id": "RTI-2005/CH-III",
            "title": "The Central Information Commission",
            "snapshot_id": SNAPSHOT_ID,
            "level": "chapter",
            "parent_id": "RTI-2005",
            "children": []
        },
        "CH-IV": {
            "node_id": "RTI-2005/CH-IV",
            "title": "The State Information Commission",
            "snapshot_id": SNAPSHOT_ID,
            "level": "chapter",
            "parent_id": "RTI-2005",
            "children": []
        },
        "CH-V": {
            "node_id": "RTI-2005/CH-V",
            "title": "Powers and Functions of the Information Commissions",
            "snapshot_id": SNAPSHOT_ID,
            "level": "chapter",
            "parent_id": "RTI-2005",
            "children": []
        },
        "CH-VI": {
            "node_id": "RTI-2005/CH-VI",
            "title": "Miscellaneous",
            "snapshot_id": SNAPSHOT_ID,
            "level": "chapter",
            "parent_id": "RTI-2005",
            "children": []
        }
    }

    matches = SECTION_PATTERN.findall(text)

    for section_number, body in matches:

        lines = [
            line.strip()
            for line in body.splitlines()
            if line.strip()
        ]

        if not lines:
            continue

        title = lines[0]

        section_text = "\n".join(lines)

        section_num = int(section_number)

        parent_chapter = get_chapter(
            section_num,
            chapters
        )

        keywords = [
            f"section {section_number}",
            title.lower()
        ]

        if section_number == "6":
            keywords.extend([
                "rti application",
                "application format",
                "request for information",
                "how to file rti"
            ])

        parent_chapter["children"].append(
            {
                "node_id": f"{parent_chapter['node_id']}/S-{section_number}",
                "title": title,
                "section_number": section_number,
                "text": section_text,
                "snapshot_id": SNAPSHOT_ID,
                "level": "section",
                "parent_id": parent_chapter["node_id"],
                "retrieval_keywords": keywords
            }
        )

    root["children"] = [
        chapters["CH-I"],
        chapters["CH-II"],
        chapters["CH-III"],
        chapters["CH-IV"],
        chapters["CH-V"],
        chapters["CH-VI"]
    ]

    return root


def main():

    text = load_text()

    tree = build_tree(text)

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            tree,
            f,
            indent=2,
            ensure_ascii=False
        )

    print(
        f"Generated {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()