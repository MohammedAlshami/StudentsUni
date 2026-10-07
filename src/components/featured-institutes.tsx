"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { getLanguageCentreImage } from "@/lib/language-centre-images";
import { NiLighthouse } from "@/components/notion-illustrations";

export type FeaturedCentre = {
  slug: string;
  name: string;
  name_ar?: string;
  city?: string | null;
  course_count?: number;
  student_count?: number | null;
};

export function FeaturedInstitutes({ items }: { items: FeaturedCentre[] }) {
  const t = useTranslations("home.englishInstitutes");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  function getLocalizedName(c: FeaturedCentre): string {
    if (locale === "ar") return c.name_ar || c.name;
    return c.name;
  }

  return (
    <div className="mt-[42px] grid gap-[26px] md:grid-cols-3">
      {items.map((c, i) => {
        const image = getLanguageCentreImage(c.slug);
        return (
          <motion.article
            key={c.slug}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="group bg-white pb-[26px]"
          >
            <Link href={`/language-centres/${c.slug}`}>
              <div className="overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={getLocalizedName(c)}
                    className="h-[202px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-[202px] w-full items-center justify-center bg-[#f5efeb]">
                    <NiLighthouse width={168} className="text-[#285b50]"/>
                  </div>
                )}
              </div>
            </Link>
            <div className="px-[21px]">
              <p className="mt-[21px] text-[12px] font-bold uppercase tracking-[.1em] text-[#285b50]">
                {t("category")}
              </p>
              <Link href={`/language-centres/${c.slug}`}>
                <h3 className="mt-[6px] text-[21px] font-bold leading-tight hover:underline">
                  {getLocalizedName(c)}
                </h3>
              </Link>
              {c.city && (
                <p className="mt-[10px] flex items-center gap-[6px] text-[14px] text-black/55">
                  <MapPin size={14} /> {c.city}
                </p>
              )}
              <Link
                href={`/language-centres/${c.slug}`}
                className="mt-[16px] inline-flex items-center gap-[6px] text-[13px] font-bold uppercase tracking-wide text-[#285b50] hover:underline"
              >
                {tCommon("viewProgrammes")} <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
