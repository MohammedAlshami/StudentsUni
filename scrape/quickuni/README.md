# quickuni.com scraper

Scrape of **https://quickuni.com** — an English-language WordPress
study-abroad consultancy based in Kuala Lumpur, Malaysia (HQ), with offices
in the Maldives and Qatar.

The site exposes a working **WordPress REST API**, so the scraper reads that
instead of parsing rendered pages.

## Commands

```bash
cd scrape/quickuni
python3 scraper.py
```

Re-running is **resumable**: a source URL already present in a JSONL file is
skipped. Delete a `.jsonl` file to force a full re-scrape of that stream.

No third-party deps beyond `requests` (already used by `../common.py`).

## Files

| File | Kind | Rows | Notes |
|---|---|---|---|
| `pages.jsonl`   | `page`    | 8 | All WP pages incl. Home, About, Our Services, Apply Now, Contact, Blog index |
| `posts.jsonl`   | `post`    | 4 | The whole blog (4 posts) |
| `services.jsonl`| `service` | 8 | Service cards parsed from `/our-services/` |
| `records.jsonl` | `course` / `program` / `university` | 7 | Structured facts (see below) |
| `scraper.py`    | — | — | Self-contained, resumable scraper |

Site totals: 8 pages, 4 posts, 1 category (`Uncategorized`), 6 tags,
309 media items. There is also an empty `project` custom post type (0 items).

## Schema

Every row carries the shared-kit base fields: `source="quickuni"`,
`kind`, `source_url`, `fetched_at`.

**pages.jsonl / posts.jsonl**

```
kind, source_id, id, slug, link, title, date, modified,
content_html, content_text, excerpt_text,
categories, tags,                 # names (pages: always [])
category_ids, tag_ids,            # posts only
featured_media, author
```

* `content_html` — raw WP `content.rendered`.
* `content_text` — visible text: shortcodes and HTML tags stripped,
  entities decoded, whitespace collapsed.
* Post categories/tags are resolved to **names** via `?_embed=wp:term`
  (single request).

**services.jsonl**

```
kind="service", name, description, summary, source_url
```

`description` is the full "Learn More" copy; `summary` is the short card
blurb. Parsed from the Elementor service cards on `/our-services/`:

1. Student Counselling
2. University Admissions
3. Visa Assistance
4. Career Guidance
5. Hostel Arrangement
6. Pick-up Arrangements
7. Pre-Departure Briefing
8. Student Support

**records.jsonl**

| kind | rows | fields |
|---|---|---|
| `course` | 3 | `name, center, center_slug, duration, duration_months, fee_myr, currency, savings_myr, inclusions, note, valid_until, minimum_age, promotion, found_on` |
| `program` | 1 | `name, level, field, mode, duration, fee, currency, processing_fee_eur, employment_arrangement_fee_eur, salary_range, requirements` |
| `university` | 3 | `name, ranking, country, note` |

All values are taken verbatim from the site; nothing is inferred. Missing
values are `null`.

## Structured data actually extractable

1. **Bright Language Centre English-course packages** (kind `course`) —
   published in an end-of-year promo caption embedded (in an `<img alt>`)
   by the Instagram-feed widget on **every** page:

   | Duration | fee_myr | savings_myr | note |
   |---|---|---|---|
   | 1 month | 2800 | 330 | — |
   | 2 months | 4500 | 960 | — |
   | 3 months | 5500 | 2490 | + Bright Transportation Card |

   All packages include: Registration Fee, Placement Test Fee,
   Books & Materials, Tuition Fee. Valid until 30 November 2025, ages 13+.
   `source_url` is the home page; `found_on` lists all 8 pages carrying the
   caption.

2. **Luxembourg MBA with Employment Visa** (kind `program`) — from the
   blog post *"Unlocking Career Advancements…"*: 2 years part-time,
   €40,000 course/processing fee, €1,000 application processing fee,
   €24,500 employment-arrangement payment, salary €3,000–6,000/month,
   entry requirements (bachelor's, 3–5 yrs experience, GMAT ≥ 500,
   IELTS 6.5).

3. **Partner-university promo slides** (kind `university`) — home-page
   marketing ranking claims for Sunway University, Asia Pacific University
   and University of Southampton Malaysia. These are **promotional claims
   published by the site**, not independently verified rankings.

No university/program catalogue, tuition tables, intake dates or entry
requirements for academic degrees are published on this site.

## Notes & limitations

* **Little ingestible academic data.** The site is a lead-generation /
  marketing brochure: service descriptions, a blog, contact info and one
  language-school promo. There is no structured catalogue of universities,
  degree programs, fees or intakes.
* The Bright pricing lives in an image `alt` attribute, so it does **not**
  appear in `content_text`; it is captured as records instead.
* Hostinger/LiteSpeed rate-limits bursts (HTTP 429) and its WAF rejects
  browser-like User-Agents sent by non-browsers. The scraper therefore uses
  a plain `python-requests` UA and spaces requests out (2 s) with explicit
  429 back-off. `robots.txt` allows everything except `/wp-admin/`.
* `source_url` points at the canonical page; multiple records from the same
  page (services, home-page records) share it. `record_id` provides a
  stable per-record key used for resume.
