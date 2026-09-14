# Data folder structure

public/data/
  institutions.json                        # master index of all 96 institutions
  universities/<uni-slug>/
    info.json                              # university profile
    <level>/                               # foundation | diploma | bachelor | master | phd
      index.json                           # list of all programs found at this level (name + slug + detail_status)
      <program-slug>.json                  # full detail for one program (may not exist yet for every entry in index.json)
  _meta/
    schema.md                              # this file
    progress.json                          # orchestrator-maintained completion tracker (do not edit from subagents)

## info.json (per university)
{
  "slug": "um",
  "name": "University of Malaya",
  "abbr": "UM",
  "type": "public-university | private-university | private-university-college",
  "state": "Kuala Lumpur",
  "city": "Kuala Lumpur",
  "website": "https://www.um.edu.my",
  "levels_available": ["foundation","bachelor","master","phd"],
  "program_counts": {"foundation": 2, "bachelor": 45, "master": 30, "phd": 20},
  "sources": [{"url": "...", "publisher": "...", "fetched_at": "YYYY-MM-DD"}],
  "last_updated": "YYYY-MM-DD"
}

## <level>/index.json
{
  "university_slug": "um",
  "level": "bachelor",
  "programs": [
    {"slug": "bachelor-of-computer-science", "name": "Bachelor of Computer Science", "field": "Computer Science", "detail_status": "done | pending"}
  ]
}

## <level>/<program-slug>.json (full detail)
{
  "university": "University of Malaya",
  "university_slug": "um",
  "level": "bachelor",
  "program_name": "Bachelor of Computer Science",
  "field": "Computer Science / IT",
  "duration": "4 years",
  "mode": "Full-time",
  "intakes": ["September"],
  "fees": {
    "currency": "MYR",
    "local_total": 12000,
    "international_total": 45000,
    "per_year_local": null,
    "per_year_international": null,
    "notes": ""
  },
  "requirements": {
    "malaysian": {
      "spm": "...",
      "stpm": "...",
      "foundation_matriculation": "...",
      "diploma_pathway": "..."
    },
    "international": {
      "a_level": "...",
      "ib": "...",
      "other_qualifications": "...",
      "english_requirement": "IELTS 6.0 / TOEFL 80 or equivalent"
    }
  },
  "accreditation": {
    "mqa_status": "Full Accreditation | Provisional | Unknown",
    "mqa_ref": null
  },
  "sources": [
    {"url": "...", "publisher": "StudyMalaysia.com", "fetched_at": "YYYY-MM-DD"},
    {"url": "...", "publisher": "University official site", "fetched_at": "YYYY-MM-DD"}
  ],
  "confidence": "high | medium | low",
  "last_updated": "YYYY-MM-DD"
}

## Rules for data collectors
- Never fabricate a number or requirement. If a fact can't be confirmed from a fetched page, use `null` and set "confidence": "low".
- Every fee/requirement fact must carry at least one source URL actually fetched (not guessed) plus the date fetched.
- Cross-check fees/requirements against at least 2 sources when possible (e.g. an aggregator + the university's own site); if they conflict, prefer the official university site and note the discrepancy in "notes".
- Use kebab-case slugs, no special characters.
- Do not overwrite institutions.json or progress.json — only the orchestrator updates those.
