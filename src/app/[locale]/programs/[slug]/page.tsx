import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, GraduationCap, Wallet } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { wrap, Label, Heading, Pill } from "@/components/marketing-ui";
import { ProgramOfferingsTable } from "@/components/program-offerings-table";
import { getCanonicalProgram, sortOfferings, type ProgramLevelGroup } from "@/lib/program-catalog";
import { GENERIC_CAMPUS_PHOTOS } from "@/lib/university-images";

const LEVEL_KEYS: Record<ProgramLevelGroup, string> = {
  foundation: "foundation",
  diploma: "diploma",
  bachelor: "bachelor",
  master: "master",
  phd: "phd",
  certificate: "certificate",
  language: "language",
  other: "other",
};

function heroImage(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return GENERIC_CAMPUS_PHOTOS[h % GENERIC_CAMPUS_PHOTOS.length];
}

function formatFee(value: number | null, currency: string): string | null {
  if (!value) return null;
  return `${currency} ${Math.round(value).toLocaleString()}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const program = getCanonicalProgram(slug);
  if (!program) return {};
  const t = await getTranslations({ locale, namespace: "programPage" });
  const title = `${program.title} in Malaysia — Universities, Fees & Requirements`;
  return {
    title,
    description: t("metaDescription", { title: program.title, count: program.universityCount }),
  };
}

export default async function CanonicalProgramPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const program = getCanonicalProgram(slug);
  if (!program) notFound();

  const t = await getTranslations("programPage");
  const tLevels = await getTranslations("levels");
  const tCommon = await getTranslations("common");

  const offerings = sortOfferings(program.offerings);
  const levelsText = program.levels.map((g) => tLevels(LEVEL_KEYS[g] as "foundation")).join(", ");
  const hasDescription = t.has(`descriptions.${program.slug}`);
  const description = hasDescription
    ? t(`descriptions.${program.slug}`)
    : t("descriptionTemplate", { title: program.title, count: program.universityCount, levels: levelsText });

  const feeCurrency = offerings.find((o) => o.feeTotal || o.feePerYear)?.currency ?? "MYR";
  const feeRange =
    program.feeMin && program.feeMax
      ? program.feeMin === program.feeMax
        ? formatFee(program.feeMin, feeCurrency)
        : `${formatFee(program.feeMin, feeCurrency)} – ${formatFee(program.feeMax, feeCurrency)}`
      : null;

  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Hero */}
      <div
        className="flex h-[520px] items-end bg-cover bg-center pb-[52px] text-white"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.72),rgba(0,0,0,.45)),url(${heroImage(program.slug)})` }}
      >
        <div className={wrap}>
          <div className="flex flex-wrap items-center gap-[6px] text-[12px] text-white/60">
            <Link href="/programs" className="hover:underline">
              {t("backToPrograms")}
            </Link>
            <span>/</span>
            <span className="text-white/85">{program.title}</span>
          </div>
          <Label>{program.field ? `${program.field} · ${levelsText}` : levelsText}</Label>
          <h1 className="max-w-[874px] text-[42px] font-bold leading-[.95] tracking-[-.06em] md:text-[62px]">
            {program.title}
          </h1>
          <p className="mt-[16px] text-[16px] text-white/75">
            {t("offeredBy", { count: program.universityCount })}
          </p>
        </div>
      </div>

      <div className={`${wrap} grid grid-cols-1 gap-[42px] py-[62px] lg:grid-cols-[1fr_299px]`}>
        <div className="space-y-[42px]">
          {/* About */}
          <section>
            <Heading className="text-[29px] md:text-[34px]">{t("aboutTitle")}</Heading>
            <p className="mt-[16px] max-w-[749px] text-[17px] leading-relaxed text-black/70">{description}</p>
          </section>

          {/* Comparison */}
          <section>
            <h2 className="flex items-center gap-[8px] border-b border-black/10 pb-[10px] text-[21px] font-bold">
              <Wallet size={20} className="text-[#285b50]" /> {t("compareTitle")}
            </h2>
            <ProgramOfferingsTable offerings={offerings} />
            <p className="mt-[10px] text-[12px] italic text-black/45">{t("feeNote")}</p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-[16px]">
          <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
            <p className="flex items-center gap-[6px] text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
              <GraduationCap size={14} /> {t("stats.universities")}
            </p>
            <p className="mt-[8px] text-[25px] font-bold">{program.universityCount}</p>
          </div>
          {feeRange && (
            <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
              <p className="flex items-center gap-[6px] text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
                <Wallet size={14} /> {t("stats.feeRange")}
              </p>
              <p className="mt-[8px] text-[17px] font-bold">{feeRange}</p>
              <p className="mt-[4px] text-[12px] text-black/50">{t("stats.feeRangeNote")}</p>
            </div>
          )}
          <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
            <p className="flex items-center gap-[6px] text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
              <BadgeCheck size={14} /> {t("stats.levels")}
            </p>
            <div className="mt-[8px] flex flex-wrap gap-[6px]">
              {program.levels.map((g) => (
                <span key={g} className="rounded-full bg-white px-[10px] py-[4px] text-[12px] font-semibold">
                  {tLevels(LEVEL_KEYS[g] as "foundation")}
                </span>
              ))}
            </div>
          </div>
          <div className="border border-black/10 bg-[#285b50] p-[21px] text-white">
            <p className="text-[12px] font-bold uppercase tracking-[.08em] text-white/60">{t("needHelp")}</p>
            <p className="mt-[8px] text-[13px] leading-relaxed text-white/80">{t("needHelpBody")}</p>
            <div className="mt-[16px]">
              <Pill white>{tCommon("talkToUs")}</Pill>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}