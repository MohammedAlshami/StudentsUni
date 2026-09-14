"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, GraduationCap, Landmark, MapPin, Search, SlidersHorizontal, Wallet } from "lucide-react";
import { wrap, Label } from "@/components/marketing-ui";
import { getUniversityImage } from "@/lib/university-images";
import type { UniversityStats } from "@/lib/university-stats";

type Institution = {
  slug: string;
  name: string;
  abbr: string;
  type: string;
  state: string | null;
  city: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  "public-university": "Public University",
  "private-university": "Private University",
  "private-university-college": "Private University College",
};

const TYPE_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "public-university", label: "Public" },
  { value: "private-university", label: "Private" },
  { value: "private-university-college", label: "College" },
];

const PAGE_SIZE = 15;

function formatFeeRange(stats?: UniversityStats): string | null {
  if (!stats?.feeRange) return null;
  const { min, max, currency } = stats.feeRange;
  const fmt = (n: number) => `${currency} ${Math.round(n).toLocaleString()}`;
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}

function UniversityMark({ slug, name, abbr }: { slug: string; name: string; abbr: string }) {
  const image = getUniversityImage(slug);

  if (image) {
    return (
      <div
        className={`flex h-[202px] w-full items-center justify-center border-b border-black/10 bg-white ${
          image.kind === "logo" ? "p-[26px]" : ""
        }`}
      >
        <img
          src={image.url}
          alt={name}
          className={image.kind === "logo" ? "max-h-full max-w-full object-contain" : "h-full w-full object-cover"}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[202px] w-full items-center justify-center border-b border-black/10 bg-gradient-to-br from-[#285b50] to-[#16352d]">
      <span className="text-[34px] font-bold tracking-[-.03em] text-white/90">{abbr}</span>
    </div>
  );
}

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

export default function UniversitiesClient({
  institutions,
  stats,
}: {
  institutions: Institution[];
  stats: Record<string, UniversityStats>;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.abbr.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || inst.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateTypeFilter(value: string) {
    setTypeFilter(value);
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
              <SlidersHorizontal size={13} /> {filtered.length} of {institutions.length} match
            </span>
          </div>
          <div className="flex flex-col gap-[16px] md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-[10px] rounded-full border border-black/15 bg-[#f5efeb] px-[21px] py-[13px]">
              <Search size={18} className="shrink-0 text-[#285b50]" />
              <input
                type="text"
                placeholder="Search by name or abbreviation..."
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/40"
              />
            </div>
            <div className="flex items-center gap-[4px] rounded-full bg-[#f5efeb] p-[4px]">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => updateTypeFilter(f.value)}
                  className={`rounded-full px-[16px] py-[9px] text-[13px] font-semibold transition-colors ${
                    typeFilter === f.value ? "bg-[#285b50] text-white" : "text-black/60 hover:bg-black/5"
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
            universities
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className={`${wrap} py-[52px]`}>
        <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((inst) => {
            const s = stats[inst.slug];
            const feeRange = formatFeeRange(s);
            return (
              <Link
                key={inst.slug}
                href={`/universities/${inst.slug}`}
                className="group block border border-black/10 bg-white transition-colors hover:border-[#285b50]"
              >
                <UniversityMark slug={inst.slug} name={inst.name} abbr={inst.abbr} />
                <div className="px-[21px] pb-[21px]">
                  <p className="mt-[21px] text-[12px] font-bold uppercase tracking-[.1em] text-[#285b50]">
                    {TYPE_LABELS[inst.type] ?? inst.type}
                  </p>
                  <h3 className="mt-[6px] text-[18px] font-bold leading-tight group-hover:underline">
                    {inst.name}
                  </h3>
                  {inst.state && (
                    <p className="mt-[10px] flex items-center gap-[6px] text-[13px] text-black/55">
                      <MapPin size={13} /> {inst.state}
                    </p>
                  )}
                  <div className="mt-[16px] flex flex-wrap gap-x-[16px] gap-y-[6px] border-t border-black/10 pt-[16px] text-[13px] text-black/70">
                    {s && s.totalPrograms > 0 && (
                      <span className="flex items-center gap-[6px]">
                        <GraduationCap size={14} className="text-[#285b50]" />
                        {s.totalPrograms} programmes
                      </span>
                    )}
                    {feeRange && (
                      <span className="flex items-center gap-[6px]">
                        <Wallet size={14} className="text-[#285b50]" />
                        {feeRange}
                      </span>
                    )}
                    {!s?.totalPrograms && !feeRange && (
                      <span className="text-black/40">Data coming soon</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-[83px] text-center">
            <p className="text-[16px] text-black/50">No universities match your search.</p>
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
