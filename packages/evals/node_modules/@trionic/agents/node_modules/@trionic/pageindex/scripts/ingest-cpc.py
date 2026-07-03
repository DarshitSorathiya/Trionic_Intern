import json
import urllib.request
import re
import time
import sqlite3
from pathlib import Path
import fitz

SNAPSHOT_ID = "2026-06-11"
ACT_CODE = "CPC-1908"
ACT_NAME = "Code of Civil Procedure, 1908"

ROOT = Path(__file__).resolve().parents[3]
CORPUS_DIR = ROOT / "corpus" / "acts" / "cpc" / f"snapshot-{SNAPSHOT_ID}"
CLEANED_TEXT_FILE = CORPUS_DIR / "cleaned-text.md"

ARTIFACT_DIR = ROOT / "packages" / "pageindex" / "artifacts"
CPC_TREE_FILE = ARTIFACT_DIR / "cpc-tree.json"
CPC_INSERT_SQL = ARTIFACT_DIR / "cpc-insert.sql"
SQLITE_DB_FILE = ARTIFACT_DIR / "cpc.db"

REPORTS_DIR = ROOT / "packages" / "pageindex" / "reports"
METRICS_FILE = REPORTS_DIR / "cpc-metrics.json"

PDF_PATH = ROOT / "packages" / "pageindex" / "cpc.pdf"

# Roman to Integer mapping for Orders
ROMAN_TO_INT = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10,
    "XI": 11, "XII": 12, "XIII": 13, "XIII-A": 13.5, "XIV": 14, "XV": 15, "XV-A": 15.5,
    "XVI": 16, "XVI A": 16.5, "XVII": 17, "XVIII": 18, "XIX": 19, "XX": 20, "XXA": 20.5, "XXI": 21
}

def get_base_section(sec_val):
    if isinstance(sec_val, int):
        return sec_val
    sec_str = str(sec_val).strip().rstrip('.')
    match = re.match(r"^\d+", sec_str)
    if match:
        return int(match.group(0))
    return 999999

def clean_page_text(text):
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        # Filter footnotes and state amendments
        if re.search(r"^\s*\d+\.\s+(Subs\.|Ins\.|Amended|Omitted|The\s+proviso|Vide|See|Act|ibid\.|Rep\.\s+by|Certain\s+words|The\s+provisions)", line, re.IGNORECASE):
            continue
        if re.search(r"^\s*\d+[\s\w]*\.\s*Subs\.\s+by", line, re.IGNORECASE):
            continue
        if "STATE AMENDMENT" in line or "State Amendment" in line:
            continue
        if re.search(r"^\s*(?:The\s+provisions|Certain\s+words|proviso\s+added|Subs\.\s+by|Ins\.\s+by|Omitted\s+by|Amended\s+by)", line, re.IGNORECASE):
            continue
        # Page numbers
        if re.match(r"^\s*\d+\s*$", line):
            continue
        cleaned_lines.append(line)
    return "\n".join(cleaned_lines)

def split_rule_title_body(rule_text):
    clean_txt = re.sub(r"^\s*(?:\d+\[)?\s*\d+[A-Z]?\.\s*", "", rule_text).strip()
    
    # Check for em-dash separator
    dash_match = re.search(r"[\.—]\s*—\s*", clean_txt)
    if dash_match:
        title = clean_txt[:dash_match.start()].strip()
        body = clean_txt[dash_match.end():].strip()
    else:
        # Split by first period followed by spaces, brackets, capital letters, or end of line
        period_match = re.search(r"\.\s*(?=\(|\[|\d+|[A-Z]|\Z)", clean_txt)
        if period_match:
            title = clean_txt[:period_match.start()].strip()
            body = clean_txt[period_match.end():].strip()
        else:
            parts = clean_txt.split(".", 1)
            title = parts[0].strip()
            body = parts[1].strip() if len(parts) > 1 else clean_txt
            
    title = re.sub(r"^\d+\[|\]$", "", title).strip()
    return title, body

def escape_sql_str(val):
    if val is None:
        return "NULL"
    escaped = val.replace("'", "''")
    return f"'{escaped}'"

def main():
    start_time = time.perf_counter()
    print("Starting CPC Ingestion Pipeline...")

    # Step 1: Download & Filter CPC Sections 1-100
    sections_url = "https://raw.githubusercontent.com/civictech-India/Indian-Law-Penal-Code-Json/master/cpc.json"
    print(f"Downloading CPC sections from {sections_url}...")
    req = urllib.request.Request(sections_url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    all_sections_data = json.loads(response.read().decode('utf-8'))
    print(f"Downloaded {len(all_sections_data)} raw section items.")

    filtered_sections = []
    for item in all_sections_data:
        sec_num = get_base_section(item.get("section"))
        if sec_num <= 100:
            filtered_sections.append(item)

    print(f"Filtered {len(filtered_sections)} sections (1 to 100).")

    # Step 2: Download CPC PDF if not local
    if not PDF_PATH.exists():
        pdf_url = "https://www.indiacode.nic.in/bitstream/123456789/2191/1/aA1908-05.pdf"
        print(f"Downloading CPC PDF from {pdf_url}...")
        pdf_req = urllib.request.Request(pdf_url, headers={'User-Agent': 'Mozilla/5.0'})
        urllib.request.urlretrieve(pdf_url, str(PDF_PATH))
        print("Downloaded CPC PDF successfully.")

    # Step 3: Parse PDF for Orders & Rules
    print("Opening CPC PDF for parsing Orders I-XXI...")
    doc = fitz.open(str(PDF_PATH))
    text_content = []
    for p in range(85, 178):
        cleaned = clean_page_text(doc[p].get_text())
        text_content.append(cleaned)

    full_text = "\n".join(text_content)
    full_text = full_text.replace("\r", "")
    full_text = full_text.replace("\ufffd", "—") # Standardize replacement chars

    # Truncate at ORDER XXII
    idx = full_text.find("ORDER XXII")
    if idx != -1:
        full_text = full_text[:idx]

    # Find Order blocks
    order_matches = list(re.finditer(r"(?mi)^\s*(?:[^\w\n]*\d*\[|\*\[|)?\s*(ORDER\s+[IVXLCDM]+(?:\s*-\s*[A-Z]|\s*[A-Z])?)\s*\n\s*(.*?)\s*$", full_text, re.MULTILINE))
    print(f"Found {len(order_matches)} order matches in text.")

    parsed_orders = []
    seen_orders = set()

    for i, m in enumerate(order_matches):
        ord_label = m.group(1).strip()
        ord_title = m.group(2).strip()
        
        # Skip duplicate commercial divisions or already seen orders
        if ord_label in seen_orders:
            continue
        # Skip duplicate commercial divisions like the extra ORDER XI
        if "commercial division" in ord_title.lower() or "commercial dispute" in ord_title.lower():
            continue
            
        seen_orders.add(ord_label)
        
        start = m.end()
        end = order_matches[i+1].start() if i+1 < len(order_matches) else len(full_text)
        ord_body = full_text[start:end].strip()

        # Extract rules for this order
        rule_starts = list(re.finditer(r"(?m)^\s*(?:\d+\[)?\s*(\d+[A-Z]?)\.\s+(.*)", ord_body))
        
        order_rules = []
        seen_rules_nums = {}
        seen_rule_nums_in_order = set()

        for k, r_start in enumerate(rule_starts):
            r_num = r_start.group(1)
            r_title_raw = r_start.group(2).strip()
            
            # Remap ORDER XX OCR merges
            if ord_label == "ORDER XX":
                if r_num == "21":
                    r_num = "1"
                elif r_num == "13":
                    seen_rules_nums["13"] = seen_rules_nums.get("13", 0) + 1
                    if seen_rules_nums["13"] == 1:
                        r_num = "3"
                elif r_num == "14":
                    seen_rules_nums["14"] = seen_rules_nums.get("14", 0) + 1
                    if seen_rules_nums["14"] == 1:
                        r_num = "4"
                elif r_num == "15":
                    seen_rules_nums["15"] = seen_rules_nums.get("15", 0) + 1
                    if seen_rules_nums["15"] == 1:
                        r_num = "5"
            
            # Avoid duplicate rules due to footnote leakage or state amendments
            if r_num in seen_rule_nums_in_order:
                continue
            seen_rule_nums_in_order.add(r_num)

            r_text_start = r_start.start()
            r_text_end = rule_starts[k+1].start() if k+1 < len(rule_starts) else len(ord_body)
            r_text = ord_body[r_text_start:r_text_end].strip()

            rule_title, rule_body = split_rule_title_body(r_text)
            order_rules.append((r_num, rule_title, rule_body))

        # Check if Roman numeral exists in mapping
        roman_only = ord_label.replace("ORDER ", "").strip()
        if roman_only in ROMAN_TO_INT:
            parsed_orders.append({
                "roman": roman_only,
                "title": ord_title,
                "rules": order_rules
            })

    print(f"Parsed {len(parsed_orders)} unique orders.")

    # Step 4: Write Cleaned Text Markdown File
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)
    markdown_lines = ["# Code of Civil Procedure, 1908", f"Snapshot: {SNAPSHOT_ID}", ""]
    
    # Add Sections
    markdown_lines.append("## PART I: SECTIONS 1 TO 100\n")
    for item in filtered_sections:
        sec_num_str = str(item.get("section")).strip().rstrip('.')
        sec_title = " ".join(item.get("title", "").replace("\xa0", " ").split()).strip()
        sec_desc = item.get("description", "").strip()
        markdown_lines.append(f"### Section {sec_num_str}: {sec_title}")
        markdown_lines.append(sec_desc)
        markdown_lines.append("")

    # Add Orders
    markdown_lines.append("\n## PART II: FIRST SCHEDULE — ORDERS I TO XXI\n")
    for ord_item in parsed_orders:
        markdown_lines.append(f"\n### ORDER {ord_item['roman']}: {ord_item['title'].upper()}\n")
        for r_num, r_title, r_body in ord_item["rules"]:
            markdown_lines.append(f"#### Rule {r_num}: {r_title}")
            markdown_lines.append(r_body)
            markdown_lines.append("")

    CLEANED_TEXT_FILE.write_text("\n".join(markdown_lines), encoding="utf-8")
    print(f"Saved cleaned act text to {CLEANED_TEXT_FILE}")

    # Step 5: Build JSON Tree Nodes
    nodes = []

    # Root Node
    act_node = {
        "id": ACT_CODE,
        "node_id": ACT_CODE,
        "type": "act",
        "level": "act",
        "title": "Code of Civil Procedure, 1908",
        "snapshot_id": SNAPSHOT_ID,
        "text": "Code of Civil Procedure, 1908\nAn Act to consolidate and amend the laws relating to the procedure of the Courts of Civil Judicature.",
        "parent_id": None,
        "children": [],
        "children_ids": [],
        "path": [ACT_CODE],
        "act_code": ACT_CODE,
        "act_name": "Code of Civil Procedure, 1908",
        "number": "1908"
    }
    nodes.append(act_node)

    # Section Nodes
    for item in filtered_sections:
        sec_num_str = str(item.get("section")).strip().rstrip('.')
        sec_title = " ".join(item.get("title", "").replace("\xa0", " ").split()).strip()
        sec_desc = item.get("description", "").strip()
        sec_id = f"{ACT_CODE}/S-{sec_num_str}"

        act_node["children"].append(sec_id)
        act_node["children_ids"].append(sec_id)

        sec_node = {
            "id": sec_id,
            "node_id": sec_id,
            "type": "section",
            "level": "section",
            "title": f"Section {sec_num_str} — {sec_title}",
            "snapshot_id": SNAPSHOT_ID,
            "text": f"{sec_num_str}. {sec_title}\n{sec_desc}",
            "parent_id": ACT_CODE,
            "children": [],
            "children_ids": [],
            "path": [ACT_CODE, sec_id],
            "act_code": ACT_CODE,
            "act_name": "Code of Civil Procedure, 1908",
            "number": sec_num_str
        }
        nodes.append(sec_node)

    # Order and Rule Nodes
    for ord_item in parsed_orders:
        roman = ord_item["roman"]
        ord_title = ord_item["title"]
        ord_id = f"{ACT_CODE}/ORD-{roman}"

        act_node["children"].append(ord_id)
        act_node["children_ids"].append(ord_id)

        ord_node = {
            "id": ord_id,
            "node_id": ord_id,
            "type": "chapter",
            "level": "chapter",
            "title": f"Order {roman} — {ord_title}",
            "snapshot_id": SNAPSHOT_ID,
            "text": f"ORDER {roman}\n{ord_title.upper()}",
            "parent_id": ACT_CODE,
            "children": [],
            "children_ids": [],
            "path": [ACT_CODE, ord_id],
            "act_code": ACT_CODE,
            "act_name": "Code of Civil Procedure, 1908",
            "number": roman
        }
        nodes.append(ord_node)

        # Rule Nodes under the Order
        for r_num, r_title, r_body in ord_item["rules"]:
            rule_id = f"{ord_id}/R-{r_num}"
            ord_node["children"].append(rule_id)
            ord_node["children_ids"].append(rule_id)

            rule_node = {
                "id": rule_id,
                "node_id": rule_id,
                "type": "section",
                "level": "section",
                "title": f"Rule {r_num} — {r_title}",
                "snapshot_id": SNAPSHOT_ID,
                "text": f"Rule {r_num}. {r_title}\n{r_body}",
                "parent_id": ord_id,
                "children": [],
                "children_ids": [],
                "path": [ACT_CODE, ord_id, rule_id],
                "act_code": ACT_CODE,
                "act_name": "Code of Civil Procedure, 1908",
                "number": r_num
            }
            nodes.append(rule_node)

    # Save JSON Tree
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    with open(CPC_TREE_FILE, "w", encoding="utf-8") as f:
        json.dump(nodes, f, indent=2, ensure_ascii=False)
    print(f"Saved CPC act tree to {CPC_TREE_FILE}")

    # Step 6: Generate SQL Insertion logic and SQLite db
    print("Generating database population script...")
    sql_lines = [
        "-- SQL Ingestion script for CPC, 1908",
        "-- Target DB: PostgreSQL",
        "",
        "INSERT INTO acts (act_code, full_name, year, source_url) ",
        "VALUES ('CPC-1908', 'Code of Civil Procedure, 1908', 1908, 'https://indiacode.nic.in') ",
        "ON CONFLICT (act_code) DO UPDATE SET full_name = EXCLUDED.full_name;",
        "",
        f"INSERT INTO act_snapshots (snapshot_id, act_code, version_label, pulled_at, source_url, is_current) ",
        f"VALUES ('CPC-1908_{SNAPSHOT_ID}', 'CPC-1908', 'v1', '{SNAPSHOT_ID}', 'https://indiacode.nic.in', true) ",
        f"ON CONFLICT (snapshot_id) DO UPDATE SET is_current = EXCLUDED.is_current;",
        ""
    ]

    for n in nodes:
        parent_val = escape_sql_str(n["parent_id"])
        sql_lines.append(
            f"INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) "
            f"VALUES ("
            f"'{n['node_id']}', "
            f"'CPC-1908_{SNAPSHOT_ID}', "
            f"{parent_val}, "
            f"'{n['type']}', "
            f"{escape_sql_str(n['title'])}, "
            f"{escape_sql_str(n['text'])}"
            f") ON CONFLICT (node_id, snapshot_id) DO UPDATE SET "
            f"text_content = EXCLUDED.text_content, label = EXCLUDED.label;"
        )

    CPC_INSERT_SQL.write_text("\n".join(sql_lines), encoding="utf-8")
    print(f"Generated SQL script saved to {CPC_INSERT_SQL}")

    # SQLite populate
    if SQLITE_DB_FILE.exists():
        SQLITE_DB_FILE.unlink()

    conn = sqlite3.connect(str(SQLITE_DB_FILE))
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE acts (
      act_code       TEXT PRIMARY KEY,
      full_name      TEXT NOT NULL,
      year           INTEGER NOT NULL,
      source_url     TEXT NOT NULL,
      created_at     TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE act_snapshots (
      snapshot_id    TEXT PRIMARY KEY,
      act_code       TEXT REFERENCES acts(act_code),
      version_label  TEXT NOT NULL,
      pulled_at      TEXT NOT NULL,
      source_url     TEXT NOT NULL,
      is_current     BOOLEAN DEFAULT 0,
      notes          TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE pageindex_nodes (
      node_id        TEXT NOT NULL,
      snapshot_id    TEXT REFERENCES act_snapshots(snapshot_id),
      parent_id      TEXT,
      node_type      TEXT NOT NULL,
      label          TEXT NOT NULL,
      text_content   TEXT NOT NULL,
      status         TEXT DEFAULT 'active',
      struck_down_by TEXT,
      effective_from TEXT,
      effective_until TEXT,
      PRIMARY KEY (node_id, snapshot_id)
    );
    """)

    # Populate SQLite database
    cursor.execute(
        "INSERT INTO acts (act_code, full_name, year, source_url) VALUES (?, ?, ?, ?)",
        ("CPC-1908", "Code of Civil Procedure, 1908", 1908, "https://indiacode.nic.in")
    )
    cursor.execute(
        "INSERT INTO act_snapshots (snapshot_id, act_code, version_label, pulled_at, source_url, is_current) VALUES (?, ?, ?, ?, ?, ?)",
        (f"CPC-1908_{SNAPSHOT_ID}", "CPC-1908", "v1", SNAPSHOT_ID, "https://indiacode.nic.in", 1)
    )

    for n in nodes:
        cursor.execute(
            "INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES (?, ?, ?, ?, ?, ?)",
            (n["node_id"], f"CPC-1908_{SNAPSHOT_ID}", n.get("parent_id"), n["type"], n["title"], n["text"])
        )
    
    conn.commit()
    conn.close()
    print(f"SQLite database populated successfully at {SQLITE_DB_FILE}")

    # Metrics
    elapsed_time = time.perf_counter() - start_time
    sec_nodes_count = len([n for n in nodes if n["type"] == "section"])
    ch_nodes_count = len([n for n in nodes if n["type"] == "chapter"])
    metrics = {
        "snapshot_id": SNAPSHOT_ID,
        "total_nodes": len(nodes),
        "act_nodes": 1,
        "part_nodes": 0,
        "chapter_nodes": ch_nodes_count,
        "section_nodes": sec_nodes_count,
        "build_time_seconds": round(elapsed_time, 4)
    }
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print("Saved CPC Ingestion metrics:", json.dumps(metrics, indent=2))

if __name__ == "__main__":
    main()
