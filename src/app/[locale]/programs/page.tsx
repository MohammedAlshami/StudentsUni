import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ProgramsClient, { type CanonicalProgramRow } from "@/components/programs-client";
import { wrap, Pic, Label, Heading, Pill } from "@/components/marketing-ui";
import { PROGRAM_CATALOG } from "@/lib/program-catalog";
import { routing } from "@/i18n/routing";

const HERO_IMG = "https://pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev/studentsuni/images/blog/1509062522246-3755977927d7.jpg";
const CTA_IMG_1 = "https://pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev/studentsuni/images/blog/1509062522246-3755977927d7.jpg";
const CTA_IMG_2 = "https://pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev/studentsuni/images/blog/1521737711867-e3b97375f902.jpg";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ProgramsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("programsPage");
  const tCommon = await getTranslations("common");

  const programs: CanonicalProgramRow[] = PROGRAM_CATALOG.map((p) => ({
    slug: p.slug,
    title: p.title,
    field: p.field,
    levels: p.levels,
    universityCount: p.universityCount,
    feePerYearMin: p.feePerYearMin,
    feePerYearMax: p.feePerYearMax,
  }));
  const universityCount = new Set(
    PROGRAM_CATALOG.flatMap((p) => p.offerings.map((o) => o.university_slug))
  ).size;

  return (
    <div className="bg-white font-sans text-[#242927]">
      <div
        className="flex h-[762px] items-center bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.42)),url(${HERO_IMG})`,
        }}
      >
        <div className={wrap}>
          <Label>{t("hero.label")}</Label>
          <h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">
            {t("hero.titleLine1")}<br />{t("hero.titleLine2")}
          </h1>
          <p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed text-white/80">
            {t("hero.subtitle", { count: programs.length.toLocaleString(), universities: universityCount })}
          </p>
        </div>
      </div>
      <Suspense fallback={null}>
        <ProgramsClient programs={programs} />
      </Suspense>

      {/* Consultation CTA */}
      <div className="bg-[#f5efeb] py-[83px]">
        <div className={wrap}>
          <div className="mx-auto mb-[21px] grid h-[52px] w-[52px] place-items-center rounded-full border-[3px] border-[#285b50] text-[#285b50]">
            <ArrowUpRight size={25} className="rtl:rotate-90" />
          </div>
          <div className="grid grid-cols-[130px_1fr_130px] items-center gap-[16px] bg-white p-[26px] text-center md:grid-cols-[237px_1fr_231px] md:gap-[26px] md:p-[42px]">
            <Pic src={CTA_IMG_1} className="h-[220px] w-full md:h-[270px]" />
            <div>
              <Label>{tCommon("freeConsultation")}</Label>
              <Heading className="text-[29px] md:text-[36px]">
                {t("cta.titleLine1")}
                <br />
                {t("cta.titleLine2")}
              </Heading>
              <p className="mx-auto mt-[16px] max-w-[380px] text-[14px] leading-relaxed text-black/60">
                {t("cta.body")}
              </p>
              <div className="mt-[21px]">
                <Pill>{tCommon("talkToUs")}</Pill>
              </div>
            </div>
            <Pic src={CTA_IMG_2} className="h-[220px] w-full md:h-[270px]" />
          </div>
        </div>
      </div>
    </div>
  );
}