import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const UNIVERSITIES_DIR = path.join(root, "public/data/universities");
const OUT = path.join(root, "src/lib/program-catalog.data.json");

const NOISE = new Set([
  "hons", "honours", "with", "by", "coursework", "research", "mixed", "mode",
  "programme", "program", "the", "executive", "graduate", "and", "year", "years", "online",
]);

const DEGREE_WORDS = new Set([
  "bachelor", "bachelors", "master", "masters", "doctor", "doctoral", "doctorate",
  "diploma", "certificate", "foundation", "associate", "postgraduate", "undergraduate",
  "degree", "phd", "mba", "msc", "bsc", "ba", "beng", "bba", "dba", "ma", "meng",
  "mpharm", "ph", "d", "in", "of", "sc", "eng",
]);

const GENERIC_CORES = new Set([
  "science", "arts", "engineering", "computer-science", "information-technology",
  "business", "business-administration", "business-management", "management",
  "technology", "applied-science", "social-science", "multidisciplinary",
]);

const SYNONYM = {
  networking: "network",
  "computer-networking": "network",
  "computer-network": "network",
  cybersecurity: "cyber-security",
  "computer-security": "cyber-security",
  accountancy: "accounting",
  "business-studies": "business",
  computing: "computer-science",
  "computing-and-information-technology": "information-technology",
  "business-administration-and-management": "business-administration",
  "nursing-sciences": "nursing",
  civil: "civil-engineering",
  mechanical: "mechanical-engineering",
  electrical: "electrical-engineering",
  chemical: "chemical-engineering",
  "electronic": "electronic-engineering",
  "medicine-and-bachelor-of-surgery": "medicine-and-bachelor-of-surgery-mbbs",
  "medicine-bachelor-of-surgery": "medicine-and-bachelor-of-surgery-mbbs",
};

function titleCase(slug) {
  return slug
    .split("-")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function expandAbbreviations(s) {
  return s
    .replace(/\bm\.?\s*sc\.?\b/gi, "msc")
    .replace(/\bb\.?\s*sc\.?\b/gi, "bsc")
    .replace(/\bm\.?\s*eng\.?\b/gi, "meng")
    .replace(/\bb\.?\s*eng\.?\b/gi, "beng")
    .replace(/\bm\.?\s*b\.?\s*a\.?\b/gi, "mba")
    .replace(/\bb\.?\s*b\.?\s*a\.?\b/gi, "bba")
    .replace(/\bph\.?\s*d\.?\b/gi, "phd")
    .replace(/\bm\.?\s*a\.?\b/gi, "ma")
    .replace(/\bb\.?\s*a\.?\b/gi, "ba");
}

function tokenize(s) {
  return expandAbbreviations(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^-+|-+$/g, ""))
    .filter((t) => t && !NOISE.has(t))
    .filter((t) => !/^\d+$/.test(t) && !/^\d+[a-z]$/.test(t));
}

function coreFromTokens(toks) {
  const cleaned = toks.filter((t) => !DEGREE_WORDS.has(t));
  while (cleaned.length && ["of", "in", "and"].includes(cleaned[0])) cleaned.shift();
  if (["science", "arts", "engineering"].includes(cleaned[0]) && cleaned.length > 1) {
    cleaned.shift();
  }
  return cleaned.filter(Boolean).join("-");
}

function normalizeProgramName(name) {
  const parenMatches = [...name.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]);
  const parenSubject = parenMatches
    .flatMap((p) => tokenize(p))
    .filter((t) => !DEGREE_WORDS.has(t))
    .join("-");

  const baseNoParen = name.replace(/\[[^\]]*\]/g, " ").replace(/\([^)]*\)/g, " ");
  let base = coreFromTokens(tokenize(baseNoParen));

  const barePhilosophy = !base && /philosoph/i.test(name);
  if (barePhilosophy) base = "philosophy";

  if (parenSubject && GENERIC_CORES.has(base)) {
    base = parenSubject;
  } else if (!base && parenSubject) {
    base = parenSubject;
  }

  if (!base) return "";
  return SYNONYM[base] ?? base;
}

function levelGroup(level, name = "") {
  const s = `${level} ${name}`.toLowerCase();
  if (s.includes("foundation") || s.includes("pre-university") || s.includes("pre university")) return "foundation";
  if (s.includes("phd") || s.includes("doctor")) return "phd";
  if (s.includes("master") || s.includes("postgraduate")) return "master";
  if (s.includes("diploma")) return "diploma";
  if (s.includes("bachelor") || s.includes("degree") || s.includes("undergraduate")) return "bachelor";
  if (s.includes("certificate")) return "certificate";
  if (s.includes("language")) return "language";
  return "other";
}

const LEVEL_GROUP_ORDER = ["foundation", "diploma", "bachelor", "master", "phd", "certificate", "language", "other"];

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

function normalizeList(index) {
  if (Array.isArray(index)) return index;
  if (index && typeof index === "object") {
    if (Array.isArray(index.programs)) return index.programs;
    if (Array.isArray(index.sample_programs)) return index.sample_programs;
  }
  return [];
}

const entrySlug = (raw) => (typeof raw === "string" ? raw : raw.slug || raw.program_slug || "");
const entryName = (raw, slug) =>
  typeof raw === "string" ? titleCase(slug) : raw.program_name || raw.name || titleCase(slug);
const entryField = (raw) => (typeof raw === "string" ? "" : raw.field || "");

function parseFee(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const m = v.match(/\d[\d,]*(?:\.\d+)?/);
    if (!m) return null;
    const n = parseFloat(m[0].replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function offeringFrom(raw, uniSlug, university, level) {
  const programSlug = entrySlug(raw);
  if (!programSlug) return null;
  const name = entryName(raw, programSlug);
  const detail = readJSON(path.join(UNIVERSITIES_DIR, uniSlug, level, `${programSlug}.json`));
  let currency = "MYR";
  let feeTotal = null;
  let feePerYear = null;
  let duration = null;
  let mqaStatus = null;
  if (detail && typeof detail === "object") {
    const fees = detail.fees || {};
    currency = fees.currency || "MYR";
    feeTotal = parseFee(fees.total) ?? parseFee(fees.international_total);
    feePerYear = parseFee(fees.per_year) ?? parseFee(fees.per_year_international);
    duration = detail.duration ?? null;
    mqaStatus = detail.accreditation?.mqa_status ?? null;
  } else if (raw && typeof raw === "object") {
    const fees = raw.fees || {};
    currency = fees.currency || "MYR";
    feeTotal = parseFee(fees.total) ?? parseFee(fees.international_total);
    feePerYear = parseFee(fees.per_year) ?? parseFee(fees.per_year_international);
    duration = raw.duration ?? null;
  }
  return {
    university,
    university_slug: uniSlug,
    level,
    level_group: levelGroup(level, name),
    program_slug: programSlug,
    name,
    duration,
    feeTotal,
    feePerYear,
    currency,
    mqaStatus,
  };
}

const institutions = readJSON(path.join(root, "public/data/institutions.json"))?.institutions ?? [];
const nameBySlug = new Map(institutions.map((i) => [i.slug, i.name]));

const groups = new Map();
for (const uniSlug of fs.readdirSync(UNIVERSITIES_DIR)) {
  const uniPath = path.join(UNIVERSITIES_DIR, uniSlug);
  if (!fs.statSync(uniPath).isDirectory()) continue;
  const university = nameBySlug.get(uniSlug) ?? uniSlug;
  const levels = fs
    .readdirSync(uniPath, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "_meta")
    .map((e) => e.name)
    .filter((name) => fs.existsSync(path.join(uniPath, name, "index.json")));
  for (const level of levels) {
    const raw = normalizeList(readJSON(path.join(uniPath, level, "index.json")));
    for (const entry of raw) {
      const offering = offeringFrom(entry, uniSlug, university, level);
      if (!offering) continue;
      const slug = normalizeProgramName(offering.name);
      if (!slug) continue;
      const group = groups.get(slug) ?? { offerings: [], fields: new Map() };
      group.offerings.push(offering);
      const field = entryField(entry) || offering.level_group;
      group.fields.set(field, (group.fields.get(field) ?? 0) + 1);
      groups.set(slug, group);
    }
  }
}

const catalog = [];
for (const [slug, group] of groups) {
  const unis = new Set(group.offerings.map((o) => o.university_slug));
  const levels = LEVEL_GROUP_ORDER.filter((g) => group.offerings.some((o) => o.level_group === g));
  const perYearFees = group.offerings.map((o) => o.feePerYear).filter((n) => typeof n === "number" && n > 0);
  const totalFees = group.offerings.map((o) => o.feeTotal).filter((n) => typeof n === "number" && n > 0);
  const field = [...group.fields.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  catalog.push({
    slug,
    title: titleCase(slug),
    field,
    levels,
    offerings: group.offerings,
    universityCount: unis.size,
    feePerYearMin: perYearFees.length ? Math.min(...perYearFees) : null,
    feePerYearMax: perYearFees.length ? Math.max(...perYearFees) : null,
    feeTotalMin: totalFees.length ? Math.min(...totalFees) : null,
    feeTotalMax: totalFees.length ? Math.max(...totalFees) : null,
  });
}
catalog.sort((a, b) => b.universityCount - a.universityCount || a.title.localeCompare(b.title));

fs.writeFileSync(OUT, JSON.stringify(catalog));
console.log(`wrote ${catalog.length} canonical programs to ${path.relative(root, OUT)}`);
console.log(`offerings: ${catalog.reduce((n, p) => n + p.offerings.length, 0)}`);
console.log(`with >=2 universities: ${catalog.filter((p) => p.universityCount >= 2).length}`);
const bySlug = new Map(catalog.map((p) => [p.slug, p]));
for (const s of ["cyber-security", "network", "computer-science", "software-engineering", "machine-learning", "artificial-intelligence", "business-administration", "biotechnology", "psychology"]) {
  const p = bySlug.get(s);
  console.log(`  ${s}: ${p ? `${p.universityCount} unis, per-year ${p.feePerYearMin}-${p.feePerYearMax}, total ${p.feeTotalMin}-${p.feeTotalMax}` : "MISSING"}`);
}