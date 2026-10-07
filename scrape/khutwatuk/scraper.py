#!/usr/bin/env python3
"""
Scraper for https://khutwatuk.com  (خطوتك — Arabic study-in-Malaysia agency).

The site is WordPress with a working REST API, so content is pulled from
/wp-json/wp/v2/ instead of HTML-scraping listing pages.  Fee data lives in
Elementor "data table" widgets; those tables are parsed into normalized
records (Arabic-Indic digits converted to ASCII via common.parse_num).

Outputs, all newline-delimited JSON in this directory and resumable by
source_url:

    pages.jsonl    every WP page   (kind="page")
    posts.jsonl    every WP post   (kind="post")
    records.jsonl  one normalized record per page/post whose content yielded a
                   structured record (kind inferred: university | center |
                   program | discipline | article | misc).  Pages with no
                   extractable structure are skipped here but still appear in
                   pages.jsonl / posts.jsonl.

Run:
    python3 scraper.py
Re-running skips source_urls already present in each output file.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))  # scrape/ on path

import common as _common  # noqa: E402
from common import (  # noqa: E402
    JsonlSink,
    clean_text,
    fetch_json,
    normalize_digits,
    now_iso,
    parse_num,
)

# This site's WAF returns HTTP 429 for a spoofed Chrome User-Agent but accepts a
# plain identifying bot UA, so override the shared session's header here.
_common._SESSION.headers["User-Agent"] = (
    "Mozilla/5.0 (compatible; StudentsUniResearchBot/1.0; "
    "+https://studentsuni.example/bot)"
)

try:
    from bs4 import BeautifulSoup
except Exception:  # pragma: no cover
    BeautifulSoup = None

BASE = "https://khutwatuk.com"
API = BASE + "/wp-json/wp/v2"
SOURCE = "khutwatuk"
PER_PAGE = 100

FIELDS = "id,slug,link,title,date,modified,content,excerpt,categories,tags,featured_media"

# ----------------------------------------------------------------------------
# Heuristics / vocab
# ----------------------------------------------------------------------------

# Header classifiers. Order matters: requirements first, then the institute
# "course fee" table (which also contains "تشمل"), then exclusions/inclusions,
# and fees last — because e.g. "من 1 شهر إلى 3 أشهر الرسوم تشمل" is an
# inclusions table despite containing "الرسوم".
REQ_HEADER_RE = re.compile(r"متطلبات|شروط|الوثائق|مستندات")
INCLUDE_HEADER_RE = re.compile(r"تشمل|خدماتنا")
EXCLUDE_HEADER_RE = re.compile(r"لا تشمل|لايشمل|غير شامل|غير مشمول")
FEE_HEADER_RE = re.compile(r"الرسوم|رسوم|التكلفة|تكلفة|دولار|رنقت|رنجت")
# Columns that are durations / discounts, not prices.
NON_FEE_HEADER_RE = re.compile(r"المدة|مدة|سنوات|عدد الاشخاص|خصم|المزيد")
DURATION_HEADER_RE = re.compile(r"المدة|مدة|سنوات")

# Common Arabic academic-field words used to spot discipline/major pages.
FIELD_RE = re.compile(
    r"هندسة|الهندسة|إدارة|الادارة|الإدارة|الأدارة|التسويق|المحاسبة|الاقتصاد|"
    r"التمريض|الصيدلة|الطب|التغذية|العلاج الطبيعي|علوم|الحاسوب|الحاسب|"
    r"البرمجيات|المعلومات|البيانات|الذكاء|الأمن|الامن|علم النفس|الضيافة|"
    r"السياحة|الطيران|المطارات|الامدادات|الإمدادات|المالية|المصرفية|ريادة|"
    r"الموارد البشرية|المختبرات|جرافيك|التصميم|المعمارية|الميكانيكية|"
    r"الكيميائية|البترول|المدنية|الميكاترونكس|الإلكترونية|الالكترونية|الطبية|"
    r"طب "
)

CURRENCY_MARKERS = [
    (re.compile(r"AU\$|AUD", re.I), "AUD"),
    (re.compile(r"دولار"), "USD"),
    (re.compile(r"\bUSD\b", re.I), "USD"),
    (re.compile(r"رنقت|رنجت|رينغيت|رنغيت|ريجنت"), "MYR"),
    (re.compile(r"\bMYR\b|\bRM\b", re.I), "MYR"),
]

CITIES = [
    "كوالالمبور", "كوالا لمبور", "كوالا لامبور", "سيلانجور", "شاه علم",
    "بيتالينغ جايا", "بوتراجايا", "نيلاي", "سيردانغ", "كاجانغ", "جوهور",
    "جوهور باهرو", "بينانغ", "بينانج", "ملقا", "مالاكا", "إيبوه", "ايبوه",
    "كوتا كينابالو", "كوتشينغ", "تيرينجانو", "كيلانتان", "بيراك", "قدح",
    "باهانغ", "نوسا جايا", "سرمبان", "كلانج", "بيتالينغ", "سيبانغ",
]

LEVEL_WORDS = [
    ("phd", r"دكتوراه|الدكتوراه"),
    ("master", r"ماجستير|الماجستير"),
    ("bachelor", r"بكالوريوس|البكالوريوس"),
    ("diploma", r"دبلوم"),
    ("foundation", r"السنة التحضيرية|تحضيري|foundation"),
]

INDEX_TITLES_RE = re.compile(r"من نحن|تواصل معنا|مقالات ماليزيا|الصفحة الرئيسية")
INDEX_SLUGS = {"home"}


def _has_number(text: str) -> bool:
    return bool(re.search(r"[0-9]", normalize_digits(text or "")))


def find_amounts(text: str):
    """Return list of (amount, currency|None) found in a cell, in order.

    A number is attached to the nearest currency marker within a small window
    (so "61,200 رنجت (13,600 دولار)" -> [(61200, MYR), (13600, USD)])."""
    t = normalize_digits(text or "")
    markers = []  # (pos, currency)
    for pat, cur in CURRENCY_MARKERS:
        for m in pat.finditer(t):
            markers.append((m.start(), cur))
    out = []
    for m in re.finditer(r"\d[\d,]*(?:\.\d+)?", t):
        num = parse_num(m.group(0))
        if num is None:
            continue
        # choose nearest marker
        best, best_d = None, None
        for pos, cur in markers:
            d = abs(pos - m.start())
            if best_d is None or d < best_d:
                best, best_d = cur, d
        if best_d is not None and best_d <= 25:
            out.append((num, best))
        else:
            out.append((num, None))
    return out


def fee_from_cell(label: str, cell: str):
    """Build one fee entry {label, price, currency[, price_usd, price_myr]}."""
    amounts = find_amounts(cell)
    if not amounts:
        return None
    primary = next((a for a in amounts if a[1] == "MYR"), amounts[0])
    entry = {"label": label, "price": primary[0], "currency": primary[1]}
    for amt, cur in amounts:
        if cur == "USD" and "price_usd" not in entry:
            entry["price_usd"] = amt
        if cur == "MYR" and "price_myr" not in entry:
            entry["price_myr"] = amt
    return entry


# ----------------------------------------------------------------------------
# HTML helpers
# ----------------------------------------------------------------------------

def get_tables(content_html: str):
    """Return [(headers, rows)] for every <table> in the rendered content."""
    if not content_html or BeautifulSoup is None:
        return []
    soup = BeautifulSoup(content_html, "lxml")
    tables = []
    for table in soup.find_all("table"):
        headers = [clean_text(th.get_text(" ", strip=True)) for th in table.find_all("th")]
        rows = []
        for tr in table.find_all("tr"):
            tds = tr.find_all("td")
            if not tds:
                continue
            rows.append([clean_text(td.get_text(" ", strip=True)) for td in tds])
        if headers or rows:
            tables.append((headers, rows))
    return tables


def extract_description(content_html: str, content_text: str) -> str:
    """First meaningful paragraphs of the page, capped for readability."""
    if BeautifulSoup is not None and content_html:
        soup = BeautifulSoup(content_html, "lxml")
        chunks = []
        for p in soup.find_all("p"):
            t = clean_text(p.get_text(" ", strip=True))
            if len(t) >= 40:
                chunks.append(t)
            if len(" ".join(chunks)) > 700:
                break
        if chunks:
            return " ".join(chunks)[:800]
    return (content_text or "")[:800]


def detect_city(text: str):
    """Earliest-mentioned known city wins (title/slug/description are prepended
    by the caller, so the page's own intro beats footer boilerplate)."""
    best, best_pos = None, None
    for c in CITIES:
        pos = text.find(c)
        if pos != -1 and (best_pos is None or pos < best_pos):
            best, best_pos = c, pos
    return best


def extract_exclusions(content_html: str, content_text: str):
    """Pull free-text notes that say a fee excludes something.

    Prefers the HTML element that actually contains the note (much cleaner than
    the whitespace-collapsed page text), falling back to a text scan."""
    out = []
    if BeautifulSoup is not None and content_html:
        soup = BeautifulSoup(content_html, "lxml")
        seen = set()
        for node in soup.find_all(string=EXCLUDE_HEADER_RE):
            parent = node.parent
            if parent is None:
                continue
            t = re.sub(r"^[®\s]+", "", clean_text(parent.get_text(" ", strip=True)))
            if 10 <= len(t) <= 500 and t not in seen:
                seen.add(t)
                out.append(t)
        if out:
            return out
    for m in re.finditer(
        r"[^.،\n]{0,140}(?:لا تشمل|لايشمل|غير شامل(?:ة)?|غير مشمول)[^.،\n]{0,160}",
        content_text or "",
    ):
        s = clean_text(m.group(0))
        if s:
            out.append(s)
    return out


def detect_levels(text: str):
    found = []
    for name, pat in LEVEL_WORDS:
        if re.search(pat, text):
            found.append(name)
    return found


# ----------------------------------------------------------------------------
# Fee-table parsing
# ----------------------------------------------------------------------------

def _col(headers, *keywords):
    """Index of first header containing any keyword, else None."""
    for i, h in enumerate(headers):
        for kw in keywords:
            if kw in h:
                return i
    return None


def rows_to_fees(headers, rows):
    """Turn a fee table's data rows into a list of fee entries."""
    entries = []
    hdr0 = headers[0] if headers else ""

    # Special case: the language-institute "course duration / visa fee" table.
    if any("مدة الكورس" in h for h in headers) and any("دولار" in h for h in headers):
        myr_i = _col(headers, "رسوم تشمل", "الرسوم")
        usd_i = _col(headers, "بالدولار", "دولار")
        visa_i = _col(headers, "مدة الفيزا", "التاشيرة", "تأشيرة")
        for cells in rows:
            if not cells or not _has_number(" ".join(cells)):
                continue
            label = f"مدة الكورس: {cells[0]}" if cells[0] else "مدة الكورس"
            cell = cells[myr_i] if myr_i is not None and myr_i < len(cells) else ""
            entry = fee_from_cell(label, cell)
            if entry is None:
                entry = {"label": label, "price": None, "currency": None}
            if cells[0]:
                entry["duration"] = cells[0]
            if usd_i is not None and usd_i < len(cells):
                amts = find_amounts(cells[usd_i])
                if amts:
                    entry["price_usd"] = amts[0][0]
            if visa_i is not None and visa_i < len(cells) and cells[visa_i]:
                entry["visa_duration"] = cells[visa_i]
            if entry.get("price") is not None or entry.get("price_usd") is not None:
                entries.append(entry)
        return entries

    combine_first_two = ("جامعة" in hdr0) or ("أسم الجامعة" in hdr0)
    dur_i = next(
        (i for i, h in enumerate(headers) if DURATION_HEADER_RE.search(h)), None
    )

    for cells in rows:
        if not cells or not any(cells):
            continue
        if not _has_number(" ".join(cells)):
            continue
        dur = cells[dur_i] if dur_i is not None and dur_i < len(cells) else None
        num_idx = []
        for i in range(1, len(cells)):
            h = headers[i] if i < len(headers) else ""
            if NON_FEE_HEADER_RE.search(h):
                continue
            if _has_number(cells[i]):
                num_idx.append(i)
        if not num_idx:
            continue

        if combine_first_two and len(cells) > 1 and cells[1]:
            label = f"{cells[0]} — {cells[1]}"
        else:
            label = cells[0]

        row_entries = []
        if len(num_idx) == 1:
            entry = fee_from_cell(label, cells[num_idx[0]])
            if entry:
                row_entries.append(entry)
        else:
            for i in num_idx:
                h = headers[i] if i < len(headers) else ""
                lab = f"{label} — {h}" if h else label
                entry = fee_from_cell(lab, cells[i])
                if entry:
                    row_entries.append(entry)
        for entry in row_entries:
            if dur:
                entry.setdefault("duration", dur)
        entries.extend(row_entries)
    return entries


def classify_table(headers, rows):
    """Return {'fees'|'inclusions'|'requirements'|'exclusions': [...]}."""
    h = " | ".join(headers)
    if REQ_HEADER_RE.search(h):
        return {"requirements": [r[0] for r in rows if r and r[0]]}
    # The institute "course duration / visa fee" table also contains the word
    # "تشمل" in a column header, so it must be tested before inclusions.
    if any("مدة الكورس" in x for x in headers) and any("دولار" in x for x in headers):
        return {"fees": rows_to_fees(headers, rows)}
    if EXCLUDE_HEADER_RE.search(h):
        return {"exclusions": [r[0] for r in rows if r and r[0]]}
    if INCLUDE_HEADER_RE.search(h):
        return {"inclusions": [r[0] for r in rows if r and r[0]]}
    if FEE_HEADER_RE.search(h) or any(_has_number(" ".join(r)) for r in rows):
        return {"fees": rows_to_fees(headers, rows)}
    return {}


# ----------------------------------------------------------------------------
# Kind inference
# ----------------------------------------------------------------------------

def infer_kind(title: str, slug: str, text: str, has_fees: bool) -> str:
    s = urllib.parse.unquote(slug or "")
    t = f"{title} {s}"

    if s in INDEX_SLUGS or INDEX_TITLES_RE.search(title or ""):
        return "misc"
    # language institutes / academies -> center (but not the "معاهد اللغة" index)
    if re.search(r"معهد|أكاديمية|اكاديمية|institute|academy", title or "") and "معاهد" not in (title or ""):
        return "center"
    # single degree-topic pages -> program
    if re.search(r"ماجستير|دكتوراه|doctorate|phd", title or "") and not re.search(r"جامعة|جامعه|university", title or ""):
        return "program"
    # named university / university-profile page -> university
    if re.search(r"جامعة|جامعه|university|unikl|ucsi|mmu|apu|utm|segi|help|iukl|limkokwing", t):
        return "university"
    # explicit "تخصصات" pages and single academic-field pages -> discipline
    if "تخصصات" in t or FIELD_RE.search(title or ""):
        return "discipline"
    if re.search(
        r"الدراسة في|تكاليف|رسوم|معتمدة|المعترف|الجامعات|دراسة اللغة|"
        r"عروض|معاهد|عن بعد|أفضل|مسار",
        t,
    ):
        return "article"
    return "misc"


# ----------------------------------------------------------------------------
# Record builder
# ----------------------------------------------------------------------------

def build_record(kind, item, content_html, content_text, tables):
    title = item.get("title") or ""
    link = item.get("link") or ""
    fees, inclusions, requirements, exclusions = [], [], [], []
    for headers, rows in tables:
        out = classify_table(headers, rows)
        fees.extend(out.get("fees", []))
        inclusions.extend(out.get("inclusions", []))
        requirements.extend(out.get("requirements", []))
        exclusions.extend(out.get("exclusions", []))

    # de-duplicate while preserving order
    def dedup(seq):
        seen, out = set(), []
        for x in seq:
            key = json.dumps(x, ensure_ascii=False, sort_keys=True)
            if key not in seen:
                seen.add(key)
                out.append(x)
        return out

    fees = dedup(fees)
    inclusions = dedup(inclusions)
    requirements = dedup(requirements)
    exclusions = dedup(exclusions + extract_exclusions(content_html, content_text))

    myr = [f["price"] for f in fees if f.get("currency") == "MYR" and f.get("price") is not None]
    usd = [f["price"] for f in fees if f.get("currency") == "USD" and f.get("price") is not None]
    durs = [f["duration"] for f in fees if f.get("duration")]
    duration = durs[0] if len(set(durs)) == 1 else None

    text_for_levels = " ".join([title] + [c for _h, rs in tables for r in rs for c in r])
    levels = detect_levels(text_for_levels) or detect_levels(title)
    level = levels[0] if len(levels) == 1 else None

    description = extract_description(content_html, content_text)
    city = detect_city(
        f"{title} {urllib.parse.unquote(item.get('slug') or '').replace('-', ' ')} "
        f"{description} {content_text[:1000]}"
    )

    field = None
    if kind == "program":
        f = re.sub(r"^(دراسة\s+)?(ماجستير|دكتوراه|الدكتوراه|الماجستير)\s*(في)?\s*", "", title).strip()
        field = f or None

    rec = {
        "kind": kind,
        "source_url": link,
        "source_id": item.get("id"),
        "title": title,
        "name": title,
        "name_ar": title,
        "date": item.get("date"),
        "city": city,
        "level": level,
        "levels": levels or None,
        "field": field,
        "duration": duration,
        "fee_myr": min(myr) if myr else None,
        "fee_usd": min(usd) if usd else None,
        "fees_table": fees,
        "inclusions": inclusions,
        "exclusions": exclusions,
        "requirements": requirements,
        "description": description,
        "content_text": content_text,
        "fetched_at": now_iso(),
    }
    if kind == "university":
        rec["university"] = title
    if kind == "center":
        rec["center"] = title
    return rec


def has_structured_record(rec) -> bool:
    if rec["kind"] in ("university", "center", "program", "discipline"):
        return True
    if rec["fees_table"] or rec["requirements"] or rec["inclusions"] or rec["exclusions"]:
        return True
    # informational articles only when there is a real body of text
    return rec["kind"] == "article" and len(rec.get("description") or "") >= 120


# ----------------------------------------------------------------------------
# REST helpers
# ----------------------------------------------------------------------------

def fetch_all(resource: str, fields: str):
    """Paginate a WP collection and return all items."""
    items = []
    page = 1
    while True:
        url = f"{API}/{resource}?per_page={PER_PAGE}&page={page}&_fields={fields}"
        data = fetch_json(url)
        if not data:
            break
        if isinstance(data, dict):  # error payload
            break
        items.extend(data)
        if len(data) < PER_PAGE:
            break
        page += 1
    return items


def fetch_terms(taxonomy: str):
    """id -> name map for a taxonomy, paginated."""
    out = {}
    page = 1
    while True:
        url = f"{API}/{taxonomy}?per_page={PER_PAGE}&page={page}&_fields=id,name"
        data = fetch_json(url)
        if not data or isinstance(data, dict):
            break
        for t in data:
            out[t["id"]] = t.get("name")
        if len(data) < PER_PAGE:
            break
        page += 1
    return out


def term_names(ids, mapping):
    if not ids:
        return []
    return [mapping[i] for i in ids if i in mapping]


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------

def main():
    print(f"[{SOURCE}] fetching WP collections ...")
    pages = fetch_all("pages", FIELDS)
    posts = fetch_all("posts", FIELDS)
    cats = fetch_terms("categories")
    tags = fetch_terms("tags")
    print(f"  pages={len(pages)} posts={len(posts)} categories={len(cats)} tags={len(tags)}")

    pages_sink = JsonlSink(SOURCE, "pages", outdir=HERE)
    posts_sink = JsonlSink(SOURCE, "posts", outdir=HERE)
    records_sink = JsonlSink(SOURCE, "records", outdir=HERE)

    kind_counts = {}
    fee_pages = []

    def process(item, kind_label, sink):
        link = item.get("link") or ""
        title = (item.get("title") or {}).get("rendered") or ""
        content_html = (item.get("content") or {}).get("rendered") or ""
        content_text = clean_text(content_html)

        if not sink.done(link):
            sink.write(
                {
                    "kind": kind_label,
                    "id": item.get("id"),
                    "slug": item.get("slug"),
                    "link": link,
                    "title": title,
                    "date": item.get("date"),
                    "modified": item.get("modified"),
                    "content_html": content_html,
                    "content_text": content_text,
                    "categories": term_names(item.get("categories"), cats),
                    "tags": term_names(item.get("tags"), tags),
                },
                source_url=link,
            )

        if records_sink.done(link):
            return
        tables = get_tables(content_html)
        has_fees = any("fees" in classify_table(h, r) for h, r in tables)
        kind = infer_kind(title, item.get("slug") or "", content_text, has_fees)
        rec = build_record(kind, {**item, "title": title, "link": link},
                           content_html, content_text, tables)
        if has_structured_record(rec):
            records_sink.write(rec, source_url=link)
            kind_counts[kind] = kind_counts.get(kind, 0) + 1
            if rec["fees_table"]:
                fee_pages.append((title, link, len(rec["fees_table"])))

    for p in pages:
        process(p, "page", pages_sink)
    for p in posts:
        process(p, "post", posts_sink)

    pages_sink.close()
    posts_sink.close()
    records_sink.close()

    print(f"  pages.jsonl   = {pages_sink.count()}")
    print(f"  posts.jsonl   = {posts_sink.count()}")
    print(f"  records.jsonl = {records_sink.count()}")
    print(f"  record kinds  = {kind_counts}")
    print(f"  pages with parsed fee tables = {len(fee_pages)}")


if __name__ == "__main__":
    main()
