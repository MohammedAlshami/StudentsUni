#!/usr/bin/env python3
"""Match scraped program/course records to our program detail files and emit
fill-only patches.

Sources of program-level data:
  maiga/programs_en.jsonl  (preferred; English names via enrichment)  OR programs.jsonl
  khutwatuk/records.jsonl  kind=program, and fees_table rows inside kind=university
  abeer/universities.jsonl fees_table rows (Arabic names)

Output:
  scrape/mapped/program_patches.json
  scrape/mapped/program_match_report.txt

Run:  python3 scrape/map/match_programs.py
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SCRAPE = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "public", "data")
sys.path.insert(0, HERE)
sys.path.insert(0, SCRAPE)
from normalize import best_name_match, norm, sig_tokens  # noqa: E402

# reuse university overrides / matching
import importlib.util  # noqa: E402
_spec = importlib.util.spec_from_file_location("mu", os.path.join(HERE, "match_universities.py"))
mu = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mu)
_OV_KEYS = sorted(mu.OVERRIDES, key=len, reverse=True)
_INST = mu.our_institutions()


def slug_for(name: str | None) -> str | None:
    if not name:
        return None
    blob = norm(name)
    for k in _OV_KEYS:
        if norm(k) in blob:
            return mu.OVERRIDES[k]
    best, bs = 0.0, None
    for i in _INST:
        sc, _ = best_name_match([name], [i.get("name", ""), i.get("abbr", ""), i.get("name_ar", "")])
        if sc > best:
            best, bs = sc, i["slug"]
    return bs if best >= 0.62 else None


LEVEL_MAP = {
    "foundation": "foundation", "asasi": "foundation", "pre-university": "foundation",
    "pre-university-foundation-studies": "foundation", "تأسيسي": "foundation",
    "السنة التحضيرية": "foundation", "التحضيرية": "foundation",
    "diploma": "diploma", "advanced-diploma": "diploma", "دبلوم": "diploma",
    "postgraduate-diploma": "diploma", "postgraduate-certificate": "diploma",
    "bachelor": "bachelor", "bachelors": "bachelor", "bachelors-degree": "bachelor",
    "undergraduate": "bachelor", "degree": "bachelor", "بكالوريوس": "bachelor",
    "master": "master", "masters": "master", "masters-degree": "master",
    "postgraduate": "master", "ماجستير": "master",
    "phd": "phd", "doctorate": "phd", "doctoral": "phd", "doctoral-degree": "phd",
    "دكتوراه": "phd", "دكتور": "phd",
}


def canon_level(s: str | None) -> str | None:
    if not s:
        return None
    return LEVEL_MAP.get(str(s).strip().lower()) or LEVEL_MAP.get(str(s).strip()) or None


def load_jsonl(p):
    if not os.path.exists(p):
        return []
    return [json.loads(l) for l in open(p, encoding="utf-8") if l.strip()]


def our_programs(slug: str) -> list[dict]:
    out = []
    base = os.path.join(DATA, "universities", slug)
    for f in glob.glob(os.path.join(base, "*", "*.json")):
        if f.endswith("index.json"):
            continue
        try:
            d = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(d, dict):
            continue
        level_dir = os.path.basename(os.path.dirname(f))
        out.append({
            "file": f,
            "level_dir": level_dir,
            "level": canon_level(level_dir) or canon_level(d.get("level")),
            "program_name": d.get("program_name"),
            "program_name_ar": d.get("program_name_ar"),
            "fees": d.get("fees") or {},
            "duration": d.get("duration"),
            "description": d.get("description"),
        })
    return out


def has_fee(d: dict) -> bool:
    f = d.get("fees") or {}
    return (f.get("total") or f.get("local_total") or f.get("international_total")) not in (None, 0)


def split_label(label: str) -> list[str]:
    parts = re.split(r"[|—–]", label)
    return [p.strip() for p in parts if p and p.strip()]


def scraped_candidates() -> dict[str, list[dict]]:
    """slug -> list of candidate dicts with name/name_ar/level/fee."""
    out: dict[str, list[dict]] = {}

    def add(slug, **kw):
        if not slug:
            return
        out.setdefault(slug, []).append(kw)

    # maiga (prefer English-enriched file)
    maiga_file = "maiga/programs_en.jsonl" if os.path.exists(os.path.join(SCRAPE, "maiga/programs_en.jsonl")) else "maiga/programs.jsonl"
    for r in load_jsonl(os.path.join(SCRAPE, maiga_file)):
        slug = slug_for(r.get("university"))
        add(slug, source="maiga", source_url=r.get("source_url"),
            name=r.get("name_en") or r.get("name"), name_ar=r.get("name"),
            level=canon_level(r.get("level")), fee=r.get("fee_myr"), currency="MYR",
            duration=r.get("duration"), requirements=r.get("requirements"),
            description=r.get("description"))

    # khutwatuk program records
    for r in load_jsonl(os.path.join(SCRAPE, "khutwatuk/records.jsonl")):
        if r.get("kind") == "program":
            slug = slug_for(r.get("university")) or slug_for(r.get("name"))
            add(slug, source="khutwatuk", source_url=r.get("source_url"),
                name=r.get("name"), name_ar=r.get("name"), level=canon_level(r.get("level")),
                fee=r.get("fee_myr"), currency="MYR", duration=r.get("duration"),
                description=r.get("description"))
        elif r.get("kind") == "university":
            slug = slug_for(r.get("university") or r.get("name"))
            for row in (r.get("fees_table") or []):
                label = row.get("label") or ""
                names = split_label(label)
                add(slug, source="khutwatuk", source_url=r.get("source_url"),
                    name=names, name_ar=names, level=None,
                    fee=row.get("price_myr") or (row.get("price") if row.get("currency") == "MYR" else None),
                    currency=row.get("currency"))

    # abeer fees tables (Arabic program names)
    for r in load_jsonl(os.path.join(SCRAPE, "abeer/universities.jsonl")):
        slug = slug_for(r.get("name_en") or r.get("name"))
        for row in (r.get("fees_table") or []):
            add(slug, source="abeer", source_url=r.get("source_url"),
                name=row.get("program"), name_ar=row.get("program"), level=None,
                fee=row.get("fee"), currency=row.get("currency"), duration=row.get("duration"))
    return out


def match_one(prog: dict, cands: list[dict]) -> dict | None:
    if not cands:
        return None
    best = None
    best_key = (0.0, 0.0)
    for c in cands:
        # level must be compatible when both known
        if prog["level"] and c.get("level") and prog["level"] != c["level"]:
            continue
        # English side
        sc_en, jac_en = best_name_match([prog.get("program_name")], [c["name"]] if isinstance(c["name"], str) else c["name"])
        # Arabic side (our ar name is Arabic-prefixed English; still helps sometimes)
        sc_ar, jac_ar = best_name_match([prog.get("program_name_ar")], [c["name_ar"]] if isinstance(c["name_ar"], str) else (c["name_ar"] or []))
        sc = max(sc_en, sc_ar * 0.95)
        jac = max(jac_en, jac_ar)
        if (sc, jac) > best_key:
            best_key = (sc, jac)
            best = c
    if best and best_key[0] >= 0.72:
        return {"cand": best, "score": round(best_key[0], 3)}
    return None


def main() -> None:
    matches = json.load(open(os.path.join(SCRAPE, "mapped", "university_matches.json"), encoding="utf-8"))
    slugs = sorted({m["our_slug"] for m in matches if m.get("our_slug")})
    cands = scraped_candidates()

    patches: dict[str, dict] = {}
    lines = []
    filled_fee = filled_desc = filled_dur = filled_req = 0
    matched_total = 0
    for slug in slugs:
        progs = our_programs(slug)
        if not progs:
            continue
        c = cands.get(slug, [])
        slug_fee = slug_desc = slug_dur = 0
        for p in progs:
            m = match_one(p, c)
            if not m:
                continue
            matched_total += 1
            cand = m["cand"]
            fields = {}
            if not has_fee(p) and cand.get("fee"):
                fields["fees"] = {"total": cand["fee"], "currency": cand.get("currency") or "MYR",
                                  "notes": f"External estimate from {cand['source']} ({cand.get('source_url','')})"}
                filled_fee += 1
                slug_fee += 1
            if not (p.get("description") or "").strip() and cand.get("description"):
                fields["description"] = cand["description"]
                filled_desc += 1
                slug_desc += 1
            if not p.get("duration") and cand.get("duration"):
                fields["duration"] = cand["duration"]
                filled_dur += 1
                slug_dur += 1
            if cand.get("requirements"):
                fields["requirements"] = cand["requirements"]
                filled_req += 1
            if fields:
                rel = os.path.relpath(p["file"], DATA)
                patches[rel] = {
                    "fields": fields,
                    "match": {"source": cand["source"], "source_url": cand.get("source_url"),
                              "scraped_name": cand.get("name") if isinstance(cand.get("name"), str) else cand.get("name"),
                              "score": m["score"]},
                }
        if slug_fee or slug_desc or slug_dur:
            lines.append(f"  {slug:10} programs={len(progs):4} matched_fee={slug_fee:3} desc={slug_desc:3} dur={slug_dur:3}")

    outdir = os.path.join(SCRAPE, "mapped")
    with open(os.path.join(outdir, "program_patches.json"), "w", encoding="utf-8") as fh:
        json.dump(patches, fh, ensure_ascii=False, indent=1)
    report = (f"programs matched: {matched_total}\n"
              f"fee patches: {filled_fee}  desc: {filled_desc}  duration: {filled_dur}  requirements: {filled_req}\n"
              f"files to patch: {len(patches)}\n\nper-university (fee/desc/dur):\n" + "\n".join(lines))
    with open(os.path.join(outdir, "program_match_report.txt"), "w", encoding="utf-8") as fh:
        fh.write(report)
    print(report)


if __name__ == "__main__":
    main()
