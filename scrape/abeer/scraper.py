#!/usr/bin/env python3
"""
Scraper for abeereducation.com (Abeer Education — study-in-Malaysia agency).

Produces (newline-delimited JSON, resumable):
    universities.jsonl   kind="university"
    institutes.jsonl     kind="center"   (from /institutes; empty if none listed)
    pages.jsonl          kind="page"     (about / contact / terms / privacy-policy)
    blog.jsonl           kind="article"  (posts discovered from /blog/ + pagination)

Design notes
------------
* Uses the shared kit in ../common.py (fetch, JsonlSink, clean_text, parse_num...).
* Respects robots.txt: only public university / page / blog HTML is fetched.
  Disallowed paths (/api/, /programs/, /courses, /search, /login, /register,
  /admin, /dashboard, /public/) are never requested.
* The host aggressively rate-limits (HTTP 429 -> fetch() returns None), so every
  request goes through `_get()` which backs off for a long time and retries.
* Original Arabic / English text is preserved verbatim; no translation.
* Missing values are written as null — never fabricated.
"""

from __future__ import annotations

import os
import re
import sys
import time
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

# --- shared kit -------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import common  # noqa: E402
from common import JsonlSink, clean_text, parse_num, to_int  # noqa: E402

BASE = "https://abeereducation.com"
SOURCE = "abeer"
OUTDIR = HERE

# The host's WAF returns HTTP 429 for non-browser User-Agents on the main
# (Laravel) app, so we identify with a normal browser UA. robots.txt is still
# respected and requests are paced.
common._SESSION.headers["User-Agent"] = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)
common._SESSION.headers["Accept-Language"] = "ar,en;q=0.9"

DELAY = 3.0          # seconds of politeness after every successful request
MAX_RETRIES = 8      # 429 backoff rounds
BACKOFF = 25         # seconds * attempt

# Optional on-disk HTML cache (set ABEER_CACHE to a directory). Makes parser
# re-runs instant and avoids re-hammering the site.
CACHE_DIR = os.environ.get("ABEER_CACHE")


def _cache_path(url: str):
    if not CACHE_DIR:
        return None
    import hashlib
    os.makedirs(CACHE_DIR, exist_ok=True)
    return os.path.join(CACHE_DIR, hashlib.sha1(url.encode()).hexdigest()[:16] + ".html")


def _get(url: str):
    """Fetch a URL, tolerating the host's aggressive 429 rate limiting."""
    cp = _cache_path(url)
    if cp and os.path.exists(cp) and os.path.getsize(cp) > 500:
        with open(cp, encoding="utf-8") as fh:
            return fh.read()
    for attempt in range(1, MAX_RETRIES + 1):
        html = common.fetch(url, tries=1, delay=DELAY)
        if html:
            if cp:
                with open(cp, "w", encoding="utf-8") as fh:
                    fh.write(html)
            return html
        wait = BACKOFF * attempt
        print(f"    ! blocked/failed, retry {attempt}/{MAX_RETRIES} in {wait}s: {url}",
              flush=True)
        time.sleep(wait)
    print(f"    !! giving up: {url}", flush=True)
    return None


def _soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "lxml")


# ---------------------------------------------------------------------------
# small parsers
# ---------------------------------------------------------------------------
def _qs_year(text):
    m = re.search(r"QS\s*((?:19|20)\d{2})", text or "")
    return int(m.group(1)) if m else None


def _qs_rank_from(v):
    """Extract a numeric QS rank from a value string (handles ranges/stars)."""
    if not v:
        return None
    for pat in (r"(?:المرتبة|الفئة|الـ|#)\s*([\d][\d,]*)",
                r"([\d][\d,]*)\s*(?:عالمي|في آسيا|في جنوب|Rank)"):
        m = re.search(pat, v)
        if m:
            return to_int(m.group(1))
    return None


def _split_intakes(raw):
    if not raw:
        return None
    parts = [p.strip(" .") for p in re.split(r"[,،]", raw) if p.strip(" .")]
    return parts or None


def _split_recognized(text):
    """Split a 'Country: value' list item; returns (key, value) or (None, text)."""
    m = re.match(r"^\s*([^:：]{2,40})[:：]\s*(.+)$", text or "")
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return None, (text or "").strip()


def _blocks(container):
    """Split a container's direct children into ordered heading blocks.

    Returns a list of {"level", "heading", "els"} where `els` are the
    non-heading elements that follow a heading (until the next heading).
    """
    blocks = []
    cur = None
    for el in container.find_all(recursive=False):
        name = getattr(el, "name", None)
        if name in ("h1", "h2", "h3", "h4"):
            cur = {"level": name,
                   "heading": clean_text(el.get_text(" ", strip=True)),
                   "els": []}
            blocks.append(cur)
        elif name in ("style", "script"):
            continue
        else:
            if cur is None:
                cur = {"level": None, "heading": None, "els": []}
                blocks.append(cur)
            cur["els"].append(el)
    return blocks


def _first_p(els):
    for el in els:
        p = el if getattr(el, "name", None) == "p" else el.find("p")
        if p:
            return clean_text(p.get_text(" ", strip=True))
    return None


_PROG_HINTS = ("أبرز البرامج", "التخصص", "البرنامج", "المستوى الدراسي",
               "المستوى", "الكلية")


def _parse_fee_tables(root):
    """Parse every fee-like table under `root` into normalised rows.

    Handles both the classic 3-column table (التخصص | المدة | الرسوم الإجمالية)
    and the narrative template's 4-column tables (e.g. with شروط القبول, or
    separate RM/USD columns).
    """
    out = []
    for table in root.find_all("table"):
        rows = table.find_all("tr")
        if not rows:
            continue
        header = [clean_text(c.get_text(" ", strip=True))
                  for c in rows[0].find_all(["th", "td"])]
        htext = " ".join(header)
        is_fee = ("الرسوم الإجمالية" in htext) or (
            "الرسوم" in htext
            and any(x in htext for x in ("المدة", "البرنامج", "التخصص", "المستوى")))
        if not is_fee or len(header) < 2:
            continue

        def idx(preds):
            for i, h in enumerate(header):
                if any(p in h for p in preds):
                    return i
            return None

        def idx_priority(preds):
            for p in preds:
                for i, h in enumerate(header):
                    if p in h:
                        return i
            return None

        prog_i = idx_priority(_PROG_HINTS)
        dur_i = idx(("المدة",))
        fee_i = None
        for pref in ("الإجمالية", "USD", "RM"):
            for i, h in enumerate(header):
                if pref in h and "الرسوم" in h:
                    fee_i = i
                    break
            if fee_i is not None:
                break
        if fee_i is None:
            fee_i = idx(("الرسوم",))
        if prog_i is None and fee_i is None:
            continue

        for row in rows[1:]:
            vals = [clean_text(c.get_text(" ", strip=True))
                    for c in row.find_all(["td", "th"])]
            if not vals:
                continue
            prog = vals[prog_i] if prog_i is not None and prog_i < len(vals) else None
            dur = vals[dur_i] if dur_i is not None and dur_i < len(vals) else None
            fee_raw = vals[fee_i] if fee_i is not None and fee_i < len(vals) else None
            if not prog and not fee_raw:
                continue
            cur = None
            if fee_raw:
                if "$" in fee_raw or "USD" in fee_raw.upper():
                    cur = "USD"
                elif "RM" in fee_raw or "MYR" in fee_raw.upper():
                    cur = "MYR"
            extra = {}
            for i, h in enumerate(header):
                if i in (prog_i, dur_i, fee_i) or not h or i >= len(vals):
                    continue
                if vals[i]:
                    extra[h] = vals[i]
            out.append({
                "program": prog,
                "duration": dur or None,
                "fee": parse_num(fee_raw) if fee_raw else None,
                "fee_raw": fee_raw,
                "currency": cur,
                "extra": extra or None,
            })
    return out


# ---------------------------------------------------------------------------
# university pages
# ---------------------------------------------------------------------------
def parse_university(url: str, html: str) -> dict:
    soup = _soup(html)
    uni = soup.select_one(".ab-uni-single")
    if uni is None:
        # fall back to the whole document
        uni = soup

    hero = uni.select_one(".ab-uni-hero")
    name = None
    location_hero = None
    category = None
    hero_image = None
    logo = None
    hero_stats = {}

    if hero:
        h1 = hero.select_one(".ab-uni-hero-title")
        if h1:
            name = clean_text(h1.get_text(" ", strip=True))
        loc = hero.select_one(".ab-uni-hero-location")
        if loc:
            location_hero = clean_text(loc.get_text(" ", strip=True))
        badge = hero.select_one(".ab-uni-hero-badge")
        if badge:
            category = clean_text(badge.get_text(" ", strip=True))
        for img in hero.select("img"):
            src = img.get("src")
            if not src:
                continue
            if "featured_images" in src and hero_image is None:
                hero_image = src
            elif "universities_logos" in src and logo is None:
                logo = src
        for st in hero.select(".ab-uni-hero-stat"):
            strong = st.find("strong")
            span = st.find("span")
            if strong and span:
                hero_stats[clean_text(span.get_text(" ", strip=True))] = clean_text(
                    strong.get_text(" ", strip=True))

    if name is None:
        t = soup.select_one(".ab-uni-card-title") or soup.find("h1")
        name = clean_text(t.get_text(" ", strip=True)) if t else None

    # slug / abbreviation from URL
    slug = urlparse(url).path.rstrip("/").split("/")[-1]

    # ---- overview tab -----------------------------------------------------
    pane = uni.select_one("#ab-tab-overview") or uni

    # quick facts are the <ul> that starts with "الاسم الكامل"
    facts = {}
    facts_ul = None
    for ul in pane.find_all("ul"):
        first = ul.find("li")
        if first and "الاسم الكامل" in clean_text(first.get_text(" ", strip=True)):
            facts_ul = ul
            break
    if facts_ul:
        for li in facts_ul.find_all("li", recursive=False):
            t = clean_text(li.get_text(" ", strip=True))
            m = re.match(r"^([^:：]+)[:：]\s*(.+)$", t)
            if m:
                facts.setdefault(m.group(1).strip(), m.group(2).strip())

    # Extended key:value facts gathered from every <li> in the overview pane
    # (some templates put rankings in a separate list, e.g. "QS World: ...").
    ext_facts = dict(facts)
    for li in pane.find_all("li"):
        t = clean_text(li.get_text(" ", strip=True))
        m = re.match(r"^([^:：]{1,40})[:：]\s*(.+)$", t)
        if m:
            ext_facts.setdefault(m.group(1).strip(), m.group(2).strip())

    def fact(*keys):
        for k, v in facts.items():
            if any(kk in k for kk in keys):
                return v
        return None

    def efact(*keys):
        for k, v in ext_facts.items():
            if any(kk in k for kk in keys):
                return v
        return None

    name_en = fact("الاسم الكامل")
    abbr = fact("الاختصار")
    founded_year_raw = fact("سنة التأسيس")
    founded_year = None
    if founded_year_raw:
        m = re.search(r"(1[89]\d{2}|20\d{2})", founded_year_raw)
        founded_year = int(m.group(1)) if m else to_int(founded_year_raw)
    location = fact("الموقع", "الحرمان", "الحرم")
    campuses = fact("الحرمان", "الحرم")
    uni_type = fact("نوع الجامعة", "النوع")
    student_count = to_int(fact("عدد الطلاب"))
    international_students = to_int(fact("الطلاب الدوليون", "الطلاب الدوليين"))
    languages = fact("لغة الدراسة")
    accreditation = fact("الاعتمادات", "الاعتماد")
    employability = fact("معدل التوظيف")
    alumni_count = to_int(fact("الخريجون"))
    ranking = efact("التصنيف", "تصنيف")

    # QS: the key is usually "تصنيف QS <year>" but some pages use "التصنيف"
    # and mention QS inside the value (rank range or star rating). Prefer a
    # numeric ranking over a star rating when both appear.
    qs_pairs = [(k, v) for k, v in ext_facts.items()
                if "QS" in k or "QS" in (v or "")]
    rating_marks = ("نجوم", "نجمة", "Star")
    qs_rank = None
    qs_rank_raw = None
    qs_rank_key = None
    for k, v in qs_pairs:
        r = _qs_rank_from(v)
        if r is not None:
            qs_rank, qs_rank_raw, qs_rank_key = r, v, k
            break
    qs_rating_raw = None
    qs_rating_key = None
    for k, v in qs_pairs:
        if any(s in v for s in rating_marks):
            qs_rating_raw, qs_rating_key = v, k
            break
    qs_rating = qs_rating_raw
    qs_raw = qs_rank_raw or qs_rating_raw
    qs_key = qs_rank_key or qs_rating_key
    qs_year = _qs_year(f"{qs_key or ''} {qs_raw or ''}") if qs_raw else None

    city = None
    if location:
        parts = [p.strip() for p in re.split(r"[،,]", location) if p.strip()]
        if parts:
            city = re.split(r"\s*[/|]\s*", parts[-1])[0].strip() or None

    # ordered heading blocks inside the single section body
    body = pane.select_one(".ab-uni-section-body") or pane
    blocks = _blocks(body)

    # ---- description (intro paragraph under "نظرة") ------------------------
    description = None
    for b in blocks:
        if b["heading"] and "نظرة" in b["heading"]:
            description = _first_p(b["els"])
            break
    if not description:
        description = _first_p([e for b in blocks for e in b["els"]])

    # ---- faculties (h3 colleges under the "تخصصات"/"الكليات" h2) -----------
    faculties = []
    for i, b in enumerate(blocks):
        if (b["heading"] and b["level"] == "h2"
                and ("تخصصات" in b["heading"] or "الكليات" in b["heading"])):
            for nb in blocks[i + 1:]:
                if nb["level"] == "h2":
                    break
                if nb["level"] == "h3" and nb["heading"]:
                    if nb["heading"] not in faculties:
                        faculties.append(nb["heading"])
            break
    program_faculties = []
    for f in uni.select(".ps-card-faculty"):
        t = clean_text(f.get_text(" ", strip=True))
        if t and t not in program_faculties:
            program_faculties.append(t)

    # ---- fees table(s) ----------------------------------------------------
    fees_table = _parse_fee_tables(pane)

    # ---- recognition by country ------------------------------------------
    recognition = {}
    recognition_text_parts = []
    rec_note = None
    rec_started = False
    cur = None
    for b in blocks:
        h = b["heading"]
        if not rec_started:
            if b["level"] == "h2" and h and ("معترف" in h or "الاعتراف" in h):
                rec_started = True
                intro = _first_p(b["els"])
                if intro:
                    rec_note = intro
                    recognition_text_parts.append(intro)
            continue
        if b["level"] == "h2":
            break
        if b["level"] == "h3" and h:
            cur = re.sub(r"^الاعتراف\s*(في|بـ|ب)?\s*", "", h).strip() or h
            recognition.setdefault(cur, "")
            recognition_text_parts.append(h + ":")
        for el in b["els"]:
            if getattr(el, "name", None) == "p":
                t = clean_text(el.get_text(" ", strip=True))
                if not t:
                    continue
                recognition_text_parts.append(t)
                if "قد يختلف" in t or "راجع الجهة" in t:
                    rec_note = t
                elif cur:
                    recognition[cur] = (recognition.get(cur, "") + " " + t).strip()
            elif getattr(el, "name", None) == "ul":
                for li in el.find_all("li", recursive=False):
                    t = clean_text(li.get_text(" ", strip=True))
                    if not t:
                        continue
                    recognition_text_parts.append(t)
                    key, val = _split_recognized(t)
                    if key:
                        recognition.setdefault(key, val)
                    elif cur:
                        recognition[cur] = (recognition.get(cur, "") + " " + t).strip()
    recognition = {k: v for k, v in recognition.items() if v}
    if not recognition:
        recognition = None
    recognition_text = clean_text(" ".join(recognition_text_parts)) or None
    if not recognition_text:
        # narrative templates fold accreditation + recognition into a section
        # titled "تصنيف واعتماد ..." — keep its prose as recognition_text.
        for i, b in enumerate(blocks):
            if b["level"] == "h2" and b["heading"] and "اعتماد" in b["heading"]:
                parts = [b["heading"] + ":"]
                for nb in blocks[i:]:
                    if nb is not b and nb["level"] == "h2":
                        break
                    for el in nb["els"]:
                        t = clean_text(el.get_text(" ", strip=True))
                        if t:
                            parts.append(t)
                recognition_text = clean_text(" ".join(parts)) or None
                break

    # ---- requirements ------------------------------------------------------
    # Prefer the university-specific "شروط القبول" section (narrative
    # template); fall back to the shared "شروط الدراسة في ماليزيا" block.
    requirements_sections = []
    for i, b in enumerate(blocks):
        if (b["heading"] and b["level"] == "h2"
                and "شروط القبول" in b["heading"]):
            own_items = [clean_text(li.get_text(" ", strip=True))
                         for el in b["els"] if getattr(el, "name", None) == "ul"
                         for li in el.find_all("li", recursive=False)]
            own_texts = [clean_text(el.get_text(" ", strip=True))
                         for el in b["els"] if getattr(el, "name", None) == "p"]
            if own_items or own_texts:
                requirements_sections.append({
                    "section": b["heading"], "text": own_texts or None,
                    "items": own_items or None})
            for nb in blocks[i + 1:]:
                if nb["level"] == "h2":
                    break
                items = [clean_text(li.get_text(" ", strip=True))
                         for el in nb["els"] if getattr(el, "name", None) == "ul"
                         for li in el.find_all("li", recursive=False)]
                texts = [clean_text(el.get_text(" ", strip=True))
                         for el in nb["els"] if getattr(el, "name", None) == "p"]
                if items or texts:
                    requirements_sections.append({
                        "section": nb["heading"], "text": texts or None,
                        "items": items or None})
            break
    if not requirements_sections:
        for sec in uni.select(".ab-uni-static"):
            title = sec.select_one(".ab-uni-static-title")
            if not title:
                continue
            if "شروط الدراسة" in clean_text(title.get_text(" ", strip=True)):
                for sub in sec.select(".ab-uni-static-sub"):
                    sub_t = sub.select_one(".ab-uni-static-subtitle")
                    items = [clean_text(li.get_text(" ", strip=True))
                             for li in sub.find_all("li")]
                    texts = [clean_text(p.get_text(" ", strip=True))
                             for p in sub.find_all("p")]
                    requirements_sections.append({
                        "section": clean_text(sub_t.get_text(" ", strip=True)) if sub_t else None,
                        "text": texts or None,
                        "items": items or None,
                    })
                break
    requirements = None
    if requirements_sections:
        chunks = []
        for s in requirements_sections:
            if s["section"]:
                chunks.append(s["section"] + ":")
            chunks.extend(s["text"] or [])
            chunks.extend(s["items"] or [])
        requirements = clean_text(" ".join(chunks))

    # ---- intakes ----------------------------------------------------------
    intakes_raw = None
    for cell in uni.select(".ps-info-cell"):
        lab = cell.select_one(".ps-info-l")
        val = cell.select_one(".ps-info-v")
        if lab and val and "القبول" in clean_text(lab.get_text(" ", strip=True)):
            intakes_raw = clean_text(val.get_text(" ", strip=True))
            break
    if not intakes_raw:
        for b in blocks:
            if b["heading"] and "مواعيد التسجيل" in b["heading"]:
                intakes_raw = _first_p(b["els"])
                break
    intakes = _split_intakes(intakes_raw)

    # ---- FAQ --------------------------------------------------------------
    faq = []
    in_faq = False
    for b in blocks:
        if b["level"] == "h2" and b["heading"] and "الأسئلة الشائعة" in b["heading"]:
            in_faq = True
            continue
        if in_faq and b["level"] == "h2":
            break
        if in_faq and b["level"] == "h3" and b["heading"]:
            faq.append({"q": b["heading"], "a": _first_p(b["els"])})
    faq = faq or None

    # ---- program count from hero stats ------------------------------------
    program_count = None
    for k, v in hero_stats.items():
        if "البرامج" in k:
            program_count = to_int(v)
            break
    programs_listed = len(uni.select(".ps-card"))

    # ---- hero starting fee ------------------------------------------------
    hero_fee_raw = None
    for k, v in hero_stats.items():
        if "سنو" in k:
            hero_fee_raw = v
            break

    content_text = clean_text(uni.get_text(" ", strip=True))

    return {
        "kind": "university",
        "source_url": url,
        "name": name,
        "name_en": name_en,
        "abbr": abbr,
        "slug": slug,
        "city": city,
        "location": location or location_hero,
        "campuses": campuses,
        "type": uni_type,
        "category": category,
        "founded_year": founded_year,
        "qs_rank": qs_rank,
        "qs_year": qs_year,
        "qs_raw": qs_raw,
        "qs_rating": qs_rating,
        "ranking": ranking,
        "student_count": student_count,
        "international_students": international_students,
        "program_count": program_count,
        "programs_listed": programs_listed,
        "employability": employability,
        "alumni_count": alumni_count,
        "languages_of_instruction": languages,
        "accreditation": accreditation,
        "description": description,
        "faculties": faculties or None,
        "program_faculties": program_faculties or None,
        "fees_table": fees_table or None,
        "recognition": recognition,
        "recognition_text": recognition_text,
        "recognition_note": rec_note,
        "requirements": requirements,
        "requirements_sections": requirements_sections or None,
        "intakes": intakes,
        "intakes_raw": intakes_raw,
        "faq": faq,
        "fee": parse_num(hero_fee_raw) if hero_fee_raw else None,
        "fee_raw": hero_fee_raw,
        "currency": "USD" if hero_fee_raw and "$" in hero_fee_raw else None,
        "logo": logo,
        "hero_image": hero_image,
        "hero_stats": hero_stats or None,
        "content_text": content_text,
    }


# ---------------------------------------------------------------------------
# language institutes (/institutes) — currently lists none
# ---------------------------------------------------------------------------
def parse_institutes(url: str, html: str) -> list[dict]:
    soup = _soup(html)
    records = []
    # Cards reuse the university card markup; only emit real cards with a link.
    for card in soup.select(".ab-uni-card, .ab-institute-card, [class*='institute-card']"):
        a = card.select_one("a[href]")
        if not a:
            continue
        link = urljoin(url, a["href"])
        if link.rstrip("/") in (BASE + "/institutes", BASE):
            continue
        title = card.select_one(".ab-uni-card-title, h3, h2")
        loc = card.select_one(".ab-uni-card-location")
        logo = card.select_one(".ab-uni-card-logo img, img")
        body = card.select_one(".ab-uni-card-body") or card
        records.append({
            "kind": "center",
            "source_url": link,
            "name": clean_text(title.get_text(" ", strip=True)) if title else None,
            "city": clean_text(loc.get_text(" ", strip=True)) if loc else None,
            "description": clean_text(body.get_text(" ", strip=True)),
            "courses": None,
            "logo": logo.get("src") if logo else None,
            "content_text": clean_text(card.get_text(" ", strip=True)),
        })
    return records


# ---------------------------------------------------------------------------
# static pages
# ---------------------------------------------------------------------------
def parse_page(url: str, html: str) -> dict:
    soup = _soup(html)
    main = soup.select_one("main#main-content") or soup.find("main") or soup
    # drop chrome
    for junk in main.select("nav, style, script, .ab-breadcrumb, footer"):
        junk.decompose()
    h1 = soup.find("h1")
    og_title = soup.select_one('meta[property="og:title"]')
    meta_desc = soup.select_one('meta[name="description"]')
    title = clean_text(h1.get_text(" ", strip=True)) if h1 else None
    if not title and og_title:
        title = og_title.get("content")
    return {
        "kind": "page",
        "source_url": url,
        "title": title,
        "description": (meta_desc.get("content") if meta_desc else None),
        "content_text": clean_text(main.get_text(" ", strip=True)),
    }


# ---------------------------------------------------------------------------
# blog
# ---------------------------------------------------------------------------
_POST_RE = re.compile(r"^https?://abeereducation\.com/blog/([^/]+)/?$")
_POST_SKIP = {"", "category", "author", "page", "tag", "feed", "comments", "wp-content"}


def _post_links(html: str, base_url: str) -> set[str]:
    soup = _soup(html)
    found = set()
    for a in soup.find_all("a", href=True):
        link = urljoin(base_url, a["href"]).split("#")[0].split("?")[0]
        m = _POST_RE.match(link)
        if not m:
            continue
        slug = m.group(1)
        if slug in _POST_SKIP or "/" in slug:
            continue
        found.add(link.rstrip("/") + "/")
    return found


def parse_article(url: str, html: str) -> dict:
    soup = _soup(html)
    article = soup.find("article")
    h1 = soup.select_one("h1") or soup.select_one(".entry-title")
    title = clean_text(h1.get_text(" ", strip=True)) if h1 else None
    if not title:
        og = soup.select_one('meta[property="og:title"]')
        title = og.get("content") if og else None

    content_el = None
    if article:
        content_el = article.select_one(".wd-entry-content")
    if content_el is None:
        content_el = (soup.select_one("article .entry-content")
                      or soup.select_one("article .post-content")
                      or article)
    if content_el:
        for junk in content_el.select("script, style, .sharedaddy, .share"):
            junk.decompose()
        content_text = clean_text(content_el.get_text(" ", strip=True))
    else:
        content_text = None

    # date — prefer the explicit published meta, never sidebar recent-posts times
    date = None
    for sel in ['meta[property="article:published_time"]',
                'meta[property="og:updated_time"]']:
        el = soup.select_one(sel)
        if el and el.get("content"):
            date = el["content"]
            break
    if not date and article:
        el = article.select_one("time[datetime]")
        if el:
            date = el.get("datetime") or clean_text(el.get_text(" ", strip=True))
    if not date:
        el = soup.select_one(".wd-post-date time[datetime], .wd-post-date")
        if el:
            date = el.get("datetime") or clean_text(el.get_text(" ", strip=True))

    # author
    author = None
    el = soup.select_one(".wd-post-author, .wd-meta-author")
    if el:
        author = clean_text(el.get_text(" ", strip=True))
    if not author:
        a = soup.select_one('a[href*="/blog/author/"]')
        if a:
            author = clean_text(a.get_text(" ", strip=True))
    if not author:
        tw = soup.select_one('meta[name="twitter:data1"]')
        if tw:
            author = tw.get("content")
    if author:
        author = re.sub(r"^\s*(Posted by|بواسطة|بقلم)\s*[:：]?\s*", "",
                        author, flags=re.I).strip() or None

    # categories / tags
    cats, tags = [], []
    for a in soup.find_all("a", href=True):
        h = a["href"]
        t = clean_text(a.get_text(" ", strip=True))
        if "/blog/category/" in h and t and t not in cats:
            cats.append(t)
        elif "/blog/tag/" in h and t and t not in tags:
            tags.append(t)

    og_img = soup.select_one('meta[property="og:image"]')
    image = og_img.get("content") if og_img else None
    if not image and content_el:
        img = content_el.find("img")
        if img:
            image = img.get("src")

    md = soup.select_one('meta[name="description"]')
    return {
        "kind": "article",
        "source_url": url,
        "title": title,
        "date": date,
        "author": author,
        "categories": cats or None,
        "tags": tags or None,
        "image": image,
        "description": md.get("content") if md else None,
        "content_text": content_text,
    }


# ---------------------------------------------------------------------------
# driver
# ---------------------------------------------------------------------------
def scrape_universities(urls):
    sink = JsonlSink(SOURCE, "universities", outdir=OUTDIR)
    print(f"[universities] {len(urls)} candidate URLs")
    for url in urls:
        if sink.done(url):
            print(f"  = skip (done): {url}")
            continue
        html = _get(url)
        if not html:
            continue
        try:
            rec = parse_university(url, html)
        except Exception as e:  # noqa: BLE001
            print(f"  ! parse error {url}: {e}")
            continue
        sink.write(rec, source_url=url)
        print(f"  + {rec.get('name')} | fees={len(rec.get('fees_table') or [])} "
              f"qs={rec.get('qs_rank')} rec={len(rec.get('recognition') or {})}")
    sink.close()
    return sink.count()


def scrape_institutes():
    sink = JsonlSink(SOURCE, "institutes", outdir=OUTDIR)
    url = BASE + "/institutes"
    if sink.done(url):
        print("[institutes] already done")
        sink.close()
        return sink.count()
    html = _get(url)
    if html:
        recs = parse_institutes(url, html)
        for r in recs:
            sink.write(r, source_url=r["source_url"])
        if not recs:
            print("  (no language centres listed on /institutes)")
    sink.close()
    return sink.count()


def scrape_pages(urls):
    sink = JsonlSink(SOURCE, "pages", outdir=OUTDIR)
    print(f"[pages] {len(urls)} URLs")
    for url in urls:
        if sink.done(url):
            print(f"  = skip (done): {url}")
            continue
        html = _get(url)
        if not html:
            continue
        try:
            rec = parse_page(url, html)
        except Exception as e:  # noqa: BLE001
            print(f"  ! parse error {url}: {e}")
            continue
        sink.write(rec, source_url=url)
        print(f"  + {rec.get('title')}")
    sink.close()
    return sink.count()


def discover_blog_posts():
    """Walk /blog/ and /blog/page/N/ to collect post URLs."""
    posts = set()
    page = 1
    while page <= 30:
        url = BASE + "/blog/" if page == 1 else f"{BASE}/blog/page/{page}/"
        html = _get(url)
        if not html:
            break
        found = _post_links(html, url)
        new = found - posts
        print(f"  blog page {page}: {len(found)} links, {len(new)} new")
        if not new:
            break
        posts |= new
        page += 1
    return sorted(posts)


def scrape_blog():
    sink = JsonlSink(SOURCE, "blog", outdir=OUTDIR)
    print("[blog] discovering posts ...")
    posts = discover_blog_posts()
    print(f"[blog] {len(posts)} posts")
    for url in posts:
        if sink.done(url):
            print(f"  = skip (done): {url}")
            continue
        html = _get(url)
        if not html:
            continue
        try:
            rec = parse_article(url, html)
        except Exception as e:  # noqa: BLE001
            print(f"  ! parse error {url}: {e}")
            continue
        sink.write(rec, source_url=url)
        print(f"  + {rec.get('title')}")
    sink.close()
    return sink.count()


def main():
    print("== Abeer Education scraper ==")
    sitemap_urls = common.get_sitemap_urls(BASE + "/sitemap.xml")
    print(f"sitemap: {len(sitemap_urls)} URLs")

    uni_urls = [
        u for u in sitemap_urls
        if re.search(r"/universities/[^/]+$", u)
        and "/universities/category/" not in u
    ]
    # de-dup, keep order
    seen = set()
    uni_urls = [u for u in uni_urls if not (u in seen or seen.add(u))]

    page_urls = [
        u for u in sitemap_urls
        if urlparse(u).path.rstrip("/") in
        ("/about", "/contact", "/terms", "/privacy-policy")
    ]

    n_uni = scrape_universities(uni_urls)
    n_inst = scrape_institutes()
    n_pages = scrape_pages(page_urls)
    n_blog = scrape_blog()

    print("\n== done ==")
    print(f"universities: {n_uni}")
    print(f"institutes:   {n_inst}")
    print(f"pages:        {n_pages}")
    print(f"blog:         {n_blog}")


if __name__ == "__main__":
    main()
