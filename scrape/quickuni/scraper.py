#!/usr/bin/env python3
"""
Scraper for quickuni.com — an English-language WordPress study-abroad
consultancy based in Kuala Lumpur, Malaysia.

The site exposes a working WordPress REST API, so we use it instead of
parsing the rendered pages:

    /wp-json/wp/v2/pages     -> 8 pages
    /wp-json/wp/v2/posts     -> 4 posts
    /wp-json/wp/v2/categories, /tags  -> taxonomy name lookup

Outputs (newline-delimited JSON, resumable — see ../../common.py):

    pages.jsonl     kind="page"    one record per WP page
    posts.jsonl     kind="post"    one record per WP post
    services.jsonl  kind="service" the 8 service cards on /our-services/
    records.jsonl   kind in {course, program, university}  structured facts

Run:
    python3 scraper.py

Re-running skips source URLs already present in the JSONL files. Delete a
file to force a full re-scrape of that stream.
"""

from __future__ import annotations

import html as _html
import json
import os
import re
import sys
import time

import requests

# --- shared kit -----------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from common import (  # noqa: E402
    DEFAULT_HEADERS,
    JsonlSink,
    clean_text,
    parse_num,
)

SOURCE = "quickuni"
BASE = "https://quickuni.com"
API = f"{BASE}/wp-json/wp/v2"
OUTDIR = os.path.dirname(os.path.abspath(__file__))
PER_PAGE = 100

# The host (LiteSpeed/Hostinger) rate-limits bursts of REST requests with
# HTTP 429 and its WAF rejects browser-like User-Agents from non-browsers.
# A plain requests UA is accepted; we still space calls out politely.
REQUEST_DELAY = 2.0
_SESSION = requests.Session()
_SESSION.headers.update(DEFAULT_HEADERS)
_SESSION.headers["User-Agent"] = f"python-requests/{requests.__version__}"

# The Bright Language Centre promo is embedded (in an <img alt>) by the
# Instagram-feed widget that appears in the footer of every page.
PROMO_CENTER = "Bright Language Centre"


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def strip_shortcodes(s: str) -> str:
    """Remove WordPress/Elementor shortcodes like [et_pb_section ...]."""
    if not s:
        return ""
    return re.sub(r"\[[^\[\]]*\]", " ", s)


def content_to_text(rendered_html: str) -> str:
    """Visible text: drop shortcodes, tags, scripts/styles; collapse space."""
    return clean_text(strip_shortcodes(rendered_html or ""))


def api_get(url: str, tries: int = 6):
    """GET JSON from the WP REST API, spacing calls out and honouring 429."""
    for attempt in range(1, tries + 1):
        try:
            r = _SESSION.get(url, timeout=30)
            if r.status_code == 200:
                time.sleep(REQUEST_DELAY)
                return r.json()
            if r.status_code in (404, 410):
                return None
            if r.status_code == 429:
                retry_after = r.headers.get("Retry-After")
                wait = float(retry_after) if retry_after and retry_after.isdigit() else min(5 * attempt, 60)
                print(f"  . 429 rate-limited, sleeping {wait:.0f}s ({url})")
                time.sleep(wait)
                continue
            print(f"  ! HTTP {r.status_code}: {url}")
        except Exception as e:  # noqa: BLE001
            print(f"  ! {e}: {url}")
        time.sleep(min(3 * attempt, 30))
    print(f"  ! giving up: {url}")
    return None


def wp_list(resource: str, extra: str = "") -> list[dict]:
    """Fetch every item of a WP REST collection (paginated)."""
    out: list[dict] = []
    page = 1
    while True:
        q = f"{API}/{resource}?per_page={PER_PAGE}&page={page}"
        if extra:
            q += f"&{extra}"
        data = api_get(q)
        if not data or not isinstance(data, list):
            break
        out.extend(data)
        if len(data) < PER_PAGE:
            break
        page += 1
    return out


def embedded_terms(po: dict) -> tuple[list[str], list[str]]:
    """Category/tag names from the post's _embedded wp:term groups."""
    cats: list[str] = []
    tags: list[str] = []
    for group in (po.get("_embedded") or {}).get("wp:term", []) or []:
        for term in group or []:
            tax = term.get("taxonomy")
            name = term.get("name")
            if not name:
                continue
            if tax == "category":
                cats.append(name)
            elif tax == "post_tag":
                tags.append(name)
    return cats, tags


def line_count(path: str) -> int:
    if not os.path.exists(path):
        return 0
    with open(path, encoding="utf-8") as fh:
        return sum(1 for line in fh if line.strip())


# ---------------------------------------------------------------------------
# pages / posts
# ---------------------------------------------------------------------------
def page_record(pg: dict) -> dict:
    rendered = (pg.get("content") or {}).get("rendered", "") or ""
    return {
        "kind": "page",
        "source_id": pg.get("id"),
        "id": pg.get("id"),
        "slug": pg.get("slug"),
        "link": pg.get("link"),
        "title": _html.unescape((pg.get("title") or {}).get("rendered", "") or ""),
        "date": pg.get("date"),
        "modified": pg.get("modified"),
        "content_html": rendered,
        "content_text": content_to_text(rendered),
        "excerpt_text": content_to_text((pg.get("excerpt") or {}).get("rendered", "")),
        "categories": [],
        "tags": [],
        "featured_media": pg.get("featured_media"),
        "author": pg.get("author"),
        "menu_order": pg.get("menu_order"),
    }


def post_record(po: dict) -> dict:
    rendered = (po.get("content") or {}).get("rendered", "") or ""
    cats, tags = embedded_terms(po)
    return {
        "kind": "post",
        "source_id": po.get("id"),
        "id": po.get("id"),
        "slug": po.get("slug"),
        "link": po.get("link"),
        "title": _html.unescape((po.get("title") or {}).get("rendered", "") or ""),
        "date": po.get("date"),
        "modified": po.get("modified"),
        "content_html": rendered,
        "content_text": content_to_text(rendered),
        "excerpt_text": content_to_text((po.get("excerpt") or {}).get("rendered", "")),
        "categories": cats,
        "tags": tags,
        "category_ids": po.get("categories") or [],
        "tag_ids": po.get("tags") or [],
        "featured_media": po.get("featured_media"),
        "author": po.get("author"),
    }


def scrape_pages() -> list[dict]:
    sink = JsonlSink(SOURCE, "pages", OUTDIR)
    pages = wp_list("pages")
    for pg in pages:
        link = pg.get("link")
        if not link or sink.done(link):
            continue
        sink.write(page_record(pg), source_url=link)
    sink.close()
    print(f"[pages]    fetched={len(pages)}  lines={line_count(sink.path)}")
    return pages


def scrape_posts() -> list[dict]:
    sink = JsonlSink(SOURCE, "posts", OUTDIR)
    # _embed=wp:term brings category/tag names along in one request.
    posts = wp_list("posts", extra="_embed=wp:term")
    for po in posts:
        link = po.get("link")
        if not link or sink.done(link):
            continue
        sink.write(post_record(po), source_url=link)
    sink.close()
    print(f"[posts]    fetched={len(posts)}  lines={line_count(sink.path)}")
    return posts


# ---------------------------------------------------------------------------
# services  (/our-services/ cards)
# ---------------------------------------------------------------------------
_CARD_RE = re.compile(
    r'<h3 class="et_pb_module_header"><span>(.*?)</span></h3>(.*?)(?='
    r'<h3 class="et_pb_module_header"><span>|\Z)',
    re.S,
)
_SHORT_RE = re.compile(r'<div class="et_pb_text_inner"><p>(.*?)</p>', re.S)
_LONG_RE = re.compile(r'<div class="et_pb_toggle_content clearfix">(.*?)</div>', re.S)

SERVICE_PAGE_SLUG = "our-services"


def parse_services(rendered_html: str) -> list[dict]:
    """Parse the Elementor service cards on the Our Services page."""
    out = []
    for m in _CARD_RE.finditer(rendered_html or ""):
        name = clean_text(m.group(1))
        block = m.group(2)
        short = _SHORT_RE.search(block)
        long_ = _LONG_RE.search(block)
        summary = clean_text(short.group(1)) if short else None
        description = clean_text(long_.group(1)) if long_ else summary
        if not name:
            continue
        out.append({"name": name, "summary": summary, "description": description})
    return out


def scrape_services(pages: list[dict]) -> None:
    sink = JsonlSink(SOURCE, "services", OUTDIR)
    for pg in pages:
        if pg.get("slug") != SERVICE_PAGE_SLUG:
            continue
        link = pg.get("link")
        if not link or sink.done(link):
            continue
        for svc in parse_services((pg.get("content") or {}).get("rendered", "")):
            sink.write(
                {
                    "kind": "service",
                    "name": svc["name"],
                    "description": svc["description"],
                    "summary": svc["summary"],
                    "source_url": link,
                },
                source_url=link,
            )
    print(f"[services] lines={line_count(sink.path)}")
    sink.close()


# ---------------------------------------------------------------------------
# records  (structured facts)
# ---------------------------------------------------------------------------
def load_seen_record_ids(path: str) -> set[str]:
    seen: set[str] = set()
    if not os.path.exists(path):
        return seen
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            try:
                rid = json.loads(line).get("record_id")
            except Exception:  # noqa: BLE001
                continue
            if rid:
                seen.add(rid)
    return seen


def bright_promo_caption(rendered_html: str) -> str | None:
    """The Instagram caption lives in the <img alt> of the feed widget."""
    m = re.search(r'alt="([^"]*' + re.escape(PROMO_CENTER) + r'[^"]*)"', rendered_html or "")
    return _html.unescape(m.group(1)) if m else None


def parse_bright_records(caption: str, source_url: str, found_on: list[str]) -> list[dict]:
    """Turn the promo caption into one record per package (no invented values)."""
    inclusions = []
    inc_m = re.search(r"All packages include:(.*?)(?:\n\n|\Z)", caption, re.S)
    if inc_m:
        for line in inc_m.group(1).splitlines():
            item = line.strip().lstrip("\u2022").strip()
            if item:
                inclusions.append(_html.unescape(item))

    valid_until = None
    vu = re.search(r"Valid until ([^\n]+)", caption)
    if vu:
        valid_until = vu.group(1).strip()

    ages = None
    ag = re.search(r"ages (\d+\+?)", caption, re.I)
    if ag:
        ages = ag.group(1).strip()

    out = []
    for pm in re.finditer(
        r"(\d+)\s*Months?:\s*RM\s*([\d,]+)\s*\(Save\s*RM\s*([\d,]+)\)", caption
    ):
        months = int(pm.group(1))
        fee = parse_num(pm.group(2))
        save = parse_num(pm.group(3))
        note = None
        # anything after ")" on the same package line, e.g. "+ Bright Transportation Card"
        line_end = caption.find("\n", pm.end())
        tail = caption[pm.end(): line_end if line_end != -1 else len(caption)].strip()
        if tail:
            note = tail.lstrip("+ ").strip()
        out.append(
            {
                "kind": "course",
                "record_id": f"quickuni:bright:{months}month:{int(fee) if fee is not None else 'na'}",
                "name": f"Bright Language Centre English Course — {months} Month Package",
                "center": PROMO_CENTER,
                "center_slug": "bright-language-centre",
                "duration": f"{months} month" + ("s" if months > 1 else ""),
                "duration_months": months,
                "fee_myr": fee,
                "currency": "MYR",
                "savings_myr": save,
                "inclusions": inclusions,
                "note": note,
                "valid_until": valid_until,
                "minimum_age": ages,
                "promotion": "End-of-Year Promotion",
                "source_url": source_url,
                "found_on": found_on,
            }
        )
    return out


def parse_mba_record(text: str, source_url: str) -> dict | None:
    """Structured facts from the Luxembourg MBA blog post (values as written)."""
    if "MBA" not in text:
        return None

    def find(pat, flags=0):
        m = re.search(pat, text, flags)
        return m.group(1).strip() if m else None

    requirements = []
    if "Recognized Bachelor Degree" in text or "Recognised Bachelor Degree" in text:
        requirements.append("Recognized bachelor's degree")
    if "3-5 Years Working Experience" in text or "3-5 years" in text:
        requirements.append("3-5 years relevant work experience")
    gmat = find(r"GMAT\s*[–-]\s*Minimum Score\s*(\d+)", re.I)
    if gmat:
        requirements.append(f"GMAT minimum score {gmat}")
    ielts = find(r"IELTS\s*[–-]\s*([\d.]+)", re.I)
    if ielts:
        requirements.append(f"IELTS minimum {ielts}")

    duration = find(r"Duration:\s*(?:The MBA program[^.]*?spans\s*)?(\d+\s*years?)")
    fee = parse_num(find(r"(?:Course Fees|investment in your future is)\s*[^€\d]*€\s*([\d,]+)"))
    processing_fee = parse_num(find(r"processing fee of\s*€\s*([\d,]+)", re.I))
    employment_fee = parse_num(find(r"payment of\s*€\s*([\d,]+)"))
    salary = find(r"pay\s*(€[\d,]+\s*to\s*€[\d,]+ per month)", re.I)

    return {
        "kind": "program",
        "record_id": "quickuni:mba-luxembourg",
        "name": "MBA with Employment Visa in Luxembourg",
        "level": "Postgraduate",
        "field": "Business Administration",
        "mode": "Part-time",
        "duration": duration,
        "fee": fee,
        "currency": "EUR",
        "processing_fee_eur": processing_fee,
        "employment_arrangement_fee_eur": employment_fee,
        "salary_range": salary,
        "requirements": requirements or None,
        "source_url": source_url,
    }


_SLIDE_TITLE_RE = re.compile(r'<h2 class="et_pb_slide_title"><a[^>]*>(.*?)</a>', re.S)
_SLIDE_CONTENT_RE = re.compile(
    r'<div class="et_pb_slide_content">(.*?)</div>\s*<div class="et_pb_button_wrapper"', re.S
)


def parse_partner_universities(rendered_html: str, source_url: str) -> list[dict]:
    """University promo slides on the home page (marketing ranking claims)."""
    out = []
    for chunk in re.split(r'data-slide-id="et_pb_slide_', rendered_html or "")[1:]:
        tm = _SLIDE_TITLE_RE.search(chunk)
        if not tm:
            continue
        name = clean_text(tm.group(1))
        if "UNIVERSITY" not in name.upper():
            continue
        cm = _SLIDE_CONTENT_RE.search(chunk)
        claim = clean_text(cm.group(1)) if cm else None
        out.append(
            {
                "kind": "university",
                "record_id": "quickuni:partner:" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-"),
                "name": name,
                "ranking": claim,
                "country": "Malaysia",
                "note": "Promotional ranking claim published by quickuni.com",
                "source_url": source_url,
            }
        )
    return out


def scrape_records(pages: list[dict], posts: list[dict]) -> None:
    sink = JsonlSink(SOURCE, "records", OUTDIR)
    seen = load_seen_record_ids(sink.path)

    by_slug = {p.get("slug"): p for p in pages}
    by_post_slug = {p.get("slug"): p for p in posts}

    records: list[dict] = []

    # 1) Bright Language Centre package pricing (embedded on every page footer).
    home = by_slug.get("home-quickuni")
    home_link = home.get("link") if home else BASE + "/"
    promo_found_on = []
    caption = None
    for pg in pages:
        cap = bright_promo_caption((pg.get("content") or {}).get("rendered", ""))
        if cap:
            promo_found_on.append(pg.get("link"))
            if caption is None:
                caption = cap
    if caption:
        records.extend(parse_bright_records(caption, home_link, promo_found_on))

    # 2) Luxembourg MBA program facts (from the blog post).
    for po in posts:
        text = content_to_text((po.get("content") or {}).get("rendered", ""))
        rec = parse_mba_record(text, po.get("link"))
        if rec:
            records.append(rec)

    # 3) Partner-university promo slides (home page).
    if home:
        records.extend(
            parse_partner_universities(
                (home.get("content") or {}).get("rendered", ""), home.get("link")
            )
        )

    written = 0
    for rec in records:
        rid = rec.get("record_id")
        if rid and rid in seen:
            continue
        sink.write(rec, source_url=rec.get("source_url"))
        if rid:
            seen.add(rid)
        written += 1
    print(f"[records]  extracted={len(records)}  newly_written={written}  lines={line_count(sink.path)}")
    sink.close()


# ---------------------------------------------------------------------------
def main() -> None:
    print(f"Scraping {BASE} -> {OUTDIR}")
    pages = scrape_pages()
    posts = scrape_posts()
    scrape_services(pages)
    scrape_records(pages, posts)
    print("Done.")


if __name__ == "__main__":
    main()
