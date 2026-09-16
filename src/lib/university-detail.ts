import fs from "fs";
import path from "path";

export type ProgramSummary = {
  slug: string;
  name: string;
  name_ar?: string;
  name_zh?: string;
  field: string;
  field_ar?: string;
  field_zh?: string;
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

export type NormalizedProgramDetail = {
  university: string;
  university_slug: string;
  level: string;
  program_name: string;
  program_name_ar?: string;
  program_name_zh?: string;
  field: string;
  field_ar?: string;
  field_zh?: string;
  duration: string | null;
  mode: string | null;
  intakes: string[];
  fees: {
    currency: string;
    local_total: number | null;
    international_total: number | null;
    per_year_local: number | null;
    per_year_international: number | null;
    notes: string;
  };
  requirements: {
    malaysian: {
      spm: string | null;
      stpm: string | null;
      foundation_matriculation: string | null;
      diploma_pathway: string | null;
    };
    international: {
      a_level: string | null;
      ib: string | null;
      other_qualifications: string | null;
      english_requirement: string | null;
    };
    // Some sources give one plain-text requirement blurb instead of the
    // structured breakdown above (e.g. "Bachelor's degree with minimum
    // CGPA of 2.75"). Shown as a fallback when the structured fields are
    // all empty.
    general_text: string | null;
  };
  accreditation: {
    mqa_status: string | null;
    mqa_ref: string | null;
  };
  confidence: string;
  hasDetail: boolean;
};

const UNIVERSITIES_DIR = path.join(process.cwd(), "public/data/universities");

function readJSON(filePath: string): unknown | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Some index.json entries give fees as pre-formatted strings like
// "RM30,350" instead of a plain number. Extract the numeric value.
function parseFeeValue(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const digits = v.replace(/[^0-9]/g, "");
    if (!digits) return null;
    const n = parseInt(digits, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
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

export function entrySlug(raw: string | Record<string, unknown>): string {
  if (typeof raw === "string") return raw;
  return (raw.slug as string) || (raw.program_slug as string) || "";
}

export function entryFallbackName(raw: string | Record<string, unknown>, slug: string): string {
  if (typeof raw === "string") return titleCase(raw);
  return (raw.program_name as string) || (raw.name as string) || titleCase(slug || "");
}

export function entryField(raw: string | Record<string, unknown>): string {
  if (typeof raw === "string") return "";
  return (raw.field as string) || "";
}

/**
 * Loads full detail for one program, regardless of which of the three
 * scraped schema shapes it came from:
 *  1. A separate `<slug>.json` file next to index.json (most universities).
 *  2. An inline object in index.json with fees/requirements embedded
 *     directly (23 universities, e.g. Monash, Sunway, APU, INTI, UniTen) -
 *     these never had a separate file and were previously mishandled as
 *     "not found" because they use program_slug/program_name instead of
 *     slug/name.
 *  3. Neither - just a bare name/slug with nothing else scraped yet.
 */
export function loadProgramDetail(
  universityName: string,
  uniSlug: string,
  level: string,
  raw: string | Record<string, unknown>
): NormalizedProgramDetail {
  const slugFromEntry = entrySlug(raw);
  const fallbackName = entryFallbackName(raw, slugFromEntry);
  const slug = slugFromEntry || slugify(fallbackName);
  const uniDir = path.join(UNIVERSITIES_DIR, uniSlug);

  // Schema 1: separate detail file.
  const detailPath = path.join(uniDir, level, `${slug}.json`);
  const fileDetail = readJSON(detailPath) as Record<string, unknown> | null;
  if (fileDetail && typeof fileDetail === "object") {
    const fees = (fileDetail.fees as Record<string, unknown>) ?? {};
    const requirements = (fileDetail.requirements as Record<string, unknown>) ?? {};
    const malaysian = (requirements.malaysian as Record<string, unknown>) ?? {};
    const international = (requirements.international as Record<string, unknown>) ?? {};
    const accreditation = (fileDetail.accreditation as Record<string, unknown>) ?? {};
    return {
      university: universityName,
      university_slug: uniSlug,
      level,
      program_name: (fileDetail.program_name as string) || fallbackName,
      program_name_ar: (fileDetail.program_name_ar as string) || undefined,
      program_name_zh: (fileDetail.program_name_zh as string) || undefined,
      field: (fileDetail.field as string) || entryField(raw),
      field_ar: (fileDetail.field_ar as string) || undefined,
      field_zh: (fileDetail.field_zh as string) || undefined,
      duration: (fileDetail.duration as string) ?? null,
      mode: (fileDetail.mode as string) ?? null,
      intakes: Array.isArray(fileDetail.intakes) ? (fileDetail.intakes as string[]) : [],
      fees: {
        currency: (fees.currency as string) || "MYR",
        local_total: parseFeeValue(fees.local_total),
        international_total: parseFeeValue(fees.international_total),
        per_year_local: parseFeeValue(fees.per_year_local),
        per_year_international: parseFeeValue(fees.per_year_international),
        notes: (fees.notes as string) || "",
      },
      requirements: {
        malaysian: {
          spm: (malaysian.spm as string) ?? null,
          stpm: (malaysian.stpm as string) ?? null,
          foundation_matriculation: (malaysian.foundation_matriculation as string) ?? null,
          diploma_pathway: (malaysian.diploma_pathway as string) ?? null,
        },
        international: {
          a_level: (international.a_level as string) ?? null,
          ib: (international.ib as string) ?? null,
          other_qualifications: (international.other_qualifications as string) ?? null,
          english_requirement: (international.english_requirement as string) ?? null,
        },
        general_text: null,
      },
      accreditation: {
        mqa_status: (accreditation.mqa_status as string) ?? null,
        mqa_ref: (accreditation.mqa_ref as string) ?? null,
      },
      confidence: (fileDetail.confidence as string) || "medium",
      hasDetail: true,
    };
  }

  // Schema 2: inline data directly on the index.json entry (no separate file).
  if (typeof raw === "object" && raw !== null) {
    const inlineFees = raw.fees as Record<string, unknown> | undefined;
    const hasInlineData = Boolean(inlineFees || raw.requirements || raw.duration || raw.accreditation);
    if (hasInlineData) {
      return {
        university: universityName,
        university_slug: uniSlug,
        level,
        program_name: fallbackName,
        field: entryField(raw),
        duration: (raw.duration as string) ?? null,
        mode: (raw.mode as string) ?? null,
        intakes: Array.isArray(raw.intakes) ? (raw.intakes as string[]) : [],
        fees: {
          currency: "MYR",
          local_total: parseFeeValue(inlineFees?.local),
          international_total: parseFeeValue(inlineFees?.international),
          per_year_local: null,
          per_year_international: null,
          notes: "",
        },
        requirements: {
          malaysian: { spm: null, stpm: null, foundation_matriculation: null, diploma_pathway: null },
          international: { a_level: null, ib: null, other_qualifications: null, english_requirement: null },
          general_text: typeof raw.requirements === "string" ? raw.requirements : null,
        },
        accreditation: {
          mqa_status: (raw.accreditation as string) ?? null,
          mqa_ref: null,
        },
        confidence: typeof raw.confidence === "number" ? String(raw.confidence) : "medium",
        hasDetail: true,
      };
    }
  }

  // Schema 3: nothing scraped yet beyond the name.
  return {
    university: universityName,
    university_slug: uniSlug,
    level,
    program_name: fallbackName,
    field: entryField(raw),
    duration: null,
    mode: null,
    intakes: [],
    fees: {
      currency: "MYR",
      local_total: null,
      international_total: null,
      per_year_local: null,
      per_year_international: null,
      notes: "",
    },
    requirements: {
      malaysian: { spm: null, stpm: null, foundation_matriculation: null, diploma_pathway: null },
      international: { a_level: null, ib: null, other_qualifications: null, english_requirement: null },
      general_text: null,
    },
    accreditation: { mqa_status: null, mqa_ref: null },
    confidence: "low",
    hasDetail: false,
  };
}

export function getProgramsByLevel(universityName: string, slug: string, levels: string[]): LevelPrograms[] {
  const uniDir = path.join(UNIVERSITIES_DIR, slug);

  return levels.map((level) => {
    const indexPath = path.join(uniDir, level, "index.json");
    const rawPrograms = normalizeProgramsList(readJSON(indexPath));

    const programs: ProgramSummary[] = rawPrograms.map((raw) => {
      const detail = loadProgramDetail(universityName, slug, level, raw);
      return {
        slug: entrySlug(raw) || slugify(detail.program_name),
        name: detail.program_name,
        name_ar: detail.program_name_ar,
        name_zh: detail.program_name_zh,
        field: detail.field,
        field_ar: detail.field_ar,
        field_zh: detail.field_zh,
        duration: detail.duration,
        localFee: detail.fees.local_total,
        internationalFee: detail.fees.international_total,
        currency: detail.fees.currency,
        hasDetail: detail.hasDetail,
      };
    });

    return { level, programs };
  });
}
