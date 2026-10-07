# Competitive Website Analysis — Malaysian Education Sites

**Prepared:** 2026-10-06
**Scope:** 5 sites analyzed against our own dataset (`StudentsUni` / `public/data`)
**Sites:** maigaedu.com · khutwatuk.com · al-enjaz.net · abeereducation.com · quickuni.com
**Goal:** identify what structured data each site exposes, what is missing from ours, and where we can source it.

---

## 0. Our baseline (what we already have)

| Item | Value |
|---|---|
| Institutions | **96** — 20 public universities, 60 private universities, 16 university colleges |
| Program index entries | **4,575** |
| Program detail files | **3,267** |
| Fees present | **1,996** (~61% of detail files) |
| Fees `null` | **1,271** (~39% of detail files) |
| Program descriptions | **~0** — there is no `description` field in the schema at all (3,528 of 4,575 entries have nothing) |
| Duration / intakes | ~100% |
| Requirements | ~98% (missing mostly master/PhD where SPM N/A) |
| MQA reference (`mqa_ref`) | missing on **3,147** programs (only status, rarely the ref) |
| Program images | **none** |
| English language centres | **none** — we have zero language-institute data |
| University-level extras | no QS rank, no student numbers, no founded year, no living-cost data |
| Languages | EN / AR / ZH for program & field names |

> Note: `public/data/_meta/progress.json` claims "100% fees (4332/4344)". The real files show **~39% of detail files have null fees** and only 3,267 detail files exist for 4,575 entries. The tracker is optimistic; treat these computed numbers as the working truth.

**Fields our program schema has today:** `program_name` (+ar/zh), `field` (+ar/zh), `duration`, `mode`, `intakes`, `fees{local_total, international_total, per_year, notes}`, `requirements{...}`, `accreditation{mqa_status, mqa_ref}`, `sources`, `confidence`.
**Fields we do NOT have:** `description`, `image`, `qs_rank`, `student_count`, `founded_year`, `living_cost`, `scholarship/offer`, `recognition_by_country`, `language_centre` entity, `program_level_standardised` (we have messy level dirs like `bachelors`, `masters`, `doctorate`, `undergraduate` alongside `bachelor`, `master`, `phd`).

---

## 1. Summary comparison

| | **maigaedu.com** | **khutwatuk.com** | **al-enjaz.net** | **abeereducation.com** | **quickuni.com** |
|---|---|---|---|---|---|
| Type | Study-in-Malaysia agency | Study-in-Malaysia agency | Academic-writing services | Study-in-Malaysia agency | Study-abroad consultancy |
| Language | AR + EN | AR | AR | AR (+ bits EN) | EN + AR |
| Target market | Saudi | Arab (general) | Arab researchers/students | Egypt, Libya, Sudan, Gulf | Global (Maldives, Gulf, Africa, CIS) |
| Universities listed | 18+ partner | ~30 (3 groups) | — | 50+ partner | "500+" claim, no catalog |
| Program/major catalog | 1,922 majors | Yes (by discipline) | — | Yes (filterable) | No public catalog |
| **Language centres** | **19 (15 listed)** | **7** | — | Yes (institutes page) | Promos only |
| Fees (university) | Yes (per program) | Yes (tables) | — | Yes (per program, USD) | — |
| **Fees (English courses)** | **Yes (rich, MYR+USD)** | **Yes (rich, MYR)** | — | Partly | Instagram only |
| Descriptions | Short | Long editorial | Long service copy | **Very long editorial** | Medium service copy |
| QS rank / student counts | Rank + program count | Rank on uni pages | — | **Rank, students, founded, employment** | — |
| Registration portal | Login/signup | No | No | **Yes (student register/login)** | Apply form |
| Offers/discounts | **Yes (50%, coupons, Tamara)** | Yes | No | Scholarships mentioned | Yes |
| Blog/content | Large | Large | Articles | Large | Small |
| Data we want most | Language-centre fees, majors, offers | Language-centre fees, uni fee tables | Service-page copy only | **Program descriptions, requirements, recognition, fee tables** | Service copy, Bright course pricing |

---

## 2. maigaedu.com — MAIGA Educational Services

### What it is
A licensed (Saudi Arabia + Malaysia) education agency selling "everything under one roof": university admission, English courses, visa, housing, airport pickup, orientation. Arabic-first with a full English mirror (`/en/`). Claims 10+ years, 15,000 consultations, 2,142 registered students, 1,922 majors, 18+ partner universities, 19 language centres.

### Site map (data-bearing pages)
- `/en/universities` — filterable university directory
- `/en/language-centers` — the English institutes directory
- `/en/programs` (Majors) — 1,922 majors
- `/en/offers` — monthly offers, 50% deals
- `/en/center/<slug>/<id>` — individual language centre
- `/en/university/<slug>/<id>` — individual university
- `/en/course/<slug>/<id>` — individual English course (duration + price)
- `/en/program/<slug>/<id>` — individual academic program
- `/en/accommodation/`, `/en/orientation-courses/`, `/en/training-program/`, `/en/all-articles/`, `/en/all-news/`, `/en/services/calculator/`

### Data we can extract
- **Language centre directory (15 shown):** ELC (20 courses), Sheffield (13), Bright (7), EMS (11), Big Ben (18), Menara (10), WWLC (11), IABT (12), ELS (12), Manchester (12), EXCEL (12), Elit (24), Erican (1), Stratford (25), Britannia (14) — each with logo, city, # courses, type (Regular/Intensive).
- **English course pricing (very valuable):** duration (1/2/3/6/8/10/12 months), price in **MYR + USD**, discount, and *what the price includes* — registration fee, tuition, placement test, student visa, health insurance & medical, airport pickup. Example (Big Ben): 1 mo 2,340 · 2 mo 4,380 · 3 mo 6,420 · 6 mo 15,540 · 8 mo 21,120 · 10 mo 25,200 · 12 mo 29,280 MYR; books 150 MYR/month; accommodation excluded.
- **University cards:** name, city, ranking number, program count, type (Public/Private/Foreign/Hybrid), tuition-range buckets (<20k / 20–25k / 25–30k / 30k+ MYR), field filter.
- **Offers engine:** discount %, original vs offer price, coupon/installment (Tamara), per-course.
- **Program pages:** name, university, fee, duration, discount.
- **Service/soft data:** testimonials (name, date, rating), team (name, role, photo), FAQ, news, blog, holiday calendar.

### What's different vs ours
- We have **no language-centre entity at all**; MAIGA has 19 institutes with course counts and fees — directly fills our biggest gap.
- MAIGA prices **English courses by month with inclusions/exclusions**; we only have university program totals.
- They expose **tuition-range filters and QS rank buckets**; our data has no rank and no price bucketing.
- They run an **offers/discount layer** (50%, Tamara installments); we have none.
- They cover **housing, orientation, airport pickup, attestation** as first-class content; ours is a catalog + blog.
- Our coverage is **deeper** (96 institutions, 4,575 programs, MQA status) than their curated 18+ partner set.
- Their **Arabic is native and market-tuned** (Saudi); our AR/ZH is name-level translation.

### Notes on extraction
Structured, server-rendered, clean URLs with numeric IDs. Course pages give the most complete fee+inclusion data. Some price text is Arabic numerals — normalize to MYR integers. Prices include agency discounts, so tag as "promotional / agency price", not official list fee.

---

## 3. khutwatuk.com — خطوتك للخدمات التعليمية

### What it is
Arabic-only Malaysia study agency. Strong on **discipline/major landing pages** (SEO) and on **language-institute detail pages**. Three university buckets: private, foreign branch, government/public.

### Site map
- `/الجامعات-الماليزية-المعترف-بها-عالميا/` — university hub (private / foreign / government)
- `/دراسة-اللغة-الإنجليزية-في-ماليزيا/` — language institutes hub (7)
- `/تخصصات-جامعات-ماليزيا/` — majors hub (computing, engineering, management, medical, graphic design)
- `/دراسة-الماجستير-في-ماليزيا/`, `/دراسة-الدكتوراه-في-ماليزيا/`
- `/تكاليف-الدراسة-في-ماليزيا/`, `/عروض-دراسة-اللغة-الإنجليزية/`
- `/الجامعات-الماليزية-المعترف-بها-في-السعودية/`, `/...-المعتمدة-في-الدول-العربية/`

### Data we can extract
- **Language institutes (7):** IABT, EMS, Big Ben, Bright, Sheffield, Britannia, Awesome.
- **Very detailed institute pages**, e.g. Big Ben:
  - description + mission + teaching method
  - CEFR-aligned intensive program, 6 levels
  - **full fee table** (1/2/3/6/8/10/12 months in MYR)
  - **what's included** (registration, tuition, placement test, student visa, health insurance + medical, airport pickup, free SIM)
  - **exclusions** (accommodation; books 150 MYR/month)
  - **payment process** (e.g. 700 USD visa deposit to institute bank account, balance on arrival)
  - visa steps, monthly intake, FAQ ("how many levels", "how many months")
- **University pages:** specializations, ranking, fees tables.
- **Discipline pages:** each major (AI, cybersecurity, civil, accounting, nursing, medicine, etc.) gets its own descriptive page — reusable taxonomy + SEO copy.
- **Recognition pages:** "universities recognized in Saudi Arabia" and "accredited in Arab countries".

### What's different vs ours
- Their **language-institute pages are deeper than our entire language coverage (zero)** — description, CEFR levels, fees, inclusions, payment flow, FAQ.
- They publish **payment/visa workflow** (deposit amounts, when to pay); we don't model process at all.
- They have a **clean discipline taxonomy with landing pages**; our `field` values are inconsistent and have no pages.
- They separate **recognized-in-Saudi / recognized-in-Arab-countries** lists; we have no country-recognition field.
- Their university set is small (~30); our 96 institutions is far broader.
- No English interface, no portal, no live offers engine (offers are static pages).

### Notes on extraction
All Arabic; fee tables are clean `<table>`s and easy to parse. Normalize Arabic-Indic digits and "رنقت/رنجت" → MYR. Best single source for **English-course fee tables + inclusions + payment process**.

---

## 4. al-enjaz.net — الإنجاز للخدمات التعليمية

### What it is
**Not a study-abroad directory.** It is an academic-support service: thesis/dissertation writing, assignments, research publishing, graduation projects, statistical analysis, translation, CV/design. Arabic-only, Saudi-facing (+1641 beneficiaries, +112 theses, +12 service types).

### Site map
- `/service/<slug>/` — 19 service pages
- `/team/`, `/testimonial/`, `/المقالات/` (articles), `/اتصل-بنا/`

### Data we can extract
- **19 service definitions** with copy: research writing, thesis/dissertation, assignment solving, journal publishing, graduation projects, title selection, source gathering, research plan, survey design, **SPSS analysis**, abstract (AR/EN), indexes/contents, formatting, proofreading (AR/EN), presentations, certified translation, CV/portfolio, promo design.
- Service request form fields (name, phone, service dropdown, deadline, notes).
- Team bios, testimonials, article library.

### What's different vs ours
- **Entirely different category** — it's a services/agency site, not a university catalog. No university, program, fee, or ranking data.
- Useful to us only as **copy/UX reference for our `/services` page** and as a signal of adjacent demand (SPSS, thesis help, translation).
- Their **service catalog is itemized with 19 discrete offerings**; our services page is not modeled as structured services.
- They have a **service-request workflow with deadline + notes**; we have a generic contact form.
- They have **no English interface** and no data schema we can ingest.

### Notes on extraction
Low priority for the catalog. Value = content/UX patterns and possible future "student services" module. Do not scrape as university data.

---

## 5. abeereducation.com — Abeer Education

### What it is
The **most content-rich competitor**. Egypt/Libya/Sudan/Gulf-focused agency, since 2011, HQ Kuala Lumpur, claims 50+ partner universities and 5,000+ students, EMGS-recognized. Has a **student registration/login portal**. University pages are long, SEO/editorial articles with tables.

### Site map
- `/universities` + `/universities/category/{foreign|government|private}`
- `/universities/<slug>` — university profile (long-form)
- `/institutes` — language institutes
- `/students-register-form`, `/login`, `/register`
- `/blog/`, `/about`, `/contact`, `/privacy-policy`, `/terms`
- Program search with **degree** + **faculty** filters on the home page.

### Data we can extract (per university page)
Using APU as the example, each page yields:
- **Identity:** full name, abbreviation, founded year (1993), location (Technology Park Malaysia, Bukit Jalil, KL), type (private / Premier Digital Tech University), language of instruction.
- **Scale & rank:** 11,000+ students from 130 countries, QS 2026 rank (#597, top 2%), alumni count, employability (100% tracer study).
- **Accreditation:** MQA, QAA (UK, first Malaysian uni, May 2024), professional bodies (Board of Engineers Malaysia/Washington Accord, ACCA/CPA/ICAEW, IFOA/SOA).
- **Faculties & specializations:** structured lists (computing, engineering, business, accounting/finance, design/media, postgraduate).
- **Fee tables:** program → duration → **total fee in USD** (e.g. AI/Cyber/CS 3.5 yrs ≈ $28,555; engineering 4 yrs ≈ $21,500–24,000; MBA 1.5 yrs ≈ $18,000).
- **Double-degree detail:** partner university (De Montfort), membership fee GBP 450/level, total GBP 1,350–1,800.
- **Recognition by country:** Egypt (SCU), Sudan, Saudi, UAE, Qatar, Oman — with steps.
- **Comparison tables:** APU vs MMU vs Sunway on rank, double degree, fees, best-fit.
- **Admission content:** English requirements (IELTS 5.0–5.5 non-medical, 6.0 medical), documents, 8-step admission process, intakes (March/July/Sept/Nov).
- **Cost of living & housing:** $150–300/mo housing, $300–550/mo total, work rights (20 hrs/week in official breaks).
- **FAQ, testimonials (many, named), team (name/role/WhatsApp), scholarships.**

### What's different vs ours
- Their **program pages carry narrative descriptions, faculty context, accreditation, and country recognition**; ours have no `description` field and no recognition data.
- They give **QS rank, student counts, founded year, employability, alumni** at university level; we have none of these.
- They present **fee tables with duration per program in USD**; we have totals in MYR with ~39% null.
- They model **double/awarding-partner degrees**; our data has a raw `awarding_country`/`awarding_body` on only ~112/7 files — not systematic.
- They have a **student portal + registration**; we are read-only.
- They expose **country-by-country recognition** (huge for Arab students); we have none.
- Our **breadth wins**: 96 institutions / 4,575 programs vs their 50+ curated; their depth-per-uni wins.
- They have **no language-course fee tables** as detailed as MAIGA/khutwatuk (institutes page exists but thinner).
- **Caution:** their fee numbers are **estimates/rounded in USD** and sometimes inconsistent with official sources — use as a secondary cross-check, not ground truth.

### Notes on extraction
Laravel app (`/storage/...`, `/login`, `/register`). University pages are server-rendered and parseable; tables are clean. Highest-value source for **program descriptions, entry requirements, recognition, fee tables, and university profile fields**.

---

## 6. quickuni.com — QuickUni

### What it is
Malaysia-based consultancy (KL HQ) targeting **global English-speaking markets**: Maldives, Qatar, Kuwait, Oman, UAE, Saudi, Indonesia, Kazakhstan, Uzbekistan, Tajikistan, Tanzania, Nigeria. English-first with an Arabic mirror. "Education Matchmaker."

### Site map
- `/our-services/`, `/home-quickuni/about-quickuni/`, `/apply-now/`, `/student-registration-form/`
- `/1084-2/` (blog), `/Links`, `/google-review/`
- Country contact sections (WhatsApp per country)

### Data we can extract
- **Service definitions (8):** student counselling, university admissions, visa assistance, career guidance, hostel arrangement, pick-up arrangement, pre-departure briefing, student support — with marketing copy for each.
- **Course/partner marketing:** YouTube features (Sunway, APU, Southampton Malaysia), partner logos.
- **English-course pricing (from their social feed):** Bright Language Centre — 1 month RM2,800 (save RM330), 2 months RM4,500 (save RM960), 3 months RM5,500 (save RM2,490) + transport card; includes registration, placement test, books/materials, tuition; ages 13+.
- **Google reviews** (5.0, 7 reviews) and named reviewers.
- **Global office footprint** (city + WhatsApp per country) — useful for market-expansion view.
- Blog articles (MBA in Luxembourg, Indian students → Malaysia, Malaysia vs USA/UK/AU feasibility).

### What's different vs ours
- QuickUni has **no public university/program catalog** — it's a lead-gen consultancy, so it offers almost no ingestible academic data.
- Their value is **service-page copy and positioning** (matchmaker, global offices, free counselling), plus the **Bright English-course package prices**.
- They market **many countries**, not only Malaysia; we are Malaysia-only and deeper.
- They **lead with English**; we support EN/AR/ZH.
- They have **no structured fees for university programs**, whereas our core asset is exactly that.
- Lowest priority for data; moderate priority for **messaging/UX reference**.

---

## 7. The English language centres (your priority)

None of the five sites **is** an English centre — they are agencies that **list/aggregate** English centres. The actual centres, consolidated across maigaedu + khutwatuk + abeereducation + quickuni:

| Centre | Seen on | Data available |
|---|---|---|
| Big Ben Academy | maiga, khutwatuk | description, CEFR levels, full monthly fee table, inclusions, exclusions, payment/visa process, FAQ |
| EMS English Center | maiga, khutwatuk | listing + description; fee table (khutwatuk) |
| Bright Language Center | maiga, khutwatuk, abeer, quickuni | listing, description, package pricing (RM2,800/4,500/5,500) incl. items |
| Sheffield Academy | maiga, khutwatuk | listing, description, offer (IELTS free 8 mo) |
| Britannia Language Center | maiga, khutwatuk | listing, description |
| IABT (Int'l Academy of Business & Technology) | maiga, khutwatuk | listing, description |
| ELC English Center | maiga | listing, 20 courses |
| Menara / MLC / Manchester Language Centre | maiga | listing, courses |
| WWLC (Wordsworth) | maiga | listing, 11 courses |
| ELS | maiga | listing, 12 courses |
| EXCEL | maiga | listing, 12 courses |
| Elit English Center | maiga | listing, 24 courses, offer (3 mo 5,300 MYR / $1,378) |
| Erican | maiga | listing, 1 course |
| Stratford International Language Centre | maiga | listing, 25 courses |
| Awesome | khutwatuk | listing, description |

**Fields we could model for a new `language_centres` dataset:**
`name` (+ar), `city`, `logo`, `description`, `mission`, `course_types` (Regular/Intensive/Certificate), `cefr_levels`, `course_count`, `durations` (months), `fees[{duration, myr, usd}]`, `inclusions[]`, `exclusions[]`, `books_fee`, `registration_fee`, `visa_deposit`, `payment_process`, `intakes`, `offers[]`, `source_url`, `fetched_at`.

**Why this matters:** it is a **whole vertical we currently have zero of**, it is exactly what the user asked for, and the fee/inclusion detail on maigaedu + khutwatuk is ready to parse.

---

## 8. Consolidated: what data we can get from where

| Data field | maigaedu | khutwatuk | al-enjaz | abeereducation | quickuni |
|---|---|---|---|---|---|
| Language-centre list | ✅ 15 | ✅ 7 | — | ✅ | — |
| Language-course fees | ✅✅ MYR+USD+inclusions | ✅✅ MYR+inclusions | — | ◐ | ◐ (Bright only) |
| Language-course descriptions | ✅ | ✅✅ | — | ◐ | ◐ |
| University profile (founded, city, type) | ◐ | ◐ | — | ✅✅ | — |
| QS rank | ✅ | ✅ | — | ✅ | — |
| Student counts / employability | — | — | — | ✅ | — |
| Program descriptions | ◐ | ◐ | — | ✅✅ | — |
| Program fee tables | ✅ | ✅ | — | ✅ (USD, est.) | — |
| Entry requirements / IELTS | ◐ | ◐ | — | ✅ | — |
| Recognition by country | ◐ | ✅ | — | ✅✅ | — |
| Scholarships / offers | ✅ | ✅ | — | ◐ | ◐ |
| Cost of living / housing | ◐ | ◐ | — | ✅ | — |
| Accreditation detail (MQA/QAA/pro bodies) | ◐ | ◐ | — | ✅✅ | — |
| Service-page copy | ✅ | ✅ | ✅✅ | ✅ | ✅✅ |
| Blog/SEO topic ideas | ✅ | ✅ | ✅ | ✅ | ◐ |

Legend: ✅✅ excellent · ✅ good · ◐ partial · — none.

---

## 9. Recommended next steps (priority order)

1. **Build a `language_centres` dataset** (biggest gap, explicit user ask). Seed from **maigaedu + khutwatuk** (fees, inclusions, CEFR, process), enrich descriptions from **abeereducation `/institutes`**. Target the 7 centres that appear on 2+ sites first.
2. **Backfill program descriptions** using **abeereducation** university pages as the primary template (faculty context, accreditation, recognition) — this fixes our ~0% description coverage.
3. **Add university profile fields**: `founded_year`, `qs_rank`, `student_count`, `employability`, `languages_of_instruction`, `accreditation[]` — source from abeereducation (and cross-check official sites).
4. **Add `recognition_by_country`** (Saudi/Egypt/UAE/Qatar/Oman/Sudan) — abeereducation + khutwatuk recognition pages.
5. **Add an `offers` layer** (discount %, validity, inclusions) — maigaedu + khutwatuk + quickuni social.
6. **Fix fee coverage**: our 1,271 null-fee detail files can be partially filled from maigaedu/khutwatuk/abeer tables, but always tag source and confidence; prefer official university sources where they exist.
7. **Model services as structured items** (for our `/services` page) — reference al-enjaz (19 itemized services) + quickuni (8 services).
8. **Standardize level taxonomy** (our level dirs are inconsistent) — use the 7 clean levels abeereducation exposes: foundation, international schools, bachelor, diploma, master, phd, doctor.

---

## 10. Caveats

- Fee figures on these sites are often **agency/promotional prices or USD estimates**, not official list fees. Always record `source_url`, `publisher`, `fetched_at`, and a `confidence` value, and cross-check against the official university/centre page before publishing as authoritative.
- Scrape **respectfully**: robots.txt, rate limits, and attribution. Prefer linking back to the source page for each fact.
- Prices and offers change frequently (monthly offers, end-of-year promos) — store a `valid_until` where available.
- Arabic content needs digit normalization (٠١٢٣ → 0123) and currency normalization (رنقت/رنجت/ريال → MYR/USD).
- `abeereducation` uses USD estimates and sometimes rounds aggressively (e.g. "$28,555") — treat as indicative.
- Two of the five (al-enjaz, quickuni) contain **little or no ingestible academic data**; their value is content/UX, not dataset rows.
