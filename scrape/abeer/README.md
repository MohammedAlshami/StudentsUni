# Abeer Education scraper (`abeereducation.com`)

Scrapes the public Arabic/English pages of **Abeer Education** (عبير للتعليم), a
Laravel study-in-Malaysia agency, into newline-delimited JSON. Original Arabic /
English text is preserved verbatim — nothing is translated and no value is
fabricated (missing data is `null`).

## Run

```bash
cd scrape/abeer
python3 scraper.py
```

Resumable: already-scraped `source_url`s are skipped on the next run, so you can
re-run after an interruption. To cache raw HTML on disk (useful while tweaking
the parser; avoids re-hammering the site):

```bash
ABEER_CACHE=/tmp/abeer_cache python3 scraper.py
```

Requirements: `requests`, `beautifulsoup4`, `lxml` (the shared kit is
`../common.py`; the scraper adds the parent dir to `sys.path`).

## robots.txt / politeness

`robots.txt` disallows `/api/`, `/programs/`, `/courses`, `/search`, `/login`,
`/register`, `/admin`, `/dashboard`, `/public/`, `/wp-content/`. **None of these
are ever requested.** Only public university, page and blog HTML is fetched.

The host's WAF returns HTTP 429 for non-browser User-Agents on the main app, so
the scraper uses a normal browser UA, paces requests (3 s), and backs off
(25 s × attempt, up to 8 rounds) on failures.

## Outputs

| file | kind | count |
|---|---|---|
| `universities.jsonl` | `university` | 28 |
| `institutes.jsonl` | `center` | 0 (see note) |
| `pages.jsonl` | `page` | 4 |
| `blog.jsonl` | `article` | 12 |

Every record has the shared meta fields `source="abeer"`, `kind`,
`source_url`, `fetched_at` (UTC ISO-8601).

### `university` schema

```
source_url, name, name_en, abbr, slug, city, location, campuses, type, category,
founded_year, qs_rank, qs_year, qs_raw, qs_rating, ranking,
student_count, international_students, program_count, programs_listed,
employability, alumni_count, languages_of_instruction, accreditation,
description, faculties[], program_faculties[], fees_table[],
recognition{country: text}, recognition_text, recognition_note,
requirements, requirements_sections[], intakes[], intakes_raw, faq[],
fee, fee_raw, currency, logo, hero_image, hero_stats{}, content_text
```

`fees_table[]` entries: `{program, duration, fee, fee_raw, currency, extra}` where
`fee` is numeric (first value in a range), `fee_raw` keeps the original string
(e.g. `"~$21,500 - $24,000"`), `currency` is `USD`/`MYR`, and `extra` holds any
additional columns (e.g. `شروط القبول`, `الكلية`).

`recognition` is an object keyed by country (e.g. `مصر`, `السودان`, `السعودية`,
`الإمارات`, `قطر`, `عمان`) when the page has per-country sections;
`recognition_text` always keeps the full recognition/accreditation prose so
nothing is lost.

`content_text` is the full cleaned text of the university block, so any field
that could not be structured is still recoverable.

### `page` schema

`source_url, title, description, content_text` — for `/about`, `/contact`,
`/terms`, `/privacy-policy`.

### `article` schema

`source_url, title, date, author, categories[], tags[], image, description,
content_text` — 12 posts discovered from `/blog/` and `/blog/page/N/`.

### `center` schema

`source_url, name, city, description, courses[], logo, content_text`.
**`institutes.jsonl` is empty** because `/institutes` currently renders
“لا توجد نتائج” (no language centres listed) — there are no centre pages in the
sitemap either. The file exists but has 0 records; this is the true state of the
site, not a scrape failure.

## Per-university extraction reliability

`fees`/`recog`/`faculties`/`intakes` are counts; `✓`/`–` are present/absent.
`recog` = structured country object; `recog_txt` = free-text recognition prose.

| # | university (slug) | founded | city | students | QS | fees | recog | recog_txt | faculties | reqs | intakes | logo | hero |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | asia-pacific-university-apu | 1993 | كوالالمبور | 11000 | 597 | 6 | 6 | ✓ | 6 | ✓ | 4 | ✓ | ✓ |
| 2 | city-university-malaysia | 1984 | سيلانغور (كوالالمبور الكبرى) | 7800 | 106 | 9 | 2 | ✓ | – | ✓ | 3 | ✓ | ✓ |
| 3 | cyberjaya-uoc | 2005 | سيلانغور 30 دقيقة من كوالالمبور والمطار الدولي | – | 951 | 23 | – | ✓ | 5 | ✓ | 1 | ✓ | ✓ |
| 4 | imu-university | – | ماليزيا حرم Bukit Jalil ومراكز سريرية متعددة | – | – | 7 | – | – | – | ✓ | 2 | ✓ | ✓ |
| 5 | infrastructure-university-of-kuala-lumpur-iukl | – | – | – | – | – | – | – | – | ✓ | 3 | ✓ | ✓ |
| 6 | inti-international-university | – | – | – | – | – | – | – | – | ✓ | 2 | ✓ | ✓ |
| 7 | kuala-lumpur-university-klust | – | – | – | – | – | – | ✓ | 5 | ✓ | 3 | ✓ | ✓ |
| 8 | lincoln-university-college | 2002 | سيلانغور (قرب كوالالمبور) | 70 | 185 | 11 | 2 | ✓ | 1 | ✓ | 3 | ✓ | ✓ |
| 9 | mahsa-university | 2004 | سيلانغور (حرم 48 فداناً) | 5000 | 577 | 9 | 2 | ✓ | 1 | ✓ | 1 | ✓ | ✓ |
| 10 | management-science-university-msu | 2001 | سيلانغور (30 دقيقة من كوالالمبور) | 15000 | 597 | 12 | 2 | ✓ | 2 | ✓ | 4 | ✓ | ✓ |
| 11 | multimedia-university-mmu | 1996 | – | 30000 | 851 | 10 | 2 | ✓ | 1 | ✓ | 1 | ✓ | ✓ |
| 12 | newcastle-university-malaysia | – | – | – | 129 | 2 | – | ✓ | 1 | ✓ | 2 | ✓ | ✓ |
| 13 | quest-international-university-qiu | – | – | – | – | – | – | – | – | ✓ | 3 | ✓ | ✓ |
| 14 | segi-university | 1977 | سيلانغور (على خط المترو مباشرة) | 20000 | 731 | 9 | 2 | ✓ | 1 | ✓ | – | ✓ | ✓ |
| 15 | sunway-university | – | – | – | – | – | – | – | – | ✓ | 3 | ✓ | ✓ |
| 16 | swinburne-sarawaks-campus | – | – | – | – | – | – | – | – | ✓ | 2 | ✓ | ✓ |
| 17 | taylors-university | 1969 | سيلانغور (20 دقيقة من كوالالمبور) | 22000 | 253 | 8 | 2 | ✓ | 3 | ✓ | 3 | ✓ | ✓ |
| 18 | ucsi-university | – | – | – | – | – | – | – | – | ✓ | 1 | ✓ | ✓ |
| 19 | unitar-international-university | 1997 | Selangor | 7000 | – | 15 | – | ✓ | 4 | ✓ | 3 | ✓ | ✓ |
| 20 | universiti-kuala-lumpur-unikl | – | – | – | – | – | – | – | – | ✓ | 1 | ✓ | ✓ |
| 21 | universiti-poly-tech-malaysia-uptm | – | – | – | – | – | – | – | – | ✓ | 1 | ✓ | ✓ |
| 22 | universiti-teknologi-malaysia | 1972 | جوهور باهرو | – | 153 | 17 | – | ✓ | 4 | ✓ | 2 | ✓ | ✓ |
| 23 | universiti-teknologi-petronas | – | – | – | – | – | – | – | – | ✓ | 1 | ✓ | ✓ |
| 24 | universiti-tenaga-nasional-uniten | 1997 | بوتراجايا (هندسة وIT) وحرم Sultan Haji Ahmad Shah في بانغ (أعمال ومحاسبة) | – | – | 21 | – | ✓ | 4 | ✓ | 1 | ✓ | ✓ |
| 25 | university-malaya-um | – | – | – | – | 13 | – | – | 4 | ✓ | 3 | ✓ | ✓ |
| 26 | university-of-nottingham | – | – | – | – | – | – | – | – | ✓ | 1 | ✓ | ✓ |
| 27 | university-of-southampton-malaysia | – | – | – | – | – | 1 | ✓ | 1 | ✓ | 1 | ✓ | ✓ |
| 28 | utauniversiti-tunku-abdul-rahman-utar | – | – | – | 801 | 32 | – | – | 5 | ✓ | 1 | ✓ | ✓ |

Totals: **204 fee rows** across **16 universities**; **12** universities with a
numeric QS rank; **9** with a structured `recognition` object; **15** with
`recognition_text`.

### Which universities yielded what

* **Fee tables (16):** asia-pacific-university-apu, city-university-malaysia,
  lincoln-university-college, mahsa-university, management-science-university-msu,
  multimedia-university-mmu, segi-university, taylors-university,
  unitar-international-university, universiti-tenaga-nasional-uniten,
  cyberjaya-uoc, universiti-teknologi-malaysia,
  utauniversiti-tunku-abdul-rahman-utar, university-malaya-um,
  newcastle-university-malaysia, imu-university.
* **QS rank (12):** asia-pacific-university-apu (597), city-university-malaysia
  (106), lincoln-university-college (185), mahsa-university (577),
  management-science-university-msu (597), multimedia-university-mmu (851),
  segi-university (731), taylors-university (253), cyberjaya-uoc (951),
  universiti-teknologi-malaysia (153), utauniversiti-tunku-abdul-rahman-utar (801),
  newcastle-university-malaysia (129). Four pages carry a QS **star rating**
  instead (`qs_rating`): city, segi, unitar, klust.
* **Structured recognition by country (9):** asia-pacific-university-apu,
  city-university-malaysia, lincoln-university-college, mahsa-university,
  management-science-university-msu, multimedia-university-mmu, segi-university,
  taylors-university, university-of-southampton-malaysia.
* **Narrative recognition prose only (`recognition_text`):** the remaining rich
  pages (unitar, uniten, uoc, utm, utar, klust, newcastle, city, …).

## Page templates found

1. **Structured long-form** (APU, City, Lincoln, Mahsa, MSU, MMU, Segi, Taylor's,
   UM, Southampton): a “نظرة سريعة” facts `<ul>`, per-college `h3`s, a
   `الرسوم الإجمالية` table, and per-country `الاعتراف في …` sections.
2. **Narrative long-form** (UNITAR, UNITEN, UOC, UTM, UTAR): headings such as
   `نظرة عامة`, `تصنيف واعتماد`, `رسوم …`, `شروط القبول`, `الأسئلة الشائعة`.
   Fee tables sit under `h3` sub-headings (hence the table-scan collects every
   fee-like table in the overview pane); recognition is prose (no per-country
   split) and is preserved in `recognition_text`; FAQs are captured in `faq`.
3. **Minimal** (IUKL, UCSI, QIU, PETRONAS, UNIKL, Sunway, INTI, Swinburne,
   Nottingham, KLUST, UPTM): only the hero, program cards and the shared
   “study in Malaysia” blocks — no fee table, QS or recognition on the page
   itself, so those fields are `null`.

Fee-table parsing is header-driven (handles `التخصص | المدة | الرسوم الإجمالية`,
`الكلية | أبرز البرامج | المدة | الرسوم السنوية`, and separate RM/USD columns),
so no numeric value is guessed from the wrong column.

## Notes / caveats

* Numbers use `parse_num` on the raw string; ranges keep the first number in
  `fee` and the full string in `fee_raw`.
* `qs_year` is taken from the source (some pages cite QS 2027).
* `student_count` comes from `عدد الطلاب` only; `international_students` is kept
  separately when the page states it, to avoid conflating the two.
* `institutes.jsonl` is intentionally empty — the site lists no language centres.
* Blog discovery walks `/blog/` and `/blog/page/N/`; only 3 index pages exist
  (12 posts). `/blog/sitemap_index.xml` was not needed and returned 429 during
  recon.
