import pdfplumber
import json
import re

SNAPSHOT_ID  = "DPDP-2023_v2023_2026-06-12"
SOURCE_PDF   = "corpus/raw/dpdp-act-2023.pdf"
OUTPUT_JSON  = "corpus/acts/dpdp-act-2023/tree.json"

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

def make_node(node_id, parent_id, node_type, label, text):
    return {
        "node_id":        unique_id(node_id),
        "snapshot_id":    SNAPSHOT_ID,
        "parent_id":      parent_id,
        "node_type":      node_type,
        "label":          label,
        "text_content":   text.strip(),
        "status":         "active",
        "effective_from": "2023-08-11"
    }

# Root node
nodes.append(make_node(
    "DPDP-2023", None, "root",
    "Digital Personal Data Protection Act, 2023", ""
))

# Extract full text from PDF
full_text = ""
with pdfplumber.open(SOURCE_PDF) as pdf:
    for page in pdf.pages:
        t = page.extract_text()
        if t:
            full_text += t + "\n"

# Split into chapters
chapter_pattern = re.compile(
    r'CHAPTER\s+([IVXLC]+)\s*\n([^\n]+)', re.IGNORECASE
)
chapters = list(chapter_pattern.finditer(full_text))

for i, ch_match in enumerate(chapters):
    ch_num   = ch_match.group(1).strip()
    ch_title = ch_match.group(2).strip()
    ch_id    = f"DPDP-2023/CH-{ch_num}"

    ch_start = ch_match.end()
    ch_end   = chapters[i + 1].start() if i + 1 < len(chapters) else len(full_text)
    ch_text  = full_text[ch_start:ch_end]

    nodes.append(make_node(
        ch_id, "DPDP-2023", "chapter",
        f"Chapter {ch_num} — {ch_title}", ch_title
    ))

    # Extract sections — only valid section numbers (1-100)
    sec_pattern = re.compile(
        r'(?<!\d)(\d{1,3})\.\s+([A-Z][^\n]{5,80})\n',
        re.DOTALL
    )
    sec_matches = list(sec_pattern.finditer(ch_text))

    for j, sec_match in enumerate(sec_matches):
        sec_num = sec_match.group(1).strip()

        # Skip invalid section numbers (> 100 are parsing artifacts)
        if int(sec_num) > 100:
            continue

        sec_title = sec_match.group(2).strip()
        sec_start = sec_match.end()
        sec_end   = sec_matches[j+1].start() if j+1 < len(sec_matches) else len(ch_text)
        sec_text  = ch_text[sec_start:sec_end].strip()

        # Skip empty sections
        if not sec_text:
            continue

        sec_id = f"DPDP-2023/CH-{ch_num}/S-{sec_num}"

        nodes.append(make_node(
            sec_id, ch_id, "section",
            f"Section {sec_num} — {sec_title}",
            sec_text[:1000]
        ))

        # Extract sub-sections
        subsec_pattern = re.compile(r'\((\d+)\)\s+(.+?)(?=\(\d+\)|\Z)', re.DOTALL)
        seen_ss = set()
        for ss_match in subsec_pattern.finditer(sec_text[:2000]):
            ss_num = ss_match.group(1)
            if ss_num in seen_ss:
                continue
            seen_ss.add(ss_num)
            ss_text = ss_match.group(2).strip()
            if not ss_text:
                continue
            ss_id = f"{sec_id}/SS-{ss_num}"
            nodes.append(make_node(
                ss_id, sec_id, "subsection",
                f"Section {sec_num}({ss_num})",
                ss_text[:500]
            ))

# Write output
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(nodes, f, indent=2, ensure_ascii=False)

sections = [n for n in nodes if n["node_type"] == "section"]
print(f"Done — {len(nodes)} total nodes, {len(sections)} sections → {OUTPUT_JSON}")