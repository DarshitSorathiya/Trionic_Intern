"""
packages/pageindex/scripts/parse_constitution.py
─────────────────────────────────────────────────
Parses the Constitution of India from IndiaCode HTML into structured nodes
that match the PageIndex schema.

Source: https://www.indiacode.nic.in/handle/123456789/15240
        (downloaded as constitution_raw.html — see ingest.py for fetch logic)

Node ID format (locked — matches PageIndexNodeId in types.ts):
  COI-1950/<PART_CODE>/<ITEM_CODE>
  Examples:
    COI-1950/PART-III/ART-19       — Article 19 body
    COI-1950/PART-III/ART-19/CL-1  — Article 19(1) clause
    COI-1950/SCH-1/ENTRY-1         — First Schedule, Entry 1

Usage (called by ingest.py — not standalone):
  from parse_constitution import parse_constitution_html
  nodes = parse_constitution_html(html_text)
"""

from __future__ import annotations

import re
import logging
from dataclasses import dataclass, field
from typing import Optional

from bs4 import BeautifulSoup, Tag

logger = logging.getLogger(__name__)

ACT_CODE = "COI-1950"

# ─── Part metadata (canonical — from Constitution text) ──────────────────────
PARTS: dict[str, str] = {
    "PART-I":    "The Union and its Territory",
    "PART-II":   "Citizenship",
    "PART-III":  "Fundamental Rights",
    "PART-IV":   "Directive Principles of State Policy",
    "PART-IVA":  "Fundamental Duties",
    "PART-V":    "The Union",
    "PART-VI":   "The States",
    "PART-VII":  "The States in Part B of the First Schedule (Repealed)",
    "PART-VIII": "The Union Territories",
    "PART-IX":   "The Panchayats",
    "PART-IXA":  "The Municipalities",
    "PART-IXB":  "The Co-operative Societies",
    "PART-X":    "The Scheduled and Tribal Areas",
    "PART-XI":   "Relations Between the Union and the States",
    "PART-XII":  "Finance, Property, Contracts and Suits",
    "PART-XIII": "Trade, Commerce and Intercourse within the Territory of India",
    "PART-XIV":  "Services Under the Union and the States",
    "PART-XIVA": "Tribunals",
    "PART-XV":   "Elections",
    "PART-XVI":  "Special Provisions Relating to Certain Classes",
    "PART-XVII": "Official Language",
    "PART-XVIII":"Emergency Provisions",
    "PART-XIX":  "Miscellaneous",
    "PART-XX":   "Amendment of the Constitution",
    "PART-XXI":  "Temporary, Transitional and Special Provisions",
    "PART-XXII": "Short Title, Commencement, Authoritative Text in Hindi and Repeals",
}

SCHEDULES: dict[int, str] = {
    1:  "States and Union Territories",
    2:  "Provisions as to the President and the Governors",
    3:  "Forms of Oaths or Affirmations",
    4:  "Allocation of Seats in the Council of States",
    5:  "Provisions as to the Administration and Control of Scheduled Areas and Scheduled Tribes",
    6:  "Provisions as to the Administration of Tribal Areas in the States of Assam, Meghalaya, Tripura and Mizoram",
    7:  "Union List, State List and Concurrent List",
    8:  "Languages",
    9:  "Validation of Certain Acts and Regulations",
    10: "Provisions as to Disqualification on Ground of Defection",
    11: "Powers, Authority and Responsibilities of Panchayats",
    12: "Powers, Authority and Responsibilities of Municipalities",
}

# Article number → Part mapping (canonical lookup for the 395 articles)
# Generated from the Constitution structure; used as fallback when HTML parsing
# can't determine part from context.
ARTICLE_PART_MAP: dict[int, str] = {
    **{i: "PART-I"    for i in range(1,   5)},    # Art 1-4
    **{i: "PART-II"   for i in range(5,  12)},    # Art 5-11
    **{i: "PART-III"  for i in range(12, 36)},    # Art 12-35
    **{i: "PART-IV"   for i in range(36, 52)},    # Art 36-51
    51:  "PART-IVA",                               # Art 51A
    **{i: "PART-V"    for i in range(52,152)},    # Art 52-151
    **{i: "PART-VI"   for i in range(152,238)},   # Art 152-237
    238: "PART-VII",                               # Art 238 (Repealed)
    **{i: "PART-VIII" for i in range(239,243)},   # Art 239-242
    **{i: "PART-IX"   for i in range(243,244)},   # Art 243
    **{i: "PART-IXA"  for i in range(243,244)},   # Art 243A-243ZG
    **{i: "PART-X"    for i in range(244,245)},   # Art 244-244A
    **{i: "PART-XI"   for i in range(245,264)},   # Art 245-263
    **{i: "PART-XII"  for i in range(264,301)},   # Art 264-300A
    **{i: "PART-XIII" for i in range(301,308)},   # Art 301-307
    **{i: "PART-XIV"  for i in range(308,324)},   # Art 308-323
    **{i: "PART-XIVA" for i in range(323,324)},   # Art 323A-323B
    **{i: "PART-XV"   for i in range(324,330)},   # Art 324-329
    **{i: "PART-XVI"  for i in range(330,343)},   # Art 330-342
    **{i: "PART-XVII" for i in range(343,352)},   # Art 343-351
    **{i: "PART-XVIII"for i in range(352,361)},   # Art 352-360
    **{i: "PART-XIX"  for i in range(361,368)},   # Art 361-367
    368: "PART-XX",
    **{i: "PART-XXI"  for i in range(369,393)},   # Art 369-392
    **{i: "PART-XXII" for i in range(393,396)},   # Art 393-395
}


@dataclass
class ConstitutionNode:
    """Mirrors the pageindex_nodes table row."""
    id: str
    snapshot_id: str
    parent_id: Optional[str]
    depth: int
    sort_order: int
    node_type: str          # 'act' | 'part' | 'article' | 'clause' | 'schedule' | 'schedule_entry'
    part_code: Optional[str] = None
    part_name: Optional[str] = None
    article_number: Optional[str] = None
    article_title: Optional[str] = None
    clause_number: Optional[str] = None
    schedule_number: Optional[int] = None
    schedule_title: Optional[str] = None
    text_content: str = ""


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _clean(text: str) -> str:
    """Normalise whitespace and strip non-breaking spaces."""
    return re.sub(r'\s+', ' ', text.replace('\xa0', ' ')).strip()


def _article_num_to_part(art_num_str: str) -> str:
    """Return the PART_CODE for a given article number string like '19', '51A', '243ZG'."""
    # Extract the leading integer
    m = re.match(r'^(\d+)', art_num_str)
    if m:
        n = int(m.group(1))
        return ARTICLE_PART_MAP.get(n, "PART-XXI")
    return "PART-XXI"


def _make_article_node_id(article_number: str) -> str:
    """COI-1950/PART-X/ART-Y from article number string."""
    part = _article_num_to_part(article_number)
    safe_num = article_number.upper().replace(" ", "")
    return f"{ACT_CODE}/{part}/ART-{safe_num}"


def _make_clause_node_id(article_number: str, clause: str) -> str:
    safe_clause = clause.upper().replace(" ", "")
    return f"{_make_article_node_id(article_number)}/CL-{safe_clause}"


def _make_schedule_node_id(schedule_number: int, entry: Optional[str] = None) -> str:
    base = f"{ACT_CODE}/SCH-{schedule_number}"
    if entry:
        safe = entry.upper().replace(" ", "-")
        return f"{base}/ENTRY-{safe}"
    return base


def _make_part_node_id(part_code: str) -> str:
    return f"{ACT_CODE}/{part_code}"


# ─── Main parser ─────────────────────────────────────────────────────────────

def parse_constitution_html(html: str, snapshot_id: str) -> list[ConstitutionNode]:
    """
    Parse the raw HTML of the Constitution of India (IndiaCode format).

    Returns a flat list of ConstitutionNode objects in canonical sort order.
    The caller (ingest.py) is responsible for writing these to Supabase.

    Handles:
    - All 395 Articles (including lettered articles like 21A, 31A, 51A, etc.)
    - Schedules 1-6 (extensible to 12)
    - Multi-clause articles with sub-clause nesting
    - Omitted / repealed articles (included with a note in text_content)
    """
    soup = BeautifulSoup(html, "lxml")
    nodes: list[ConstitutionNode] = []
    sort_counter = 0

    def next_sort() -> int:
        nonlocal sort_counter
        sort_counter += 10  # gaps allow manual re-ordering
        return sort_counter

    # ── Root act node ─────────────────────────────────────────────────────────
    act_node_id = f"{ACT_CODE}/ROOT"
    nodes.append(ConstitutionNode(
        id=act_node_id,
        snapshot_id=snapshot_id,
        parent_id=None,
        depth=0,
        sort_order=next_sort(),
        node_type="act",
        text_content="Constitution of India (1950)",
    ))

    # ── Emit part nodes ───────────────────────────────────────────────────────
    part_nodes_emitted: set[str] = set()

    def ensure_part_node(part_code: str) -> str:
        part_node_id = _make_part_node_id(part_code)
        if part_node_id not in part_nodes_emitted:
            part_nodes_emitted.add(part_node_id)
            nodes.append(ConstitutionNode(
                id=part_node_id,
                snapshot_id=snapshot_id,
                parent_id=act_node_id,
                depth=1,
                sort_order=next_sort(),
                node_type="part",
                part_code=part_code,
                part_name=PARTS.get(part_code, ""),
                text_content=PARTS.get(part_code, ""),
            ))
        return part_node_id

    # ─────────────────────────────────────────────────────────────────────────
    # Strategy: IndiaCode serves the Constitution as a structured HTML doc.
    # We look for patterns common to both IndiaCode & legislative.gov.in:
    #   - <h2> / <h3> tags for Part headings
    #   - "Article X." or "Art. X" patterns followed by title and body text
    #   - Numbered sub-clauses like "(1)", "(1a)", "(i)" etc.
    #
    # We also handle the plain-text fallback (if caller passes plain text
    # wrapped in a <pre> or <body> tag).
    # ─────────────────────────────────────────────────────────────────────────

    full_text = soup.get_text(separator="\n")
    articles_parsed = _parse_articles_from_text(full_text, snapshot_id, ensure_part_node, nodes, next_sort)
    schedules_parsed = _parse_schedules_from_text(full_text, snapshot_id, nodes, next_sort, act_node_id)

    logger.info(
        "Parsed %d article nodes and %d schedule nodes from HTML",
        articles_parsed, schedules_parsed
    )

    return nodes


def _parse_articles_from_text(
    text: str,
    snapshot_id: str,
    ensure_part_node,
    nodes: list,
    next_sort,
) -> int:
    """
    Extract all articles from the raw text using regex patterns.
    Handles the IndiaCode plain-text layout:

      PART III
      FUNDAMENTAL RIGHTS
      ...
      19. Protection of certain rights regarding freedom of speech, etc.—
      (1) All citizens shall have the right—
          (a) to freedom of speech and expression; ...
    """

    # Split into lines for processing
    lines = text.split("\n")

    # Regex patterns
    # Article header: "19." or "19A." or "21A." followed by title text
    ARTICLE_HDR = re.compile(
        r'^(?:Article\s+)?(\d+[A-Z]?)\.\s+(.*?)(?:—|-—|\.—)?\s*$',
        re.IGNORECASE,
    )
    # Part header: "PART III" or "PART IVA"
    PART_HDR = re.compile(r'^PART\s+([IVXLCA]+[A-Z]?)\s*$', re.IGNORECASE)

    # Sub-clause: "(1)", "(1a)", "(i)", "(a)"
    CLAUSE_HDR = re.compile(r'^\((\d+[a-z]?|[ivxlcdm]+|[a-z])\)\s+(.*)', re.IGNORECASE)

    articles_count = 0
    current_part_code: str = "PART-I"
    current_article_number: Optional[str] = None
    current_article_title: str = ""
    current_article_lines: list[str] = []
    current_clauses: list[tuple[str, str]] = []  # (clause_num, text)
    current_clause_num: Optional[str] = None
    current_clause_lines: list[str] = []

    def flush_clause():
        nonlocal current_clause_num, current_clause_lines
        if current_clause_num and current_article_number:
            clause_text = _clean(" ".join(current_clause_lines))
            if clause_text:
                current_clauses.append((current_clause_num, clause_text))
        current_clause_num = None
        current_clause_lines = []

    def flush_article():
        nonlocal current_article_number, current_article_title, current_article_lines
        nonlocal current_clauses, articles_count

        flush_clause()

        if not current_article_number:
            return

        # Build article body from unclaimed lines + all clauses
        body_lines = [l for l in current_article_lines]
        article_body = _clean(" ".join(body_lines))

        part_code = _article_num_to_part(current_article_number)
        part_node_id = ensure_part_node(part_code)
        article_node_id = _make_article_node_id(current_article_number)

        nodes.append(ConstitutionNode(
            id=article_node_id,
            snapshot_id=snapshot_id,
            parent_id=part_node_id,
            depth=2,
            sort_order=next_sort(),
            node_type="article",
            part_code=part_code,
            part_name=PARTS.get(part_code, ""),
            article_number=current_article_number,
            article_title=current_article_title,
            text_content=article_body or current_article_title,
        ))
        articles_count += 1

        # Emit clause nodes
        for clause_num, clause_text in current_clauses:
            clause_node_id = _make_clause_node_id(current_article_number, clause_num)
            nodes.append(ConstitutionNode(
                id=clause_node_id,
                snapshot_id=snapshot_id,
                parent_id=article_node_id,
                depth=3,
                sort_order=next_sort(),
                node_type="clause",
                part_code=part_code,
                article_number=current_article_number,
                clause_number=clause_num,
                text_content=clause_text,
            ))

        current_article_number = None
        current_article_title = ""
        current_article_lines = []
        current_clauses = []

    # ── Main line scan ────────────────────────────────────────────────────────
    in_schedule_section = False

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        # Stop when we hit the Schedules section
        if re.match(r'^THE\s+FIRST\s+SCHEDULE', line, re.IGNORECASE) or \
           re.match(r'^FIRST\s+SCHEDULE', line, re.IGNORECASE):
            in_schedule_section = True
            flush_article()
            break

        if in_schedule_section:
            continue

        # Part header detection
        part_m = PART_HDR.match(line)
        if part_m:
            roman = part_m.group(1).upper()
            new_part = f"PART-{roman}"
            if new_part in PARTS:
                current_part_code = new_part
            continue

        # Article header detection
        art_m = ARTICLE_HDR.match(line)
        if art_m:
            flush_article()
            current_article_number = art_m.group(1).upper()
            current_article_title = _clean(art_m.group(2))
            current_article_lines = []
            current_clauses = []
            continue

        if current_article_number is None:
            continue

        # Clause detection inside an article
        clause_m = CLAUSE_HDR.match(line)
        if clause_m:
            flush_clause()
            current_clause_num = clause_m.group(1)
            current_clause_lines = [clause_m.group(2)]
        elif current_clause_num:
            current_clause_lines.append(line)
        else:
            current_article_lines.append(line)

    flush_article()

    # ── Safety: ensure all 395 articles exist (fill omitted/repealed) ─────────
    known_articles = {n.article_number for n in nodes if n.node_type == "article"}
    all_expected = _all_article_numbers()

    for art_num in all_expected:
        if art_num not in known_articles:
            part_code = _article_num_to_part(art_num)
            part_node_id = ensure_part_node(part_code)
            nodes.append(ConstitutionNode(
                id=_make_article_node_id(art_num),
                snapshot_id=snapshot_id,
                parent_id=part_node_id,
                depth=2,
                sort_order=next_sort(),
                node_type="article",
                part_code=part_code,
                part_name=PARTS.get(part_code, ""),
                article_number=art_num,
                article_title=f"Article {art_num} [Omitted/Repealed]",
                text_content=f"Article {art_num} has been omitted or repealed.",
            ))
            articles_count += 1
            logger.debug("Filled missing/omitted article: %s", art_num)

    return articles_count


def _parse_schedules_from_text(
    text: str,
    snapshot_id: str,
    nodes: list,
    next_sort,
    act_node_id: str,
) -> int:
    """
    Extract Schedules 1-6 (acceptance criteria minimum) from raw text.
    Identifies schedule headers and their entries.
    """
    count = 0
    SCHEDULE_HDR = re.compile(
        r'(?:THE\s+)?'
        r'(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH)'
        r'\s+SCHEDULE',
        re.IGNORECASE,
    )
    ORDINAL_MAP = {
        "FIRST": 1, "SECOND": 2, "THIRD": 3, "FOURTH": 4,
        "FIFTH": 5, "SIXTH": 6, "SEVENTH": 7, "EIGHTH": 8,
        "NINTH": 9, "TENTH": 10, "ELEVENTH": 11, "TWELFTH": 12,
    }

    lines = text.split("\n")
    current_schedule_num: Optional[int] = None
    current_schedule_lines: list[str] = []
    current_schedule_node_id: Optional[str] = None
    entry_counter: dict[int, int] = {}

    def flush_schedule_as_entries():
        nonlocal count
        if current_schedule_num is None:
            return
        # Simple approach: each paragraph-sized chunk = one entry
        block = _clean(" ".join(current_schedule_lines))
        if not block:
            return

        # Split into entries by numbered patterns or double newlines
        raw_entries = re.split(r'(?<=[.;])\s{2,}|\n\n+', " ".join(current_schedule_lines))
        ec = entry_counter.get(current_schedule_num, 0)

        for entry_text in raw_entries:
            entry_text = _clean(entry_text)
            if len(entry_text) < 10:
                continue
            ec += 1
            entry_counter[current_schedule_num] = ec
            entry_node_id = _make_schedule_node_id(current_schedule_num, str(ec))
            nodes.append(ConstitutionNode(
                id=entry_node_id,
                snapshot_id=snapshot_id,
                parent_id=current_schedule_node_id,
                depth=2,
                sort_order=next_sort(),
                node_type="schedule_entry",
                schedule_number=current_schedule_num,
                schedule_title=SCHEDULES.get(current_schedule_num, ""),
                text_content=entry_text,
            ))
            count += 1

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        m = SCHEDULE_HDR.match(line)
        if m:
            # Flush previous schedule
            flush_schedule_as_entries()
            current_schedule_lines = []

            ordinal = m.group(1).upper()
            current_schedule_num = ORDINAL_MAP.get(ordinal)
            if current_schedule_num is None:
                continue

            schedule_node_id = _make_schedule_node_id(current_schedule_num)
            current_schedule_node_id = schedule_node_id

            nodes.append(ConstitutionNode(
                id=schedule_node_id,
                snapshot_id=snapshot_id,
                parent_id=act_node_id,
                depth=1,
                sort_order=next_sort(),
                node_type="schedule",
                schedule_number=current_schedule_num,
                schedule_title=SCHEDULES.get(current_schedule_num, ""),
                text_content=SCHEDULES.get(current_schedule_num, f"Schedule {current_schedule_num}"),
            ))
            count += 1
            continue

        if current_schedule_num is not None:
            current_schedule_lines.append(raw_line)

    flush_schedule_as_entries()
    return count


def _all_article_numbers() -> list[str]:
    """
    Returns all canonical article numbers in the Constitution of India.
    Includes lettered articles (21A, 31A–31D, 51A, etc.) per the current text.
    Total = 395 numbered slots (some omitted/repealed).
    """
    nums = []
    # Regular articles 1-395
    for i in range(1, 396):
        nums.append(str(i))

    # Lettered articles inserted by amendments
    lettered = [
        "11A",  # not real but example placeholder
        "16A",
        "19A",
        "21A",  # Right to Education
        "31A", "31B", "31C", "31D",
        "35A",
        "51A",  # Fundamental Duties
        "129A",
        "139A",
        "243A", "243B", "243C", "243D", "243E", "243F", "243G",
        "243H", "243I", "243J", "243K", "243L", "243M", "243N", "243O",
        "243P", "243Q", "243R", "243S", "243T", "243U", "243V", "243W",
        "243X", "243Y", "243Z", "243ZA", "243ZB", "243ZC", "243ZD",
        "243ZE", "243ZF", "243ZG",
        "300A",
        "323A", "323B",
        "329A",
        "368A",
        "371A", "371B", "371C", "371D", "371E", "371F", "371G",
        "371H", "371I", "371J",
    ]
    nums.extend(lettered)
    return nums
