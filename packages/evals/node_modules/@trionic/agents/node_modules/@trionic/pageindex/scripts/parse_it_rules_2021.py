import pdfplumber
import json
import re

SNAPSHOT_ID  = "IT-RULES-2021_v2021_2026-06-12"
SOURCE_PDF   = "corpus/raw/it-rules-2021.pdf"
OUTPUT_JSON  = "corpus/acts/it-intermediary-rules-2021/tree.json"

CROSS_REFS = {
    "2":  "ITACT/CH-1/S-2",
    "3":  "ITACT/CH-12/S-79",
    "4":  "ITACT/CH-12/S-79",
    "4A": "ITACT/CH-12/S-79",
    "7":  "ITACT/CH-9/S-43A",
    "14": "ITACT/CH-12/S-79",
}

nodes = []
seen_ids = set()

def unique_id(node_id):
    if node_id not in seen_ids:
        seen_ids.add(node_id)
        return node_id
    counter = 2
    while f"{node_id}-{counter}" in seen_ids:
        counter += 1
    new_id = f"{node_id}-{counter}"
    seen_ids.add(new_id)
    return new_id

def make_node(node_id, parent_id, node_type, label, text, cross_ref=None):
    node = {
        "node_id":        unique_id(node_id),
        "snapshot_id":    SNAPSHOT_ID,
        "parent_id":      parent_id,
        "node_type":      node_type,
        "label":          label,
        "text_content":   text.strip(),
        "status":         "active",
        "effective_from": "2021-02-25"
    }
    if cross_ref:
        node["cross_ref"] = cross_ref
    return node

# Root node
nodes.append(make_node(
    "IT-RULES-2021", None, "root",
    "Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021",
    ""
))

# Extract full text
full_text = ""
with pdfplumber.open(SOURCE_PDF) as pdf:
    for page in pdf.pages:
        t = page.extract_text()
        if t:
            full_text += t + "\n"

# Match rules
rule_pattern = re.compile(
    r'\n(\d+[A-Z]?)\.\s+([A-Z][^\n]{5,100})\n',
    re.DOTALL
)
rule_matches = list(rule_pattern.finditer(full_text))

for i, match in enumerate(rule_matches):
    rule_num   = match.group(1).strip()
    rule_title = match.group(2).strip()
    rule_start = match.end()
    rule_end   = rule_matches[i+1].start() if i+1 < len(rule_matches) else len(full_text)
    rule_text  = full_text[rule_start:rule_end].strip()
    rule_id    = f"IT-RULES-2021/RULE-{rule_num}"
    cross_ref  = CROSS_REFS.get(rule_num)

    nodes.append(make_node(
        rule_id, "IT-RULES-2021", "rule",
        f"Rule {rule_num} — {rule_title}",
        rule_text[:1000],
        cross_ref
    ))

    # Extract clauses — track seen to avoid duplicates
    clause_pattern = re.compile(
        r'\(([a-z]{1,2})\)\s+(.+?)(?=\([a-z]{1,2}\)|\Z)',
        re.DOTALL
    )
    seen_cl = set()
    for cl_match in clause_pattern.finditer(rule_text[:3000]):
        cl_label = cl_match.group(1)
        if cl_label in seen_cl:
            continue
        seen_cl.add(cl_label)
        cl_text = cl_match.group(2).strip()
        cl_id   = f"{rule_id}/CL-{cl_label.upper()}"
        nodes.append(make_node(
            cl_id, rule_id, "clause",
            f"Rule {rule_num}, clause ({cl_label})",
            cl_text[:500]
        ))

# Write output
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(nodes, f, indent=2, ensure_ascii=False)

rules   = [n for n in nodes if n["node_type"] == "rule"]
clauses = [n for n in nodes if n["node_type"] == "clause"]
print(f"Done — {len(nodes)} total nodes, {len(rules)} rules, {len(clauses)} clauses → {OUTPUT_JSON}")