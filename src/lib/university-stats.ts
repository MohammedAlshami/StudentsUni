import fs from "fs";
import path from "path";
import { normalizeProgramsList, loadProgramDetail } from "@/lib/university-detail";

export type UniversityStats = {
  totalPrograms: number;
  feeRange: { min: number; max: number; currency: string } | null;
};

const UNIVERSITIES_DIR = path.join(process.cwd(), "public/data/universities");
const MAX_DETAIL_SCANNED = 80;

function readJSON(filePath: string): unknown | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function getUniversityStats(slug: string): UniversityStats {
  const uniDir = path.join(UNIVERSITIES_DIR, slug);

  let totalPrograms = 0;
  let min = Infinity;
  let max = -Infinity;
  let currency = "MYR";
  let scanned = 0;

  if (fs.existsSync(uniDir)) {
    const levels = fs
      .readdirSync(uniDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== "_meta")
      .map((e) => e.name);

    outer: for (const level of levels) {
      const indexPath = path.join(uniDir, level, "index.json");
      const programs = normalizeProgramsList(readJSON(indexPath));
      // Ground truth for "how many programmes" is the actual index length —
      // info.json summary fields are inconsistently named across universities
      // (program_counts vs total_programs, etc.) so they aren't trustworthy.
      totalPrograms += programs.length;

      for (const prog of programs) {
        if (scanned >= MAX_DETAIL_SCANNED) break outer;
        const detail = loadProgramDetail(slug, slug, level, prog);
        if (!detail.hasDetail) continue;
        scanned++;
        const fee = detail.fees.local_total ?? detail.fees.international_total;
        if (typeof fee === "number" && fee > 0) {
          currency = detail.fees.currency;
          if (fee < min) min = fee;
          if (fee > max) max = fee;
        }
      }
    }
  }

  return {
    totalPrograms,
    feeRange: min === Infinity ? null : { min, max, currency },
  };
}

export function getAllUniversityStats(slugs: string[]): Record<string, UniversityStats> {
  const result: Record<string, UniversityStats> = {};
  for (const slug of slugs) {
    result[slug] = getUniversityStats(slug);
  }
  return result;
}
