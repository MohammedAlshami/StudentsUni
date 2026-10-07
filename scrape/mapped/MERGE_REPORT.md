# Merge Report — competitor data → StudentsUni DB

**Date:** 2026-10-07
**Sources scraped:** maigaedu.com · khutwatuk.com · abeereducation.com · quickuni.com
*(al-enjaz.net excluded — academic-writing service, no university/program data)*
**Method:** resumable Python scrapers (WP REST API where available, otherwise sitemap + HTML), resumable JSONL, fill-only merge.
**Safety:** every file written under `public/data` was backed up to `scrape/_backup/` first.

---

## 1. What was scraped

| source | records | highlights |
|---|---:|---|
| **maiga** | 5,477 | 1,922 programs (fee + requirements + accreditation + description), 193 English courses, 15 centres, 18 universities, 282 articles, 3,047 FAQ |
| **khutwatuk** | 272 | 134 normalized records, **2,618 fee entries**, all 7 language institutes, 40 universities, 44 disciplines |
| **abeer** | 44 | 28 universities — 16 fee tables, 12 QS ranks, 9 recognition maps, 28 requirement sets |
| **quickuni** | 27 | 8 services, Bright English packages, 1 MBA, 3 partner promos |

Raw output: `scrape/_merged/all.jsonl` (5,820 deduped records) + per-site `*.jsonl`.

---

## 2. What was mapped & applied

### 2a. University enrichment — **37 info.json updated**

Priority per field: **abeer > maiga > khutwatuk > quickuni**. Fill-only.

| field added | universities | field added | universities |
|---|---:|---|---:|
| `description` | 37 | `accreditation` | 10 |
| `logo` / `hero_image` | 26 | `student_count` | 9 |
| `intakes` | 25 | `languages_of_instruction` | 9 |
| `founded_year` | 16 | `recognition` (by country) | 9 |
| `local_rank` (MY) | 14 | `qs_year` | 4 |
| `faculties` | 14 | `employability` | 3 |
| `qs_rank` (world) | 11 | `alumni_count` | 3 |
| `city` | 11 | `international_students` | 3 |

Example — `apu` now carries: `founded_year 1993`, `qs_rank 597 (QS 2026)`, `local_rank 37`, `student_count 11000`, `alumni_count 90000`, `employability`, `languages_of_instruction`, `recognition` for Egypt/Sudan/Saudi/UAE/Qatar/Oman, `faculties`, `logo`, `hero_image`, `intakes`.

### 2b. New dataset — `public/data/language-centres/` (**16 centres**)

Built from maiga centres+courses, khutwatuk institutes, quickuni packages.

| centre | courses/offers | sources |
|---|---:|---:|
| elit-english-center | 24 | maiga + khutwatuk |
| stratford-international | 24 | maiga |
| sheffield-academy | 13 | maiga + khutwatuk + quickuni |
| britannia-language-center | 14 | maiga + khutwatuk |
| elc / els / excel / iabt / manchester / wwlc | 12–16 | maiga |
| big-ben / bright / ems | 7–12 | maiga + khutwatuk (+ quickuni for Bright) |
| menara / erican / awesome | 1–10 | maiga / khutwatuk |

Each centre file: `name`, `name_ar`, `city`, `logo`, `description`, `student_count`, `course_count`, `courses[]` (duration, fee_myr/fee_usd, discount, fees_table), `offers[]`, `inclusions[]`, `exclusions[]`, `sources[]`.

### 2c. Program enrichment — **390 program files patched**

Matching engine: English names (maiga enrichment + khutwatuk fee-table labels), Arabic fallback. Level-compatible fuzzy match (score ≥ 0.72; 371/390 ≥ 0.85).

| patch type | files | source mix |
|---|---:|---|
| `fees` (fill a null total) | **144** | maiga / khutwatuk |
| `description` | **338** | maiga |
| `requirements` | **338** | maiga |
| `duration` | 0 | (already 100%) |

Top beneficiaries: cityu (55 fees), luc (15), unitar (22), unikl (11), segi (9), help (8), upm (7), hwum (6).

---

## 3. Coverage in our DB

### Programs (`public/data/universities/*/*/*.json`, 4,343 files)

| metric | before | after |
|---|---:|---:|
| fees present | ~2,783 | **2,927** (+144) |
| description | ~0 | **377** (+338) |
| requirements | ~4,300 | 4,300 (99%) |
| duration | 4,343 | 4,343 (100%) |

### University profiles (`info.json`, 96 institutions)
New fields now populated on 9–37 institutions each (see table above). Previously none of `qs_rank`, `founded_year`, `student_count`, `recognition`, `faculties`, `logo` existed in the schema.

### Language centres
0 → **16 centres**, 193 courses, fee tables + inclusions + offers.

---

## 4. Not matched / left out (by design)

- **15 scraped universities out of scope:** Australian branches (Tasmania, Wollongong AU, Adelaide, La Trobe, Griffith, Edith Cowan, Deakin, Sydney, RMIT), **IUKL**, **UTAR** (≠ our TARUMT), Geomatika, Alfa, YES International.
- Programs not matched by name: left untouched (never guessed).
- Fees marked as external estimates in `notes`; source URL always recorded.

---

## 5. Caveats

- Source fees are **agency/promotional prices** (maiga), **USD estimates** (abeer), or **mixed-currency tables** (khutwatuk). Treat as indicative and cross-check official sites before publishing.
- Program `description` texts added from maiga are Arabic and somewhat templated.
- `recognition` maps are country-keyed Arabic text (abeer).
- maiga course English names came back null (course pages don't render an English `<h1>`), so course records rely on Arabic + duration/fee.

---

## 6. Reproduce / revert

```bash
python3 scrape/map/match_universities.py
python3 scrape/map/build_university_patches.py
python3 scrape/map/match_programs.py
python3 scrape/map/build_language_centres.py
python3 scrape/map/apply_patches.py --all --dry-run   # preview
python3 scrape/map/apply_patches.py --all             # write (backed up)

python3 scrape/verify.py            # per-file counts
python3 scrape/consolidate.py       # re-merge scraped JSONL
```

Revert a file: copy it back from `scrape/_backup/<path-relative-to-public/data>`.
