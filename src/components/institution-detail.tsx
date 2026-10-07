import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { wrap, Pic, Label, Heading, Pill } from "@/components/marketing-ui";

/**
 * Shared detail-page shell used by both institution types
 * (/universities/[slug] and /language-centres/[slug]).
 *
 * The owning page is responsible for loading its own data and mapping it into
 * these props — this component only renders the layout, so both pages stay
 * visually identical.
 */

export type DetailStat = {
  icon: LucideIcon;
  value: ReactNode;
  label: string;
};

export type DetailMetaItem = {
  icon?: LucideIcon;
  text: ReactNode;
  href?: string;
};

export type InstitutionDetailProps = {
  // header
  backHref: string;
  backLabel: string;
  coverPhoto: string | null;
  avatarUrl: string | null;
  avatarAlt: string;
  avatarFallback: string;
  /** logos render contained so they aren't cropped by the circular mask */
  avatarFit?: "cover" | "contain";
  badgeLabel: string;
  title: ReactNode;
  abbr?: string;
  meta: DetailMetaItem[];
  applyLabel: string;
  // quick facts
  stats: DetailStat[];
  // about
  aboutLabel: string;
  aboutText: ReactNode;
  sourcesNote?: ReactNode;
  // gallery
  gallery: string[];
  galleryLabel: string;
  galleryCaption: string;
  // main content slot (programs explorer, courses table, …)
  contentLabel: string;
  children: ReactNode;
  // CTA band
  ctaPhotoLeft: string | null;
  ctaPhotoRight: string | null;
  ctaBadgeLabel: string;
  ctaTitle: ReactNode;
  ctaPillLabel: string;
};

export function InstitutionDetail(props: InstitutionDetailProps) {
  const {
    backHref,
    backLabel,
    coverPhoto,
    avatarUrl,
    avatarAlt,
    avatarFallback,
    avatarFit = "cover",
    badgeLabel,
    title,
    abbr,
    meta,
    applyLabel,
    stats,
    aboutLabel,
    aboutText,
    sourcesNote,
    gallery,
    galleryLabel,
    galleryCaption,
    contentLabel,
    children,
    ctaPhotoLeft,
    ctaPhotoRight,
    ctaBadgeLabel,
    ctaTitle,
    ctaPillLabel,
  } = props;

  const ctaHasPhotos = Boolean(ctaPhotoLeft && ctaPhotoRight);

  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Header */}
      <div
        className="relative bg-[#285b50] bg-cover bg-center text-white"
        style={
          coverPhoto
            ? { backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.55)),url(${coverPhoto})` }
            : undefined
        }
      >
        <div className={`${wrap} pt-[155px] pb-[86px]`}>
          <Link href={backHref} className="text-[13px] text-white/60 hover:underline">
            <span className="inline-block rtl:-scale-x-100">&larr;</span> {backLabel}
          </Link>
          <div className="mt-[26px] flex flex-col gap-[26px] md:flex-row md:items-center">
            <div className="flex h-[104px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={avatarAlt}
                  className={
                    avatarFit === "contain"
                      ? "h-[70%] w-[70%] object-contain"
                      : "h-full w-full object-cover"
                  }
                />
              ) : (
                <span className="text-[25px] font-bold text-[#285b50]">{avatarFallback}</span>
              )}
            </div>
            <div className="flex-1">
              <Label>{badgeLabel}</Label>
              <h1 className="text-[36px] font-bold leading-[.98] tracking-[-.04em] md:text-[42px]">
                {title}
                {abbr && <span className="ms-[11px] text-[18px] font-normal text-white/50">({abbr})</span>}
              </h1>
              {meta.length > 0 && (
                <div className="mt-[16px] flex flex-wrap items-center gap-[21px] text-[14px] text-white/70">
                  {meta.map((item, i) =>
                    item.href ? (
                      <a
                        key={i}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span key={i} className="flex items-center gap-[6px]">
                        {item.icon ? <item.icon size={14} /> : null}
                        {item.text}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
            <Pill white>{applyLabel}</Pill>
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className={`${wrap} pt-[26px]`}>
        <div className="grid grid-cols-2 gap-[21px] rounded-[28px] border border-black/10 bg-[#f5efeb] px-[26px] py-[26px] sm:grid-cols-4 sm:rounded-full">
          {stats.map((stat, i) => (
            <div className="flex items-center gap-[10px]" key={i}>
              <stat.icon size={20} className="shrink-0 text-[#285b50]" />
              <div>
                <p className="text-[16px] font-bold leading-none">{stat.value}</p>
                <p className="mt-[4px] text-[12px] text-black/55">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className={`${wrap} py-[42px]`}>
        <Label>{aboutLabel}</Label>
        <p className="max-w-[750px] text-[16px] leading-relaxed text-black/70">{aboutText}</p>
        {sourcesNote && <p className="mt-[10px] text-[12px] text-black/40">{sourcesNote}</p>}
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className={`${wrap} pb-[42px]`}>
          <Label>{galleryLabel}</Label>
          {gallery.length >= 3 ? (
            <div className="grid grid-cols-2 gap-[10px] md:grid-cols-[1.45fr_1fr] md:grid-rows-2">
              <img
                src={gallery[0]}
                alt={avatarAlt}
                className="row-span-2 h-[220px] w-full object-cover md:h-full"
              />
              <img src={gallery[1]} alt={avatarAlt} className="h-[105px] w-full object-cover md:h-full" />
              <img src={gallery[2]} alt={avatarAlt} className="h-[105px] w-full object-cover md:h-full" />
            </div>
          ) : (
            <div className={`grid gap-[10px] ${gallery.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {gallery.map((url) => (
                <img key={url} src={url} alt={avatarAlt} className="h-[220px] w-full object-cover" />
              ))}
            </div>
          )}
          <p className="mt-[10px] text-[11px] text-black/40">{galleryCaption}</p>
        </div>
      )}

      {/* Main content */}
      <div className={`${wrap} pb-[52px]`}>
        <Label>{contentLabel}</Label>
        {children}
      </div>

      {/* CTA */}
      <div className="bg-white pb-[62px]">
        <div className={wrap}>
          <div className="mx-auto mb-[21px] grid h-[52px] w-[52px] place-items-center rounded-full border-[3px] border-[#285b50] text-[#285b50]">
            <ArrowUpRight size={25} className="rtl:rotate-90" />
          </div>
          <div
            className={`grid h-[270px] items-center bg-white text-center ${
              ctaHasPhotos ? "grid-cols-[130px_1fr_130px] md:grid-cols-[237px_1fr_231px]" : "grid-cols-1"
            }`}
          >
            {ctaPhotoLeft && <Pic src={ctaPhotoLeft} className="h-[270px] w-full" />}
            <div>
              <Label>{ctaBadgeLabel}</Label>
              <Heading className="text-[29px] md:text-[36px]">{ctaTitle}</Heading>
              <div className="mt-[21px]">
                <Pill>{ctaPillLabel}</Pill>
              </div>
            </div>
            {ctaPhotoRight && <Pic src={ctaPhotoRight} className="h-[270px] w-full" />}
          </div>
        </div>
      </div>
    </div>
  );
}
