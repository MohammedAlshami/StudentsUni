"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, Clock, Wallet } from "lucide-react";
import type { LevelPrograms } from "@/lib/university-detail";
import { formatUsd } from "@/lib/fees";

const LEVEL_LABEL_KEYS: Record<string, string> = {
  foundation: "foundation",
  "pre-university": "pre-university",
  "pre-university-foundation-studies": "pre-university-foundation-studies",
  diploma: "diploma",
  "advanced-diploma": "advanced-diploma",
  bachelor: "bachelor",
  "bachelors-degree": "bachelors-degree",
  master: "master",
  "masters-degree": "masters-degree",
  phd: "phd",
  "doctoral-degree": "doctoral-degree",
  certificate: "certificate",
  language: "language",
};

const PAGE_SIZE = 12;

function formatFee(fee: number | null, feePerYear: number | null, currency: string): string | null {
  const total = formatUsd(fee, currency);
  if (total) return total;
  const perYear = formatUsd(feePerYear, currency);
  if (perYear) return `${perYear}/yr`;
  return null;
}

export function UniversityProgramsExplorer({
  slug,
  levels,
}: {
  slug: string;
  levels: LevelPrograms[];
}) {
  const t = useTranslations("universityDetail");
  const tLevels = useTranslations("levels");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const nonEmptyLevels = levels.filter((l) => l.programs.length > 0);
  const [activeLevel, setActiveLevel] = useState(nonEmptyLevels[0]?.level ?? "");
  const [page, setPage] = useState(1);

  const current = nonEmptyLevels.find((l) => l.level === activeLevel) ?? nonEmptyLevels[0];
  const totalPages = current ? Math.max(1, Math.ceil(current.programs.length / PAGE_SIZE)) : 1;

  const pageStart = (page - 1) * PAGE_SIZE;
  const pageItems = current ? current.programs.slice(pageStart, pageStart + PAGE_SIZE) : [];

  if (nonEmptyLevels.length === 0) {
    return (
      <p className="text-[14px] text-black/50">{t("programDataCollecting")}</p>
    );
  }

  return (
    <div>
      {/* Level tabs */}
      <div className="flex flex-wrap gap-[10px] border-b border-black/10 pb-[16px]">
        {nonEmptyLevels.map((l) => (
          <button
            key={l.level}
            type="button"
            onClick={() => {
              setActiveLevel(l.level);
              setPage(1);
            }}
            className={`rounded-full px-[18px] py-[8px] text-[13px] font-semibold transition-colors ${
              (current?.level ?? "") === l.level
                ? "bg-[#285b50] text-white"
                : "bg-[#f5efeb] text-[#242927] hover:bg-black/10"
            }`}
          >
            {LEVEL_LABEL_KEYS[l.level] ? tLevels(LEVEL_LABEL_KEYS[l.level] as "foundation") : l.level}
            <span className="ms-[6px] opacity-60">{l.programs.length}</span>
          </button>
        ))}
      </div>

      {/* Program list */}
      <div className="mt-[16px] divide-y divide-black/10 border border-black/10">
        {pageItems.map((prog) => {
          const fee = formatFee(prog.fee, prog.fee_per_year, prog.currency);
          return (
            <Link
              key={prog.slug}
              href={`/universities/${slug}/${current!.level}/${prog.slug}`}
              className="flex flex-col gap-[10px] p-[16px] transition-colors hover:bg-[#f5efeb] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">
                  {locale === "ar" ? (prog.name_ar || prog.name) : locale === "zh" ? (prog.name_zh || prog.name) : prog.name}
                </p>
                {prog.field && (
                  <p className="mt-[3px] text-[12px] text-black/50">
                    {locale === "ar" ? (prog.field_ar || prog.field) : locale === "zh" ? (prog.field_zh || prog.field) : prog.field}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-x-[16px] gap-y-[4px] text-[13px] text-black/70">
                {prog.duration && (
                  <span className="flex items-center gap-[5px]">
                    <Clock size={13} className="text-[#285b50]" /> {prog.duration}
                  </span>
                )}
                {fee ? (
                  <span className="flex items-center gap-[5px]">
                    <Wallet size={13} className="text-[#285b50]" /> {fee}
                  </span>
                ) : (
                  <span className="text-black/35">{t("feeInfoPending")}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-[16px] flex items-center justify-between text-[13px]">
          <span className="text-black/50">
            {t("pageOf", { page, total: totalPages })}
          </span>
          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-black/15 disabled:opacity-30"
              aria-label={tCommon("previousPage")}
            >
              <ChevronLeft size={16} className="rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-black/15 disabled:opacity-30"
              aria-label={tCommon("nextPage")}
            >
              <ChevronRight size={16} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
