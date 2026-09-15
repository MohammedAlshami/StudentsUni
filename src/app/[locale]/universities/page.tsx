import fs from "fs";
import path from "path";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import UniversitiesClient from "@/components/universities-client";
import { wrap, Pic, Label, Heading, Pill } from "@/components/marketing-ui";
import { getAllUniversityStats } from "@/lib/university-stats";
import { routing } from "@/i18n/routing";

type Institution = {
  slug: string;
  name: string;
  abbr: string;
  type: string;
  state: string | null;
  city: string | null;
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85";
const CTA_IMG_1 =
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80";
const CTA_IMG_2 =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function UniversitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const dataPath = path.join(process.cwd(), "public/data/institutions.json");
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const institutions: Institution[] = raw.institutions;
  const stats = getAllUniversityStats(institutions.map((i) => i.slug));
  const t = await getTranslations("universitiesPage");
  const tCommon = await getTranslations("common");

  return (
    <div className="bg-white font-sans text-[#242927]">
      <div
        className="flex h-[762px] items-center bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(10,45,36,.82),rgba(10,45,36,.42)),url(${HERO_IMG})`,
        }}
      >
        <div className={wrap}>
          <Label>{t("hero.label")}</Label>
          <h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">
            {t("hero.titleLine1")}<br />{t("hero.titleLine2")}
          </h1>
          <p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed text-white/80">
            {t("hero.subtitle", { count: institutions.length })}
          </p>
        </div>
      </div>
      <Suspense fallback={null}>
        <UniversitiesClient institutions={institutions} stats={stats} />
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
