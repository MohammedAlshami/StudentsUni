import fs from "fs";
import path from "path";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, Calendar, Clock, GraduationCap, ShieldCheck, Wallet } from "lucide-react";
import { wrap, Label, Pill } from "@/components/marketing-ui";
import { normalizeProgramsList, loadProgramDetail, entrySlug } from "@/lib/university-detail";
import { routing } from "@/i18n/routing";

const LEVEL_LABEL_KEYS: Record<string, string> = {
  foundation: "foundation",
  "pre-university": "pre-university",
  "pre-university-foundation-studies": "pre-university-foundation-studies",
  diploma: "diploma",
  "advanced-diploma": "advanced-diploma",
  bachelor: "bachelor",
  "bachelors-degree": "bachelors-degree",
  degree: "degree",
  undergraduate: "undergraduate",
  master: "master",
  "masters-degree": "masters-degree",
  masters: "masters",
  postgraduate: "postgraduate",
  phd: "phd",
  "doctoral-degree": "doctoral-degree",
  certificate: "certificate",
  language: "language",
};

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-[16px] border-b border-black/10 py-[12px] text-[14px]">
      <span className="text-black/50">{label}</span>
      <span className="text-end font-semibold">{value}</span>
    </div>
  );
}

function readJSON(filePath: string): unknown | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  const uniDir = path.join(process.cwd(), "public/data/universities");
  const params: Array<{ slug: string; level: string; program: string }> = [];

  for (const slug of fs.readdirSync(uniDir)) {
    const uniPath = path.join(uniDir, slug);
    if (!fs.statSync(uniPath).isDirectory()) continue;

    const levels = fs
      .readdirSync(uniPath, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== "_meta")
      .map((e) => e.name)
      .filter((name) => fs.existsSync(path.join(uniPath, name, "index.json")));

    for (const level of levels) {
      const indexPath = path.join(uniPath, level, "index.json");
      const rawPrograms = normalizeProgramsList(readJSON(indexPath));
      for (const raw of rawPrograms) {
        const program = typeof raw === "string" ? raw : entrySlug(raw);
        if (!program) continue;
        params.push({ slug, level, program });
      }
    }
  }

  return routing.locales.flatMap((locale) => params.map((p) => ({ locale, ...p })));
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; level: string; program: string }>;
}) {
  const { locale, slug, level, program } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("programDetail");
  const tLevels = await getTranslations("levels");

  const uniDir = path.join(process.cwd(), "public/data/universities", slug);
  const indexPath = path.join(uniDir, level, "index.json");
  const infoPath = path.join(uniDir, "info.json");

  const rawPrograms = normalizeProgramsList(readJSON(indexPath));
  const rawEntry = rawPrograms.find((p) => {
    const s = typeof p === "string" ? p : (p.slug as string) || (p.program_slug as string);
    return s === program;
  });

  const info = readJSON(infoPath) as { name?: string; university?: string } | null;
  const institutionsPath = path.join(process.cwd(), "public/data/institutions.json");
  const institutionsList = (readJSON(institutionsPath) as { institutions: Array<{ slug: string; name: string; name_ar?: string; name_zh?: string }> } | null)?.institutions ?? [];
  const canonicalName = institutionsList.find((i) => i.slug === slug);
  const universityName = locale === "ar" ? (canonicalName?.name_ar || canonicalName?.name || info?.name || info?.university || slug)
    : locale === "zh" ? (canonicalName?.name_zh || canonicalName?.name || info?.name || info?.university || slug)
    : (canonicalName?.name || info?.name || info?.university || slug);

  if (!rawEntry) {
    return (
      <div className="bg-white py-[83px] text-center font-sans text-[#242927]">
        <h1 className="text-[21px] font-bold">{t("programNotFound")}</h1>
        <Link href={`/universities/${slug}`} className="mt-[16px] inline-block text-[14px] underline">
          <span className="inline-block rtl:-scale-x-100">&larr;</span> {t("backToUniversity")}
        </Link>
      </div>
    );
  }

  const prog = loadProgramDetail(universityName, slug, level, rawEntry);
  const displayName = locale === "ar" ? (prog.program_name_ar || prog.program_name)
    : locale === "zh" ? (prog.program_name_zh || prog.program_name)
    : prog.program_name;
  const displayField = locale === "ar" ? (prog.field_ar || prog.field)
    : locale === "zh" ? (prog.field_zh || prog.field)
    : prog.field;
  const fee = prog.fees;
  const hasFees = fee.local_total || fee.international_total || fee.per_year_local || fee.per_year_international;
  const hasMalaysianReq = Object.values(prog.requirements.malaysian).some(Boolean);
  const hasIntlReq = Object.values(prog.requirements.international).some(Boolean);
  const hasGeneralReq = Boolean(prog.requirements.general_text);
  const levelLabel = LEVEL_LABEL_KEYS[prog.level] ? tLevels(LEVEL_LABEL_KEYS[prog.level] as "foundation") : prog.level;

  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Header */}
      <div className="bg-[#285b50] text-white">
        <div className={`${wrap} py-[42px]`}>
          <div className="flex flex-wrap items-center gap-[6px] text-[12px] text-white/60">
            <Link href="/universities" className="hover:underline">
              {t("backToUniversities")}
            </Link>
            <span>/</span>
            <Link href={`/universities/${slug}`} className="hover:underline">
              {universityName}
            </Link>
            <span>/</span>
            <span className="text-white/85">{displayName}</span>
          </div>

          <Label>
            {levelLabel}
            {displayField ? ` · ${displayField}` : ""}
          </Label>
          <h1 className="max-w-[750px] text-[29px] font-bold leading-[1.05] tracking-[-.03em] md:text-[36px]">
            {displayName}
          </h1>

          <div className="mt-[21px] flex flex-wrap gap-[21px] text-[14px] text-white/75">
            {prog.duration && (
              <span className="flex items-center gap-[6px]">
                <Clock size={14} /> {prog.duration}
              </span>
            )}
            {prog.mode && (
              <span className="flex items-center gap-[6px]">
                <GraduationCap size={14} /> {prog.mode}
              </span>
            )}
            {prog.intakes.length > 0 && (
              <span className="flex items-center gap-[6px]">
                <Calendar size={14} /> {t("intakes")}: {prog.intakes.join(", ")}
              </span>
            )}
          </div>

          <div className="mt-[26px]">
            <Pill white>{t("applyThroughUs")}</Pill>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${wrap} grid grid-cols-1 gap-[42px] py-[42px] lg:grid-cols-3`}>
        {/* Main */}
        <div className="space-y-[34px] lg:col-span-2">
          {/* Fees */}
          <section>
            <h2 className="flex items-center gap-[8px] border-b border-black/10 pb-[10px] text-[19px] font-bold">
              <Wallet size={18} className="text-[#285b50]" /> {t("fees")}
            </h2>
            <div className="mt-[10px]">
              <Fact
                label={t("localStudentsTotal")}
                value={fee.local_total ? `${fee.currency} ${fee.local_total.toLocaleString()}` : null}
              />
              <Fact
                label={t("internationalStudentsTotal")}
                value={fee.international_total ? `${fee.currency} ${fee.international_total.toLocaleString()}` : null}
              />
              <Fact
                label={t("localStudentsPerYear")}
                value={fee.per_year_local ? `${fee.currency} ${fee.per_year_local.toLocaleString()}` : null}
              />
              <Fact
                label={t("internationalStudentsPerYear")}
                value={
                  fee.per_year_international ? `${fee.currency} ${fee.per_year_international.toLocaleString()}` : null
                }
              />
              {fee.notes && <p className="mt-[10px] text-[12px] italic text-black/50">{fee.notes}</p>}
              {!hasFees && (
                <p className="py-[12px] text-[13px] text-black/40">{t("feeComingSoon")}</p>
              )}
            </div>
          </section>

          {/* Requirements */}
          <section>
            <h2 className="flex items-center gap-[8px] border-b border-black/10 pb-[10px] text-[19px] font-bold">
              <BadgeCheck size={18} className="text-[#285b50]" /> {t("entryRequirements")}
            </h2>
            {hasGeneralReq && (
              <p className="mt-[16px] text-[15px] leading-relaxed text-black/75">{prog.requirements.general_text}</p>
            )}
            {!hasGeneralReq && (
              <div className="mt-[16px] grid gap-[26px] sm:grid-cols-2">
                <div>
                  <p className="mb-[6px] text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
                    {t("malaysianQualifications")}
                  </p>
                  <Fact label={t("spm")} value={prog.requirements.malaysian.spm} />
                  <Fact label={t("stpm")} value={prog.requirements.malaysian.stpm} />
                  <Fact label={t("foundationMatriculation")} value={prog.requirements.malaysian.foundation_matriculation} />
                  <Fact label={t("diplomaPathway")} value={prog.requirements.malaysian.diploma_pathway} />
                  {!hasMalaysianReq && <p className="py-[12px] text-[13px] text-black/40">{t("notYetAvailable")}</p>}
                </div>
                <div>
                  <p className="mb-[6px] text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
                    {t("internationalQualifications")}
                  </p>
                  <Fact label={t("aLevels")} value={prog.requirements.international.a_level} />
                  <Fact label={t("ib")} value={prog.requirements.international.ib} />
                  <Fact label={t("other")} value={prog.requirements.international.other_qualifications} />
                  <Fact label={t("englishRequirement")} value={prog.requirements.international.english_requirement} />
                  {!hasIntlReq && <p className="py-[12px] text-[13px] text-black/40">{t("notYetAvailable")}</p>}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-[16px]">
          <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
            <p className="flex items-center gap-[6px] text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
              <ShieldCheck size={14} /> {t("accreditation")}
            </p>
            <p className="mt-[8px] text-[15px] font-semibold">{prog.accreditation.mqa_status ?? t("unknown")}</p>
          </div>

          <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
            <p className="text-[12px] font-bold uppercase tracking-[.08em] text-black/50">{t("dataConfidence")}</p>
            <p className="mt-[8px] text-[15px] font-semibold capitalize">{prog.confidence}</p>
          </div>

          <div className="border border-black/10 bg-[#285b50] p-[21px] text-white">
            <p className="text-[12px] font-bold uppercase tracking-[.08em] text-white/60">{t("needHelpApplying")}</p>
            <p className="mt-[8px] text-[13px] leading-relaxed text-white/80">
              {t("needHelpBody")}
            </p>
            <div className="mt-[16px]">
              <Pill white>{t("contactUs")}</Pill>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
