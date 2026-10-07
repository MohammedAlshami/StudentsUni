#!/usr/bin/env python3
"""Build fill-only enrichment patches for our university info.json files.

Reads the scraped records + scrape/mapped/university_matches.json and emits
scrape/mapped/university_patches.json containing, per our slug, only the
fields that are currently MISSING/empty in public/data/universities/<slug>/info.json.

Priority per field is chosen by source reliability:
    abeer (structured long-form) > maiga (structured) > khutwatuk (editorial) > quickuni

Run:  python3 scrape/map/build_university_patches.py
"""
from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SCRAPE = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "public", "data")


def load_jsonl(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    return [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]


# field -> ordered list of (source, scraped_key)
PRIORITY = {
    "founded_year": [("abeer", "founded_year"), ("maiga", "founded_year")],
    "qs_rank": [("abeer", "qs_rank")],
    "qs_year": [("abeer", "qs_year")],
    "local_rank": [("maiga", "ranking")],
    "student_count": [("abeer", "student_count")],
    "international_students": [("abeer", "international_students")],
    "employability": [("abeer", "employability")],
    "alumni_count": [("abeer", "alumni_count")],
    "languages_of_instruction": [("abeer", "languages_of_instruction")],
    "accreditation": [("abeer", "accreditation"), ("maiga", "accreditation")],
    "recognition": [("abeer", "recognition")],
    "description": [("abeer", "description"), ("khutwatuk", "description"), ("maiga", "description")],
    "logo": [("abeer", "logo"), ("maiga", "logo")],
    "hero_image": [("abeer", "hero_image")],
    "faculties": [("abeer", "faculties")],
    "intakes": [("abeer", "intakes")],
    "website": [("maiga", "website")],
    "city": [("abeer", "city"), ("khutwatuk", "city"), ("maiga", "city")],
}

SOURCE_META = {
    "abeer": ("Abeer Education", "https://abeereducation.com"),
    "khutwatuk": ("Khutwatuk", "https://khutwatuk.com"),
    "maiga": ("MAIGA", "https://maigaedu.com"),
    "quickuni": ("QuickUni", "https://quickuni.com"),
}


def nonempty(v) -> bool:
    return v not in (None, "", [], {})


def main() -> None:
    matches = json.load(open(os.path.join(SCRAPE, "mapped", "university_matches.json"), encoding="utf-8"))
    # group matched records by our slug and source
    by_slug: dict[str, dict[str, list[dict]]] = {}
    for m in matches:
        if not m.get("our_slug"):
            continue
        by_slug.setdefault(m["our_slug"], {}).setdefault(m["source"], []).append(m)

    # index scraped records by (source, url)
    index: dict[tuple[str, str], dict] = {}
    for src, fname in [
        ("abeer", "abeer/universities.jsonl"),
        ("maiga", "maiga/universities.jsonl"),
        ("quickuni", "quickuni/records.jsonl"),
        ("khutwatuk", "khutwatuk/records.jsonl"),
    ]:
        for r in load_jsonl(os.path.join(SCRAPE, fname)):
            if r.get("kind") == "university" and r.get("source_url"):
                index[(src, r["source_url"])] = r

    patches: dict[str, dict] = {}
    stats = {}
    for slug, per_source in sorted(by_slug.items()):
        info_path = os.path.join(DATA, "universities", slug, "info.json")
        if not os.path.exists(info_path):
            continue
        info = json.load(open(info_path, encoding="utf-8"))
        fields: dict = {}
        evidence: dict = {}
        sources: list[dict] = []
        for field, prio in PRIORITY.items():
            if nonempty(info.get(field)):
                continue  # fill-only
            for src, key in prio:
                got = None
                for m in per_source.get(src, []):
                    rec = index.get((src, m.get("source_url")))
                    if rec and nonempty(rec.get(key)):
                        got = rec.get(key)
                        break
                if got is not None:
                    fields[field] = got
                    evidence[field] = src
                    pub, home = SOURCE_META[src]
                    url = next((m["source_url"] for m in per_source.get(src, []) if index.get((src, m["source_url"]))), home)
                    sources.append({"url": url, "publisher": pub, "fetched_at": "2026-10-06"})
                    break
        if fields:
            patches[slug] = {"fields": fields, "evidence": evidence, "sources": sources}
            stats[slug] = list(fields.keys())

    outdir = os.path.join(SCRAPE, "mapped")
    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, "university_patches.json"), "w", encoding="utf-8") as fh:
        json.dump(patches, fh, ensure_ascii=False, indent=1)

    print(f"patches for {len(patches)} universities\n")
    for slug, flds in stats.items():
        print(f"  {slug:10} +{', '.join(flds)}")
    print("\nfield frequency:")
    from collections import Counter
    c = Counter(f for flds in stats.values() for f in flds)
    for f, n in c.most_common():
        print(f"  {f:26} {n}")


if __name__ == "__main__":
    main()
