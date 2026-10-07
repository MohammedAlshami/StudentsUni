# Competitor data scrape

Source-of-truth scripts that pull structured education data from competitor /
aggregator sites into newline-delimited JSON. **Nothing here touches the app or
the `public/data` DB.** Consolidation into our own schema is a separate, later step.

## Layout

```
scrape/
  common.py              shared HTTP/JSONL helpers (fetch, JsonlSink, parsers)
  verify.py              reads every *.jsonl and prints counts + field coverage
  maiga/                 maigaedu.com      (Django, sitemap + HTML scrape)
    scraper.py  universities.jsonl  centers.jsonl  courses.jsonl
    programs.jsonl  articles.jsonl  faq.jsonl  README.md
  khutwatuk/             khutwatuk.com     (WordPress REST API)
    scraper.py  pages.jsonl  posts.jsonl  records.jsonl  README.md
  abeer/                 abeereducation.com (Laravel, HTML scrape)
    scraper.py  universities.jsonl  institutes.jsonl  pages.jsonl  blog.jsonl  README.md
  quickuni/              quickuni.com      (WordPress REST API)
    scraper.py  pages.jsonl  posts.jsonl  services.jsonl  records.jsonl  README.md
```

## Record conventions

Every JSONL line is one record and always contains:

| field | meaning |
|---|---|
| `source` | `maiga` \| `khutwatuk` \| `abeer` \| `quickuni` |
| `kind` | `university` \| `program` \| `center` \| `course` \| `article` \| `page` \| `post` \| `faq` \| `service` \| `misc` |
| `source_url` | canonical URL the record came from |
| `fetched_at` | ISO-8601 UTC timestamp |

Sites add canonical field names where they apply (see `CANONICAL_FIELDS` in
`common.py`): `name`, `name_en`, `name_ar`, `city`, `type`, `qs_rank`,
`student_count`, `university`, `center`, `level`, `field`, `duration`,
`fee_myr`, `fee_usd`, `currency`, `intakes`, `requirements`, `accreditation`,
`description`, `fees_table`, `inclusions`, `exclusions`, `content_text`, …

Missing facts are `null` — never guessed. Original language (Arabic/English) is
preserved; no translation is performed.

## Running

```bash
cd scrape/<site>
python3 scraper.py          # resumable: re-run to continue after an interrupt
python3 ../verify.py        # counts + coverage across all sources
```

## Platform notes (from recon)

| site | platform | method | robots |
|---|---|---|---|
| maigaedu.com | Django | sitemaps + HTML scrape | public OK; avoids /accounts /admin /management |
| khutwatuk.com | WordPress | WP REST API `/wp-json/wp/v2/...` | allows all but /wp-admin |
| abeereducation.com | Laravel | HTML scrape (sitemap) | **/api /programs /courses disallowed** → not touched |
| quickuni.com | WordPress | WP REST API | allows all but /wp-admin |

`al-enjaz.net` is intentionally **excluded** — it is an academic-writing/translation
service with no university/program data.

## Mapping / merge layer (`scrape/map/`)

Turns the scraped JSONL into fill-only patches against `public/data`.

| script | purpose |
|---|---|
| `normalize.py` | text normalisation + fuzzy name matching (EN + AR) |
| `match_universities.py` | maps every scraped university → one of our 96 slugs |
| `build_university_patches.py` | priority-ordered, fill-only university fields |
| `match_programs.py` | matches scraped programs/courses → our program files, builds fee/desc patches |
| `build_language_centres.py` | builds the **new** `public/data/language-centres/` dataset |
| `apply_patches.py` | applies patches to `public/data` with backups (`--dry-run` supported) |

Outputs land in `scrape/mapped/` (`university_matches.json`,
`university_patches.json`, `program_patches.json`, `program_match_report.txt`).
Every touched file is backed up under `scrape/_backup/` before writing.

Merge rules: **fill-only** (never overwrite a non-empty value); fees only fill a
null total; every added fact appends a `sources` entry; `last_updated` is bumped.

```bash
python3 scrape/map/match_universities.py
python3 scrape/map/build_university_patches.py
python3 scrape/map/match_programs.py
python3 scrape/map/build_language_centres.py
python3 scrape/map/apply_patches.py --all --dry-run   # preview
python3 scrape/map/apply_patches.py --all             # write (backed up)
```
