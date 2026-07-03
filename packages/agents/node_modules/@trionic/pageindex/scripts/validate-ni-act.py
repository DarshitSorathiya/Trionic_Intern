
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

ARTIFACT_FILE = (
    ROOT
    / "packages"
    / "pageindex"
    / "artifacts"
    / "ni-act-tree.json"
)

with open(
    ARTIFACT_FILE,
    encoding="utf-8"
) as f:
    tree = json.load(f)

sections = tree["children"]

sample = random.sample(
    sections,
    min(5, len(sections))
)

passed = 0

results = []

for section in sample:

    errors = []

    if not section["node_id"].startswith(
        "NI-1881/S-"
    ):
        errors.append(
            "Invalid node id"
        )

    if not section["title"].strip():
        errors.append(
            "Missing title"
        )

    if not section["text"].strip():
        errors.append(
            "Missing text"
        )

    if (
        section["section_number"]
        not in {
            str(i)
            for i in range(138, 148)
        }
    ):
        errors.append(
            "Invalid section"
        )

    if errors:
        status = "FAIL"
    else:
        status = "PASS"
        passed += 1

    results.append(
        {
            "section":
                section["node_id"],
            "status":
                status,
            "errors":
                errors,
        }
    )

report = {
    "validated_sections":
        len(sample),
    "passed":
        passed,
    "failed":
        len(sample) - passed,
    "results":
        results,
}

report_path = (
    ROOT
    / "packages"
    / "pageindex"
    / "reports"
    / "ni-act-validation.json"
)

report_path.parent.mkdir(
    parents=True,
    exist_ok=True,
)

with open(
    report_path,
    "w",
    encoding="utf-8"
) as f:
    json.dump(
        report,
        f,
        indent=2,
        ensure_ascii=False,
    )

print(
    f"Validated sections: {len(sample)}"
)

print(
    f"Passed: {passed}"
)

print(
    f"Failed: {len(sample)-passed}"
)

if passed == len(sample):
    print("\n5/5 PASS")
