#!/usr/bin/env python3
"""Match every scraped university record to one of our 96 institutions.

Outputs:
    scrape/mapped/university_matches.json   scraped record -> our slug (+score)
    stdout: match report (matched / unmatched / ambiguous)

Run:  python3 scrape/map/match_universities.py
"""
from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))  # scrape/
sys.path.insert(0, HERE)
from normalize import best_name_match, norm, sig_tokens  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))  # project root
DATA = os.path.join(ROOT, "public", "data")
SCRAPE = os.path.dirname(HERE)

# Manual overrides: scraped-signature (normalised substring) -> our slug.
# Used when the algorithmic score is low or ambiguous.
OVERRIDES = {
    "tenaga university": "uniten",
    "universiti tenaga nasional": "uniten",
    "management science": "msu",
    "management and science university": "msu",
    "university kuala lumpur": "unikl",
    "universiti kuala lumpur": "unikl",
    "cyberjaya university": "uoc",
    "university of cyberjaya": "uoc",
    "infrastructure university": None,      # IUKL not in our DB
    "alfa university": None,
    "yes international college": None,
    "geomatika college": None,
    "utar": None,                            # UTAR != TARUMT
    "university of southampton malaysia": "usmc",
    "southampton malaysia": "usmc",
    "newcastle university malaysia": "numed",
    "newcastle": "numed",
    "universiti poly tech malaysia": "uptm",
    "poly tech university of malaysia": "uptm",
    "asia pacific university": "apu",
    "asia pacific": "apu",
    "المحيط الآسيوي": "apu",
    "kuala lumpur university of science": "klust",
    "klust": "klust",
    "swinburne": "swinburne",
    "university of nottingham": "unmc",
    "nottingham": "unmc",
    "university of malaya": "um",
    "universiti malaya": "um",
    "malaya": "um",
    "international medical university": "imu",
    "heriot watt": "hwum",
    "wollongong": "uowm",
    "limkokwing": "luct",
    "medina international university": "mediu",
    "al madinah international university": "mediu",
    "city university malaysia": "cityu",
    "lincoln university college": "luc",
    "raffles": "rui",
    "university of reading": "uorm",
    "reading malaysia": "uorm",
    "university of technology sarawak": "uts",
    "university malaysia of computer science": "unimy",
    "uni my": "unimy",
    "binary university": "binary",
    "open university malaysia": "oum",
    "wawasan open university": "wou",
    "northern university": None,
    # Arabic-name-only sources (maiga/khutwatuk) that need explicit help:
    "جامعة ملايا": "um",
    "جامعة بوترا": "upm",
    "جامعة العلوم": "usm",
    "الجامعة الوطنية": "ukm",
    "جامعة التكنلوجيا": "utm",
    "جامعة تكنولوجيا ماليزيا": "utm",
    "جامعة هيريوت وات": "hwum",
    "جامعة المدينة العالمية": "mediu",
    "جامعة مالايا ويلز": "um-wales",
    "جامعة بتروناس": "utp",
    "جامعة تناجا": "uniten",
    "جامعة سايبرجايا": "uoc",
    "جامعة الادارة والعلوم": "msu",
    "جامعة لينكولن": "luc",
    "جامعة ليمكوكوينج": "luct",
    "جامعة يوني ماي": "unimy",
    "جامعة سيتي": "cityu",
    "جامعة APU": "apu",
    "جامعة ماهسا": "mahsa",
    "جامعةماهسا": "mahsa",
    "جامعة البنية التحتية": None,          # IUKL
    "جامعة كوالالمبور في ماليزيا": "klust",
    "جامعة كوالالمبور": "unikl",
    "جامعة أوتار": None,                    # UTAR
    "جامعة سيجي": "segi",
    "جامعة موناش": "monash",
    "جامعة تسمانيا": None,
    "جامعة ولونجونج": "uowm",
    "جامعة اديلايد": None,
    "جامعة لا تروب": None,
    "جامعة جريفيث": None,
    "جامعة اديث كوان": None,
    "جامعة ديكين": None,
    "جامعة سيدني": None,
    "جامعة ر م ا ي ت": None,
    "الجامعة الطبية": "imu",
    "جامعة UCSI": "ucsi",
    "جامعة ام ا ي": "unimy",
}


def load_jsonl(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    out = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def our_institutions() -> list[dict]:
    d = json.load(open(os.path.join(DATA, "institutions.json"), encoding="utf-8"))
    return d["institutions"]


def scraped_universities() -> list[dict]:
    recs = []
    for src, fname in [
        ("abeer", "abeer/universities.jsonl"),
        ("maiga", "maiga/universities.jsonl"),
        ("quickuni", "quickuni/records.jsonl"),
        ("khutwatuk", "khutwatuk/records.jsonl"),
    ]:
        for r in load_jsonl(os.path.join(SCRAPE, fname)):
            if r.get("kind") == "university":
                r["_src"] = src
                recs.append(r)
    return recs


def candidate_strings(rec: dict) -> list[str]:
    keys = ("name", "name_en", "name_ar", "abbr", "title", "university", "slug")
    out = []
    for k in keys:
        v = rec.get(k)
        if isinstance(v, str) and v.strip():
            out.append(v)
    return out


def main() -> None:
    inst = our_institutions()
    targets = {
        i["slug"]: [i.get("name", ""), i.get("abbr", ""), i.get("name_ar", ""), i["slug"]]
        for i in inst
    }
    # override lookup (normalised, longest key first)
    ov_keys = sorted(OVERRIDES.keys(), key=len, reverse=True)

    matches = []
    for rec in scraped_universities():
        cands = candidate_strings(rec)
        blob = " | ".join(norm(c) for c in cands)
        # 1) override by substring
        slug = None
        how = None
        for k in ov_keys:
            nk = norm(k)
            if nk and nk in blob:
                slug = OVERRIDES[k]
                how = f"override:{k}"
                break
        # 2) algorithmic
        score = 0.0
        if slug is None:
            best_slug, best, best_jac = None, 0.0, 0.0
            for s, tg in targets.items():
                sc, jac = best_name_match(cands, tg)
                if (sc, jac) > (best, best_jac):
                    best, best_jac, best_slug = sc, jac, s
            if best >= 0.62:
                slug, score, how = best_slug, best, "fuzzy"
            else:
                score = best
        else:
            score = 1.0
        matches.append({
            "source": rec["_src"],
            "source_url": rec.get("source_url"),
            "scraped_name": rec.get("name_en") or rec.get("name"),
            "scraped_name_ar": rec.get("name_ar"),
            "scraped_abbr": rec.get("abbr"),
            "our_slug": slug,
            "score": round(score, 3),
            "how": how,
        })

    outdir = os.path.join(SCRAPE, "mapped")
    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, "university_matches.json"), "w", encoding="utf-8") as fh:
        json.dump(matches, fh, ensure_ascii=False, indent=1)

    matched = [m for m in matches if m["our_slug"]]
    unmatched = [m for m in matches if not m["our_slug"]]
    print(f"scraped university records: {len(matches)}")
    print(f"matched: {len(matched)}   unmatched/out-of-scope: {len(unmatched)}\n")
    by_slug: dict[str, list] = {}
    for m in matched:
        by_slug.setdefault(m["our_slug"], []).append(m)
    print("=== matched (our slug <- sources) ===")
    for slug in sorted(by_slug):
        srcs = ", ".join(sorted({m["source"] for m in by_slug[slug]}))
        names = " / ".join(sorted({str(m["scraped_name"]) for m in by_slug[slug]})[:2])
        print(f"  {slug:10} [{srcs:22}] {names[:60]}")
    print("\n=== unmatched ===")
    for m in sorted(unmatched, key=lambda x: x["source"]):
        print(f"  [{m['source']:9}] {str(m['scraped_name'])[:45]:45} score={m['score']}")


if __name__ == "__main__":
    main()
