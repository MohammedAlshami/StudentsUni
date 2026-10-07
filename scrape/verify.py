#!/usr/bin/env python3
"""Summarise every *.jsonl produced by the scrapers: counts + field coverage.

    python3 scrape/verify.py

Read-only. Safe to run while scrapers are still writing (it just reads what
exists). Does not touch the app or public/data.
"""
from __future__ import annotations

import glob
import json
import os
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))

KEY_FIELDS = [
    "name", "name_en", "name_ar", "city", "type", "qs_rank", "ranking",
    "student_count", "program_count", "university", "center", "level", "field",
    "duration", "fee", "fee_myr", "fee_usd", "currency", "intakes",
    "requirements", "accreditation", "description", "fees_table",
    "inclusions", "exclusions", "content_text", "content_html",
]


def main() -> None:
    files = sorted(glob.glob(os.path.join(ROOT, "*", "*.jsonl")))
    if not files:
        print("No .jsonl files found yet.")
        return
    grand = 0
    for path in files:
        rel = os.path.relpath(path, ROOT)
        rows = 0
        kinds = Counter()
        present = Counter()
        bad = 0
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except Exception:
                    bad += 1
                    continue
                rows += 1
                kinds[rec.get("kind", "?")] += 1
                for k in KEY_FIELDS:
                    v = rec.get(k)
                    if v not in (None, "", [], {}):
                        present[k] += 1
        grand += rows
        size = os.path.getsize(path) / 1024
        print(f"\n{rel}  —  {rows} records, {size:.0f} KB"
              + (f", {bad} bad lines" if bad else ""))
        if kinds:
            print("  kinds:", dict(kinds))
        top = ", ".join(f"{k}={v}" for k, v in present.most_common(14))
        print("  fields:", top or "(none)")
    print(f"\nTOTAL: {grand} records across {len(files)} files")


if __name__ == "__main__":
    main()
