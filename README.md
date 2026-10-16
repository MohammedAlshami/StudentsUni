# University Finder / StudentsUni

A Next.js web app to explore Malaysian university programs by field, level,
duration, fees, and accreditation. It ships with a pre-built data directory
under `public/data/universities/` (university, college, and program listings).

## Features

- Filter programs by **field, university, level, fee, duration, accreditation**
- Static JSON data (no backend required)
- Mobile-friendly UI
- Built with Next.js 15 + Tailwind

## Getting started

```bash
npm install
npm run dev   # http://localhost:3000
```

## Project layout

```
src/                # app + components
public/data/        # university/program data (JSON)
```

## Notes

The dataset under `public/data/` is curated local data; no API keys are required.
