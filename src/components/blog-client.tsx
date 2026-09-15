"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Layers, Search } from "lucide-react";
import { wrap, Label } from "@/components/marketing-ui";
import type { BlogPostSummary } from "@/app/[locale]/blog/page";

const CATEGORIES = [
  "All",
  "Cost & Budgeting",
  "Choosing a Programme",
  "Applications & Visas",
  "Scholarships",
  "Student Life",
  "Programme Guides",
];

const PAGE_SIZE = 9;

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export default function BlogClient({ posts }: { posts: BlogPostSummary[] }) {
  const t = useTranslations("filters");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = posts.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <div>
      {/* Search & filters — straddles the header photo and the white body */}
      <div className={`${wrap} -mt-[70px]`}>
        <div className="border-x border-b border-t-[4px] border-x-black/10 border-b-black/10 border-t-[#285b50] bg-white p-[32px]">
          <Label>{t("searchFilter")}</Label>
          <div className="flex items-center gap-[10px] rounded-full border border-black/15 bg-[#f5efeb] px-[21px] py-[13px]">
            <Search size={18} className="shrink-0 text-[#285b50]" />
            <input
              type="text"
              placeholder={t("searchPlaceholderArticles")}
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-black/40"
            />
          </div>
          <div className="mt-[16px] flex flex-wrap gap-[8px]">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateCategory(c)}
                className={`rounded-full px-[16px] py-[8px] text-[13px] font-semibold transition-colors ${
                  category === c ? "bg-[#285b50] text-white" : "bg-[#f5efeb] text-black/60 hover:bg-black/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-[21px] flex items-center gap-[10px] border-t border-black/10 pt-[16px] text-[13px] text-black/50">
            <Layers size={14} className="text-[#285b50]" />
            {t("showingArticles", {
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
          {pageItems.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block border border-black/10 bg-white transition-colors hover:border-[#285b50]"
            >
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-[187px] w-full border-b border-black/10 object-cover"
              />
              <div className="p-[21px]">
                <p className="text-[12px] font-bold uppercase tracking-[.08em] text-[#285b50]">
                  {post.category}
                </p>
                <h3 className="mt-[8px] text-[17px] font-bold leading-snug group-hover:underline">
                  {post.title}
                </h3>
                <p className="mt-[10px] text-[13px] leading-relaxed text-black/55 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-[16px] flex items-center gap-[16px] border-t border-black/10 pt-[16px] text-[12px] text-black/50">
                  <span className="flex items-center gap-[5px]">
                    <CalendarDays size={12} /> {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-[5px]">
                    <Clock size={12} /> {post.readTimeMin} min read
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-[83px] text-center">
            <p className="text-[16px] text-black/50">{t("noResultsArticles")}</p>
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
