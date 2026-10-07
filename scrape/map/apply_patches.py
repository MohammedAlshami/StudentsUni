#!/usr/bin/env python3
"""Apply fill-only patches to public/data. Backs up every touched file first.

Usage:
    python3 scrape/map/apply_patches.py --universities [--dry-run]
    python3 scrape/map/apply_patches.py --programs     [--dry-run]
    python3 scrape/map/apply_patches.py --all

Rules:
  * NEVER overwrite an existing non-empty value.
  * fees: only set when current total/local/international is null.
  * description/duration: only set when missing.
  * requirements: only set when missing/empty.
  * sources: append if the URL isn't already present; set last_updated.

Backups go to scrape/_backup/<path-relative-to-public/data> (first write only).
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SCRAPE = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "public", "data")
BACKUP = os.path.join(SCRAPE, "_backup")
TODAY = "2026-10-07"


def nonempty(v) -> bool:
    return v not in (None, "", [], {})


def has_fee(d: dict) -> bool:
    f = d.get("fees") or {}
    if not isinstance(f, dict):
        return False
    return (f.get("total") or f.get("local_total") or f.get("international_total")) not in (None, 0)


def backup(path: str) -> None:
    rel = os.path.relpath(path, DATA)
    dest = os.path.join(BACKUP, rel)
    if not os.path.exists(dest):
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copy2(path, dest)


def add_source(obj: dict, url: str, publisher: str) -> bool:
    if not url:
        return False
    srcs = obj.get("sources")
    if not isinstance(srcs, list):
        srcs = []
        obj["sources"] = srcs
    existing = {s.get("url") if isinstance(s, dict) else s for s in srcs}
    if url in existing:
        return False
    srcs.append({"url": url, "publisher": publisher, "fetched_at": TODAY})
    return True


def apply_universities(dry: bool) -> int:
    p = os.path.join(SCRAPE, "mapped", "university_patches.json")
    patches = json.load(open(p, encoding="utf-8"))
    changed = 0
    for slug, patch in patches.items():
        path = os.path.join(DATA, "universities", slug, "info.json")
        if not os.path.exists(path):
            continue
        info = json.load(open(path, encoding="utf-8"))
        before = json.dumps(info, ensure_ascii=False, sort_keys=True)
        for field, val in patch["fields"].items():
            if nonempty(info.get(field)):
                continue
            info[field] = val
        for s in patch.get("sources", []):
            add_source(info, s.get("url"), s.get("publisher", "external"))
        info["last_updated"] = TODAY
        after = json.dumps(info, ensure_ascii=False, sort_keys=True)
        if after != before:
            changed += 1
            if not dry:
                backup(path)
                with open(path, "w", encoding="utf-8") as fh:
                    json.dump(info, fh, ensure_ascii=False, indent=2)
    return changed


def apply_programs(dry: bool) -> int:
    p = os.path.join(SCRAPE, "mapped", "program_patches.json")
    if not os.path.exists(p):
        print("no program_patches.json yet")
        return 0
    patches = json.load(open(p, encoding="utf-8"))
    changed = 0
    for rel, patch in patches.items():
        path = os.path.join(DATA, rel)
        if not os.path.exists(path):
            continue
        d = json.load(open(path, encoding="utf-8"))
        if not isinstance(d, dict):
            continue
        before = json.dumps(d, ensure_ascii=False, sort_keys=True)
        f = patch["fields"]
        if "fees" in f and not has_fee(d):
            newfees = dict(d.get("fees") or {})
            newfees.update(f["fees"])
            d["fees"] = newfees
        if "description" in f and not nonempty(d.get("description")):
            d["description"] = f["description"]
        if "duration" in f and not nonempty(d.get("duration")):
            d["duration"] = f["duration"]
        if "requirements" in f and not nonempty(d.get("requirements")):
            d["requirements"] = f["requirements"]
        m = patch.get("match", {})
        add_source(d, m.get("source_url"), m.get("source", "external"))
        d["last_updated"] = TODAY
        after = json.dumps(d, ensure_ascii=False, sort_keys=True)
        if after != before:
            changed += 1
            if not dry:
                backup(path)
                with open(path, "w", encoding="utf-8") as fh:
                    json.dump(d, fh, ensure_ascii=False, indent=1)
    return changed


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--universities", action="store_true")
    ap.add_argument("--programs", action="store_true")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    do_uni = a.universities or a.all
    do_prog = a.programs or a.all
    if not (do_uni or do_prog):
        ap.error("choose --universities, --programs or --all")
    tag = "DRY-RUN " if a.dry_run else ""
    if do_uni:
        n = apply_universities(a.dry_run)
        print(f"{tag}universities changed: {n}")
    if do_prog:
        n = apply_programs(a.dry_run)
        print(f"{tag}program files changed: {n}")


if __name__ == "__main__":
    main()
