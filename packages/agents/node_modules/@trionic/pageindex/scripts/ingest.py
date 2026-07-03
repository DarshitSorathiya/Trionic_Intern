"""
packages/pageindex/scripts/ingest.py
─────────────────────────────────────
Main ingestion runner for the Constitution of India.

What it does:
  1. Fetches/loads the Constitution HTML (from IndiaCode or local file)
  2. Parses all 395 Articles + Schedules via parse_constitution.py
  3. Generates OpenAI embeddings for each node (batched, cheap)
  4. Upserts everything into Supabase pageindex_nodes
  5. Tags a snapshot and updates pageindex_snapshots.total_nodes
  6. Logs the run to pageindex_ingest_log

Usage:
  # Full ingest from IndiaCode (requires network)
  python ingest.py

  # Ingest from a local HTML file (faster, for re-runs)
  python ingest.py --source local --file ./constitution_raw.html

  # Dry-run (parse + print stats, no DB writes)
  python ingest.py --dry-run

  # Ingest only schedules 1-6 (for testing acceptance criteria)
  python ingest.py --only-schedules 1-6

Environment variables (set in .env or Vercel):
  SUPABASE_URL          — your project URL
  SUPABASE_SERVICE_KEY  — service role key (write access)
  OPENAI_API_KEY        — for text-embedding-3-small

Dependencies:
  pip install supabase openai requests beautifulsoup4 lxml python-dotenv tqdm
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import time
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv

# Local imports
sys.path.insert(0, str(Path(__file__).parent))
from parse_constitution import parse_constitution_html, ConstitutionNode

load_dotenv()

# ─── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ingest")

# ─── Constants ───────────────────────────────────────────────────────────────
ACT_CODE = "COI-1950"
SNAPSHOT_ID = str(date.today())          # "YYYY-MM-DD"
SOURCE_URL = "https://www.indiacode.nic.in/handle/123456789/15240"
EMBED_MODEL = "text-embedding-3-small"  # 1536 dims, cheap
EMBED_BATCH_SIZE = 100                  # OpenAI allows up to 2048 per request
UPSERT_BATCH_SIZE = 50                  # Supabase safe batch size

# Validator spot-check articles (per acceptance criteria)
VALIDATOR_ARTICLES = ["14", "19", "21", "32", "226"]


# ─── Fetch HTML ──────────────────────────────────────────────────────────────

def fetch_constitution_html(source: str = "remote", local_file: Optional[str] = None) -> str:
    """
    Fetch the Constitution of India HTML.

    Two strategies:
      'remote' — download from IndiaCode (primary) or legislative.gov.in (fallback)
      'local'  — read from a pre-downloaded file (faster for re-runs)
    """
    if source == "local" and local_file:
        path = Path(local_file)
        if not path.exists():
            raise FileNotFoundError(f"Local file not found: {local_file}")
        logger.info("Loading from local file: %s", local_file)
        return path.read_text(encoding="utf-8")

    # Remote fetch — try multiple sources
    sources = [
        # IndiaCode — primary source
        "https://www.indiacode.nic.in/bitstream/123456789/15240/5/constitution_of_india.pdf",
        # legislative.gov.in — alternate
        "https://legislative.gov.in/sites/default/files/COI_updated_31072018.pdf",
        # Text version fallback (Wikisource-style)
        "https://raw.githubusercontent.com/devkumar07/constitution-of-india/main/constitution.txt",
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (PageIndex Constitution Ingestor; research@trionic.in)",
        "Accept": "text/html,application/pdf,text/plain,*/*",
    }

    for url in sources:
        try:
            logger.info("Fetching from: %s", url)
            r = requests.get(url, headers=headers, timeout=30)
            r.raise_for_status()
            logger.info("Fetched %d bytes from %s", len(r.content), url)

            if url.endswith(".pdf"):
                return _extract_text_from_pdf_bytes(r.content)
            return r.text

        except Exception as e:
            logger.warning("Failed to fetch %s: %s", url, e)
            continue

    raise RuntimeError(
        "All fetch sources failed. Download the Constitution HTML manually:\n"
        "  curl -o constitution_raw.html 'https://www.indiacode.nic.in/handle/123456789/15240'\n"
        "Then run:  python ingest.py --source local --file constitution_raw.html"
    )


def _extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using pdfminer if available, else pypdf."""
    try:
        import io
        try:
            from pdfminer.high_level import extract_text
            return extract_text(io.BytesIO(pdf_bytes))
        except ImportError:
            pass
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except ImportError:
            pass
        raise ImportError("Install pdfminer.six or pypdf: pip install pdfminer.six")
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {e}") from e


# ─── Embedding ───────────────────────────────────────────────────────────────

def generate_embeddings(
    nodes: list[ConstitutionNode],
    dry_run: bool = False,
) -> dict[str, list[float]]:
    """
    Generate embeddings for all nodes using text-embedding-3-small.
    Returns a dict mapping node_id → embedding vector.

    Text used for embedding = article_title + ": " + text_content (capped at 512 tokens)
    """
    if dry_run:
        logger.info("[DRY-RUN] Skipping embedding generation for %d nodes", len(nodes))
        return {}

    try:
        from openai import OpenAI
    except ImportError:
        logger.warning("openai not installed — skipping embeddings. Run: pip install openai")
        return {}

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY not set — skipping embeddings")
        return {}

    client = OpenAI(api_key=api_key)
    embeddings: dict[str, list[float]] = {}
    errors = 0

    # Only embed leaf nodes (articles + clauses + schedule entries) to save cost
    leaf_nodes = [
        n for n in nodes
        if n.node_type in ("article", "clause", "schedule_entry")
    ]
    logger.info("Generating embeddings for %d leaf nodes (skipping %d structural nodes)",
                len(leaf_nodes), len(nodes) - len(leaf_nodes))

    for i in range(0, len(leaf_nodes), EMBED_BATCH_SIZE):
        batch = leaf_nodes[i : i + EMBED_BATCH_SIZE]
        texts = []
        for n in batch:
            # Build rich embedding text
            parts = []
            if n.article_title:
                parts.append(f"Article {n.article_number}: {n.article_title}")
            elif n.schedule_number:
                parts.append(f"Schedule {n.schedule_number}: {n.schedule_title}")
            parts.append(n.text_content)
            text = " ".join(parts)
            # Truncate to ~512 tokens (rough: 1 token ≈ 4 chars)
            texts.append(text[:2048])

        try:
            response = client.embeddings.create(
                model=EMBED_MODEL,
                input=texts,
                encoding_format="float",
            )
            for node, emb_obj in zip(batch, response.data):
                embeddings[node.id] = emb_obj.embedding

            logger.info(
                "  Embedded batch %d/%d (%d nodes)",
                i // EMBED_BATCH_SIZE + 1,
                (len(leaf_nodes) + EMBED_BATCH_SIZE - 1) // EMBED_BATCH_SIZE,
                len(batch),
            )
        except Exception as e:
            logger.error("Embedding batch %d failed: %s", i // EMBED_BATCH_SIZE + 1, e)
            errors += 1
            if errors > 3:
                logger.warning("Too many embedding errors — continuing without embeddings")
                break

        # Rate limit safety
        time.sleep(0.1)

    logger.info("Generated %d embeddings (%d nodes skipped/failed)", len(embeddings), len(leaf_nodes) - len(embeddings))
    return embeddings


# ─── Supabase upsert ─────────────────────────────────────────────────────────

def get_supabase_client():
    """Return an authenticated Supabase client using service role key."""
    try:
        from supabase import create_client
    except ImportError:
        raise ImportError("Install supabase: pip install supabase")

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise EnvironmentError(
            "Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.\n"
            "See docs/INTERN_ACCESS.md for the Supabase access model."
        )

    return create_client(url, key)


def upsert_snapshot(supabase, snapshot_id: str, total_nodes: int) -> None:
    """Create or update a snapshot row."""
    supabase.table("pageindex_snapshots").upsert({
        "id": snapshot_id,
        "act_code": ACT_CODE,
        "label": f"Constitution of India (as of {snapshot_id})",
        "source_url": SOURCE_URL,
        "total_nodes": total_nodes,
    }).execute()
    logger.info("Snapshot upserted: %s (%d nodes)", snapshot_id, total_nodes)


def upsert_nodes(
    supabase,
    nodes: list[ConstitutionNode],
    embeddings: dict[str, list[float]],
    dry_run: bool = False,
) -> tuple[int, list[dict]]:
    """
    Upsert all nodes into pageindex_nodes in batches.
    Returns (nodes_upserted, errors).
    """
    if dry_run:
        logger.info("[DRY-RUN] Would upsert %d nodes", len(nodes))
        return len(nodes), []

    upserted = 0
    errors = []

    for i in range(0, len(nodes), UPSERT_BATCH_SIZE):
        batch = nodes[i : i + UPSERT_BATCH_SIZE]
        rows = []
        for n in batch:
            row = {
                "id": n.id,
                "snapshot_id": n.snapshot_id,
                "act_code": ACT_CODE,
                "parent_id": n.parent_id,
                "depth": n.depth,
                "sort_order": n.sort_order,
                "node_type": n.node_type,
                "part_code": n.part_code,
                "part_name": n.part_name,
                "article_number": n.article_number,
                "article_title": n.article_title,
                "clause_number": n.clause_number,
                "schedule_number": n.schedule_number,
                "schedule_title": n.schedule_title,
                "text_content": n.text_content,
            }
            # Add embedding if available
            emb = embeddings.get(n.id)
            if emb:
                row["embedding"] = emb
            rows.append(row)

        try:
            supabase.table("pageindex_nodes").upsert(rows).execute()
            upserted += len(batch)
            logger.info(
                "  Upserted batch %d/%d (%d nodes, total: %d)",
                i // UPSERT_BATCH_SIZE + 1,
                (len(nodes) + UPSERT_BATCH_SIZE - 1) // UPSERT_BATCH_SIZE,
                len(batch),
                upserted,
            )
        except Exception as e:
            err = {"batch_start": i, "error": str(e)}
            errors.append(err)
            logger.error("Upsert batch %d failed: %s", i // UPSERT_BATCH_SIZE + 1, e)

    return upserted, errors


def log_run(
    supabase,
    snapshot_id: str,
    status: str,
    nodes_upserted: int,
    nodes_embedded: int,
    errors: list,
    duration_ms: int,
) -> None:
    """Write an ingest audit log row."""
    try:
        supabase.table("pageindex_ingest_log").insert({
            "snapshot_id": snapshot_id,
            "status": status,
            "nodes_upserted": nodes_upserted,
            "nodes_embedded": nodes_embedded,
            "errors": errors,
            "duration_ms": duration_ms,
            "triggered_by": "script",
        }).execute()
    except Exception as e:
        logger.warning("Failed to write ingest log: %s", e)


# ─── Validator spot-check ────────────────────────────────────────────────────

def validate_spot_check(nodes: list[ConstitutionNode]) -> bool:
    """
    Acceptance criteria: spot-check Articles 14, 19, 21, 32, 226.
    Logs a pass/fail for each.
    """
    article_map = {n.article_number: n for n in nodes if n.node_type == "article"}
    all_pass = True

    logger.info("─── Validator spot-check ───────────────────────────────")
    for art_num in VALIDATOR_ARTICLES:
        node = article_map.get(art_num)
        if not node:
            logger.error("  FAIL — Article %s not found", art_num)
            all_pass = False
            continue

        has_text = len(node.text_content.strip()) > 20
        logger.info(
            "  %s — Article %s | title: '%s' | text length: %d chars",
            "PASS" if has_text else "WARN",
            art_num,
            node.article_title[:60] if node.article_title else "n/a",
            len(node.text_content),
        )
        if not has_text:
            all_pass = False

    logger.info("─── Spot-check result: %s ──────────────────────────────", "PASS ✓" if all_pass else "FAIL ✗")
    return all_pass


# ─── Summary stats ───────────────────────────────────────────────────────────

def print_stats(nodes: list[ConstitutionNode]) -> None:
    """Print a breakdown of what was parsed."""
    type_counts: dict[str, int] = {}
    for n in nodes:
        type_counts[n.node_type] = type_counts.get(n.node_type, 0) + 1

    article_nums = sorted(
        {int(n.article_number) for n in nodes
         if n.node_type == "article" and n.article_number and n.article_number.isdigit()},
    )
    schedule_nums = sorted({n.schedule_number for n in nodes if n.schedule_number})

    logger.info("─── Ingest stats ───────────────────────────────────────")
    logger.info("  Total nodes:    %d", len(nodes))
    for t, c in sorted(type_counts.items()):
        logger.info("  %-20s %d", t + ":", c)
    logger.info("  Articles:       %s – %s (numeric)", min(article_nums), max(article_nums))
    logger.info("  Total articles: %d", type_counts.get("article", 0))
    logger.info("  Schedules:      %s", ", ".join(str(s) for s in schedule_nums))
    logger.info("────────────────────────────────────────────────────────")


# ─── Entry point ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Ingest Constitution of India into PageIndex")
    parser.add_argument("--source", choices=["remote", "local"], default="remote")
    parser.add_argument("--file", help="Local HTML/text file path (for --source local)")
    parser.add_argument("--dry-run", action="store_true", help="Parse + print stats; no DB writes")
    parser.add_argument("--skip-embed", action="store_true", help="Skip embedding generation")
    parser.add_argument("--only-schedules", help="Ingest only specific schedules, e.g. '1-6'")
    parser.add_argument("--snapshot-id", default=SNAPSHOT_ID, help="Override snapshot date string")
    args = parser.parse_args()

    snapshot_id = args.snapshot_id
    start_ms = int(time.time() * 1000)

    logger.info("════ PageIndex Constitution Ingest ════")
    logger.info("Snapshot: %s | Dry-run: %s", snapshot_id, args.dry_run)

    # ── Step 1: Fetch HTML ────────────────────────────────────────────────────
    logger.info("[1/5] Fetching Constitution HTML…")
    try:
        html = fetch_constitution_html(source=args.source, local_file=args.file)
    except Exception as e:
        logger.error("Fetch failed: %s", e)
        sys.exit(1)

    # ── Step 2: Parse ─────────────────────────────────────────────────────────
    logger.info("[2/5] Parsing articles and schedules…")
    nodes = parse_constitution_html(html, snapshot_id)

    # Filter to specific schedules if requested
    if args.only_schedules:
        parts = args.only_schedules.split("-")
        start_sch = int(parts[0])
        end_sch = int(parts[-1]) if len(parts) > 1 else start_sch
        allowed_schedules = set(range(start_sch, end_sch + 1))
        nodes = [
            n for n in nodes
            if n.schedule_number is None or n.schedule_number in allowed_schedules
        ]
        logger.info("Filtered to schedules %s–%s: %d nodes", start_sch, end_sch, len(nodes))

    print_stats(nodes)

    # ── Step 3: Spot-check ────────────────────────────────────────────────────
    logger.info("[3/5] Running validator spot-check…")
    spot_ok = validate_spot_check(nodes)
    if not spot_ok:
        logger.warning("Spot-check had warnings — continuing (inspect output above)")

    # ── Step 4: Embed ─────────────────────────────────────────────────────────
    embeddings: dict[str, list[float]] = {}
    if not args.skip_embed and not args.dry_run:
        logger.info("[4/5] Generating embeddings…")
        embeddings = generate_embeddings(nodes, dry_run=args.dry_run)
    else:
        logger.info("[4/5] Skipping embeddings (--skip-embed or --dry-run)")

    # ── Step 5: Upsert to Supabase ────────────────────────────────────────────
    if args.dry_run:
        logger.info("[5/5] DRY-RUN complete. No DB writes performed.")
        logger.info("To ingest for real: python ingest.py --skip-embed")
        return

    logger.info("[5/5] Upserting to Supabase…")
    try:
        supabase = get_supabase_client()
    except Exception as e:
        logger.error("Supabase init failed: %s", e)
        sys.exit(1)

    # Create snapshot row first (nodes FK to it)
    upsert_snapshot(supabase, snapshot_id, len(nodes))

    upserted, errors = upsert_nodes(supabase, nodes, embeddings)
    duration_ms = int(time.time() * 1000) - start_ms
    status = "done" if not errors else "partial"

    log_run(
        supabase,
        snapshot_id=snapshot_id,
        status=status,
        nodes_upserted=upserted,
        nodes_embedded=len(embeddings),
        errors=errors,
        duration_ms=duration_ms,
    )

    logger.info("════ Ingest complete ════")
    logger.info("  Snapshot:  %s", snapshot_id)
    logger.info("  Upserted:  %d nodes", upserted)
    logger.info("  Embedded:  %d nodes", len(embeddings))
    logger.info("  Duration:  %d ms", duration_ms)
    logger.info("  Status:    %s", status)

    if errors:
        logger.warning("  Errors: %d batches failed — check pageindex_ingest_log", len(errors))
        sys.exit(1)


if __name__ == "__main__":
    main()
