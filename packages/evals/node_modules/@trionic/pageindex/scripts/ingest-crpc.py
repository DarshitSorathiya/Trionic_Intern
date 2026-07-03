import json
import urllib.request
import re
import time
from pathlib import Path

SNAPSHOT_ID = "2026-05-28"

ROOT = Path(__file__).resolve().parents[3]
CORPUS_DIR = ROOT / "corpus" / "acts" / "crpc" / f"snapshot-{SNAPSHOT_ID}"
CLEANED_TEXT_FILE = CORPUS_DIR / "cleaned-text.md"

ARTIFACT_DIR = ROOT / "packages" / "pageindex" / "artifacts"
CRPC_TREE_FILE = ARTIFACT_DIR / "crpc-tree.json"

REPORTS_DIR = ROOT / "packages" / "pageindex" / "reports"
METRICS_FILE = REPORTS_DIR / "crpc-metrics.json"

CHAPTER_TITLES = {
    1: "Preliminary",
    2: "Constitution of Criminal Courts and Offices",
    3: "Power of Courts",
    4: "Powers of Superior Officers of Police and Aid to the Magistrates and the Police",
    5: "Arrest of Persons",
    6: "Processes to Compel Appearance",
    7: "Processes to Compel the Production of Things",
    8: "Security for Keeping the Peace and for Good Behaviour",
    9: "Order for Maintenance of Wives, Children and Parents",
    10: "Maintenance of Public Order and Tranquillity",
    11: "Preventive Action of the Police",
    12: "Information to the Police and their Powers to Investigate",
    13: "Jurisdiction of Criminal Courts in Inquiries and Trials",
    14: "Conditions Requisite for Initiation of Proceedings",
    15: "Complaints to Magistrates"
}

ROMAN_NUMERALS = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
    11: "XI",
    12: "XII",
    13: "XIII",
    14: "XIV",
    15: "XV"
}

def get_base_section(sec_val):
    if isinstance(sec_val, int):
        return sec_val
    sec_str = str(sec_val).strip()
    match = re.match(r"^\d+", sec_str)
    if match:
        return int(match.group(0))
    return 999999

def int_to_roman(num):
    return ROMAN_NUMERALS.get(num, str(num))

def main():
    start_time = time.perf_counter()
    print("Starting CrPC ingestion pipeline...")

    # Step 1: Download JSON data
    url = "https://raw.githubusercontent.com/civictech-India/Indian-Law-Penal-Code-Json/master/crpc.json"
    print(f"Downloading CrPC dataset from {url}...")
    response = urllib.request.urlopen(url)
    all_data = json.loads(response.read().decode('utf-8'))
    print(f"Downloaded {len(all_data)} raw items.")

    # Step 2: Filter the first 200 sections
    filtered_items = []
    for item in all_data:
        sec_num = get_base_section(item.get("section"))
        if sec_num <= 200:
            filtered_items.append(item)

    print(f"Filtered {len(filtered_items)} items for sections 1 to 200.")

    # Step 3: Create corpus folder and cleaned-text.md
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)
    
    markdown_lines = ["# Code of Criminal Procedure, 1973", f"Snapshot: {SNAPSHOT_ID}", ""]
    current_chapter = None
    
    for item in filtered_items:
        ch = item.get("chapter")
        if ch != current_chapter:
            current_chapter = ch
            ch_roman = int_to_roman(ch)
            ch_title = CHAPTER_TITLES.get(ch, f"Chapter {ch_roman}")
            markdown_lines.append(f"\n## CHAPTER {ch_roman}: {ch_title.upper()}\n")
        
        sec_label = str(item.get("section")).strip()
        sec_title = item.get("section_title", "").strip()
        sec_desc = item.get("section_desc", "").strip()
        
        markdown_lines.append(f"### Section {sec_label}: {sec_title}")
        markdown_lines.append(sec_desc)
        markdown_lines.append("")

    CLEANED_TEXT_FILE.write_text("\n".join(markdown_lines), encoding="utf-8")
    print(f"Saved cleaned text to {CLEANED_TEXT_FILE}")

    # Step 4: Build hierarchical tree
    # Act -> Chapter -> Section
    # Node IDs: CRPC-1973/CH-I/S-1
    nodes = []

    act_id = "CRPC-1973"

    # 4.1 Build Act Node (Root)
    act_node = {
        "id": act_id,
        "node_id": act_id,
        "type": "act",
        "level": "act",
        "title": "Code of Criminal Procedure, 1973",
        "snapshot_id": SNAPSHOT_ID,
        "text": "Code of Criminal Procedure, 1973\nAn Act to consolidate and amend the law relating to criminal procedure.",
        "parent_id": None,
        "children": [],  # Will be populated with chapters
        "children_ids": [],
        "path": [act_id],
        "act_code": act_id,
        "act_name": "Code of Criminal Procedure, 1973",
        "number": "1973"
    }
    nodes.append(act_node)

    # 4.3 Group sections by Chapter
    sections_by_chapter = {}
    for item in filtered_items:
        ch = item.get("chapter")
        if ch not in sections_by_chapter:
            sections_by_chapter[ch] = []
        sections_by_chapter[ch].append(item)

    # Sort chapters numerically
    sorted_chapters = sorted(sections_by_chapter.keys())

    for ch in sorted_chapters:
        ch_roman = int_to_roman(ch)
        ch_id = f"{act_id}/CH-{ch_roman}"
        ch_title = CHAPTER_TITLES.get(ch, f"Chapter {ch_roman}")
        
        # Add to act children
        act_node["children"].append(ch_id)
        act_node["children_ids"].append(ch_id)

        # 4.4 Build Chapter Node
        ch_node = {
            "id": ch_id,
            "node_id": ch_id,
            "type": "chapter",
            "level": "chapter",
            "title": f"Chapter {ch_roman} — {ch_title}",
            "snapshot_id": SNAPSHOT_ID,
            "text": f"CHAPTER {ch_roman}\n{ch_title.upper()}",
            "parent_id": act_id,
            "children": [],  # Will be populated with sections
            "children_ids": [],
            "path": [act_id, ch_id],
            "act_code": act_id,
            "act_name": "Code of Criminal Procedure, 1973",
            "number": ch_roman
        }
        nodes.append(ch_node)

        # 4.5 Build Section Nodes for this chapter
        for sec_item in sections_by_chapter[ch]:
            sec_num_str = str(sec_item.get("section")).strip()
            sec_id = f"{ch_id}/S-{sec_num_str}"
            sec_title = sec_item.get("section_title", "").strip()
            sec_desc = sec_item.get("section_desc", "").strip()

            # Add to chapter children
            ch_node["children"].append(sec_id)
            ch_node["children_ids"].append(sec_id)

            sec_node = {
                "id": sec_id,
                "node_id": sec_id,
                "type": "section",
                "level": "section",
                "title": sec_title,
                "snapshot_id": SNAPSHOT_ID,
                "text": f"{sec_num_str}. {sec_title}\n{sec_desc}",
                "parent_id": ch_id,
                "children": [],
                "children_ids": [],
                "path": [act_id, ch_id, sec_id],
                "act_code": act_id,
                "act_name": "Code of Criminal Procedure, 1973",
                "number": sec_num_str
            }
            nodes.append(sec_node)

    # Step 5: Save crpc-tree.json
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    with open(CRPC_TREE_FILE, "w", encoding="utf-8") as f:
        json.dump(nodes, f, indent=2, ensure_ascii=False)
    print(f"Saved CrPC hierarchical tree to {CRPC_TREE_FILE}")

    # Step 6: Save metrics
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    elapsed_time = time.perf_counter() - start_time
    metrics = {
        "snapshot_id": SNAPSHOT_ID,
        "total_nodes": len(nodes),
        "act_nodes": 1,
        "part_nodes": 0,
        "chapter_nodes": len(sorted_chapters),
        "section_nodes": len(filtered_items),
        "build_time_seconds": round(elapsed_time, 4)
    }
    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2, ensure_ascii=False)
    print(f"Saved metrics to {METRICS_FILE}")
    print("Ingestion metrics:", json.dumps(metrics, indent=2))

if __name__ == "__main__":
    main()
