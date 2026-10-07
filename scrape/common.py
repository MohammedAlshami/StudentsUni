"""
Shared scraper kit for the StudentsUni competitor-data scrape.

Conventions
-----------
* Every site writes NEWLINE-DELIMITED JSON (one record per line) so a run can
  be resumed: already-scraped source URLs are skipped on the next run.
* Every record MUST contain at least:
      source        e.g. "maiga"
      kind          one of: university | program | center | course | article | page | post | misc
      source_url    canonical URL of the page the record came from
      fetched_at    ISO-8601 UTC timestamp
* Extra fields are free-form per site but should follow the canonical keys in
  CANONICAL_FIELDS below where they apply, so consolidation is trivial.

Usage
-----
    from common import fetch, JsonlSink, abs_url, clean_text, parse_num, now_iso

    sink = JsonlSink("maiga", "universities")
    for url in urls:
        if sink.done(url):
            continue
        html = fetch(url)
        sink.write({...}, source_url=url)
    sink.close()
"""

from __future__ import annotations

import json
import os
import re
import time
import html as _html
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests

# ----------------------------------------------------------------------------
# Canonical field names (use these so the merge step is a straight map).
# ----------------------------------------------------------------------------
CANONICAL_FIELDS = [
    # university / center identity
    "name", "name_en", "name_ar", "abbr", "slug",
    "city", "state", "country", "type", "founded_year",
    "website", "logo", "description",
    # rankings / scale
    "qs_rank", "ranking", "student_count", "program_count",
    "employability", "alumni_count", "languages_of_instruction",
    # program / course
    "university", "university_slug", "center", "center_slug",
    "level", "field", "duration", "mode", "intakes",
    "fee", "fee_myr", "fee_usd", "currency",
    "fee_per_year", "fees_table", "inclusions", "exclusions",
    "requirements", "accreditation", "recognition",
    "awarding_body", "awarding_country", "credits",
    # meta
    "source", "source_url", "source_id", "kind", "fetched_at",
    "title", "date", "content_html", "content_text", "categories", "tags",
]

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 StudentsUniResearchBot/1.0"
)

DEFAULT_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en,ar;q=0.9",
}

# Politeness: seconds between requests to the same host.
DEFAULT_DELAY = 0.6

_SESSION = requests.Session()
_SESSION.headers.update(DEFAULT_HEADERS)


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch(url: str, tries: int = 4, timeout: int = 30, delay: float = DEFAULT_DELAY,
          expect_json: bool = False):
    """GET a URL with retries + backoff. Returns text (or parsed JSON if expect_json)."""
    last = None
    for attempt in range(1, tries + 1):
        try:
            r = _SESSION.get(url, timeout=timeout)
            if r.status_code == 200:
                time.sleep(delay)
                if expect_json:
                    return r.json()
                return r.text
            if r.status_code in (404, 410):
                return None
            last = f"HTTP {r.status_code}"
        except Exception as e:  # noqa: BLE001
            last = str(e)
        time.sleep(min(2 ** attempt, 15))
    print(f"  ! fetch failed ({last}): {url}")
    return None


def fetch_json(url: str, **kw):
    return fetch(url, expect_json=True, **kw)


def abs_url(base: str, href: str) -> str:
    return urljoin(base, href)


# ----------------------------------------------------------------------------
# Text helpers
# ----------------------------------------------------------------------------
_AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")


def normalize_digits(s: str) -> str:
    return s.translate(_AR_DIGITS) if s else s


def clean_text(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"<script[\s\S]*?</script>", " ", s, flags=re.I)
    s = re.sub(r"<style[\s\S]*?</style>", " ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = _html.unescape(s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def parse_num(s) -> float | None:
    """Pull the first numeric value out of a string (handles Arabic digits, commas)."""
    if s is None:
        return None
    if isinstance(s, (int, float)):
        return float(s)
    s = normalize_digits(str(s))
    m = re.search(r"[\d][\d,\.]*", s)
    if not m:
        return None
    raw = m.group(0).replace(",", "")
    try:
        return float(raw)
    except ValueError:
        return None


def to_int(s) -> int | None:
    n = parse_num(s)
    return int(n) if n is not None else None


# ----------------------------------------------------------------------------
# JSONL sink with resume support
# ----------------------------------------------------------------------------
class JsonlSink:
    def __init__(self, source: str, name: str, outdir: str | None = None):
        self.source = source
        self.name = name
        base = outdir or os.path.join(os.path.dirname(os.path.abspath(__file__)), source)
        os.makedirs(base, exist_ok=True)
        self.path = os.path.join(base, f"{name}.jsonl")
        self._done: set[str] = set()
        if os.path.exists(self.path):
            with open(self.path, encoding="utf-8") as fh:
                for line in fh:
                    try:
                        rec = json.loads(line)
                        u = rec.get("source_url")
                        if u:
                            self._done.add(u)
                    except Exception:  # noqa: BLE001
                        pass
        self._fh = open(self.path, "a", encoding="utf-8")

    def done(self, url: str) -> bool:
        return url in self._done

    def write(self, record: dict, source_url: str | None = None) -> None:
        record.setdefault("source", self.source)
        record.setdefault("fetched_at", now_iso())
        if source_url:
            record.setdefault("source_url", source_url)
        self._fh.write(json.dumps(record, ensure_ascii=False) + "\n")
        self._fh.flush()
        if source_url:
            self._done.add(source_url)

    def count(self) -> int:
        return len(self._done)

    def close(self) -> None:
        self._fh.close()


def read_jsonl(path: str) -> list[dict]:
    out = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def save_json(path: str, obj) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=2)


def get_sitemap_urls(sitemap_url: str) -> list[str]:
    """Return all <loc> entries; follows a sitemap index one level deep."""
    xml = fetch(sitemap_url, expect_json=False)
    if not xml:
        return []
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)
    if "<sitemapindex" in xml:
        out: list[str] = []
        for sub in locs:
            sub_xml = fetch(sub)
            if sub_xml:
                out.extend(re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", sub_xml))
        return out
    return locs
