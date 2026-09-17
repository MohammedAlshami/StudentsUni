"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getUniversityImage } from "@/lib/university-images";
import { formatUsd } from "@/lib/fees";
import type { ProgramLevelGroup, ProgramOffering } from "@/lib/program-catalog";

const LEVEL_KEYS: Record<ProgramLevelGroup, string> = {
  foundation: "foundation",
  diploma: "diploma",
  bachelor: "bachelor",
  master: "master",
  phd: "phd",
  certificate: "certificate",
  language: "language",
  other: "other",
};

const PAGE_SIZE = 10;

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) result.push("…");
    result.push(p);
  });
  return result;
}

export function ProgramOfferingsTable({ offerings }: { offerings: ProgramOffering[] }) {
  const [page, setPage] = useState(1);
  const t = useTranslations("programPage");
  const tLevels = useTranslations("levels");
  const tCommon = useTranslations("common");

  const totalPages = Math.max(1, Math.ceil(offerings.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = offerings.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div>
      <div className="mt-[16px] overflow-x-auto">
        <table className="w-full min-w-[749px] border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-black/15 text-start text-[12px] font-bold uppercase tracking-[.06em] text-black/50">
              <th className="py-[10px] pe-[16px] text-start">{t("table.university")}</th>
              <th className="py-[10px] pe-[16px] text-start">{t("table.level")}</th>
              <th className="py-[10px] pe-[16px] text-start">{t("table.duration")}</th>
              <th className="py-[10px] pe-[16px] text-start">{t("table.totalFee")}</th>
              <th className="py-[10px] text-start">{t("table.perYear")}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((o) => {
              const image = getUniversityImage(o.university_slug);
              return (
                <tr key={`${o.university_slug}-${o.level}-${o.program_slug}`} className="border-b border-black/10 align-middle">
                  <td className="py-[12px] pe-[16px]">
                    <Link
                      href={`/universities/${o.university_slug}/${o.level}/${o.program_slug}`}
                      className="flex items-center gap-[10px] font-semibold hover:underline"
                    >
                      {image && (
                        <img
                          src={image.url}
                          alt=""
                          className="h-[28px] w-[28px] shrink-0 rounded-full border border-black/10 bg-white object-contain"
                        />
                      )}
                      <span>{o.university}</span>
                    </Link>
                  </td>
                  <td className="py-[12px] pe-[16px] text-black/60">
                    {tLevels(LEVEL_KEYS[o.level_group] as "foundation")}
                  </td>
                  <td className="py-[12px] pe-[16px] text-black/60">{o.duration ?? "—"}</td>
                  <td className="py-[12px] pe-[16px] font-semibold">{formatUsd(o.feeTotal, o.currency) ?? "—"}</td>
                  <td className="py-[12px] font-semibold">{formatUsd(o.feePerYear, o.currency) ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-[26px] flex items-center justify-center gap-[6px]">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-black/15 disabled:opacity-30"
            aria-label={tCommon("previousPage")}
          >
            <ChevronLeft size={16} className="rtl:rotate-180" />
          </button>
          {pageNumbers(currentPage, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-[6px] text-[13px] text-black/40">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-[36px] w-[36px] items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
                  p === currentPage ? "bg-[#285b50] text-white" : "hover:bg-[#f5efeb]"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-black/15 disabled:opacity-30"
            aria-label={tCommon("nextPage")}
          >
            <ChevronRight size={16} className="rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}