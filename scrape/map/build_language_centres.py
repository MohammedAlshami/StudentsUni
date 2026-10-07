#!/usr/bin/env python3
"""Build a NEW additive dataset: public/data/language-centres/

Sources:
  maiga/centers.jsonl + maiga/courses.jsonl   (15 centres, 193 courses, fees)
  khutwatuk/records.jsonl (kind=center)       (7 centres, fee tables, inclusions)
  quickuni/records.jsonl  (kind=course)       (Bright package prices)

Writes:
  public/data/language-centres/index.json
  public/data/language-centres/<slug>.json

Nothing existing is modified. Run: python3 scrape/map/build_language_centres.py
"""
from __future__ import annotations

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SCRAPE = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "public", "data", "language-centres")
sys.path.insert(0, HERE)
from normalize import norm  # noqa: E402

# canonical centre slug <- normalised alias substrings
ALIASES = {
    "big ben": "big-ben-academy", "بيغ بن": "big-ben-academy", "بيج بين": "big-ben-academy",
    "bright": "bright-language-center", "برايت": "bright-language-center",
    "britannia": "britannia-language-center", "بريتانيا": "britannia-language-center",
    "sheffield": "sheffield-academy", "شيفيلد": "sheffield-academy", "شيفليد": "sheffield-academy",
    "ems": "ems-english-center", "اي ام اس": "ems-english-center",
    "iabt": "iabt", "international academy of business": "iabt",
    "الاكاديميه الدوليه": "iabt", "الاكاديميه الدولية": "iabt",
    "awesome": "awesome-language-center", "اوسم": "awesome-language-center", "أوسم": "awesome-language-center",
    "elit": "elit-english-center", "ايليت": "elit-english-center",
    "elc": "elc-english-center", "المعهد الاسترالي": "elc-english-center",
    "els": "els-english-center", "الامريكي اي ال اس": "els-english-center",
    "erican": "erican", "ايريكان": "erican",
    "stratford": "stratford-international", "سترادفورد": "stratford-international", "ستradford": "stratford-international",
    "menara": "menara-language-centre", "منارا": "menara-language-centre",
    "manchester": "manchester-language-centre", "mlc": "manchester-language-centre",
    "excel": "excel", "اكسل": "excel", "إكسل": "excel",
    "wwlc": "wwlc", "wordsworth": "wwlc",
}
ALIAS_KEYS = sorted(ALIASES, key=len, reverse=True)


def load_jsonl(p):
    if not os.path.exists(p):
        return []
    return [json.loads(l) for l in open(p, encoding="utf-8") if l.strip()]


def slugify(s: str) -> str:
    s = norm(s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "centre"


def canonical(name_candidates: list[str]) -> str | None:
    blob = " | ".join(norm(c) for c in name_candidates if c)
    for k in ALIAS_KEYS:
        if norm(k) in blob:
            return ALIASES[k]
    return None


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    centres: dict[str, dict] = {}

    def get(slug: str, name: str, name_ar=None) -> dict:
        c = centres.setdefault(slug, {
            "slug": slug, "name": name, "name_ar": name_ar, "aliases": [],
            "city": None, "country": "Malaysia", "website": None, "logo": None,
            "description": None, "student_count": None, "course_count": None,
            "sources": [], "courses": [], "offers": [], "inclusions": [], "exclusions": [],
        })
        for nm in (name, name_ar):
            if nm and nm not in c["aliases"]:
                c["aliases"].append(nm)
        return c

    def add_source(c, url, pub):
        if url and not any(s["url"] == url for s in c["sources"]):
            c["sources"].append({"url": url, "publisher": pub, "fetched_at": "2026-10-06"})

    # ---- maiga centres ----
    maiga_center_slug = {}
    ar_map: dict[str, str] = {}
    for r in load_jsonl(os.path.join(SCRAPE, "maiga/centers.jsonl")):
        slug = canonical([r.get("name_en"), r.get("name"), r.get("name_ar")])
        if not slug:
            slug = slugify(r.get("name_en") or r.get("name") or "centre")
        maiga_center_slug[r.get("source_url")] = slug
        if r.get("name_ar"):
            ar_map[norm(r["name_ar"])] = slug
        c = get(slug, r.get("name_en") or r.get("name"), r.get("name_ar"))
        c["city"] = c["city"] or r.get("city")
        c["website"] = c["website"] or r.get("website")
        c["logo"] = c["logo"] or r.get("logo")
        c["description"] = c["description"] or r.get("description_en") or r.get("description")
        c["student_count"] = c["student_count"] or r.get("student_count")
        c["course_count"] = c["course_count"] or r.get("program_count")
        add_source(c, r.get("source_url"), "MAIGA")

    # map maiga course `center` (Arabic name) -> slug
    def center_slug_from_name(name):
        return ar_map.get(norm(name)) or canonical([name]) or slugify(name)

    # ---- maiga courses ----
    for r in load_jsonl(os.path.join(SCRAPE, "maiga/courses.jsonl")):
        slug = center_slug_from_name(r.get("center"))
        if slug not in centres:
            c = get(slug, r.get("center"), r.get("center"))
        else:
            c = centres[slug]
        c["courses"].append({
            "name": r.get("name_en") or r.get("name"),
            "name_ar": r.get("name_ar"),
            "type": r.get("type"),
            "duration": r.get("duration"),
            "hours": r.get("hours"),
            "fee_myr": r.get("fee_myr"),
            "fee_usd": r.get("fee_usd"),
            "currency": r.get("currency"),
            "fee_before_discount_myr": r.get("fee_before_discount_myr"),
            "discount_pct": r.get("discount_pct"),
            "fees_table": r.get("fees_table"),
            "intakes": r.get("intakes"),
            "requirements": r.get("requirements"),
            "source": "maiga",
            "source_url": r.get("source_url"),
        })
        add_source(c, r.get("source_url"), "MAIGA")

    # ---- khutwatuk centres ----
    for r in load_jsonl(os.path.join(SCRAPE, "khutwatuk/records.jsonl")):
        if r.get("kind") != "center":
            continue
        slug = canonical([r.get("name"), r.get("title")])
        if not slug:
            slug = slugify(r.get("name"))
        c = get(slug, r.get("name"), None)
        c["city"] = c["city"] or r.get("city")
        c["description"] = c["description"] or r.get("description")
        for o in (r.get("fees_table") or []):
            c["offers"].append({**o, "source": "khutwatuk", "source_url": r.get("source_url")})
        for inc in (r.get("inclusions") or []):
            if inc not in c["inclusions"]:
                c["inclusions"].append(inc)
        for exc in (r.get("exclusions") or []):
            if exc not in c["exclusions"]:
                c["exclusions"].append(exc)
        add_source(c, r.get("source_url"), "Khutwatuk")

    # ---- quickuni course packages ----
    for r in load_jsonl(os.path.join(SCRAPE, "quickuni/records.jsonl")):
        if r.get("kind") != "course":
            continue
        slug = canonical([r.get("center")]) or slugify(r.get("center"))
        c = get(slug, r.get("center"), None)
        c["courses"].append({
            "name": r.get("name"), "name_ar": None, "type": "package",
            "duration": r.get("duration"), "fee_myr": r.get("fee_myr"),
            "fee_usd": None, "currency": "MYR", "inclusions": r.get("inclusions"),
            "source": "quickuni", "source_url": r.get("source_url"),
        })
        add_source(c, r.get("source_url"), "QuickUni")

    # write
    index = []
    for slug, c in sorted(centres.items()):
        c["course_count"] = c["course_count"] or (len(c["courses"]) + len(c["offers"]))
        path = os.path.join(OUT, f"{slug}.json")
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(c, fh, ensure_ascii=False, indent=1)
        index.append({
            "slug": slug, "name": c["name"], "name_ar": c["name_ar"], "city": c["city"],
            "logo": c["logo"], "course_count": c["course_count"],
            "student_count": c["student_count"], "sources": len(c["sources"]),
        })
    with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as fh:
        json.dump({"country": "Malaysia", "total": len(index), "centres": index}, fh,
                  ensure_ascii=False, indent=1)

    print(f"wrote {len(index)} centres to public/data/language-centres/")
    for i in index:
        print(f"  {i['slug']:30} courses={i['course_count']:>3} sources={i['sources']}  {i['name']}")


if __name__ == "__main__":
    main()
