#!/usr/bin/env python3
"""Consolidate all scraped JSONL into one deduplicated, source-tagged dataset.

    python3 scrape/consolidate.py

Reads every  scrape/<site>/*.jsonl  and writes:

    scrape/_merged/all.jsonl        one normalised record per line
    scrape/_merged/by_kind/<kind>.jsonl
    scrape/_merged/summary.json     counts per source / kind / field coverage

This is intentionally schema-light: it does NOT map to the StudentsUni DB yet.
It only guarantees a common envelope (source, kind, source_url, fetched_at),
dedupes, and reports coverage so the real merge can be written against facts.

Read-only w.r.t. the site folders; only writes under scrape/_merged/.
"""
from __future__ import annotations

import glob
import json
import os
import re
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "_merged")

ENVELOPE = ("source", "kind", "source_url", "fetched_at")

KEY_FIELDS = [
    "name", "name_en", "name_ar", "abbr", "slug", "city", "state", "type",
    "founded_year", "website", "logo", "description",
    "qs_rank", "ranking", "student_count", "program_count", "employability",
    "alumni_count", "languages_of_instruction",
    "university", "university_slug", "center", "center_slug",
    "level", "field", "duration", "mode", "intakes",
    "fee", "fee_myr", "fee_usd", "currency", "fee_per_year",
    "fees_table", "inclusions", "exclusions", "requirements",
    "accreditation", "recognition", "awarding_body", "awarding_country",
    "title", "date", "content_text", "content_html", "categories", "tags",
]

# Map a few likely aliases onto canonical names.
ALIASES = {
    "name_english": "name_en",
    "english_name": "name_en",
    "arabic_name": "name_ar",
    "rank": "ranking",
    "students": "student_count",
    "programs_count": "program_count",
    "institute": "center",
    "institute_name": "center",
    "course": "name",
}


def norm_url(u: str) -> str:
    if not u:
        return u
    u = u.split("#", 1)[0]
    return u.rstrip("/") or u


def coerce(rec: dict, source_hint: str, kind_hint: str) -> dict:
    out = {}
    for k, v in rec.items():
        key = ALIASES.get(k, k)
        if key not in out:
            out[key] = v
    out.setdefault("source", source_hint)
    out.setdefault("kind", kind_hint)
    if out.get("source_url"):
        out["source_url"] = norm_url(out["source_url"])
    return out


def is_empty(v) -> bool:
    return v in (None, "", [], {})


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    by_kind_dir = os.path.join(OUT, "by_kind")
    os.makedirs(by_kind_dir, exist_ok=True)

    seen: set[tuple] = set()
    all_records: list[dict] = []
    per_source = Counter()
    per_kind = Counter()
    coverage = defaultdict(Counter)
    dupes = 0

    for path in sorted(glob.glob(os.path.join(ROOT, "*", "*.jsonl"))):
        site = os.path.basename(os.path.dirname(path))
        if site == "_merged" or os.path.abspath(path).startswith(OUT + os.sep):
            continue  # never re-read our own output
        kind_hint = os.path.splitext(os.path.basename(path))[0].rstrip("s")
        if kind_hint == "p":  # "posts" -> "post"
            kind_hint = "post"
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    raw = json.loads(line)
                except Exception:
                    continue
                rec = coerce(raw, site, kind_hint)
                key = (
                    rec.get("source"),
                    rec.get("kind"),
                    rec.get("source_url"),
                    rec.get("name") or rec.get("title"),
                )
                if key in seen:
                    dupes += 1
                    continue
                seen.add(key)
                all_records.append(rec)
                per_source[rec.get("source")] += 1
                per_kind[rec.get("kind")] += 1
                for f in KEY_FIELDS:
                    if not is_empty(rec.get(f)):
                        coverage[f][rec.get("source")] += 1

    # write merged
    with open(os.path.join(OUT, "all.jsonl"), "w", encoding="utf-8") as fh:
        for rec in all_records:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

    # write per-kind
    buckets = defaultdict(list)
    for rec in all_records:
        buckets[rec.get("kind") or "misc"].append(rec)
    for kind, rows in buckets.items():
        safe = re.sub(r"[^a-z0-9_-]", "_", str(kind).lower())
        with open(os.path.join(by_kind_dir, f"{safe}.jsonl"), "w", encoding="utf-8") as fh:
            for rec in rows:
                fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

    summary = {
        "total_records": len(all_records),
        "duplicates_skipped": dupes,
        "per_source": dict(per_source),
        "per_kind": dict(per_kind),
        "field_coverage": {
            f: dict(counts) for f, counts in sorted(coverage.items())
        },
    }
    with open(os.path.join(OUT, "summary.json"), "w", encoding="utf-8") as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=2)

    print(f"total records : {len(all_records)}  (skipped {dupes} dupes)")
    print(f"per source    : {dict(per_source)}")
    print(f"per kind      : {dict(per_kind)}")
    print(f"written       : {os.path.relpath(OUT, ROOT)}/all.jsonl + by_kind/*.jsonl + summary.json")


if __name__ == "__main__":
    main()
