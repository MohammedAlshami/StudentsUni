"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, MapPin, Search, Users } from "lucide-react";
import { wrap } from "@/components/marketing-ui";
import { getLanguageCentreImage } from "@/lib/language-centre-images";
import { NiLighthouse } from "@/components/notion-illustrations";

export type LanguageCentreCard = {
  slug: string;
  name: string;
  name_ar?: string | null;
  city?: string | null;
  course_count?: number | null;
  student_count?: number | null;
};

export default function LanguageCentresClient({ items }: { items: LanguageCentreCard[] }) {
  const t = useTranslations("languageCentresPage");
  const tHome = useTranslations("home.englishInstitutes");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const q = search.trim().toLowerCase();
  const filtered = items.filter((c) => {
    if (!q) return true;
    return [c.name, c.name_ar, c.city]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const localizedName = (c: LanguageCentreCard) =>
    locale === "ar" ? c.name_ar || c.name : c.name;

  return (
    <div className={wrap}>
      <div className="flex items-center gap-[12px] rounded-full border border-black/10 bg-white px-[18px] py-[12px] shadow-sm">
        <Search size={18} className="shrink-0 text-[#285b50]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/40"
        />
      </div>

      <p className="mt-[12px] text-[13px] font-semibold uppercase tracking-[.08em] text-black/50">
        {t("matchCount", { filtered: filtered.length, total: items.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-[42px] text-[16px] text-black/55">{t("noResults")}</p>
      ) : (
        <div className="mt-[26px] grid gap-[26px] sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((c) => {
            const image = getLanguageCentreImage(c.slug);
            return (
              <article className="group bg-[#f5efeb] pb-[26px]" key={c.slug}>
                <a href={`/language-centres/${c.slug}`}>
                  <div className="overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={localizedName(c)}
                        className="h-[202px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-[202px] w-full items-center justify-center bg-white">
                        <NiLighthouse width={168} className="text-[#285b50]" />
                      </div>
                    )}
                  </div>
                </a>
                <div className="px-[21px]">
                  <p className="mt-[21px] text-[12px] font-bold uppercase tracking-[.1em] text-[#285b50]">
                    {tHome("category")}
                  </p>
                  <a href={`/language-centres/${c.slug}`}>
                    <h3 className="mt-[6px] text-[21px] font-bold leading-tight hover:underline">
                      {localizedName(c)}
                    </h3>
                  </a>
                  {c.city && (
                    <p className="mt-[10px] flex items-center gap-[6px] text-[14px] text-black/55">
                      <MapPin size={14} /> {c.city}
                    </p>
                  )}
                  <p className="mt-[8px] flex items-center gap-[6px] text-[14px] text-black/55">
                    <Users size={14} /> {c.course_count ?? 0}+ {tHome("coursesSuffix")}
                  </p>
                  <a
                    href={`/language-centres/${c.slug}`}
                    className="mt-[16px] inline-flex items-center gap-[6px] text-[13px] font-bold uppercase tracking-wide text-[#285b50] hover:underline"
                  >
                    {tCommon("viewProgrammes")} <ArrowRight size={14} className="rtl:rotate-180" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
