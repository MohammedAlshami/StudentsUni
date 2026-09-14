"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  slug: string;
  field: string;
};

const LEVEL_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "foundation", label: "Foundation" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelor", label: "Bachelor's" },
  { value: "master", label: "Master's" },
  { value: "phd", label: "PhD" },
];

const LEVEL_LABELS: Record<string, string> = {
  foundation: "Foundation",
  "pre-university": "Pre-University",
  diploma: "Diploma",
  "advanced-diploma": "Advanced Diploma",
  bachelor: "Bachelor's",
  "bachelors-degree": "Bachelor's",
  degree: "Bachelor's",
  undergraduate: "Bachelor's",
  master: "Master's",
  "masters-degree": "Master's",
  masters: "Master's",
  postgraduate: "Postgraduate",
  phd: "PhD",
  "doctoral-degree": "PhD",
  certificate: "Certificate",
  language: "Language",
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

  const filtered = programs.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.university.toLowerCase().includes(q) ||
      p.field.toLowerCase().includes(q);
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
            <Label>Search &amp; filter</Label>
            <span className="hidden items-center gap-[6px] text-[12px] font-semibold text-black/40 sm:flex">
              <SlidersHorizontal size={13} /> {filtered.length} of {programs.length} match
            </span>
          </div>
          <div className="flex flex-col gap-[16px] md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-[10px] rounded-full border border-black/15 bg-[#f5efeb] px-[21px] py-[13px]">
              <Search size={18} className="shrink-0 text-[#285b50]" />
              <input
                type="text"
                placeholder="Search by programme, university, or field..."
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/40"
              />
            </div>
            <div className="flex flex-wrap items-center gap-[4px] rounded-full bg-[#f5efeb] p-[4px]">
              {LEVEL_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => updateLevel(f.value)}
                  className={`rounded-full px-[16px] py-[9px] text-[13px] font-semibold transition-colors ${
                    level === f.value ? "bg-[#285b50] text-white" : "text-black/60 hover:bg-black/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-[21px] flex items-center gap-[10px] border-t border-black/10 pt-[16px] text-[13px] text-black/50">
            <Landmark size={14} className="text-[#285b50]" />
            Showing {filtered.length === 0 ? 0 : pageStart + 1}
            {filtered.length > 0 && `–${Math.min(pageStart + PAGE_SIZE, filtered.length)}`} of {filtered.length}{" "}
            programmes
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
                  {LEVEL_LABELS[p.level.toLowerCase()] ?? p.level}
                </span>
              </div>
              <div className="p-[21px]">
                <p className="text-[12px] font-bold uppercase tracking-[.06em] text-black/40">
                  {p.university}
                </p>
                <h3 className="mt-[6px] text-[16px] font-bold leading-snug group-hover:underline">
                  {p.name}
                </h3>
                {p.field && <p className="mt-[10px] text-[13px] text-black/55">{p.field}</p>}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-[83px] text-center">
            <p className="text-[16px] text-black/50">No programmes match your search.</p>
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
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
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
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
