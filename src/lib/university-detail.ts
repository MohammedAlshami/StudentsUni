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
  fee: number | null;
  fee_per_year: number | null;
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
    total: number | null;
    per_year: number | null;
    notes: string;
  };
  requirements: {
    english_requirement: string | null;
    a_level: string | null;
    ib: string | null;
    other_qualifications: string | null;
    previous_education: string | null;
    pre_university: string | null;
    foundation: string | null;
    diploma_pathway: string | null;
    general: string | null;
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

function normalizeFees(fees: Record<string, unknown>): NormalizedProgramDetail["fees"] {
  const total = parseFeeValue(fees.total) ?? parseFeeValue(fees.international_total);
  const perYear = parseFeeValue(fees.per_year) ?? parseFeeValue(fees.per_year_international);
  return {
    currency: (fees.currency as string) || "MYR",
    total,
    per_year: perYear,
    notes: (fees.notes as string) || "",
  };
}

function normalizeRequirements(reqs: Record<string, unknown>): NormalizedProgramDetail["requirements"] {
  const empty = { english_requirement: null, a_level: null, ib: null, other_qualifications: null, previous_education: null, pre_university: null, foundation: null, diploma_pathway: null, general: null };
  
  if (!reqs || typeof reqs !== "object") return empty;
  
  // New format: flat requirements
  if (reqs.english_requirement || reqs.a_level || reqs.ib || reqs.other_qualifications || reqs.general || reqs.previous_education) {
    return {
      english_requirement: (reqs.english_requirement as string) ?? null,
      a_level: (reqs.a_level as string) ?? null,
      ib: (reqs.ib as string) ?? null,
      other_qualifications: (reqs.other_qualifications as string) ?? null,
      previous_education: (reqs.previous_education as string) ?? null,
      pre_university: (reqs.pre_university as string) ?? null,
      foundation: (reqs.foundation as string) ?? null,
      diploma_pathway: (reqs.diploma_pathway as string) ?? null,
      general: (reqs.general as string) ?? null,
    };
  }
  
  // Old format: nested malaysian/international
  const intl = (reqs.international as Record<string, unknown>) ?? {};
  const mal = (reqs.malaysian as Record<string, unknown>) ?? {};
  const generalText = reqs.general_text as string | null;
  
  return {
    english_requirement: (intl.english_requirement as string) ?? null,
    a_level: (intl.a_level as string) ?? null,
    ib: (intl.ib as string) ?? null,
    other_qualifications: (intl.other_qualifications as string) ?? null,
    previous_education: (mal.spm as string) ?? null,
    pre_university: (mal.stpm as string) ?? null,
    foundation: (mal.foundation_matriculation as string) ?? null,
    diploma_pathway: (mal.diploma_pathway as string) ?? null,
    general: generalText,
  };
}

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
      fees: normalizeFees(fees),
      requirements: normalizeRequirements(requirements),
      accreditation: {
        mqa_status: (accreditation.mqa_status as string) ?? null,
        mqa_ref: (accreditation.mqa_ref as string) ?? null,
      },
      confidence: (fileDetail.confidence as string) || "medium",
      hasDetail: true,
    };
  }

  // Schema 2: inline data directly on the index.json entry.
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
        fees: normalizeFees(inlineFees ?? {}),
        requirements: normalizeRequirements(
          typeof raw.requirements === "object" && raw.requirements !== null
            ? (raw.requirements as Record<string, unknown>)
            : { general_text: typeof raw.requirements === "string" ? raw.requirements : null }
        ),
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
    fees: { currency: "MYR", total: null, per_year: null, notes: "" },
    requirements: { english_requirement: null, a_level: null, ib: null, other_qualifications: null, previous_education: null, pre_university: null, foundation: null, diploma_pathway: null, general: null },
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
        fee: detail.fees.total,
        fee_per_year: detail.fees.per_year,
        currency: detail.fees.currency,
        hasDetail: detail.hasDetail,
      };
    });

    return { level, programs };
  });
}
