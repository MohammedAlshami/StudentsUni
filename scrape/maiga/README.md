# maigaedu.com scraper

Scrapes the public, server-rendered HTML of **https://maigaedu.com** (a Django
study-in-Malaysia agency) into newline-delimited JSON (JSONL), one record per
line. Uses the shared kit at `../common.py`.

There is **no JSON API** — everything is parsed from server-rendered HTML plus
the `application/ld+json` blocks the site embeds on most pages.

## Files produced

| File | `kind` | Records | Notes |
|------|--------|--------:|-------|
| `universities.jsonl` | `university` | 18 | + English alternate fetched |
| `centers.jsonl` | `center` | 15 | + English alternate fetched; includes `course_urls` |
| `courses.jsonl` | `course` | 193 | discovered from center pages, deduped by id |
| `programs.jsonl` | `program` | 1922 | the big one |
| `articles.jsonl` | `article` | 282 | |
| `faq.jsonl` | `faq` | 3047 | scraped last |

All files validated: no malformed JSON lines, no duplicate `source_url`s, and
every record has `source`, `kind`, `source_url`, `fetched_at`.

## Exact commands

```bash
cd /home/shami/projects/StudentsUni/scrape/maiga

# Everything, in the safe order (universities, centers+courses, programs,
# articles, faq). Safe to re-run: already-written source_urls are skipped.
python3 scraper.py all

# Or one group at a time:
python3 scraper.py universities
python3 scraper.py centers      # also discovers and scrapes /course/ pages
python3 scraper.py programs     # ~1922 pages, ~30 min at the 0.6s delay
python3 scraper.py articles
python3 scraper.py faq

# Debug a single page (pretty-prints the parsed record):
python3 scraper.py sample "https://maigaedu.com/program/.../6043/"
```

A long run is best started with no timeout:

```bash
python3 -u scraper.py programs > programs.log 2>&1
```

If it is interrupted, just run the **same command again** — `JsonlSink` reads
the existing file and skips every `source_url` already present.

## How it works

* **Sitemaps** (`get_sitemap_urls`): `sitemap-universities.xml` (18),
  `sitemap-centers.xml` (15), `sitemap-programs.xml` (1922),
  `sitemap-articles.xml` (282), `sitemap-faq.xml` (3047).
* **Centers → courses**: every `/course/.../<id>/` link on each center page is
  collected, the `/en/` mirror is skipped (the Arabic page is canonical and its
  `hreflang=en` alternate is captured anyway), and links are de-duplicated by
  trailing numeric id. 193 unique courses across the 15 centers.
* **English alternates**: every record captures `alternate_en` / `alternate_ar`
  from `<link rel="alternate" hreflang=...>`. For universities and centers
  (small counts) the English page is *also fetched* to fill `name_en` /
  `description_en`. The 1922 programs are **not** double-fetched.
* **Politeness**: `common.fetch` sleeps 0.6 s after every request. Only public
  paths are touched; `/accounts/`, `/admin/`, `/management/`,
  `/staff-dashboard/` and the other `Disallow` entries in `robots.txt` are
  never requested.
* **No fabrication**: any field not present on the page is `null`.

## Record schema

Every record always contains `source="maiga"`, `kind`, `source_url`,
`fetched_at` (ISO-8601 UTC), and `source_id` (trailing numeric id).
Fields below are per kind; omitted fields are `null`/absent where not
applicable.

### `university` (`universities.jsonl`)

`name`, `name_ar`, `name_en`, `city`, `country`, `type`, `founded_year`,
`qs_rank` (always `null` — the site shows a local rank, not QS),
`ranking` (local rank int), `ranking_raw` (`"#33 في ماليزيا"`),
`program_count`, `accreditation`, `badges[]`, `description`,
`description_en`, `website`, `logo`, `alternate_en`, `alternate_ar`,
`content_text`.

Sources: `CollegeOrUniversity` JSON-LD (name, description, address locality,
`sameAs`, logo), `.ud-hero-*` / `.ud-info-*` / `.ud-badge` / `.ud-prog-hdr-sub`.

### `center` (`centers.jsonl`)

`name`, `name_ar`, `name_en`, `city`, `country`, `type` (always `null`),
`program_count` (site's "N دورة متاحة"), `student_count`, `description`,
`description_en`, `website`, `logo` (always `null` — no logo on center pages),
`course_urls[]`, `alternate_en`, `alternate_ar`, `content_text`.

Sources: `EducationalOrganization` JSON-LD, `.cd-center-name`,
`.cd-meta-item`, `.cd-stat-pill`.

### `course` (`courses.jsonl`)

`name`, `name_ar`, `name_en` (always `null`), `center`, `type`
(course type), `level` (always `null`), `duration`, `hours`, `intakes[]`,
`requirements[]` (`{label,value,note}`), `description`, `title`,
`fee`, `fee_myr` (total **after** discount), `fee_before_discount_myr`,
`fee_usd`, `currency` (`"MYR"`), `discount_pct`, `fees_table[]`
(`{label,value,rm_price,negative}`), `alternate_en`, `alternate_ar`,
`content_text`.

Sources: `.ecd-detail-row` (institute/type/duration/hours),
`.ecd-intake-card`, `.ecd-req-card`, `.ecd-fee-table`, `.ecd-tab-panel`,
`.ecd-hero-price-*`.

### `program` (`programs.jsonl`)

`name`, `name_ar`, `name_en` (always `null`), `university`, `university_url`,
`center` (`null`), `level` (degree, from "الدرجة العلمية"), `field`
(always `null` — not exposed as a labelled row), `duration`,
`languages_of_instruction`, `intakes[]`, `requirements[]`
(`{label,value,note}`), `accreditation` (hero badge pill), `description`,
`title`, `ld_offer_price_myr` (JSON-LD sticker price), `ld_offer_currency`,
`fee`, `fee_myr` (after discount), `fee_before_discount_myr`, `fee_usd`,
`currency`, `discount_pct`, `fees_table[]`, `alternate_en`, `alternate_ar`,
`content_text`.

Sources: `Course` JSON-LD (name, description, provider, offer),
`.pdp-psc-row`, `.pdp-idate-card`, `.pdp-req-card`, `.ecd-fee-table`,
`.ecd-hero-*`.

### `article` (`articles.jsonl`)

`name`, `title`, `date`, `date_modified`, `author`, `description`, `image`,
`categories` (always `null`), `tags` (always `null`), `alternate_en`,
`alternate_ar`, `content_text` (full body from `.ap-prose`).

Sources: `Article` JSON-LD + `.ap-*`.

### `faq` (`faq.jsonl`)

`name`, `title` (the question), `category`, `description` (the answer),
`date` (always `null`), `alternate_en`, `alternate_ar`, `content_text`
(the answer). Sources: `FAQPage` JSON-LD + `.fqd-*`.

## Parse reliability / known gaps

Reliable (parsed on essentially every applicable page):

* university: name, city, country, type, founded year, local ranking,
  program count, accreditation badges, description, website, logo.
* center: name, English name, city, course count, enrolled-student count,
  description, website, course links.
* course: name, center, course type, duration, hours, current/old fee,
  USD fee, discount %, fee breakdown table, intakes, requirements, overview.
* program: name, university, degree level, duration, language, current/old
  fee, USD fee, discount %, fee breakdown, intakes, requirements, long
  description, JSON-LD offer price.
* article: title, date, author, description, image, full body.
* faq: question, answer, category.

Known gaps / deliberate `null`s:

* `qs_rank` is always `null` — the site publishes a **local** Malaysia rank
  (`ranking`), not a QS rank. No QS value is shown on the pages.
* `program.field` is always `null` — the program page has no labelled
  "college/field" row (the related-program cards show a field, but for other
  programs, so it is not copied).
* `name_en` is always `null` for courses and programs (no English fetch for the
  1922 programs; course pages are Arabic-only).
* `description_en` for centers is `null` — the English center page still serves
  the Arabic description, so nothing English exists to capture.
* Center `logo` and `type` are always `null` (not present on center pages).
* A handful of universities lack a `ranking` / `website` / accreditation badge;
  those are left `null` rather than guessed.
* `intakes` is `null` on courses/programs that do not publish a start-date
  section (147 of 1922 programs).
* `content_text` intentionally includes the whole `<main>` region (related
  programs, FAQ widgets, footer CTAs, …) so nothing is lost; use the specific
  fields for clean values.

Source-side data gaps (captured faithfully, not our bug):

* 4 Taylor's programs (`source_id` 5977, 5987, 5992, 6008) publish a fee table
  with a single `الإجمالي` row of `0 MYR`, and no JSON-LD offer — so
  `fee_myr = 0.0`, `fee_usd = 0.0`, `ld_offer_price_myr = null`. The source
  itself shows "0 MYR".
* 2 programs (`source_id` 3223 `الفنون الأدائية`, 3238
  `علم النفس الإكلينيكي`, both Taylor's) have **no** `Course` JSON-LD and no
  overview section on the page, so `description = null`.
* 4 programs have no JSON-LD offer (`ld_offer_price_myr = null`); their HTML
  fee table is still parsed into `fee_myr` / `fees_table`.

## Run log

```text
universities : 18 / 18
centers      : 15 / 15   (+ 193 courses discovered)
courses      : 193 / 193
programs     : 1922 / 1922
articles     : 282 / 282
faq          : 3047 / 3047
```
