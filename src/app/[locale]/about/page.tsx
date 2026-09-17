import { BadgeCheck, Globe2, HeartHandshake } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { wrap, Pic, Label, Heading, Pill } from "@/components/marketing-ui";
import { routing } from "@/i18n/routing";

const HERO_IMG =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85";
const STORY_IMG =
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80";

const MISSION_ICONS = [BadgeCheck, Globe2, HeartHandshake];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tCommon = await getTranslations("common");
  const missionItems = t.raw("mission.items") as Array<{ title: string; desc: string }>;
  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Hero */}
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
            {t("hero.subtitle")}
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="py-[83px]">
        <div className={`${wrap} grid grid-cols-1 items-center gap-[52px] md:grid-cols-2`}>
          <div>
            <Label>{t("story.label")}</Label>
            <Heading>{t("story.title")}</Heading>
            <p className="mt-[21px] text-[16px] leading-relaxed text-black/60">{t("story.p1")}</p>
            <p className="mt-[16px] text-[16px] leading-relaxed text-black/60">{t("story.p2")}</p>
            <p className="mt-[16px] text-[16px] leading-relaxed text-black/60">{t("story.p3")}</p>
          </div>
          <Pic src={STORY_IMG} className="h-[420px] w-full" />
        </div>
      </div>

      {/* Mission */}
      <div className="bg-[#f5efeb] py-[83px]">
        <div className={wrap}>
          <div className="text-center">
            <Label>{t("mission.label")}</Label>
            <Heading>{t("mission.title")}</Heading>
          </div>
          <div className="mt-[42px] grid grid-cols-1 gap-[26px] sm:grid-cols-3">
            {missionItems.map((item, i) => {
              const Icon = MISSION_ICONS[i];
              return (
                <div key={item.title} className="border border-black/10 bg-white p-[26px] text-center">
                  <Icon size={28} className="mx-auto text-[#285b50]" />
                  <p className="mt-[16px] text-[16px] font-bold">{item.title}</p>
                  <p className="mt-[8px] text-[13px] leading-relaxed text-black/55">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-[#f5efeb] py-[83px]">
        <div className={`${wrap} text-center`}>
          <Label>{t("cta.label")}</Label>
          <Heading>
            {t("cta.titleLine1")}
            <br />
            {t("cta.titleLine2")}
          </Heading>
          <div className="mt-[26px]">
            <Pill href="/contact">{tCommon("talkToUs")}</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}
