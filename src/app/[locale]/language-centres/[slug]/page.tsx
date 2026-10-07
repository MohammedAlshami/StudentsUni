import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, GraduationCap, MapPin, Users, Wallet } from "lucide-react";
import { getLanguageCentreImage } from "@/lib/language-centre-images";
import {
  formatCentreFee as money,
  loadAllLanguageCentres,
  loadLanguageCentre,
} from "@/lib/language-centres";
import { InstitutionDetail } from "@/components/institution-detail";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    loadAllLanguageCentres().map((c) => ({ locale, slug: c.slug }))
  );
}

export default async function LanguageCentrePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const centre = loadLanguageCentre(slug);

  const t = await getTranslations("languageCentrePage");
  const tHome = await getTranslations("home.englishInstitutes");
  const tCommon = await getTranslations("common");

  if (!centre) {
    return (
      <div className="bg-white py-[83px] text-center font-sans text-[#242927]">
        <h1 className="text-[21px] font-bold">{t("notFound")}</h1>
        <Link href="/language-centres" className="mt-[16px] inline-block text-[14px] underline">
          <span className="inline-block rtl:-scale-x-100">&larr;</span> {t("backToList")}
        </Link>
      </div>
    );
  }

  const image = getLanguageCentreImage(slug);
  const courses = centre.courses ?? [];
  const offers = (centre.offers ?? []).filter((o) => o?.label || o?.price != null);
  const name = locale === "ar" ? centre.name_ar || centre.name : centre.name;
  const category = tHome("category");

  const fees = courses
    .map((c) => c.fee_myr)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0);
  const feeRangeText =
    fees.length > 0 ? `${money(Math.min(...fees), "MYR")} – ${money(Math.max(...fees), "MYR")}` : null;

  return (
    <InstitutionDetail
      backHref="/language-centres"
      backLabel={t("backToList")}
      coverPhoto={image}
      avatarUrl={image}
      avatarAlt={name}
      avatarFallback={name.slice(0, 2).toUpperCase()}
      avatarFit="contain"
      badgeLabel={category}
      title={name}
      meta={[
        ...(centre.city ? [{ icon: MapPin, text: centre.city }] : []),
        ...(centre.website
          ? [{ text: centre.website.replace(/^https?:\/\//, ""), href: centre.website }]
          : []),
      ]}
      applyLabel={t("applyLabel")}
      stats={[
        { icon: GraduationCap, value: centre.course_count ?? (courses.length || "—"), label: t("courses") },
        { icon: Users, value: centre.student_count ?? "—", label: t("students") },
        { icon: Wallet, value: feeRangeText ?? "—", label: t("feeRange") },
        { icon: BadgeCheck, value: category, label: t("categoryLabel") },
      ]}
      aboutLabel={t("about")}
      aboutText={
        <>
          {centre.description}
          {centre.website && (
            <>
              {" "}
              {t("visitWebsite")}{" "}
              <a href={centre.website} target="_blank" rel="noopener noreferrer" className="underline">
                {centre.website.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
        </>
      }
      sourcesNote={
        centre.sources?.length ? t("sourcesNote", { count: centre.sources.length }) : undefined
      }
      gallery={[]}
      galleryLabel={t("gallery")}
      galleryCaption={t("galleryCaption")}
      contentLabel={t("coursesTitle")}
      ctaPhotoLeft={null}
      ctaPhotoRight={null}
      ctaBadgeLabel={tCommon("freeConsultation")}
      ctaTitle={
        <>
          {t("readyToApply")}
          <br />
          {name}?
        </>
      }
      ctaPillLabel={tCommon("talkToUs")}
    >
      {courses.length > 0 && (
        <div className="mt-[21px] overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-black/10 text-[12px] uppercase tracking-[.08em] text-black/50">
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
                    <span className="font-semibold">
                      {locale === "ar" ? c.name_ar || c.name : c.name}
                    </span>
                    {c.type && <span className="mt-[2px] block text-[12px] text-black/50">{c.type}</span>}
                  </td>
                  <td className="py-[12px] pe-[12px] whitespace-nowrap">{c.duration ?? "—"}</td>
                  <td className="py-[12px] pe-[12px] whitespace-nowrap font-semibold">
                    {money(c.fee_myr, "MYR")}
                  </td>
                  <td className="py-[12px] whitespace-nowrap text-black/60">{money(c.fee_usd, "USD")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {offers.length > 0 && (
        <div className="mt-[26px]">
          <h2 className="text-[21px] font-bold tracking-[-.03em]">{t("offersTitle")}</h2>
          <ul className="mt-[12px] grid gap-[10px] sm:grid-cols-2">
            {offers.map((o, i) => (
              <li
                className="flex items-center justify-between gap-[12px] border border-black/10 bg-[#f5efeb] px-[16px] py-[12px]"
                key={`${o.label ?? i}-${i}`}
              >
                <span className="text-[14px] font-semibold">{o.label}</span>
                <span className="whitespace-nowrap text-[14px] font-bold text-[#285b50]">
                  {money(o.price_myr ?? o.price, o.price_myr != null ? "MYR" : o.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(centre.inclusions?.length || centre.exclusions?.length) ? (
        <div className="mt-[26px] grid gap-[21px] sm:grid-cols-2">
          {centre.inclusions?.length ? (
            <div className="border border-black/10 p-[21px]">
              <h3 className="text-[15px] font-bold">{t("included")}</h3>
              <ul className="mt-[10px] space-y-[8px] text-[14px] text-black/65">
                {centre.inclusions.map((inc) => (
                  <li key={inc}>{inc}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {centre.exclusions?.length ? (
            <div className="border border-black/10 p-[21px]">
              <h3 className="text-[15px] font-bold">{t("notIncluded")}</h3>
              <ul className="mt-[10px] space-y-[8px] text-[14px] text-black/65">
                {centre.exclusions.map((exc) => (
                  <li key={exc}>{exc}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </InstitutionDetail>
  );
}
