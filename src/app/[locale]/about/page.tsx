import { BadgeCheck, Globe2, HeartHandshake, ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { wrap, Pic, Label, Heading, Pill } from "@/components/marketing-ui";
import { routing } from "@/i18n/routing";

const HERO_IMG =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85";
const STORY_IMG =
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80";
const TEAM_IMGS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
];
const CTA_IMG_1 =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80";
const CTA_IMG_2 =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80";

const MISSION_ICONS = [BadgeCheck, Globe2, HeartHandshake];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const missionItems = t.raw("mission.items") as Array<{ title: string; desc: string }>;
  const teamMembers = t.raw("team.members") as Array<{ name: string; role: string }>;
  const milestones = t.raw("timeline.milestones") as Array<{ year: string; event: string }>;
  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Hero */}
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

      {/* Team */}
      <div className="py-[83px]">
        <div className={wrap}>
          <div className="text-center">
            <Label>{t("team.label")}</Label>
            <Heading>{t("team.title")}</Heading>
          </div>
          <div className="mt-[42px] grid grid-cols-1 gap-[26px] sm:grid-cols-3">
            {teamMembers.map((member, i) => (
              <div key={member.name} className="border border-black/10 bg-white p-[26px] text-center">
                <img
                  src={TEAM_IMGS[i]}
                  alt={member.name}
                  className="mx-auto h-[84px] w-[84px] rounded-full object-cover"
                />
                <p className="mt-[16px] text-[15px] font-bold">{member.name}</p>
                <p className="mt-[4px] text-[13px] text-black/50">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[#f5efeb] py-[83px]">
        <div className={wrap}>
          <div className="text-center">
            <Label>{t("timeline.label")}</Label>
            <Heading>{t("timeline.title")}</Heading>
          </div>
          <div className="mt-[42px] flex justify-center">
            <div className="space-y-[16px]">
              {milestones.map((m) => (
                <div key={m.year} className="flex items-center gap-[16px]">
                  <span className="w-[48px] text-end text-[15px] font-bold text-[#285b50]">
                    {m.year}
                  </span>
                  <div className="h-px w-[16px] bg-black/20" />
                  <span className="text-[15px]">{m.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-[83px]">
        <div className={wrap}>
          <div className="mx-auto mb-[21px] grid h-[52px] w-[52px] place-items-center rounded-full border-[3px] border-[#285b50] text-[#285b50]">
            <ArrowUpRight size={25} className="rtl:rotate-90" />
          </div>
          <div className="grid grid-cols-[130px_1fr_130px] items-center gap-[16px] bg-[#f5efeb] p-[26px] text-center md:grid-cols-[237px_1fr_231px] md:gap-[26px] md:p-[42px]">
            <Pic src={CTA_IMG_1} className="h-[220px] w-full md:h-[270px]" />
            <div>
              <Label>{t("cta.label")}</Label>
              <Heading className="text-[29px] md:text-[36px]">
                {t("cta.titleLine1")}
                <br />
                {t("cta.titleLine2")}
              </Heading>
              <div className="mt-[21px]">
                <Pill href="/contact">{t("cta.button")}</Pill>
              </div>
            </div>
            <Pic src={CTA_IMG_2} className="h-[220px] w-full md:h-[270px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
