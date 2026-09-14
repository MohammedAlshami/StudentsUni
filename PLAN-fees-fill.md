# Plan: Fill in Missing Fees for 11 Universities

## Overview
Find tuition fees via web search for 11 universities whose programs currently have `"fees": null` and update the JSON files.

## Fee Data Structure (target format)
```json
"fees": {
  "local": "RM70,000.00",
  "local_total": 70000,
  "per_year_local": 17500,
  "currency": "MYR",
  "international": null,
  "international_total": null
}
```
Plus add a source entry in `sources` array.

## Universities (ordered by program count)

### 1. mediu (Al-Madinah International University) — ~69 programs
- Website: https://www.mediu.edu.my
- Search: `mediu.edu.my tuition fees schedule 2025 2026`
- Direct fetch: https://www.mediu.edu.my/fees/ or https://www.mediu.edu.my/admission-fee-structure/

### 2. unimel (Melaka Islamic University College) — ~57 programs
- Search: `unimel.edu.my tuition fees 2025 2026`

### 3. pu (Perdana University) — ~56 programs
- Website: https://www.perdanauniversity.edu.my
- Search: `Perdana University tuition fees Malaysia 2025 2026`

### 4. uniten (Universiti Tenaga Nasional) — unknown count
- Direct fetch: https://www.uniten.edu.my/fees
- Search: `uniten.edu.my tuition fees 2025 2026`

### 5. qiu (Quest International University) — ~51 programs
- Website: https://www.qiu.edu.my
- Search: `Quest International University tuition fees 2025 2026`

### 6. aimst (AIMST University) — ~48 programs
- Website: https://www.aimst.edu.my
- Search: `AIMST University tuition fees 2025 2026`

### 7. utem (Universiti Teknikal Malaysia Melaka) — ~45 programs (public)
- Public: RM700-1100/semester expected
- Website: https://www.utem.edu.my
- Search: `utem.edu.my yuran pengajian fees 2025 2026`

### 8. neuc (New Era University College) — ~42 programs
- Website: https://www.neuc.edu.my
- Search: `New Era University College tuition fees 2025 2026`

### 9. usim (Universiti Sains Islam Malaysia) — ~39 programs (public)
- Public university
- Website: https://www.usim.edu.my
- Search: `usim.edu.my yuran pengajian fees 2025 2026`

### 10. mila (MILA University) — ~38 programs
- Website: https://www.mila.edu.my
- Search: `MILA University tuition fees 2025 2026`

### 11. utp (Universiti Teknologi PETRONAS) — ~38 programs
- Website: https://www.utp.edu.my
- Search: `Universiti Teknologi PETRONAS tuition fees 2025 2026`

## Workflow Per University

1. **Glob** all program JSON files under `public/data/universities/{slug}/`
2. **Read** each file, check if `fees` is `null`
3. **WebSearch** for fee information
4. **WebFetch** direct fee pages if found
5. **Edit** the JSON file with fee data + source URL
6. **Track** count of files updated vs skipped

## Rules
- NEVER fabricate fee data — if not found, leave `null`
- Always preserve existing file structure
- Add web source to `sources` array with `fetched_at` timestamp
- Set `currency: "MYR"` and appropriate confidence level
- For public unis (utem, usim), expect much lower fees (~RM700-1100/sem)
- For private unis, fees typically range RM20,000-120,000 total for bachelor

## Estimated Total Programs to Process
~520+ programs across 11 universities

## Execution Order
Start with universities most likely to have centralized fee pages (uniten, aimst, qiu, utp) for quick wins, then proceed with others.
