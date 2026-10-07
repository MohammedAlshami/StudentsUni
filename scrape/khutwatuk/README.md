# khutwatuk.com scraper

Scrape of **https://khutwatuk.com** (خطوتك للخدمات التعليمية — an Arabic
study-in-Malaysia agency). The site is WordPress with a working REST API, so
content comes from `/wp-json/wp/v2/` rather than HTML listing pages. Fee data
lives in Elementor "data table" widgets and is parsed into normalized records.

Arabic is preserved verbatim; nothing is translated. No value is invented —
unknown fields are `null`.

## Run

```bash
cd scrape/khutwatuk
python3 scraper.py
```

The run is resumable: each output is newline-delimited JSON keyed by
`source_url`, and a re-run skips URLs already present in that file. To rebuild
a file from scratch, delete it and run again.

Dependencies: `requests` and `beautifulsoup4` (both already used elsewhere in
`scrape/`).

> Note: the site's WAF answers HTTP 429 to a spoofed Chrome User-Agent but
> accepts a plain identifying bot UA, so `scraper.py` overrides the shared
> session's `User-Agent` after importing `common`.

## Outputs

| file | lines | contents |
| --- | ---: | --- |
| `pages.jsonl` | 49 | every WordPress page (`kind="page"`) |
| `posts.jsonl` | 89 | every WordPress post (`kind="post"`) |
| `records.jsonl` | 134 | one normalized record per page/post that yielded extractable structure |

### pages.jsonl / posts.jsonl

One line per item, with the raw rendered content preserved:

```json
{
  "source": "khutwatuk",
  "kind": "page" | "post",
  "id": 28220,
  "slug": "معهد-iabt-في-ماليزيا",
  "link": "https://khutwatuk.com/...",
  "title": "معهد IABT الأكاديمية الدولية",
  "date": "2025-...",
  "modified": "2025-...",
  "content_html": "<div data-elementor-type=...>...</div>",
  "content_text": "clean text, tags stripped",
  "categories": ["الدراسة في ماليزيا"],
  "tags": ["English", "..."],
  "source_url": "https://khutwatuk.com/...",
  "fetched_at": "2026-...Z"
}
```

`categories` / `tags` are resolved from term IDs to names; pages have none.

### records.jsonl

One record per page/post (source URL is unique, so resume works). Fields:

| field | notes |
| --- | --- |
| `kind` | `university` \| `center` \| `program` \| `discipline` \| `article` \| `misc` |
| `source_url`, `source_id`, `title`, `name`, `name_ar`, `date` | identity |
| `university` / `center` | set to the title for those kinds |
| `city` | earliest known Malaysian city mentioned in title/slug/intro; else `null` |
| `level` | `phd` \| `master` \| `bachelor` \| `diploma` \| `foundation`, only when unambiguous; `levels` keeps all detected |
| `field` | for `program` records: the topic parsed out of the title |
| `duration` | set only when every parsed fee row shares one duration |
| `fee_myr` / `fee_usd` | **minimum** parsed price in that currency (summary); `null` if none |
| `fees_table` | list of `{"label", "price", "currency"}` (+ `duration`, `price_usd`, `price_myr`, `visa_duration` when present) |
| `inclusions` / `exclusions` / `requirements` | Arabic lists from the relevant tables / notes |
| `description` | first meaningful paragraphs of the page |
| `content_text` | full cleaned text (for provenance) |

Record-kind counts (only records that were emitted):

| kind | records | of which have a fee table |
| --- | ---: | ---: |
| center | 7 | 7 |
| university | 40 | 38 |
| program | 14 | 12 |
| discipline | 44 | 39 |
| article | 28 | 5 |
| misc | 1 | 1 |
| **total** | **134** | **102** |

4 items produced no extractable structured
record (pure index / navigation pages) and were skipped in `records.jsonl`;
they still appear in `pages.jsonl` / `posts.jsonl`.

Parsed fee entries: **2618** total, currency distribution
`{'MYR': 537, 'USD': 1553, 'AUD': 209, None: 319}`.

## How fee tables are parsed

* Every `<table>` in the rendered content is read as `(headers, rows)`.
* Tables are classified, in order: `requirements` (متطلبات/شروط), the
  institute "course duration / visa fee" table (`مدة الكورس` + `دولار`),
  `exclusions` (لا تشمل/غير شامل), `inclusions` (تشمل/خدماتنا), then `fees`
  (رسوم/التكلفة/دولار or any numeric rows).
* For a fee row, the first cell is the label; the remaining numeric cells
  become entries. Columns whose header is a duration/discount
  (`المدة`, `سنوات`, `خصم`, …) are not treated as prices. Multi-column layouts
  (year columns, semester columns) produce one entry per column, suffixed with
  the column header.
* `أسم الجامعة` tables combine the university and program cells into the label
  (`university — program`).
* Currency is attached from the nearest marker within 25 chars:
  `AU$`/`AUD` → `AUD`, `دولار`/`USD` → `USD`, `رنقت`/`رنجت`/`رينغيت` → `MYR`.
  Arabic-Indic digits are normalized and `parse_num` strips thousands commas.
* A bare `$` or a number with no currency word keeps `currency: null` (the
  source is ambiguous — `$` is used for both USD and AUD), so nothing is
  guessed.
* `exclusions` are also pulled from free-text notes containing
  "لا تشمل" / "غير شامل".

## Pages that yielded parseable fee tables

102 records, grouped by inferred kind.

### center (7 pages)

| fee entries | title | source_url |
| ---: | --- | --- |
| 18 | معهد برايت | Bright | https://khutwatuk.com/%d9%85%d8%b9%d9%87%d8%af-%d8%a8%d8%b1%d8%a7%d9%8a%d8%aa-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 18 | معهد اي ام اس | EMS | https://khutwatuk.com/%d9%85%d8%b9%d9%87%d8%af-ems-%d9%81%d9%8a-%d9%83%d9%88%d8%a7%d9%84%d8%a7%d9%84%d9%85%d8%a8%d9%88%d8%b1/ |
| 13 | معهد أوسم | Awesome | https://khutwatuk.com/%d9%85%d8%b9%d9%87%d8%af-%d8%a7%d9%88%d8%b3%d9%85-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 12 | أكاديمية شيفيلد | Sheffield | https://khutwatuk.com/%d9%85%d8%b9%d9%87%d8%af-%d8%b4%d9%8a%d9%81%d9%8a%d9%84%d8%af-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 7 | معهد IABT الأكاديمية الدولية | https://khutwatuk.com/%d9%85%d8%b9%d9%87%d8%af-iabt-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 7 | معهد بيغ بن | Big Ben | https://khutwatuk.com/%d9%85%d8%b9%d9%87%d8%af-%d8%a8%d9%8a%d8%ac-%d8%a8%d9%8a%d9%86-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 6 | معهد بريتانيا | Britannia | https://khutwatuk.com/%d9%85%d8%b9%d9%87%d8%af-%d8%a8%d8%b1%d9%8a%d8%aa%d8%a7%d9%86%d9%8a%d8%a7-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |

### university (38 pages)

| fee entries | title | source_url |
| ---: | --- | --- |
| 205 | جامعة UCSI | UCSI | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5%d8%a7%d8%aa-%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-ucsi-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 153 | جامعة APU | APU | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-apu-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 114 | جامعة سيتي | CITY | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%b3%d9%8a%d8%aa%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 96 | جامعة ولونجونج | Wollongong | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%88%d9%84%d9%88%d9%86%d8%ba%d9%88%d9%86%d8%ba-%d9%85%d8%a8%d8%aa%d8%b9%d8%ab/ |
| 90 | جامعة التكنلوجيا | UTM | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%a7%d9%84%d8%aa%d9%83%d9%86%d9%88%d9%84%d9%88%d8%ac%d9%8a%d8%a7-%d8%a7%d9%84%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a9/ |
| 76 | الجامعة الوطنية | UKM | https://khutwatuk.com/%d8%a7%d9%84%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%a7%d9%84%d9%88%d8%b7%d9%86%d9%8a%d8%a9-%d8%a7%d9%84%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a9-%d9%85%d8%a8%d8%aa%d8%b9%d8%ab/ |
| 72 | جامعة جريفيث | Griffith | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d9%87-%d8%ac%d8%b1%d9%8a%d9%81%d9%8a%d8%ab-%d9%81%d9%8a-%d8%a7%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a7/ |
| 68 | جامعة كوالالمبور | UniKl | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d9%87-%d9%83%d9%88%d8%a7%d9%84%d8%a7%d9%84%d9%85%d8%a8%d9%88%d8%b1-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7-unikl/ |
| 62 | جامعة اديلايد |  Adelaide | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%a7%d8%af%d9%8a%d9%84%d8%a7%d9%8a%d8%af-%d9%81%d9%8a-%d8%a3%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a7-university-of-adelaide/ |
| 61 | جامعةRMIT University | RMIT | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-rmit-%d9%81%d9%8a-%d8%a3%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a7/ |
| 60 | جامعة INTI  | INTI | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-inti-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 58 | جامعة بوترا | UPM | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%a8%d9%88%d8%aa%d8%b1%d8%a7-%d8%a7%d9%84%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a9-university-putra-malaysia-upm/ |
| 56 | جامعة لينكولن | Lincoln | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%84%d9%8a%d9%86%d9%83%d9%88%d9%84%d9%86-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7-lincoln-university/ |
| 51 | جامعة صنواي | Sunway | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%b5%d9%86%d9%88%d8%a7%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 49 | جامعة ملتميديا | MMU | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%85%d9%84%d8%aa%d9%85%d9%8a%d8%af%d9%8a%d8%a7-mmu-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 47 | جامعة إديث كوان | Edith Cowan | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%a5%d8%af%d9%8a%d8%ab-%d9%83%d9%88%d8%a7%d9%86-%d9%81%d9%8a-%d8%a3%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a7-edith-cowan-university/ |
| 45 | جامعة ديكين | Deakin | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%af%d9%8a%d9%83%d9%8a%d9%86-%d9%81%d9%8a-%d8%a7%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a7-deakin-university/ |
| 44 | جامعة تايلور | Taylor&#8217;s | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5%d8%a7%d8%aa-%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%aa%d8%a7%d9%8a%d9%84%d9%88%d8%b1-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 43 | جامعة العلوم | USM | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-usm-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 40 | جامعة البنية التحتية | IUKL | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-iukl-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 40 | جامعة المدينة العالمية | MEDIU | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%a7%d9%84%d9%85%d8%af%d9%8a%d9%86%d8%a9-%d8%a7%d9%84%d8%b9%d8%a7%d9%84%d9%85%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 39 | جامعةماهسا | MAHSA | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%85%d8%a7%d9%87%d8%b3%d8%a7-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 38 | جامعة موناش | Monash | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%85%d9%88%d9%86%d8%a7%d8%b4-%d8%a7%d9%84%d8%a7%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a9-%d9%81%d8%b1%d8%b9-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 37 | جامعة لا تروب | La Trobe | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%84%d8%a7-%d8%aa%d8%b1%d9%88%d8%a8-%d9%81%d9%8a-%d8%a3%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a7-la-trobe-university/ |
| 37 | جامعة هيريوت وات | Heriot-Watt | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%87%d9%8a%d8%b1%d9%8a%d9%88%d8%aa-%d9%88%d8%a7%d8%aa-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7-heriot-watt-malaysia/ |
| 37 | جامعة تناجا | UNITEN | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%aa%d9%86%d8%a7%d8%ac%d8%a7-university-uniten/ |
| 34 | جامعة تسمانيا | Tasmania | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%aa%d8%b3%d9%85%d8%a7%d9%86%d9%8a%d8%a7-university-of-tasmania/ |
| 34 | جامعة سيدني | Sydney | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%b3%d9%8a%d8%af%d9%86%d9%8a-%d9%81%d9%8a-%d8%a7%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a7-university-of-sydney/ |
| 34 | جامعة سايبرجايا | Cyberjaya | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%b3%d8%a7%d9%8a%d8%a8%d8%b1%d8%ac%d8%a7%d9%8a%d8%a7-%d9%84%d9%84%d8%b9%d9%84%d9%88%d9%85-%d8%a7%d9%84%d8%b7%d8%a8%d9%8a%d8%a9/ |
| 34 | جامعة سيجي | SEGi | https://khutwatuk.com/%d8%b1%d8%b3%d9%88%d9%85-%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%b3%d9%8a%d8%ac%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 32 | جامعة موناش | Monash | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%85%d9%88%d9%86%d8%a7%d8%b4-%d9%81%d9%8a-%d8%a7%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a7-monash-university/ |
| 32 | جامعة أوتار | UTAR | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-utar-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 31 | جامعة ليمكوكوينج | Limkokwing | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%84%d9%8a%d9%85%d9%83%d9%88%d9%83%d9%88%d9%8a%d9%86%d8%ac-limkokwing-university/ |
| 29 | جامعة مالايا ويلز | IUMW | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%85%d8%a7%d9%84%d8%a7%d9%8a%d8%a7-%d9%88%d9%8a%d9%84%d8%b2-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7-iumw-university/ |
| 27 | الجامعة الطبية | IMU | https://khutwatuk.com/%d8%a7%d9%84%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%a7%d9%84%d8%b7%d8%a8%d9%8a%d8%a9-%d8%a7%d9%84%d8%af%d9%88%d9%84%d9%8a%d8%a9-imu/ |
| 24 | جامعة هيلب | HELP | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5%d8%a7%d8%aa-%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%87%d9%8a%d9%84%d8%a8-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7-help/ |
| 15 | جامعة بتروناس | UTP | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d8%a8%d8%aa%d8%b1%d9%88%d9%86%d8%a7%d8%b3-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7-utp/ |
| 6 | جامعة يوني ماي | UNIMY | https://khutwatuk.com/%d8%ac%d8%a7%d9%85%d8%b9%d8%a9-%d9%8a%d9%88%d9%86%d9%8a-%d9%85%d8%a7%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |

### program (12 pages)

| fee entries | title | source_url |
| ---: | --- | --- |
| 7 | ماجستير الهندسة | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d9%85%d8%a7%d8%ac%d8%b3%d8%aa%d9%8a%d8%b1-%d8%a7%d9%84%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 7 | دكتوراه في الأدارة | https://khutwatuk.com/%d8%af%d9%83%d8%aa%d9%88%d8%b1%d8%a7%d8%a9-%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d8%a3%d8%b9%d9%85%d8%a7%d9%84-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 7 | ماجستير إدارة الاعمال | https://khutwatuk.com/%d9%85%d8%a7%d8%ac%d8%b3%d8%aa%d9%8a%d8%b1-%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d8%a3%d8%b9%d9%85%d8%a7%d9%84-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 6 | ماجستير الامن السيبراني | https://khutwatuk.com/%d9%85%d8%a7%d8%ac%d8%b3%d8%aa%d9%8a%d8%b1-%d8%a7%d9%84%d8%a7%d9%85%d9%86-%d8%a7%d9%84%d8%b3%d9%8a%d8%a8%d8%b1%d8%a7%d9%86%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 6 | ماجستير الذكاء الإصطناعي | https://khutwatuk.com/%d9%85%d8%a7%d8%ac%d8%b3%d8%aa%d9%8a%d8%b1-%d8%a7%d9%84%d8%b0%d9%83%d8%a7%d8%a1-%d8%a7%d9%84%d8%a7%d8%b5%d8%b7%d9%86%d8%a7%d8%b9%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 5 | ماجستير الصيدلة | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d9%85%d8%a7%d8%ac%d8%b3%d8%aa%d9%8a%d8%b1-%d8%a7%d9%84%d8%b5%d9%8a%d8%af%d9%84%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 4 | ماجستير علوم الحاسوب | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d9%85%d8%a7%d8%ac%d8%b3%d8%aa%d9%8a%d8%b1-%d8%b9%d9%84%d9%88%d9%85-%d8%a7%d9%84%d8%ad%d8%a7%d8%b3%d9%88%d8%a8-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 4 | ماجستير طب الأسنان | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d9%85%d8%a7%d8%ac%d8%b3%d8%aa%d9%8a%d8%b1-%d8%b7%d8%a8-%d8%a7%d9%84%d8%a7%d8%b3%d9%86%d8%a7%d9%86-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 3 | ماجستير الهندسة الطبية | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d9%85%d8%a7%d8%ac%d8%b3%d8%aa%d9%8a%d8%b1-%d8%a7%d9%84%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d8%b7%d8%a8%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2/ |
| 1 | دكتوراه في العلاج الطبيعي | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%af%d9%83%d8%aa%d9%88%d8%b1%d8%a7%d9%87-%d9%81%d9%8a-%d8%a7%d9%84%d8%b9%d9%84%d8%a7%d8%ac-%d8%a7%d9%84%d8%b7%d8%a8%d9%8a%d8%b9%d9%8a-%d9%81%d9%8a-%d9%85/ |
| 1 | الدكتوراه في التغذية | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%af%d9%83%d8%aa%d9%88%d8%b1%d8%a7%d9%87-%d9%81%d9%8a-%d8%a7%d9%84%d8%aa%d8%ba%d8%b0%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 1 | دكتوراه في التمريض | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%af%d9%83%d8%aa%d9%88%d8%b1%d8%a7%d9%87-%d9%81%d9%8a-%d8%a7%d9%84%d8%aa%d9%85%d8%b1%d9%8a%d8%b6-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |

### discipline (39 pages)

| fee entries | title | source_url |
| ---: | --- | --- |
| 73 | تكنلوجيا المعلومات | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5-%d8%aa%d9%83%d9%86%d9%88%d9%84%d9%88%d8%ac%d9%8a%d8%a7-%d8%a7%d9%84%d9%85%d8%b9%d9%84%d9%88%d9%85%d8%a7%d8%aa-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 17 | المحاسبة | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d9%85%d8%ad%d8%a7%d8%b3%d8%a8%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 12 | إدارة الأعمال  | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d8%a3%d8%b9%d9%85%d8%a7%d9%84-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 11 | هندسة البرمجيات | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5-%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d8%a8%d8%b1%d9%85%d8%ac%d9%8a%d8%a7%d8%aa-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 10 | إدارة الضيافة | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d8%b6%d9%8a%d8%a7%d9%81%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 10 | الهندسة الكيميائية | https://khutwatuk.com/%d8%a7%d9%84%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d9%83%d9%8a%d9%85%d9%8a%d8%a7%d8%a6%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 10 | الهندسة الميكانيكية | https://khutwatuk.com/%d8%a7%d9%84%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d9%85%d9%8a%d9%83%d8%a7%d9%86%d9%8a%d9%83%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 9 | الهندسة الكهربائية | https://khutwatuk.com/%d8%a7%d9%84%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d9%83%d9%87%d8%b1%d8%a8%d8%a7%d8%a6%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 9 | إدارة السياحة | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d8%b3%d9%8a%d8%a7%d8%ad%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 9 | الطب البشري | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%b7%d8%a8-%d8%a7%d9%84%d8%a8%d8%b4%d8%b1%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 9 | الامن السيراني | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5-%d8%a7%d9%84%d8%a7%d9%85%d9%86-%d8%a7%d9%84%d8%b3%d9%8a%d8%a8%d8%b1%d8%a7%d9%86%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 9 | التسويق | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%aa%d8%b3%d9%88%d9%8a%d9%82-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 9 | إدارة الأعمال الدولية | https://khutwatuk.com/%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d8%a3%d8%b9%d9%85%d8%a7%d9%84-%d8%a7%d9%84%d8%af%d9%88%d9%84%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 9 | الهندسة الإلكترونية | https://khutwatuk.com/%d8%a7%d9%84%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d8%a5%d9%84%d9%83%d8%aa%d8%b1%d9%88%d9%86%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 8 | المختبرات الطبية | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d9%85%d8%ae%d8%aa%d8%a8%d8%b1%d8%a7%d8%aa-%d8%a7%d9%84%d8%b7%d8%a8%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 8 | الصيدلة | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5-%d8%a7%d9%84%d8%b5%d9%8a%d8%af%d9%84%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 8 | الهندسة المدنية | https://khutwatuk.com/%d8%a7%d9%84%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d9%85%d8%af%d9%86%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 7 | علم النفس | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%b9%d9%84%d9%85-%d8%a7%d9%84%d9%86%d9%81%d8%b3-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 7 | الهندسة المعمارية | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d9%85%d8%b9%d9%85%d8%a7%d8%b1%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 7 | التمريض | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%aa%d9%85%d8%b1%d9%8a%d8%b6-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 7 | هندسة الميكاترونكس | https://khutwatuk.com/%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d9%85%d9%8a%d9%83%d8%a7%d8%aa%d8%b1%d9%88%d9%86%d9%83%d8%b3-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 6 | جرافيك ديزاين | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%ac%d8%b1%d8%a7%d9%81%d9%8a%d9%83-%d8%af%d9%8a%d8%b2%d8%a7%d9%8a%d9%86-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 6 | العلاج الطبيعي | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%b9%d9%84%d8%a7%d8%ac-%d8%a7%d9%84%d8%b7%d8%a8%d9%8a%d8%b9%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 6 | التغذية | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%aa%d8%ae%d8%b5%d8%b5-%d8%a7%d9%84%d8%aa%d8%ba%d8%b0%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 6 | علوم الحاسوب | https://khutwatuk.com/%d8%b9%d9%84%d9%88%d9%85-%d8%a7%d9%84%d8%ad%d8%a7%d8%b3%d9%88%d8%a8-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 6 | ريادة الأعمال | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%b1%d9%8a%d8%a7%d8%af%d8%a9-%d8%a7%d9%84%d8%a3%d8%b9%d9%85%d8%a7%d9%84-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 6 | هندسة البترول | https://khutwatuk.com/%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d8%a8%d8%aa%d8%b1%d9%88%d9%84-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 5 | إدارة سلسلة الامدادات | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%b3%d9%84%d8%b3%d9%84%d8%a9-%d8%a7%d9%84%d8%a7%d9%85%d8%af%d8%a7%d8%af%d8%a7%d8%aa-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a/ |
| 5 | علوم البيانات | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5-%d8%b9%d9%84%d9%88%d9%85-%d8%a7%d9%84%d8%a8%d9%8a%d8%a7%d9%86%d8%a7%d8%aa-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 5 | الذكاء الاصطناعي | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5-%d8%a7%d9%84%d8%b0%d9%83%d8%a7%d8%a1-%d8%a7%d9%84%d8%a7%d8%b5%d8%b7%d9%86%d8%a7%d8%b9%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 5 | المالية والمصرفية | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5-%d8%a7%d9%84%d9%85%d8%a7%d9%84%d9%8a%d8%a9-%d9%88%d8%a7%d9%84%d9%85%d8%b5%d8%b1%d9%81%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 5 | إدارة الموارد البشرية | https://khutwatuk.com/%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d9%85%d9%88%d8%a7%d8%b1%d8%af-%d8%a7%d9%84%d8%a8%d8%b4%d8%b1%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 5 | الاقتصاد | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%a7%d9%82%d8%aa%d8%b5%d8%a7%d8%af-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 4 | هندسة الطيران | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d8%b7%d9%8a%d8%b1%d8%a7%d9%86-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 4 | طب الاسنان | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%b7%d8%a8-%d8%a7%d9%84%d8%a7%d8%b3%d9%86%d8%a7%d9%86-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 4 | الهندسة الطبية الحيوية | https://khutwatuk.com/%d8%aa%d8%ae%d8%b5%d8%b5-%d8%a7%d9%84%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d8%b7%d8%a8%d9%8a%d8%a9-%d8%a7%d9%84%d8%ad%d9%8a%d9%88%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a/ |
| 4 | هندسة المعدات الطبية | https://khutwatuk.com/%d9%87%d9%86%d8%af%d8%b3%d8%a9-%d8%a7%d9%84%d9%85%d8%b9%d8%af%d8%a7%d8%aa-%d8%a7%d9%84%d8%b7%d8%a8%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 3 | إدارة الطيران والمطارات | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d8%b7%d9%8a%d8%b1%d8%a7%d9%86-%d9%88%d8%a7%d9%84%d9%85%d8%b7%d8%a7%d8%b1%d8%a7%d8%aa-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a/ |
| 3 | التسويق الالكتروني | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%aa%d8%b3%d9%88%d9%8a%d9%82-%d8%a7%d9%84%d8%a7%d9%84%d9%83%d8%aa%d8%b1%d9%88%d9%86%d9%8a-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |

### article (5 pages)

| fee entries | title | source_url |
| ---: | --- | --- |
| 33 | الدراسة عن بعد في ماليزيا | https://khutwatuk.com/%d8%a7%d9%84%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%b9%d9%86-%d8%a8%d8%b9%d8%af-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 30 | عروض المعاهد | https://khutwatuk.com/%d8%b9%d8%b1%d9%88%d8%b6-%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d9%84%d8%ba%d8%a9-%d8%a7%d9%84%d8%a7%d9%86%d8%ac%d9%84%d9%8a%d8%b2%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a/ |
| 9 | دراسة اللغة الانجليزية في ماليزيا لمدة شهرين | https://khutwatuk.com/%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d9%84%d8%ba%d8%a9-%d8%a7%d9%84%d8%a7%d9%86%d8%ac%d9%84%d9%8a%d8%b2%d9%8a%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7-%d9%84%d9%85%d8%af/ |
| 6 | تكاليف الدراسة في ماليزيا | https://khutwatuk.com/%d8%aa%d9%83%d8%a7%d9%84%d9%8a%d9%81-%d8%a7%d9%84%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |
| 5 | الدراسة في أستراليا | https://khutwatuk.com/%d8%a7%d9%84%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d9%81%d9%8a-%d8%a7%d8%b3%d8%aa%d8%b1%d8%a7%d9%84%d9%8a%d8%a7-%d9%85%d8%a8%d8%aa%d8%b9%d8%ab/ |

### misc (1 pages)

| fee entries | title | source_url |
| ---: | --- | --- |
| 6 | مقالات ماليزيا | https://khutwatuk.com/%d8%a7%d9%84%d8%af%d8%b1%d8%a7%d8%b3%d8%a9-%d9%81%d9%8a-%d9%85%d8%a7%d9%84%d9%8a%d8%b2%d9%8a%d8%a7/ |

## Known source-data quirks (not fixed)

* `جامعة لينكولن` on the *ماجستير الهندسة* page shows
  `11,1250 رنقت (2,500 دولار)` — a misplaced comma in the source. It is parsed
  literally as `111250 MYR`.
* Some Australian-university rows use `AU$…` while others on the same page use
  a bare `$…`; the latter keep `currency: null`.
* A handful of pages repeat the same offers table twice; identical entries are
  de-duplicated.
