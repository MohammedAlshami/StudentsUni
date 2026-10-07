import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check, Globe, MapPin, Users, X } from "lucide-react";
import { wrap, Label, Heading, Pill } from "@/components/marketing-ui";
import { getLanguageCentreImage } from "@/lib/language-centre-images";
import {
  formatCentreFee as money,
  loadAllLanguageCentres as loadAllCentres,
  loadLanguageCentre as loadCentre,
} from "@/lib/language-centres";
import { NiLighthouse } from "@/components/notion-illustrations";

export async function generateStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  const locales = ["en", "ar", "zh"];
  return loadAllCentres().flatMap((c) => locales.map((locale) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const centre = loadCentre(slug);
  if (!centre) return {};
  const description =
    centre.description ||
    `${centre.name} — English language courses in ${centre.city || "Malaysia"}.`;
  return {
    title: `${centre.name} — English Language Centre in Malaysia`,
    description: description.slice(0, 300),
  };
}

export default async function LanguageCentrePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const centre = loadCentre(slug);
  if (!centre) notFound();

  const t = await getTranslations({ locale, namespace: "languageCentrePage" });
  const tHome = await getTranslations({ locale, namespace: "home.englishInstitutes" });
  const image = getLanguageCentreImage(slug);
  const courses = centre.courses ?? [];
  const offers = (centre.offers ?? []).filter((o) => o?.label || o?.price != null);
  const name = locale === "ar" ? centre.name_ar || centre.name : centre.name;

  return (
    <main className="bg-[#f5efeb] pb-[62px] font-sans text-[#242927] md:pb-[83px]">
      <section className="py-[62px] md:py-[83px]">
        <div className={wrap}>
          <Label>{tHome("category")}</Label>
          <Heading>{name}</Heading>
          <div className="mt-[16px] flex flex-wrap items-center gap-x-[24px] gap-y-[10px] text-[15px] text-black/60">
            {centre.city && <span className="flex items-center gap-[6px]"><MapPin size={16}/>{centre.city}</span>}
            <span className="flex items-center gap-[6px]"><Users size={16}/>{centre.student_count ?? "—"} {t("students")}</span>
            <span className="flex items-center gap-[6px]">{centre.course_count ?? courses.length}+ {t("courses")}</span>
            {centre.website && (
              <a href={centre.website} target="_blank" rel="noreferrer" className="flex items-center gap-[6px] text-[#285b50] hover:underline">
                <Globe size={16}/>{t("visitWebsite")}
              </a>
            )}
          </div>

          <div className="mt-[42px] grid gap-[26px] md:grid-cols-[1fr_360px] md:gap-[52px]">
            <div>
              {centre.description && (
                <div className="border border-black/10 bg-white p-[26px]">
                  <h2 className="text-[21px] font-bold tracking-[-.03em]">{t("about")}</h2>
                  <p className="mt-[12px] text-[16px] leading-relaxed text-black/65">{centre.description}</p>
                </div>
              )}

              {courses.length > 0 && (
                <div className="mt-[26px] border border-black/10 bg-white p-[26px]">
                  <h2 className="text-[21px] font-bold tracking-[-.03em]">{t("coursesTitle")}</h2>
                  <div className="mt-[16px] overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-[14px]">
                      <thead>
                        <tr className="border-b border-black/10 text-start text-[12px] uppercase tracking-[.08em] text-black/50">
                          <th className="py-[10px] text-start font-bold">{t("course")}</th>
                          <th className="py-[10px] text-start font-bold">{t("duration")}</th>
                          <th className="py-[10px] text-start font-bold">{t("feeMyr")}</th>
                          <th className="py-[10px] text-start font-bold">{t("feeUsd")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((c, i) => (
                          <tr className="border-b border-black/5 last:border-0" key={`${c.name ?? i}-${i}`}>
                            <td className="py-[12px] pe-[12px]">
                              <span className="font-semibold">{locale === "ar" ? c.name_ar || c.name : c.name}</span>
                              {c.type && <span className="mt-[2px] block text-[12px] text-black/50">{c.type}</span>}
                            </td>
                            <td className="py-[12px] pe-[12px] whitespace-nowrap">{c.duration ?? "—"}</td>
                            <td className="py-[12px] pe-[12px] whitespace-nowrap font-semibold">{money(c.fee_myr, "MYR")}</td>
                            <td className="py-[12px] whitespace-nowrap text-black/60">{money(c.fee_usd, "USD")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-[12px] text-[12px] text-black/45">{t("feesNote")}</p>
                </div>
              )}

              {offers.length > 0 && (
                <div className="mt-[26px] border border-black/10 bg-white p-[26px]">
                  <h2 className="text-[21px] font-bold tracking-[-.03em]">{t("offersTitle")}</h2>
                  <ul className="mt-[12px] grid gap-[10px] sm:grid-cols-2">
                    {offers.map((o, i) => (
                      <li className="flex items-center justify-between gap-[12px] border border-black/10 bg-[#f5efeb] px-[16px] py-[12px]" key={`${o.label ?? i}-${i}`}>
                        <span className="text-[14px] font-semibold">{o.label}</span>
                        <span className="whitespace-nowrap text-[14px] font-bold text-[#285b50]">
                          {money(o.price_myr ?? o.price, o.price_myr != null ? "MYR" : o.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside>
              <div className="overflow-hidden border border-black/10 bg-white">
                {image ? (
                  <img src={image} alt={name} className="h-[240px] w-full object-cover"/>
                ) : (
                  <div className="flex h-[240px] w-full items-center justify-center bg-[#f5efeb]">
                    <NiLighthouse width={180} className="text-[#285b50]"/>
                  </div>
                )}
                <div className="p-[21px]">
                  <Pill href="/contact">{tHome("cta")}</Pill>
                </div>
              </div>

              {(centre.inclusions?.length || centre.exclusions?.length) ? (
                <div className="mt-[26px] border border-black/10 bg-white p-[21px]">
                  {centre.inclusions?.length ? (
                    <>
                      <h3 className="text-[15px] font-bold">{t("included")}</h3>
                      <ul className="mt-[10px] space-y-[8px] text-[14px] text-black/65">
                        {centre.inclusions.map((inc) => (
                          <li className="flex gap-[8px]" key={inc}><Check size={16} className="mt-[3px] shrink-0 text-[#285b50]"/>{inc}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {centre.exclusions?.length ? (
                    <>
                      <h3 className="mt-[18px] text-[15px] font-bold">{t("notIncluded")}</h3>
                      <ul className="mt-[10px] space-y-[8px] text-[14px] text-black/65">
                        {centre.exclusions.map((exc) => (
                          <li className="flex gap-[8px]" key={exc}><X size={16} className="mt-[3px] shrink-0 text-black/40"/>{exc}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
