"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { UNIVERSITY_PHOTOS } from "@/lib/university-images";
import { institutionTypeLabel } from "@/components/marketing-ui";

export type FeaturedUniversity = {
  slug: string;
  name: string;
  abbr: string;
  type: string;
  state: string | null;
};

export function FeaturedUniversities({ items }: { items: FeaturedUniversity[] }) {
  const tCommon = useTranslations("common");
  return (
    <div className="mt-[42px] grid gap-[26px] md:grid-cols-3">
      {items.map((u, i) => (
        <motion.article
          key={u.slug}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
          className="group bg-white pb-[26px]"
        >
          <Link href={`/universities/${u.slug}`}>
            <div className="overflow-hidden">
              <img
                src={UNIVERSITY_PHOTOS[u.slug]}
                alt={u.name}
                className="h-[202px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </Link>
          <div className="px-[21px]">
            <p className="mt-[21px] text-[12px] font-bold uppercase tracking-[.1em] text-[#285b50]">
              {institutionTypeLabel(tCommon, u.type)}
            </p>
            <Link href={`/universities/${u.slug}`}>
              <h3 className="mt-[6px] text-[21px] font-bold leading-tight hover:underline">
                {u.name}
              </h3>
            </Link>
            {u.state && (
              <p className="mt-[10px] flex items-center gap-[6px] text-[14px] text-black/55">
                <MapPin size={14} /> {u.state}
              </p>
            )}
            <Link
              href={`/universities/${u.slug}`}
              className="mt-[16px] inline-flex items-center gap-[6px] text-[13px] font-bold uppercase tracking-wide text-[#285b50] hover:underline"
            >
              {tCommon("viewProgrammes")} <ArrowRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
