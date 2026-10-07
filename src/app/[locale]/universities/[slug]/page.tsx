import fs from "fs";
import path from "path";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, GraduationCap, Layers, MapPin, Wallet } from "lucide-react";
import { getUniversityImage, getUniversityGallery, UNIVERSITY_PHOTOS } from "@/lib/university-images";
import { formatUsdRange } from "@/lib/fees";
import { getUniversityStats } from "@/lib/university-stats";
import { detectLevels, getProgramsByLevel } from "@/lib/university-detail";
import { UniversityProgramsExplorer } from "@/components/university-programs-explorer";
import { InstitutionDetail } from "@/components/institution-detail";
import { institutionTypeLabel } from "@/components/marketing-ui";
import { routing } from "@/i18n/routing";

const LEVEL_LABEL_KEYS: Record<string, string> = {
  foundation: "foundation",
  "pre-university": "pre-university",
  diploma: "diploma",
  bachelor: "bachelor",
  master: "master",
  phd: "phd",
};

type Info = {
  slug: string;
  name?: string;
  university?: string; // some info.json files use this key instead of `name`
  abbr?: string;
  abbreviation?: string;
  type: string;
  state: string | null;
  city?: string | null;
  website: string | null;
  sources?: Array<{ url: string; publisher: string; fetched_at: string }>;
};

export function generateStaticParams() {
  const uniDir = path.join(process.cwd(), "public/data/universities");
  const folders = fs.readdirSync(uniDir);
  return routing.locales.flatMap((locale) => folders.map((slug) => ({ locale, slug })));
}

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("universityDetail");
  const tCommon = await getTranslations("common");
  const tLevels = await getTranslations("levels");
  const tProgram = await getTranslations("programDetail");

  const uniDir = path.join(process.cwd(), "public/data/universities", slug);
  const infoPath = path.join(uniDir, "info.json");

  if (!fs.existsSync(infoPath)) {
    return (
      <div className="bg-white py-[83px] text-center font-sans text-[#242927]">
        <h1 className="text-[21px] font-bold">{tProgram("universityNotFound")}</h1>
        <Link href="/universities" className="mt-[16px] inline-block text-[14px] underline">
          <span className="inline-block rtl:-scale-x-100">&larr;</span> {tProgram("backToUniversities")}
        </Link>
      </div>
    );
  }

  const info: Info = JSON.parse(fs.readFileSync(infoPath, "utf-8"));

  // institutions.json is built programmatically and is guaranteed to have a
  // real name/abbr for all 96 universities, unlike the scraped info.json
  // files (which drifted across passes: some use `name`, others `university`,
  // and a few omit it entirely). Prefer it as the source of truth for identity.
  const institutionsPath = path.join(process.cwd(), "public/data/institutions.json");
  const institutionsList = JSON.parse(fs.readFileSync(institutionsPath, "utf-8")).institutions as Array<{
    slug: string;
    name: string;
    name_ar?: string;
    name_zh?: string;
    abbr: string;
  }>;
  const canonical = institutionsList.find((i) => i.slug === slug);

  const displayName = locale === "ar" ? (canonical?.name_ar || canonical?.name || info.name || info.university || slug)
    : locale === "zh" ? (canonical?.name_zh || canonical?.name || info.name || info.university || slug)
    : (canonical?.name || info.name || info.university || slug);
  const displayAbbr = canonical?.abbr || info.abbreviation || info.abbr || "";
  const image = getUniversityImage(slug);
  const coverPhoto = UNIVERSITY_PHOTOS[slug] ?? null;
  const gallery = getUniversityGallery(slug);

  const levels = detectLevels(slug);
  const levelPrograms = getProgramsByLevel(displayName, slug, levels);
  const stats = getUniversityStats(slug);
  const sourceCount = info.sources?.length ?? 0;
  const typeLabel = institutionTypeLabel(tCommon, info.type);

  const feeRangeText = stats.feeRange
    ? formatUsdRange(stats.feeRange.min, stats.feeRange.max, stats.feeRange.currency)
    : null;

  const levelList =
    levels.length > 0
      ? ` (${levels.map((l) => (LEVEL_LABEL_KEYS[l] ? tLevels(LEVEL_LABEL_KEYS[l] as "foundation") : l)).join(", ")})`
      : "";
  const programmesClause =
    stats.totalPrograms > 0
      ? t("aboutProgrammesCount", { count: stats.totalPrograms })
      : t("aboutProgrammesFallback");
  const stateClause = info.state ? t("aboutBasedIn", { state: info.state }) : t("aboutInMalaysia");

  return (
    <InstitutionDetail
      backHref="/universities"
      backLabel={tProgram("backToUniversities")}
      coverPhoto={coverPhoto}
      avatarUrl={image?.url ?? null}
      avatarAlt={displayName}
      avatarFallback={displayAbbr}
      avatarFit={image?.kind === "logo" ? "contain" : "cover"}
      badgeLabel={typeLabel}
      title={displayName}
      abbr={displayAbbr || undefined}
      meta={[
        ...(info.state ? [{ icon: MapPin, text: info.state }] : []),
        ...(info.website
          ? [{ text: info.website.replace(/^https?:\/\//, ""), href: info.website }]
          : []),
      ]}
      applyLabel={tProgram("applyThroughUs")}
      stats={[
        { icon: GraduationCap, value: stats.totalPrograms || "—", label: t("programmes") },
        { icon: Layers, value: levels.length || "—", label: t("studyLevels") },
        { icon: Wallet, value: feeRangeText ?? "—", label: t("feeRangeSample") },
        { icon: BadgeCheck, value: typeLabel, label: t("institutionType") },
      ]}
      aboutLabel={t("about")}
      aboutText={
        <>
          {t("aboutText", {
            name: displayName,
            type: typeLabel.toLowerCase(),
            stateClause,
            programmesClause,
            levelCount: levels.length,
            levelList,
          })}{" "}
          {info.website && (
            <>
              {t("visitWebsite")}{" "}
              <a href={info.website} target="_blank" rel="noopener noreferrer" className="underline">
                {info.website.replace(/^https?:\/\//, "")}
              </a>{" "}
              {t("visitWebsiteSuffix")}
            </>
          )}
        </>
      }
      sourcesNote={sourceCount > 0 ? t("sourcesNote", { count: sourceCount }) : undefined}
      gallery={gallery}
      galleryLabel={t("gallery")}
      galleryCaption={t("galleryCaptionSpecific")}
      contentLabel={t("programmes")}
      ctaPhotoLeft={gallery.length >= 2 ? gallery[0] : null}
      ctaPhotoRight={gallery.length >= 2 ? gallery[gallery.length > 2 ? 2 : 1] : null}
      ctaBadgeLabel={tCommon("freeConsultation")}
      ctaTitle={
        <>
          {t("readyToApplyTo")}
          <br />
          {displayName}?
        </>
      }
      ctaPillLabel={tCommon("talkToUs")}
    >
      <UniversityProgramsExplorer slug={slug} levels={levelPrograms} />
    </InstitutionDetail>
  );
}
