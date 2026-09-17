import { getTranslations, setRequestLocale } from "next-intl/server";
import { FileText, GraduationCap, LifeBuoy, ListChecks, MessagesSquare, Plane } from "lucide-react";
import { wrap, Label, Heading, Pill } from "@/components/marketing-ui";
import { routing } from "@/i18n/routing";

const HERO_IMG = "https://pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev/studentsuni/images/blog/1521737711867-e3b97375f902.jpg";

const SERVICE_ICONS = [MessagesSquare, ListChecks, FileText, Plane, GraduationCap, LifeBuoy];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const tNav = await getTranslations("nav");
  const services = t.raw("items") as Array<{ title: string; description: string; steps: string[] }>;
  const processSteps = t.raw("process.steps") as Array<{ title: string; desc: string }>;

  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Hero */}
      <div
        className="flex h-[620px] items-center bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.42)),url(${HERO_IMG})`,
        }}
      >
        <div className={wrap}>
          <Label>{tNav("howWeHelp")}</Label>
          <h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">
            {t("header.title")}
          </h1>
          <p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed text-white/80">
            {t("header.subtitle")}
          </p>
        </div>
      </div>

      {/* Services grid */}
      <section className="py-[62px] md:py-[83px]">
        <div className={wrap}>
          <div className="grid gap-[26px] md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = SERVICE_ICONS[i] ?? MessagesSquare;
              return (
                <div
                  key={service.title}
                  className="group flex flex-col border border-black/10 bg-white p-[26px] transition-colors hover:border-[#285b50] md:p-[32px]"
                >
                  <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#f5efeb] text-[#285b50] transition-colors group-hover:bg-[#285b50] group-hover:text-white">
                    <Icon size={22} />
                  </div>
                  <h2 className="mt-[21px] text-[19px] font-bold tracking-[-.02em]">{service.title}</h2>
                  <p className="mt-[10px] text-[14px] leading-relaxed text-black/60">{service.description}</p>
                  <ol className="mt-[21px] space-y-[8px] border-t border-black/5 pt-[16px]">
                    {service.steps.map((step, j) => (
                      <li key={step} className="flex items-start gap-[10px] text-[13px] text-black/60">
                        <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#f5efeb] text-[11px] font-bold text-[#285b50]">
                          {j + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#285b50] py-[62px] text-white">
        <div className={wrap}>
          <Heading className="text-center text-[29px] md:text-[36px]">{t("process.title")}</Heading>
          <div className="mt-[42px] grid grid-cols-1 gap-[26px] sm:grid-cols-2 md:grid-cols-4">
            {processSteps.map((item, i) => (
              <div key={item.title} className="border-t border-white/30 pt-[21px]">
                <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/10 text-[16px] font-bold">
                  {i + 1}
                </span>
                <p className="mt-[16px] text-[17px] font-bold">{item.title}</p>
                <p className="mt-[6px] text-[14px] leading-relaxed text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f5efeb] py-[83px]">
        <div className={`${wrap} text-center`}>
          <Heading className="text-[29px] md:text-[36px]">{t("cta.text")}</Heading>
          <div className="mt-[26px]">
            <Pill>{t("cta.button")}</Pill>
          </div>
        </div>
      </section>
    </div>
  );
}