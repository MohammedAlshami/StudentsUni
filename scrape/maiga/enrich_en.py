#!/usr/bin/env python3
"""
English enrichment for the already-scraped maiga programs + courses.

Reads   maiga/programs.jsonl   (1922)  and  maiga/courses.jsonl (193)
Writes  maiga/programs_en.jsonl          maiga/courses_en.jsonl

For every record we fetch its `alternate_en` URL (the site's hreflang=en
mirror) and add three fields, leaving every original (Arabic) field untouched:

    name_en        program/course name in English, or null if the English
                   page does not actually carry an English name
    university_en  the university part when the h1/title embeds it, else null
    level_en       Foundation / Diploma / Bachelor / Master / PhD / Doctorate
                   (best effort from name_en/title), else null

Extraction rules
----------------
* name_en from the page <h1>. A trailing university suffix separated by
  " – ", " — ", " - " or " | " is stripped:
      "Bachelor's Nursing (Public Health) – Lincoln University"
          -> "Bachelor's Nursing (Public Health)"
* Fallback: from <title>, the part before " at ":
      "Bachelor's Nursing (Public Health) at Lincoln University (#6043) Malaysia | MAIGA"
          -> "Bachelor's Nursing (Public Health)"
* The <h1> is only trusted when it is actually English and is not the site's
  generic hero CTA ("Get Your Admission Free & ..."), which appears on course
  pages whose English mirror was never translated. If neither h1 nor title
  yields an English name, name_en is null. Nothing is guessed.
* university_en comes from the h1 suffix or the title's " at <university>"
  segment ("(#id)"/"Malaysia"/"| MAIGA" trimmed), else null.

Resumable
---------
JsonlSink reads the output file on start and skips any source_url already
present, so re-running resumes exactly where it stopped. Records whose fetch
failed are NOT written, so the next run retries them.

Politeness: common.fetch sleeps DEFAULT_DELAY (0.6s) after every request and
retries with backoff.

Usage
-----
    python3 enrich_en.py                 # both programs and courses
    python3 enrich_en.py programs        # programs only
    python3 enrich_en.py courses         # courses only
    python3 enrich_en.py programs --limit 5   # quick sample
"""

from __future__ import annotations

import os
import re
import sys

# --- shared kit -------------------------------------------------------------
_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))
from common import JsonlSink, clean_text, fetch, read_jsonl  # noqa: E402

from bs4 import BeautifulSoup  # noqa: E402

SOURCE = "maiga"
OUTDIR = _HERE

# Separators used between the program name and the university in the <h1>.
SEPS = (" – ", " — ", " - ", " | ")

# The generic hero heading the site reuses on course pages that have no
# translated English name. It is never a real program name.
GENERIC_H1 = "get your admission free"

LATIN_RE = re.compile(r"[A-Za-z]")

# Jobs: (kind, input file, output sink name)
JOBS = {
    "programs": ("program", "programs.jsonl", "programs_en"),
    "courses": ("course", "courses.jsonl", "courses_en"),
}


# ---------------------------------------------------------------------------
# HTML / text helpers
# ---------------------------------------------------------------------------
def soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "lxml")


def looks_english(text: str | None) -> bool:
    return bool(text) and bool(LATIN_RE.search(text))


def split_name_university(text: str | None) -> tuple[str | None, str | None]:
    """Split '<name> <sep> <university>' on the *last* separator."""
    text = clean_text(text)
    if not text:
        return None, None
    best: tuple[int, str] | None = None
    for sep in SEPS:
        idx = text.rfind(sep)
        if idx != -1 and (best is None or idx > best[0]):
            best = (idx, sep)
    if best is None:
        return text or None, None
    idx, sep = best
    name = text[:idx].strip(" -–—|")
    uni = text[idx + len(sep):].strip(" -–—|")
    return name or None, uni or None


def from_title(title: str | None) -> tuple[str | None, str | None]:
    """Name before ' at '; university between ' at ' and the (#id)/Malaysia tail."""
    if not title:
        return None, None
    t = clean_text(title)
    if " at " not in t:
        return None, None
    name, rest = t.split(" at ", 1)
    uni = re.split(r"\s*\(#\d+\)|\s+Malaysia\b|\s*\|\s*MAIGA", rest, maxsplit=1)[0]
    return (name.strip(" -–—|") or None), (uni.strip(" -–—|,") or None)


def extract_name(html: str) -> tuple[str | None, str | None]:
    """Return (name_en, university_en) from an English mirror page."""
    s = soup(html)
    h1 = s.find("h1")
    h1_text = clean_text(h1.get_text(" ", strip=True)) if h1 else None
    title = s.title.get_text(strip=True) if s.title else None

    name: str | None = None
    uni: str | None = None

    # 1) Prefer a real, English <h1> (skip the generic CTA).
    if h1_text and looks_english(h1_text) and not h1_text.lower().startswith(GENERIC_H1):
        name, uni = split_name_university(h1_text)

    # 2) Fall back to <title> before " at ".
    if not name or not looks_english(name):
        t_name, t_uni = from_title(title)
        if t_name and looks_english(t_name):
            name, uni = t_name, (t_uni or uni)

    if not looks_english(name):
        return None, None
    return name, (uni if looks_english(uni) else None)


def level_of(*texts: str | None) -> str | None:
    """Best-effort study level from the English name/title."""
    blob = " ".join(t for t in texts if t)
    low = blob.lower()
    if not low:
        return None
    if re.search(r"\bph\.?\s?d\b", low):
        return "PhD"
    if re.search(r"\bdoctorate\b|\bdoctoral\b|\bdoctor of\b", low):
        return "Doctorate"
    if re.search(r"\bmaster", low):
        return "Master"
    if re.search(r"\bbachelor", low):
        return "Bachelor"
    if re.search(r"\bdiploma", low):
        return "Diploma"
    if re.search(r"\bfoundation\b", low):
        return "Foundation"
    return None


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------
def run(key: str, limit: int | None = None) -> dict:
    kind, infile, outname = JOBS[key]
    inpath = os.path.join(OUTDIR, infile)
    records = read_jsonl(inpath)
    if limit:
        records = records[:limit]

    sink = JsonlSink(SOURCE, outname, outdir=OUTDIR)
    stats = {
        "kind": kind,
        "input": infile,
        "output": sink.path,
        "total": len(records),
        "skipped": 0,
        "fetched": 0,
        "fetch_failed": 0,
        "written": 0,
        "name_en": 0,
        "university_en": 0,
        "level_en": 0,
        "name_en_null": [],
    }
    try:
        for i, rec in enumerate(records, 1):
            src = rec.get("source_url")
            if not src:
                continue
            if sink.done(src):
                stats["skipped"] += 1
                continue

            en_url = rec.get("alternate_en")
            out = dict(rec)  # keep every original field untouched
            name_en = uni_en = lvl_en = None

            if en_url:
                html = fetch(en_url)
                if html:
                    stats["fetched"] += 1
                    name_en, uni_en = extract_name(html)
                    lvl_en = level_of(name_en, rec.get("name_en"), rec.get("title"))
                else:
                    stats["fetch_failed"] += 1
                    print(f"  ! fetch failed, will retry next run: {en_url}")
                    # Do NOT write: leave it for the next run to retry.
                    continue

            out["name_en"] = name_en
            out["university_en"] = uni_en
            out["level_en"] = lvl_en
            sink.write(out, src)
            stats["written"] += 1
            if name_en:
                stats["name_en"] += 1
            else:
                stats["name_en_null"].append(src)
            if uni_en:
                stats["university_en"] += 1
            if lvl_en:
                stats["level_en"] += 1

            if i % 50 == 0 or i == len(records):
                print(
                    f"  [{key} {i}/{len(records)}] "
                    f"written={stats['written']} name_en={stats['name_en']} "
                    f"failed={stats['fetch_failed']}"
                )
    finally:
        sink.close()

    print(
        f"[{key}] done: total={stats['total']} written={stats['written']} "
        f"skipped={stats['skipped']} fetched={stats['fetched']} "
        f"fetch_failed={stats['fetch_failed']} "
        f"name_en={stats['name_en']} university_en={stats['university_en']} "
        f"level_en={stats['level_en']}"
    )
    return stats


def main(argv: list[str]) -> int:
    if argv and argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0

    keys = ["programs", "courses"]
    if argv and not argv[0].startswith("-"):
        key = argv.pop(0)
        if key == "all":
            keys = ["programs", "courses"]
        elif key in JOBS:
            keys = [key]
        else:
            print(f"unknown target: {key}\n{__doc__}")
            return 2

    limit = None
    if "--limit" in argv:
        limit = int(argv[argv.index("--limit") + 1])

    for key in keys:
        run(key, limit=limit)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
