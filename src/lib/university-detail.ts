import fs from "fs";
import path from "path";

export type ProgramSummary = {
  slug: string;
  name: string;
  field: string;
  duration: string | null;
  localFee: number | null;
  internationalFee: number | null;
  currency: string;
  hasDetail: boolean;
};

export type LevelPrograms = {
  level: string;
  programs: ProgramSummary[];
};

const UNIVERSITIES_DIR = path.join(process.cwd(), "public/data/universities");

function readJSON(filePath: string): unknown | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// index.json shape drifted across the different scraping passes: most are
// { programs: [...] }, some are a bare [...] array, and a couple (USM
// master/phd) use { sample_programs: [...] } instead. Normalize all three.
export function normalizeProgramsList(index: unknown): Array<string | Record<string, unknown>> {
  if (Array.isArray(index)) return index;
  if (index && typeof index === "object") {
    const obj = index as Record<string, unknown>;
    if (Array.isArray(obj.programs)) return obj.programs as Array<string | Record<string, unknown>>;
    if (Array.isArray(obj.sample_programs)) return obj.sample_programs as Array<string | Record<string, unknown>>;
  }
  return [];
}

export function detectLevels(slug: string): string[] {
  const uniDir = path.join(UNIVERSITIES_DIR, slug);
  if (!fs.existsSync(uniDir)) return [];
  return fs
    .readdirSync(uniDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "_meta")
    .map((e) => e.name)
    .filter((name) => fs.existsSync(path.join(uniDir, name, "index.json")));
}

export function getProgramsByLevel(slug: string, levels: string[]): LevelPrograms[] {
  const uniDir = path.join(UNIVERSITIES_DIR, slug);

  return levels.map((level) => {
    const indexPath = path.join(uniDir, level, "index.json");
    const rawPrograms = normalizeProgramsList(readJSON(indexPath));

    const programs: ProgramSummary[] = rawPrograms.map((raw) => {
      const progSlug =
        typeof raw === "string" ? raw : (raw.slug as string) ?? "";
      const fallbackName =
        typeof raw === "string"
          ? raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : ((raw.name as string) ?? progSlug);

      const detailPath = path.join(uniDir, level, `${progSlug}.json`);
      const detail = readJSON(detailPath) as {
        program_name?: string;
        field?: string;
        duration?: string | null;
        fees?: {
          local_total?: number | null;
          international_total?: number | null;
          currency?: string;
        };
      } | null;

      return {
        slug: progSlug,
        name: detail?.program_name ?? fallbackName,
        field: detail?.field ?? (typeof raw === "string" ? "" : (raw.field as string) ?? ""),
        duration: detail?.duration ?? null,
        localFee: detail?.fees?.local_total ?? null,
        internationalFee: detail?.fees?.international_total ?? null,
        currency: detail?.fees?.currency ?? "MYR",
        hasDetail: Boolean(detail),
      };
    });

    return { level, programs };
  });
}
