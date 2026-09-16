"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Landmark,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { wrap, Label } from "@/components/marketing-ui";

type ProgramRow = {
  university: string;
  university_slug: string;
  level: string;
  name: string;
  name_ar?: string;
  name_zh?: string;
  slug: string;
  field: string;
  field_ar?: string;
  field_zh?: string;
};

const LEVEL_FILTER_VALUES = ["all", "foundation", "diploma", "bachelor", "master", "phd"] as const;

const LEVEL_LABEL_KEYS: Record<string, string> = {
  foundation: "foundation",
  "pre-university": "pre-university",
  diploma: "diploma",
  "advanced-diploma": "advanced-diploma",
  bachelor: "bachelor",
  "bachelors-degree": "bachelors-degree",
  degree: "degree",
  undergraduate: "undergraduate",
  master: "master",
  "masters-degree": "masters-degree",
  masters: "masters",
  postgraduate: "postgraduate",
  phd: "phd",
  "doctoral-degree": "doctoral-degree",
  certificate: "certificate",
  language: "language",
};

function matchesLevelFilter(level: string, filter: string): boolean {
  if (filter === "all") return true;
  return level.toLowerCase().includes(filter);
}

const PAGE_SIZE = 15;

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

export default function ProgramsClient({ programs }: { programs: ProgramRow[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [level, setLevel] = useState("all");
  const [page, setPage] = useState(1);
  const t = useTranslations("filters");
  const tLevels = useTranslations("levels");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  function getLocalizedName(name: string, nameAr?: string, nameZh?: string): string {
    if (locale === "ar") return nameAr || name;
    if (locale === "zh") return nameZh || name;
    return name;
  }

  function getLocalizedField(field: string, fieldAr?: string, fieldZh?: string): string {
    if (locale === "ar") return fieldAr || field;
    if (locale === "zh") return fieldZh || field;
    return field;
  }

  const filtered = programs.filter((p) => {
    const q = search.toLowerCase();
    const searchName = getLocalizedName(p.name, p.name_ar, p.name_zh);
    const searchField = getLocalizedField(p.field, p.field_ar, p.field_zh);
    const matchesSearch =
      searchName.toLowerCase().includes(q) ||
      p.university.toLowerCase().includes(q) ||
      searchField.toLowerCase().includes(q);
    return matchesSearch && matchesLevelFilter(p.level, level);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateLevel(value: string) {
    setLevel(value);
    setPage(1);
  }

  return (
    <div>
      {/* Search & filters — straddles the header photo and the white body */}
      <div className={`${wrap} -mt-[70px]`}>
        <div className="border-x border-b border-t-[4px] border-x-black/10 border-b-black/10 border-t-[#285b50] bg-white p-[32px]">
          <div className="flex items-center justify-between gap-[16px]">
            <Label>{t("searchFilter")}</Label>
            <span className="hidden items-center gap-[6px] text-[12px] font-semibold text-black/40 sm:flex">
              <SlidersHorizontal size={13} /> {t("matchCount", { filtered: filtered.length, total: programs.length })}
            </span>
          </div>
          <div className="flex flex-col gap-[16px] md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-[10px] rounded-full border border-black/15 bg-[#f5efeb] px-[21px] py-[13px]">
              <Search size={18} className="shrink-0 text-[#285b50]" />
              <input
                type="text"
                placeholder={t("searchPlaceholderProgrammes")}
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/40"
              />
            </div>
            <div className="flex flex-wrap items-center gap-[4px] rounded-full bg-[#f5efeb] p-[4px]">
              {LEVEL_FILTER_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateLevel(value)}
                  className={`rounded-full px-[16px] py-[9px] text-[13px] font-semibold transition-colors ${
                    level === value ? "bg-[#285b50] text-white" : "text-black/60 hover:bg-black/5"
                  }`}
                >
                  {t(`levelFilters.${value}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-[21px] flex items-center gap-[10px] border-t border-black/10 pt-[16px] text-[13px] text-black/50">
            <Landmark size={14} className="text-[#285b50]" />
            {t("showingProgrammes", {
              from: filtered.length === 0 ? 0 : pageStart + 1,
              to: filtered.length > 0 ? Math.min(pageStart + PAGE_SIZE, filtered.length) : 0,
              total: filtered.length,
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className={`${wrap} py-[52px]`}>
        <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((p) => (
            <Link
              key={`${p.university_slug}-${p.level}-${p.slug}`}
              href={`/universities/${p.university_slug}/${p.level}/${p.slug}`}
              className="group block border border-black/10 bg-white transition-colors hover:border-[#285b50]"
            >
              <div className="flex h-[80px] items-center gap-[10px] border-b border-black/10 bg-[#f5efeb] px-[21px]">
                <GraduationCap size={18} className="shrink-0 text-[#285b50]" />
                <span className="text-[12px] font-bold uppercase tracking-[.08em] text-[#285b50]">
                  {LEVEL_LABEL_KEYS[p.level.toLowerCase()] ? tLevels(LEVEL_LABEL_KEYS[p.level.toLowerCase()] as "foundation") : p.level}
                </span>
              </div>
              <div className="p-[21px]">
                <p className="text-[12px] font-bold uppercase tracking-[.06em] text-black/40">
                  {p.university}
                </p>
                <h3 className="mt-[6px] text-[16px] font-bold leading-snug group-hover:underline">
                  {getLocalizedName(p.name, p.name_ar, p.name_zh)}
                </h3>
                {p.field && <p className="mt-[10px] text-[13px] text-black/55">{getLocalizedField(p.field, p.field_ar, p.field_zh)}</p>}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-[83px] text-center">
            <p className="text-[16px] text-black/50">{t("noResultsProgrammes")}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-[42px] flex items-center justify-center gap-[6px]">
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
    </div>
  );
}
