
from __future__ import annotations

import json
import re
from pathlib import Path

SNAPSHOT_ID = "2026-06-11"

ROOT = Path(__file__).resolve().parents[3]

INPUT_FILE = (
    ROOT
    / "corpus"
    / "acts"
    / "negotiable_instruments_act"
    / f"snapshot-{SNAPSHOT_ID}"
    / "cleaned-text.md"
)

OUTPUT_FILE = (
    ROOT
    / "packages"
    / "pageindex"
    / "artifacts"
    / "ni-act-tree.json"
)

TARGET_SECTIONS = {
    str(i)
    for i in range(138, 148)
}


def load_text() -> str:
    return INPUT_FILE.read_text(
        encoding="utf-8"
    )


def normalize_text(text: str) -> str:

    text = text.replace(
        "\r",
        "\n"
    )

    text = re.sub(
        r"[ \t]+",
        " ",
        text
    )

    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text
    )

    return text.strip()


def remove_toc(text: str) -> str:
    """
    PDF contains:
      CHAPTER I PRELIMINARY
      ...
      (Arrangement of Sections)

    Then later:

      CHAPTER I PRELIMINARY
      ...
      (Actual Act)

    We want the SECOND occurrence.
    """

    matches = list(
        re.finditer(
            r"CHAPTER\s+I\s*\nPRELIMINARY",
            text,
            re.IGNORECASE
        )
    )

    if len(matches) >= 2:
        return text[
            matches[1].start():
        ]

    return text


SECTION_PATTERN = re.compile(
    r"(?ms)"
    r"^\s*"
    r"(?:\d+\s*\[)?"
    r"(\d+[A-Z]?)"
    r"\.\s*"
    r"(.*?)"
    r"(?=^\s*(?:\d+\s*\[)?\d+[A-Z]?\.\s*|\Z)"
)


def build_tree(text: str):

    root = {
        "node_id": "NI-1881",
        "title": "Negotiable Instruments Act, 1881",
        "snapshot_id": SNAPSHOT_ID,
        "level": "act",
        "children": [],
    }

    text = normalize_text(text)

    text = remove_toc(text)

    matches = SECTION_PATTERN.findall(
        text
    )

    print(
        f"Total parsed sections: {len(matches)}"
    )

    seen = set()

    for (
        section_number,
        body,
    ) in matches:

        if (
            section_number
            not in TARGET_SECTIONS
        ):
            continue

        if (
            section_number
            in seen
        ):
            continue

        body = body.strip()

        # Clean footnote markers like 1[, 4[, 6[ etc.
        body = re.sub(
            r"\d+\[",
            "",
            body
        )
        body = body.replace(
            "']",
            "'"
        )

        lines = [
            line.strip()
            for line in body.splitlines()
            if line.strip()
        ]

        if not lines:
            continue

        # Full joined text
        full_text = "\n".join(lines)

        # Split title from body at em-dash
        dash_match = re.search(
            r"[.]\s*—",
            full_text
        )

        if dash_match:
            # Title is everything up to and including
            # the period before the em-dash
            title = full_text[
                :dash_match.start() + 1
            ].strip()

            # Body text starts after the em-dash
            section_text = full_text[
                dash_match.end():
            ].strip()
        else:
            title = lines[0]
            section_text = full_text

        node = {
            "node_id":
                f"NI-1881/S-{section_number}",

            "title":
                title,

            "section_number":
                section_number,

            "text":
                section_text,

            "snapshot_id":
                SNAPSHOT_ID,

            "level":
                "section",

            "parent_id":
                "NI-1881",

            "retrieval_keywords": [
                f"section {section_number}",
                title.lower(),
                "negotiable instruments act",
            ]
        }

        if section_number == "138":
            node[
                "retrieval_keywords"
            ].extend([
                "cheque bounce",
                "dishonour of cheque",
                "cheque dishonour",
                "ni act 138",
                "legal notice",
            ])

        root["children"].append(
            node
        )

        seen.add(
            section_number
        )

    root["children"].sort(
        key=lambda x:
        int(
            re.match(
                r"\d+",
                x["section_number"]
            ).group()
        )
    )

    return root


def validate(tree):

    expected = {
        str(i)
        for i in range(138, 148)
    }

    found = {
        node["section_number"]
        for node in tree["children"]
    }

    missing = sorted(
        expected - found
    )

    print("\nFound:")
    print(sorted(found))

    if missing:
        print(
            "\nMissing sections:"
        )
        print(missing)
    else:
        print(
            "\nAll sections 138-147 found."
        )


def main():

    text = load_text()

    tree = build_tree(text)

    validate(tree)

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            tree,
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(
        f"\nGenerated {OUTPUT_FILE}"
    )

    if tree["children"]:

        print(
            "\nSection 138 Preview:\n"
        )

        print(
            tree["children"][0]
            ["text"][:1200]
        )


if __name__ == "__main__":
    main()
