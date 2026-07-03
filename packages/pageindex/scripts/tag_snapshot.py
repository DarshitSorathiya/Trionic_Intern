"""
packages/pageindex/scripts/tag_snapshot.py
─────────────────────────────────────────────
Tags a snapshot in pageindex_snapshots after a successful ingest.
Also verifies the 395-article + 6-schedule acceptance criteria.

Usage:
  python tag_snapshot.py                        # tags today's snapshot
  python tag_snapshot.py --snapshot 2025-06-05  # tags a specific snapshot

Environment:
  SUPABASE_URL, SUPABASE_SERVICE_KEY
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from datetime import date

from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("tag_snapshot")

# Acceptance criteria thresholds
REQUIRED_ARTICLES = 395
REQUIRED_SCHEDULES = list(range(1, 7))  # Schedules 1-6
VALIDATOR_ARTICLES = ["14", "19", "21", "32", "226"]


def verify_and_tag(snapshot_id: str) -> bool:
    try:
        from supabase import create_client
    except ImportError:
        logger.error("pip install supabase")
        sys.exit(1)

    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    sb = create_client(url, key)

    logger.info("Verifying snapshot: %s", snapshot_id)

    # ── Check snapshot exists ─────────────────────────────────────────────────
    snap = sb.table("pageindex_snapshots").select("*").eq("id", snapshot_id).maybe_single().execute()
    if not snap.data:
        logger.error("Snapshot %s not found. Run ingest.py first.", snapshot_id)
        return False

    logger.info("Snapshot found: %s (%d total_nodes)", snapshot_id, snap.data.get("total_nodes", 0))

    # ── Count articles ────────────────────────────────────────────────────────
    article_count = sb.table("pageindex_nodes") \
        .select("id", count="exact") \
        .eq("snapshot_id", snapshot_id) \
        .eq("node_type", "article") \
        .execute()

    actual_articles = article_count.count or 0
    articles_ok = actual_articles >= REQUIRED_ARTICLES
    logger.info(
        "  Articles: %d / %d required  [%s]",
        actual_articles, REQUIRED_ARTICLES,
        "PASS ✓" if articles_ok else "FAIL ✗"
    )

    # ── Check schedules 1-6 ───────────────────────────────────────────────────
    schedules = sb.table("pageindex_nodes") \
        .select("schedule_number") \
        .eq("snapshot_id", snapshot_id) \
        .eq("node_type", "schedule") \
        .execute()

    found_schedules = {r["schedule_number"] for r in (schedules.data or [])}
    missing_schedules = [s for s in REQUIRED_SCHEDULES if s not in found_schedules]
    schedules_ok = len(missing_schedules) == 0
    logger.info(
        "  Schedules 1-6: found=%s  missing=%s  [%s]",
        sorted(found_schedules),
        missing_schedules,
        "PASS ✓" if schedules_ok else "FAIL ✗",
    )

    # ── Spot-check individual articles ───────────────────────────────────────
    all_spot_ok = True
    for art_num in VALIDATOR_ARTICLES:
        result = sb.table("pageindex_nodes") \
            .select("id, article_title, text_content") \
            .eq("snapshot_id", snapshot_id) \
            .eq("node_type", "article") \
            .eq("article_number", art_num) \
            .maybe_single() \
            .execute()

        if not result.data:
            logger.error("  SPOT-CHECK FAIL — Article %s: NOT FOUND", art_num)
            all_spot_ok = False
            continue

        row = result.data
        text_len = len(row.get("text_content", ""))
        title = (row.get("article_title") or "")[:60]
        ok = text_len > 20
        logger.info(
            "  SPOT-CHECK %s — Art.%s | '%s' | %d chars",
            "PASS ✓" if ok else "WARN ⚠",
            art_num, title, text_len,
        )
        if not ok:
            all_spot_ok = False

    # ── Final verdict ─────────────────────────────────────────────────────────
    all_ok = articles_ok and schedules_ok and all_spot_ok

    if all_ok:
        # Update snapshot with a "verified" label
        sb.table("pageindex_snapshots").update({
            "label": f"Constitution of India (as of {snapshot_id}) [VERIFIED]",
            "total_nodes": snap.data.get("total_nodes", 0),
        }).eq("id", snapshot_id).execute()
        logger.info("✅ Snapshot %s TAGGED as VERIFIED", snapshot_id)
    else:
        logger.warning("⚠ Snapshot %s did not pass all checks — not tagged VERIFIED", snapshot_id)
        logger.warning("   Run: python ingest.py --snapshot-id %s to re-ingest", snapshot_id)

    return all_ok


def main():
    parser = argparse.ArgumentParser(description="Tag and verify a PageIndex snapshot")
    parser.add_argument("--snapshot", default=str(date.today()), help="Snapshot ID (YYYY-MM-DD)")
    args = parser.parse_args()

    ok = verify_and_tag(args.snapshot)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
