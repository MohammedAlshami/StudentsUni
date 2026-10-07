"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Layers,
  MapPin,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { LevelPrograms, ProgramSummary } from "@/lib/university-detail";
import { formatUsd } from "@/lib/fees";
import { getProgramImage } from "@/lib/program-images";

const PAGE_SIZE = 6;
const BRAND = "#285b50";

type FlatProgram = ProgramSummary & { levelKey: string };

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

function formatFee(fee: number | null, feePerYear: number | null, currency: string): string | null {
  const total = formatUsd(fee, currency);
  if (total) return total;
  const perYear = formatUsd(feePerYear, currency);
  if (perYear) return `${perYear}/yr`;
  return null;
}

// `slug` is accepted for API compatibility with the parent page; the explorer
// keeps everything inline (no per-programme routes) so it isn't read here.
export function UniversityProgramsExplorer({
  levels,
}: {
  slug: string;
  levels: LevelPrograms[];
}) {
  const t = useTranslations("programsExplorer");
  const tLevels = useTranslations("levels");
  const locale = useLocale();

  const allPrograms = useMemo<FlatProgram[]>(
    () => levels.flatMap((l) => l.programs.map((p) => ({ ...p, levelKey: l.level }))),
    [levels]
  );

  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<FlatProgram | null>(null);
  const [tab, setTab] = useState("overview");

  const levelCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allPrograms) map.set(p.levelKey, (map.get(p.levelKey) ?? 0) + 1);
    return map;
  }, [allPrograms]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPrograms
      .filter((p) => {
        if (selectedLevel !== "all" && p.levelKey !== selectedLevel) return false;
        if (!q) return true;
        return [p.name, p.name_ar, p.name_zh, p.field, p.field_ar, p.field_zh]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      })
      .sort((a, b) => {
        if (sortBy === "fee-desc") return (b.fee ?? -1) - (a.fee ?? -1);
        if (sortBy === "fee-asc")
          return (a.fee ?? Number.MAX_SAFE_INTEGER) - (b.fee ?? Number.MAX_SAFE_INTEGER);
        if (sortBy === "title") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [allPrograms, selectedLevel, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  // Windowed page list — a 100-programme university would otherwise render a
  // long row of numbered buttons. Keeps first/last/current ±1 with "…" gaps.
  const pageItems = useMemo<Array<number | "gap">>(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const wanted = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const sorted = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const items: Array<number | "gap"> = [];
    let previous = 0;
    for (const n of sorted) {
      if (previous && n - previous > 1) items.push("gap");
      items.push(n);
      previous = n;
    }
    return items;
  }, [totalPages, currentPage]);

  // Reset paging whenever the query/filters change (done in the handlers below
  // rather than in an effect, to avoid a cascading render).

  // Lock body scroll + close on Escape while the modal is open.
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const levelLabel = (key: string) =>
    LEVEL_LABEL_KEYS[key] ? tLevels(LEVEL_LABEL_KEYS[key] as "foundation") : key;

  const localised = (p: FlatProgram, en: string, ar?: string, zh?: string) =>
    locale === "ar" ? ar || en : locale === "zh" ? zh || en : en;

  const feeText = selected ? formatFee(selected.fee, selected.fee_per_year, selected.currency) : null;

  // Only offer tabs that actually have content for this programme.
  const requirementsList = useMemo(() => {
    if (!selected) return [] as Array<{ label: string; value: string }>;
    const r = selected.requirements ?? {};
    const map: Array<[keyof typeof r, string]> = [
      ["english_requirement", t("reqEnglish")],
      ["a_level", t("reqALevel")],
      ["ib", t("reqIb")],
      ["other_qualifications", t("reqOther")],
      ["previous_education", t("reqPrevious")],
      ["pre_university", t("reqPreUniversity")],
      ["foundation", t("reqFoundation")],
      ["diploma_pathway", t("reqDiploma")],
      ["general", t("reqGeneral")],
    ];
    return map
      .filter(([key]) => typeof r[key] === "string" && (r[key] as string).trim())
      .map(([key, label]) => ({ label, value: r[key] as string }));
  }, [selected, t]);

  const hasOverview = Boolean(
    selected &&
      (selected.description ||
        selected.accreditation?.mqa_status ||
        selected.accreditation?.mqa_ref ||
        selected.faculty ||
        selected.campus ||
        selected.awarding_body ||
        selected.awarding_country)
  );

  const openProgram = (p: FlatProgram) => {
    setSelected(p);
    setTab("overview");
  };

  return (
    <div className="mt-[21px]">
      {/* Header + level pills */}
      <div className="flex flex-col gap-[16px] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-[24px] font-bold tracking-[-.03em] text-[#242927] md:text-[28px]">
            {t("title")}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-[8px]">
          <button
            type="button"
            onClick={() => {
              setSelectedLevel("all");
              setCurrentPage(1);
            }}
            className="rounded-full px-[16px] py-[8px] text-[13px] font-semibold transition-colors"
            style={
              selectedLevel === "all"
                ? { background: BRAND, color: "#fff" }
                : { background: "#f0ebe6", color: "#4a4a4a" }
            }
          >
            {t("allCourses")}
            <span className="ms-[6px] opacity-70">{allPrograms.length}</span>
          </button>
          {levels.map((l) => (
            <button
              key={l.level}
              type="button"
              onClick={() => {
                setSelectedLevel(l.level);
                setCurrentPage(1);
              }}
              className="rounded-full px-[16px] py-[8px] text-[13px] font-semibold transition-colors"
              style={
                selectedLevel === l.level
                  ? { background: BRAND, color: "#fff" }
                  : { background: "#f0ebe6", color: "#4a4a4a" }
              }
            >
              {levelLabel(l.level)}
              <span className="ms-[6px] opacity-70">{levelCounts.get(l.level) ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search + sort */}
      <div className="mt-[18px] flex flex-col gap-[10px] sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1">
          <Search size={16} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="w-full rounded-[10px] border border-black/12 bg-white py-[10px] pl-[40px] pr-[38px] text-[14px] outline-none placeholder:text-black/35 focus:border-[#285b50]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              aria-label={t("clearSearch")}
              className="absolute right-[12px] top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-[8px] rounded-[10px] border border-black/12 bg-white px-[12px] py-[10px]">
          <SlidersHorizontal size={14} className="text-black/45" />
          <span className="text-[12px] text-black/50">{t("sortLabel")}</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            aria-label={t("sortLabel")}
            className="cursor-pointer bg-transparent text-[13px] font-semibold text-[#242927] outline-none"
          >
            <option value="default">{t("sortDefault")}</option>
            <option value="fee-desc">{t("sortFeeDesc")}</option>
            <option value="fee-asc">{t("sortFeeAsc")}</option>
            <option value="title">{t("sortTitle")}</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-[26px] rounded-[16px] border border-black/12 bg-white py-[62px] text-center">
          <GraduationCap size={44} className="mx-auto text-black/25" />
          <p className="mt-[12px] text-[17px] font-semibold text-[#242927]">{t("emptyTitle")}</p>
          <p className="mt-[4px] text-[13px] text-black/45">{t("emptyBody")}</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedLevel("all");
            }}
            className="mt-[16px] rounded-[10px] border px-[16px] py-[8px] text-[13px] font-semibold transition-colors hover:text-white"
            style={{ borderColor: BRAND, color: BRAND }}
          >
            {t("resetFilters")}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-[26px] grid grid-cols-1 gap-[24px] md:grid-cols-2 lg:grid-cols-3">
            {paginated.map((p) => {
              const fee = formatFee(p.fee, p.fee_per_year, p.currency);
              return (
                <article
                  key={`${p.levelKey}-${p.slug}`}
                  className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-[16px] border border-black/12 bg-white transition-colors hover:border-[#285b50]"
                  onClick={() => openProgram(p)}
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-black/8 bg-[#f5efeb]">
                      <img
                        src={getProgramImage(p.field, p.name, 600)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute left-[12px] top-[12px] rounded-[6px] border border-black/10 bg-white px-[10px] py-[4px] text-[10px] font-bold uppercase tracking-[.08em] text-[#242927]">
                        {levelLabel(p.levelKey)}
                      </span>
                    </div>
                    <div className="p-[18px] pb-[10px]">
                      <span className="block text-[11px] font-semibold uppercase tracking-[.1em] text-black/45">
                        {localised(p, p.field, p.field_ar, p.field_zh)}
                      </span>
                      <h3 className="mt-[4px] text-[16px] font-bold leading-snug text-[#242927] transition-colors group-hover:text-[#285b50]">
                        {localised(p, p.name, p.name_ar, p.name_zh)}
                      </h3>
                      {p.description && (
                        <p className="mt-[8px] line-clamp-2 text-[13px] leading-relaxed text-black/55">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto space-y-[10px] border-t border-black/8 p-[18px] pt-[14px]">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-black/45">{t("duration")}</span>
                      <span className="flex items-center gap-[6px] font-medium text-[#242927]">
                        <Clock size={14} className="text-black/45" />
                        {p.duration ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-black/6 pt-[10px] text-[13px]">
                      <span className="text-black/45">{t("tuition")}</span>
                      {fee ? (
                        <span className="text-[15px] font-bold" style={{ color: BRAND }}>
                          {fee}
                        </span>
                      ) : (
                        <span className="text-[12px] italic text-black/40">{t("feePending")}</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-[36px] flex flex-col items-center justify-between gap-[14px] border-t border-black/12 pt-[20px] sm:flex-row">
            <p className="text-[13px] text-black/55">
              {t("showing", {
                from: (currentPage - 1) * PAGE_SIZE + 1,
                to: Math.min(currentPage * PAGE_SIZE, filtered.length),
                total: filtered.length,
              })}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-[6px]">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label={t("previous")}
                  className="rounded-[8px] border border-black/12 p-[8px] text-[#4a4a4a] transition-colors hover:bg-[#f5efeb] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {pageItems.map((item, i) =>
                  item === "gap" ? (
                    <span key={`gap-${i}`} className="px-[4px] text-black/40" aria-hidden="true">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCurrentPage(item)}
                      aria-current={currentPage === item ? "page" : undefined}
                      className="h-[32px] min-w-[32px] rounded-[8px] px-[6px] text-[12px] font-semibold transition-colors"
                      style={
                        currentPage === item
                          ? { background: BRAND, color: "#fff" }
                          : { background: "#fff", border: "1px solid rgba(0,0,0,.12)", color: "#4a4a4a" }
                      }
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label={t("next")}
                  className="rounded-[8px] border border-black/12 p-[8px] text-[#4a4a4a] transition-colors hover:bg-[#f5efeb] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-[16px] sm:p-[24px]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-[18px] border border-black/12 bg-white"
            >
              {/* Banner */}
              <div className="relative aspect-[21/9] w-full bg-[#f5efeb]">
                <img
                  src={getProgramImage(selected.field, selected.name, 900)}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label={t("close")}
                  className="absolute right-[12px] top-[12px] rounded-full border border-black/10 bg-white p-[8px] text-[#242927] transition-colors hover:bg-[#f5efeb]"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-[12px] left-[16px] flex gap-[8px]">
                  <span className="rounded-[6px] border border-black/10 bg-white px-[10px] py-[4px] text-[11px] font-semibold text-[#242927]">
                    {levelLabel(selected.levelKey)}
                  </span>
                  <span className="rounded-[6px] px-[10px] py-[4px] text-[11px] font-semibold text-white" style={{ background: BRAND }}>
                    {localised(selected, selected.field, selected.field_ar, selected.field_zh)}
                  </span>
                </div>
              </div>

              {/* Title + quick info */}
              <div className="border-b border-black/8 p-[22px] pb-[16px]">
                <h2 className="text-[21px] font-bold leading-snug text-[#242927] sm:text-[24px]">
                  {localised(selected, selected.name, selected.name_ar, selected.name_zh)}
                </h2>
                <div className="mt-[14px] grid grid-cols-2 gap-[10px] text-[12px] sm:grid-cols-4">
                  <div className="rounded-[10px] border border-black/8 bg-[#f8f4f1] p-[10px]">
                    <span className="block text-[10px] font-bold uppercase tracking-[.08em] text-black/45">{t("duration")}</span>
                    <span className="mt-[2px] block font-semibold text-[#242927]">{selected.duration ?? "—"}</span>
                  </div>
                  <div className="rounded-[10px] border border-black/8 bg-[#f8f4f1] p-[10px]">
                    <span className="block text-[10px] font-bold uppercase tracking-[.08em] text-black/45">{t("tuition")}</span>
                    <span className="mt-[2px] block font-bold" style={{ color: BRAND }}>
                      {feeText ?? t("feePending")}
                    </span>
                  </div>
                  <div className="rounded-[10px] border border-black/8 bg-[#f8f4f1] p-[10px]">
                    <span className="block text-[10px] font-bold uppercase tracking-[.08em] text-black/45">{t("intakes")}</span>
                    <span className="mt-[2px] block font-semibold text-[#242927]">
                      {selected.intakes?.length ? selected.intakes.join(", ") : "—"}
                    </span>
                  </div>
                  <div className="rounded-[10px] border border-black/8 bg-[#f8f4f1] p-[10px]">
                    <span className="block text-[10px] font-bold uppercase tracking-[.08em] text-black/45">{t("studyMode")}</span>
                    <span className="mt-[2px] block font-semibold text-[#242927]">{selected.mode ?? "—"}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-[18px] flex items-center gap-[4px] overflow-x-auto border-b border-black/12">
                  {[
                    { id: "overview", label: t("tabOverview"), visible: hasOverview },
                    { id: "requirements", label: t("tabRequirements"), visible: requirementsList.length > 0 },
                    { id: "details", label: t("tabDetails"), visible: true },
                  ]
                    .filter((x) => x.visible)
                    .map((x) => (
                      <button
                        key={x.id}
                        type="button"
                        onClick={() => setTab(x.id)}
                        className="whitespace-nowrap border-b-2 px-[12px] pb-[10px] text-[12px] font-semibold transition-colors"
                        style={
                          tab === x.id
                            ? { borderColor: BRAND, color: BRAND }
                            : { borderColor: "transparent", color: "rgba(0,0,0,.5)" }
                        }
                      >
                        {x.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="space-y-[14px] p-[22px] text-[13px] leading-relaxed text-black/65">
                {tab === "overview" && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-[14px]">
                    {selected.description && (
                      <div>
                        <h4 className="mb-[6px] text-[14px] font-bold text-[#242927]">{t("description")}</h4>
                        <p>{selected.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2">
                      {[
                        { icon: Award, label: t("accreditation"), value: selected.accreditation?.mqa_status ?? selected.accreditation?.mqa_ref },
                        { icon: MapPin, label: t("faculty"), value: selected.faculty },
                        { icon: Layers, label: t("campus"), value: selected.campus },
                        { icon: Briefcase, label: t("awarding"), value: [selected.awarding_body, selected.awarding_country].filter(Boolean).join(" — ") },
                      ]
                        .filter((x) => x.value)
                        .map((x) => (
                          <div key={x.label} className="flex items-start gap-[8px] rounded-[10px] border border-black/8 p-[10px]">
                            <x.icon size={16} className="mt-[2px] shrink-0" style={{ color: BRAND }} />
                            <div>
                              <span className="block font-semibold text-[#242927]">{x.label}</span>
                              <span className="text-[11px] text-black/55">{x.value}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}

                {tab === "requirements" && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-[8px]">
                    <h4 className="text-[14px] font-bold text-[#242927]">{t("requirementsTitle")}</h4>
                    <ul className="space-y-[8px]">
                      {requirementsList.map((r) => (
                        <li key={r.label} className="flex items-start gap-[8px] rounded-[10px] border border-black/8 bg-[#f8f4f1] p-[10px]">
                          <CheckCircle2 size={16} className="mt-[2px] shrink-0" style={{ color: BRAND }} />
                          <span className="text-[#3a3a3a]">
                            <b className="font-semibold text-[#242927]">{r.label}:</b> {r.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {tab === "details" && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-[8px]">
                    <h4 className="text-[14px] font-bold text-[#242927]">{t("detailsTitle")}</h4>
                    <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2">
                      {[
                        { icon: GraduationCap, label: t("level"), value: levelLabel(selected.levelKey) },
                        { icon: Clock, label: t("duration"), value: selected.duration },
                        { icon: Wallet, label: t("tuition"), value: feeText },
                        { icon: Calendar, label: t("intakes"), value: selected.intakes?.length ? selected.intakes.join(", ") : null },
                        { icon: Layers, label: t("studyMode"), value: selected.mode },
                        { icon: Award, label: t("credits"), value: selected.credits != null ? String(selected.credits) : null },
                      ]
                        .filter((x) => x.value)
                        .map((x) => (
                          <div key={x.label} className="flex items-start gap-[8px] rounded-[10px] border border-black/8 p-[10px]">
                            <x.icon size={16} className="mt-[2px] shrink-0" style={{ color: BRAND }} />
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-[.08em] text-black/45">{x.label}</span>
                              <span className="font-semibold text-[#242927]">{x.value}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                    {selected.hasDetail && (
                      <p className="pt-[4px] text-[11px] text-black/40">{t("sourceNote")}</p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
