#!/usr/bin/env python3
"""
Scraper for https://maigaedu.com  (Django study-in-Malaysia agency).

Server-rendered HTML only (no JSON API).  Writes resumable JSONL via the
shared kit in ../common.py.

Usage
-----
    python scraper.py universities
    python scraper.py centers          # also discovers + scrapes /course/ pages
    python scraper.py programs         # the big one (1922 pages)
    python scraper.py articles
    python scraper.py faq
    python scraper.py all              # everything in the safe order
    python scraper.py sample <url>     # parse one URL and pretty-print (debug)

Re-running any command resumes: URLs already present in the .jsonl file are
skipped.

Politeness: common.fetch sleeps DEFAULT_DELAY (0.6s) after every request.
Never touches /accounts/, /admin/, /management/, /staff-dashboard/.
"""

from __future__ import annotations

import json
import os
import re
import sys

# --- shared kit -------------------------------------------------------------
_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))
from common import (  # noqa: E402
    JsonlSink,
    abs_url,
    clean_text,
    fetch,
    get_sitemap_urls,
    now_iso,
    parse_num,
    to_int,
)

from bs4 import BeautifulSoup  # noqa: E402

SOURCE = "maiga"
BASE = "https://maigaedu.com"

SITEMAPS = {
    "universities": f"{BASE}/sitemap-universities.xml",
    "centers": f"{BASE}/sitemap-centers.xml",
    "programs": f"{BASE}/sitemap-programs.xml",
    "articles": f"{BASE}/sitemap-articles.xml",
    "faq": f"{BASE}/sitemap-faq.xml",
}

AR_RE = re.compile(r"[\u0600-\u06FF]")
LATIN_RE = re.compile(r"[A-Za-z]")

OUTDIR = _HERE  # JSONL files live next to this script


# ---------------------------------------------------------------------------
# Small HTML helpers
# ---------------------------------------------------------------------------
def soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "lxml")


def txt(node, class_=None) -> str | None:
    """First element with the given class -> whitespace-collapsed text."""
    if node is None:
        return None
    el = node.find(class_=class_) if class_ else node
    if el is None:
        return None
    t = el.get_text(" ", strip=True)
    return t or None


def alts(s: BeautifulSoup) -> dict[str, str]:
    out: dict[str, str] = {}
    for link in s.find_all("link", rel=lambda r: r and "alternate" in r):
        h = link.get("hreflang")
        if h:
            out[h] = link.get("href")
    return out


def ld_blocks(s: BeautifulSoup) -> list[dict]:
    out = []
    for sc in s.find_all("script", type="application/ld+json"):
        raw = sc.string or sc.get_text()
        if not raw:
            continue
        try:
            obj = json.loads(raw)
        except Exception:  # noqa: BLE001
            continue
        if isinstance(obj, list):
            out.extend(o for o in obj if isinstance(o, dict))
        elif isinstance(obj, dict):
            out.append(obj)
    return out


def ld_of(s: BeautifulSoup, type_: str) -> dict | None:
    for obj in ld_blocks(s):
        if obj.get("@type") == type_:
            return obj
    return None


def source_id(url: str) -> str | None:
    m = re.search(r"/(\d+)/?$", url or "")
    if m:
        return m.group(1)
    # program / faq slugs end with "-<id>/"
    m = re.search(r"-(\d+)/?$", url or "")
    return m.group(1) if m else None


def main_text(s: BeautifulSoup) -> str | None:
    m = s.find("main")
    return clean_text(str(m)) if m else None


def meta_content(s: BeautifulSoup, name: str) -> str | None:
    el = s.find("meta", attrs={"name": name}) or s.find("meta", attrs={"property": name})
    return (el.get("content") or "").strip() or None if el else None


def html_desc_to_text(raw: str | None) -> str | None:
    """JSON-LD descriptions contain escaped HTML; flatten it."""
    if not raw:
        return None
    return clean_text(raw) or None


def looks_english(text: str | None) -> bool:
    return bool(text) and bool(LATIN_RE.search(text)) and not AR_RE.search(text)


def fee_rows(s: BeautifulSoup) -> list[dict]:
    """Parse the .ecd-fee-table rows into [{label, value, rm_price}]."""
    table = s.find(class_="ecd-fee-table")
    if not table:
        return []
    rows = []
    for tr in table.find_all("tr"):
        tds = tr.find_all("td")
        if len(tds) < 2:
            continue
        label = tds[0].get_text(" ", strip=True)
        val_cell = tds[1]
        val_el = val_cell.find(class_="ecd-fee-val") or val_cell
        value = val_el.get_text(" ", strip=True)
        rm = val_el.get("data-rm-price") or val_cell.get("data-rm-price")
        rows.append(
            {
                "label": label or None,
                "value": value or None,
                "rm_price": parse_num(rm) if rm is not None else None,
                "negative": bool(val_el.get("data-negative")),
            }
        )
    return rows


def pick_fee(s: BeautifulSoup) -> dict:
    """Fee/price fields shared by course + program pages."""
    old = parse_num(txt(s, "ecd-hero-price-old"))
    new = parse_num(txt(s, "ecd-hero-price-new"))
    usd = parse_num(txt(s, "ecd-fee-total-usd"))
    rows = fee_rows(s)
    # total-after-discount from the table (authoritative) else hero new price
    total = next((r["rm_price"] for r in rows if r["label"] == "الإجمالي بعد الخصم"), None)
    before = next((r["rm_price"] for r in rows if r["label"] == "الإجمالي قبل الخصم"), None)
    fee_myr = total if total is not None else new
    return {
        "fee_myr": fee_myr,
        "fee_usd": usd,
        "currency": "MYR" if fee_myr is not None else None,
        "fee": fee_myr,
        "fee_before_discount_myr": before if before is not None else old,
        "discount_pct": to_int(txt(s, "ecd-hero-price-pct")),
        "fees_table": rows or None,
    }


# ---------------------------------------------------------------------------
# Parsers
# ---------------------------------------------------------------------------
def parse_university(url: str, html: str) -> dict:
    s = soup(html)
    org = ld_of(s, "CollegeOrUniversity") or {}
    a = alts(s)

    name = txt(s, "ud-hero-h1") or org.get("name")
    loc = txt(s, "ud-hero-loc")  # "ماليزيا • سيلانغور"
    country = city = None
    if loc:
        parts = [p.strip() for p in re.split(r"[•·|]", loc) if p.strip()]
        if parts:
            country = parts[0]
            city = "، ".join(parts[1:]) or None

    info: dict[str, str] = {}
    for card in s.find_all(class_="ud-info-card"):
        lbl = txt(card, "ud-info-lbl")
        val = txt(card, "ud-info-val")
        if lbl and val:
            info[lbl] = val

    badges = [b.get_text(" ", strip=True) for b in s.find_all(class_="ud-badge")]
    accreditation = "؛ ".join(b for b in badges if "معتمد" in b) or None

    logo = None
    img = s.select_one(".ud-hero-icon-box img")
    if img and img.get("src"):
        logo = img["src"]
    if not logo:
        logo = org.get("logo")

    return {
        "kind": "university",
        "source_url": url,
        "source_id": source_id(url),
        "name": name,
        "name_ar": name,
        "name_en": None,  # filled from the English alternate
        "city": city,
        "country": country or "ماليزيا",
        "type": info.get("نوع الجامعة"),
        "founded_year": to_int(info.get("تأسست")),
        "qs_rank": None,
        "ranking": to_int(txt(s, "ud-hero-rank")) or to_int(info.get("التصنيف المحلي")),
        "ranking_raw": txt(s, "ud-hero-rank") or info.get("التصنيف المحلي"),
        "program_count": to_int(txt(s, "ud-prog-hdr-sub")),
        "accreditation": accreditation,
        "badges": badges or None,
        "description": txt(s, "ud-hero-desc") or html_desc_to_text(org.get("description")),
        "description_en": None,  # filled from the English alternate
        "website": org.get("sameAs"),
        "logo": logo,
        "alternate_en": a.get("en"),
        "alternate_ar": a.get("ar"),
        "content_text": main_text(s),
    }


def parse_center(url: str, html: str) -> tuple[dict, list[str]]:
    """Return (record, course_urls)."""
    s = soup(html)
    org = ld_of(s, "EducationalOrganization")
    # first EducationalOrganization is MAIGA itself; the center one has sameAs/url
    center_org = {}
    for obj in ld_blocks(s):
        if obj.get("@type") == "EducationalOrganization" and obj.get("sameAs"):
            center_org = obj
            break
    a = alts(s)

    name = txt(s, "cd-center-name") or center_org.get("name")
    name_en_local = txt(s, "cd-center-name-en")
    if name_en_local and name_en_local == name:
        name_en_local = None

    # Location lives in .cd-meta-item elements: "ماليزيا — كوالالمبور"
    country = city = None
    loc_el = s.find(class_="cd-meta-item")
    if loc_el:
        loc = loc_el.get_text(" ", strip=True)
        parts = [p.strip() for p in re.split(r"[—–]", loc) if p.strip()]
        if parts:
            country = parts[0]
            city = "، ".join(parts[1:]) or None

    # Counts come from .cd-stat-pill elements: "94 طالب مسجل", "7 دورة متاحة"
    stat = txt(s, "cd-stat-row")  # joined text, used as fallback
    course_count = None
    student_count = None
    for pill in s.find_all(class_="cd-stat-pill"):
        pt = pill.get_text(" ", strip=True)
        m = re.search(r"(\d[\d,]*)\s*(?:دورة|course)", pt)
        if m and course_count is None:
            course_count = to_int(m.group(1))
        m = re.search(r"(\d[\d,]*)\s*(?:طالب|student)", pt)
        if m and student_count is None:
            student_count = to_int(m.group(1))
    if stat and course_count is None:
        m = re.search(r"(\d[\d,]*)\s*(?:دورة|course)", stat)
        course_count = to_int(m.group(1)) if m else None
    if stat and student_count is None:
        m = re.search(r"(\d[\d,]*)\s*(?:طالب|student)", stat)
        student_count = to_int(m.group(1)) if m else None

    desc = html_desc_to_text(center_org.get("description"))

    # Discover course links; skip the /en/ mirror (its Arabic twin is canonical)
    # and de-duplicate by the trailing numeric id.
    course_urls: list[str] = []
    seen_ids: set[str] = set()
    for link in s.find_all("a", href=True):
        href = link["href"]
        if not re.search(r"(?:^|/)course/", href):
            continue
        if "/en/course/" in href:
            continue
        u = abs_url(BASE, href)
        cid = source_id(u)
        key = cid or u
        if key in seen_ids:
            continue
        seen_ids.add(key)
        course_urls.append(u)

    rec = {
        "kind": "center",
        "source_url": url,
        "source_id": source_id(url),
        "name": name,
        "name_ar": name,
        "name_en": name_en_local,
        "city": city,
        "country": country or "ماليزيا",
        "type": None,
        "program_count": course_count,
        "student_count": student_count,
        "description": desc,
        "description_en": None,
        "website": center_org.get("sameAs"),
        "logo": None,
        "course_urls": course_urls or None,
        "alternate_en": a.get("en"),
        "alternate_ar": a.get("ar"),
        "content_text": main_text(s),
    }
    return rec, course_urls


def parse_course(url: str, html: str) -> dict:
    s = soup(html)
    a = alts(s)

    name = txt(s, "ecd-summary-hdr-title") or txt(s, "ecd-hero-sub--course")
    center = None
    course_type = None
    duration = None
    hours = None
    for row in s.find_all(class_="ecd-detail-row"):
        lbl = txt(row, "ecd-detail-lbl")
        val = txt(row, "ecd-detail-val")
        if not lbl:
            continue
        if lbl == "اسم المعهد":
            center = val
        elif lbl == "نوع الدورة":
            course_type = val
        elif lbl == "مدة الدراسة":
            duration = val
        elif lbl == "ساعات الدراسة":
            hours = val

    intakes = [c.get_text(" | ", strip=True) for c in s.find_all(class_="ecd-intake-card")] or None
    requirements = [
        {"label": txt(c, "ecd-req-label"), "value": txt(c, "ecd-req-value"), "note": txt(c, "ecd-req-note")}
        for c in s.find_all(class_="ecd-req-card")
    ] or None

    # description from the first course tab panel ("نبذة عن الدورة")
    description = None
    panel = s.find(class_="ecd-tab-panel")
    if panel:
        description = clean_text(str(panel)) or None

    fees = pick_fee(s)

    rec = {
        "kind": "course",
        "source_url": url,
        "source_id": source_id(url),
        "name": name,
        "name_ar": name,
        "name_en": None,  # courses are Arabic-only in the source data
        "center": center,
        "type": course_type,
        "level": None,
        "duration": duration,
        "hours": hours,
        "intakes": intakes,
        "requirements": requirements,
        "description": description,
        "title": s.title.get_text(strip=True) if s.title else None,
        "alternate_en": a.get("en"),
        "alternate_ar": a.get("ar"),
        "content_text": main_text(s),
        **fees,
    }
    return rec


def parse_program(url: str, html: str) -> dict:
    s = soup(html)
    course_ld = ld_of(s, "Course") or {}
    provider = course_ld.get("provider") or {}
    offers = course_ld.get("offers") or {}
    a = alts(s)

    rows: dict[str, str] = {}
    for row in s.find_all(class_="pdp-psc-row"):
        lbl = txt(row, "pdp-psc-lbl")
        val = txt(row, "pdp-psc-val")
        if lbl and val:
            rows[lbl] = val

    university = rows.get("اسم الجامعة") or provider.get("name")
    name = rows.get("اسم التخصص") or course_ld.get("name")
    level = rows.get("الدرجة العلمية")
    language = rows.get("لغة الدراسة")
    duration = rows.get("المدة")

    intakes = [c.get_text(" | ", strip=True) for c in s.find_all(class_="pdp-idate-card")] or None
    requirements = [
        {"label": txt(c, "pdp-req-label"), "value": txt(c, "pdp-req-value"), "note": txt(c, "pdp-req-note")}
        for c in s.find_all(class_="pdp-req-card")
    ] or None

    description = html_desc_to_text(course_ld.get("description"))
    if not description:
        description = txt(s, "pdp-overview-intro")

    # badge pill on the hero, e.g. "جامعة معتمدة"
    accreditation = txt(s, "ecd-hero-badge-pill")

    fees = pick_fee(s)
    # JSON-LD offer price is the pre-discount sticker price; keep as fallback.
    ld_price = parse_num(offers.get("price"))

    rec = {
        "kind": "program",
        "source_url": url,
        "source_id": source_id(url),
        "name": name,
        "name_ar": name,
        "name_en": None,  # not double-fetching EN for 1922 programs
        "university": university,
        "university_url": provider.get("sameAs"),
        "center": None,
        "level": level,
        "field": None,  # not exposed as a labelled row on the program page
        "duration": duration,
        "languages_of_instruction": language,
        "intakes": intakes,
        "requirements": requirements,
        "accreditation": accreditation,
        "description": description,
        "title": s.title.get_text(strip=True) if s.title else None,
        "ld_offer_price_myr": ld_price,
        "ld_offer_currency": offers.get("priceCurrency"),
        "alternate_en": a.get("en"),
        "alternate_ar": a.get("ar"),
        "content_text": main_text(s),
        **fees,
    }
    return rec


def parse_article(url: str, html: str) -> dict:
    s = soup(html)
    art = ld_of(s, "Article") or {}
    a = alts(s)

    title = txt(s, "ap-title") or art.get("headline")
    body_el = s.find(class_="ap-prose")
    content = clean_text(str(body_el)) if body_el else None

    date = art.get("datePublished")
    if not date:
        meta_el = s.select_one(".ap-meta-item span")
        date = meta_el.get_text(strip=True) if meta_el else None

    author = (art.get("author") or {}).get("name") if isinstance(art.get("author"), dict) else art.get("author")

    rec = {
        "kind": "article",
        "source_url": url,
        "source_id": source_id(url),
        "name": title,
        "title": title,
        "date": date,
        "date_modified": art.get("dateModified"),
        "author": author,
        "description": html_desc_to_text(art.get("description")) or meta_content(s, "description"),
        "image": art.get("image"),
        "categories": None,
        "tags": None,
        "alternate_en": a.get("en"),
        "alternate_ar": a.get("ar"),
        "content_text": content,
    }
    return rec


def parse_faq(url: str, html: str) -> dict:
    s = soup(html)
    faq_ld = ld_of(s, "FAQPage") or {}
    entity = (faq_ld.get("mainEntity") or [{}])[0]
    answer_ld = entity.get("acceptedAnswer") or {}
    a = alts(s)

    question = txt(s, "fqd-question") or entity.get("name")
    answer = txt(s, "fqd-answer") or answer_ld.get("text")
    category = txt(s, "fqd-category")

    rec = {
        "kind": "faq",
        "source_url": url,
        "source_id": source_id(url),
        "name": question,
        "title": question,
        "category": category,
        "description": answer,
        "date": None,
        "alternate_en": a.get("en"),
        "alternate_ar": a.get("ar"),
        "content_text": answer,
    }
    return rec


# ---------------------------------------------------------------------------
# English enrichment for universities + centers (small counts only)
# ---------------------------------------------------------------------------
def enrich_english(rec: dict, kind: str) -> None:
    """Fetch the hreflang=en alternate and fill name_en / description_en."""
    en_url = rec.get("alternate_en")
    if not en_url:
        return
    html = fetch(en_url)
    if not html:
        return
    s = soup(html)
    if kind == "university":
        en_name = txt(s, "ud-hero-h1")
        org = ld_of(s, "CollegeOrUniversity") or {}
        en_desc = html_desc_to_text(org.get("description"))
    else:  # center
        en_name = txt(s, "cd-center-name")
        en_org = {}
        for obj in ld_blocks(s):
            if obj.get("@type") == "EducationalOrganization" and obj.get("sameAs"):
                en_org = obj
                break
        en_desc = html_desc_to_text(en_org.get("description"))
    if en_name and looks_english(en_name):
        rec["name_en"] = en_name
    if en_desc and looks_english(en_desc):
        rec["description_en"] = en_desc
    rec["alternate_en_fetched"] = True


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
def cmd_universities() -> None:
    urls = get_sitemap_urls(SITEMAPS["universities"])
    print(f"[universities] {len(urls)} urls in sitemap")
    sink = JsonlSink(SOURCE, "universities", outdir=OUTDIR)
    try:
        for i, url in enumerate(urls, 1):
            if sink.done(url):
                continue
            html = fetch(url)
            if not html:
                print(f"  ! no html: {url}")
                continue
            rec = parse_university(url, html)
            enrich_english(rec, "university")
            sink.write(rec, url)
            print(f"  [{i}/{len(urls)}] {rec.get('name')}")
    finally:
        sink.close()
    print(f"[universities] total {sink.count()}")


def cmd_centers() -> None:
    urls = get_sitemap_urls(SITEMAPS["centers"])
    print(f"[centers] {len(urls)} urls in sitemap")
    csink = JsonlSink(SOURCE, "centers", outdir=OUTDIR)
    course_sink = JsonlSink(SOURCE, "courses", outdir=OUTDIR)
    all_courses: dict[str, None] = {}
    try:
        for i, url in enumerate(urls, 1):
            # Always fetch center pages (cheap, 15 of them) so course discovery
            # works even when resuming a partially-finished run.
            html = fetch(url)
            if not html:
                print(f"  ! no html: {url}")
                continue
            rec, course_urls = parse_center(url, html)
            for cu in course_urls:
                all_courses.setdefault(cu, None)
            if not csink.done(url):
                enrich_english(rec, "center")
                csink.write(rec, url)
                print(f"  [{i}/{len(urls)}] {rec.get('name')} (+{len(course_urls)} courses)")
        print(f"[centers] {csink.count()} centers; {len(all_courses)} unique course links")

        for j, cu in enumerate(all_courses, 1):
            if course_sink.done(cu):
                continue
            html = fetch(cu)
            if not html:
                print(f"  ! no html (course): {cu}")
                continue
            crec = parse_course(cu, html)
            course_sink.write(crec, cu)
            print(f"  course [{j}/{len(all_courses)}] {crec.get('name')} — {crec.get('center')}")
    finally:
        csink.close()
        course_sink.close()
    print(f"[centers] total {csink.count()} centers, {course_sink.count()} courses")


def cmd_programs() -> None:
    urls = get_sitemap_urls(SITEMAPS["programs"])
    print(f"[programs] {len(urls)} urls in sitemap")
    sink = JsonlSink(SOURCE, "programs", outdir=OUTDIR)
    try:
        for i, url in enumerate(urls, 1):
            if sink.done(url):
                continue
            html = fetch(url)
            if not html:
                print(f"  ! no html: {url}")
                continue
            rec = parse_program(url, html)
            sink.write(rec, url)
            if i % 25 == 0:
                print(f"  [{i}/{len(urls)}] {rec.get('name')} @ {rec.get('university')}")
    finally:
        sink.close()
    print(f"[programs] total {sink.count()}")


def cmd_articles() -> None:
    urls = get_sitemap_urls(SITEMAPS["articles"])
    print(f"[articles] {len(urls)} urls in sitemap")
    sink = JsonlSink(SOURCE, "articles", outdir=OUTDIR)
    try:
        for i, url in enumerate(urls, 1):
            if sink.done(url):
                continue
            html = fetch(url)
            if not html:
                print(f"  ! no html: {url}")
                continue
            rec = parse_article(url, html)
            sink.write(rec, url)
            if i % 25 == 0:
                print(f"  [{i}/{len(urls)}] {rec.get('title')}")
    finally:
        sink.close()
    print(f"[articles] total {sink.count()}")


def cmd_faq() -> None:
    urls = get_sitemap_urls(SITEMAPS["faq"])
    print(f"[faq] {len(urls)} urls in sitemap")
    sink = JsonlSink(SOURCE, "faq", outdir=OUTDIR)
    try:
        for i, url in enumerate(urls, 1):
            if sink.done(url):
                continue
            html = fetch(url)
            if not html:
                print(f"  ! no html: {url}")
                continue
            rec = parse_faq(url, html)
            sink.write(rec, url)
            if i % 100 == 0:
                print(f"  [{i}/{len(urls)}]")
    finally:
        sink.close()
    print(f"[faq] total {sink.count()}")


def cmd_sample(url: str) -> None:
    html = fetch(url)
    if not html:
        print("no html")
        return
    if "/university/" in url:
        rec = parse_university(url, html)
        enrich_english(rec, "university")
    elif "/center/" in url:
        rec, _ = parse_center(url, html)
        enrich_english(rec, "center")
    elif "/course/" in url:
        rec = parse_course(url, html)
    elif "/program/" in url:
        rec = parse_program(url, html)
    elif "/article/" in url:
        rec = parse_article(url, html)
    elif "/faq/" in url:
        rec = parse_faq(url, html)
    else:
        print("unknown url type")
        return
    print(json.dumps(rec, ensure_ascii=False, indent=2))


def cmd_all() -> None:
    cmd_universities()
    cmd_centers()
    cmd_programs()
    cmd_articles()
    cmd_faq()


COMMANDS = {
    "universities": cmd_universities,
    "centers": cmd_centers,
    "programs": cmd_programs,
    "articles": cmd_articles,
    "faq": cmd_faq,
    "all": cmd_all,
}


def main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    cmd = argv[0]
    if cmd == "sample":
        if len(argv) < 2:
            print("usage: scraper.py sample <url>")
            return 2
        cmd_sample(argv[1])
        return 0
    fn = COMMANDS.get(cmd)
    if not fn:
        print(f"unknown command: {cmd}\n{__doc__}")
        return 2
    fn()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
