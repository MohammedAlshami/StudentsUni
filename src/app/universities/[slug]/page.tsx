import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, GraduationCap, Layers, MapPin, Wallet } from "lucide-react";
import { wrap, Pic, Label, Heading, Pill } from "@/components/marketing-ui";
import { getUniversityImage, getUniversityGallery, UNIVERSITY_PHOTOS } from "@/lib/university-images";
import { getUniversityStats } from "@/lib/university-stats";
import { detectLevels, getProgramsByLevel } from "@/lib/university-detail";
import { UniversityProgramsExplorer } from "@/components/university-programs-explorer";

const TYPE_LABELS: Record<string, string> = {
  "public-university": "Public University",
  "private-university": "Private University",
  "private-university-college": "Private University College",
};

const LEVEL_LABELS: Record<string, string> = {
  foundation: "Foundation",
  "pre-university": "Pre-University",
  diploma: "Diploma",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  phd: "PhD",
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
  return folders.map((slug) => ({ slug }));
}

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const uniDir = path.join(process.cwd(), "public/data/universities", slug);
  const infoPath = path.join(uniDir, "info.json");

  if (!fs.existsSync(infoPath)) {
    return (
      <div className="bg-white py-[83px] text-center font-sans text-[#242927]">
        <h1 className="text-[21px] font-bold">University not found</h1>
        <Link href="/universities" className="mt-[16px] inline-block text-[14px] underline">
          &larr; Back to universities
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
    abbr: string;
  }>;
  const canonical = institutionsList.find((i) => i.slug === slug);

  const displayName = canonical?.name || info.name || info.university || slug;
  const displayAbbr = canonical?.abbr || info.abbreviation || info.abbr || "";
  const image = getUniversityImage(slug);
  const coverPhoto = UNIVERSITY_PHOTOS[slug] ?? null;
  const gallery = getUniversityGallery(slug);
  const hasSpecificGallery = gallery.some((g) => g.specific);

  const levels = detectLevels(slug);
  const levelPrograms = getProgramsByLevel(displayName, slug, levels);
  const stats = getUniversityStats(slug);
  const sourceCount = info.sources?.length ?? 0;

  const feeRangeText = stats.feeRange
    ? stats.feeRange.min === stats.feeRange.max
      ? `${stats.feeRange.currency} ${stats.feeRange.min.toLocaleString()}`
      : `${stats.feeRange.currency} ${stats.feeRange.min.toLocaleString()} – ${stats.feeRange.max.toLocaleString()}`
    : null;

  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Header */}
      <div
        className="relative bg-[#285b50] bg-cover bg-center text-white"
        style={
          coverPhoto
            ? { backgroundImage: `linear-gradient(90deg,rgba(10,45,36,.82),rgba(10,45,36,.55)),url(${coverPhoto})` }
            : undefined
        }
      >
        <div className={`${wrap} pt-[125px] pb-[52px]`}>
          <Link href="/universities" className="text-[13px] text-white/60 hover:underline">
            &larr; All Universities
          </Link>
          <div className="mt-[26px] flex flex-col gap-[26px] md:flex-row md:items-center">
            <div className="flex h-[104px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
              {image ? (
                <img
                  src={image.url}
                  alt={displayName}
                  className={image.kind === "logo" ? "h-[70%] w-[70%] object-contain" : "h-full w-full object-cover"}
                />
              ) : (
                <span className="text-[25px] font-bold text-[#285b50]">{displayAbbr}</span>
              )}
            </div>
            <div className="flex-1">
              <Label>{TYPE_LABELS[info.type] ?? info.type}</Label>
              <h1 className="text-[36px] font-bold leading-[.98] tracking-[-.04em] md:text-[42px]">
                {displayName}
                {displayAbbr && (
                  <span className="ml-[11px] text-[18px] font-normal text-white/50">({displayAbbr})</span>
                )}
              </h1>
              <div className="mt-[16px] flex flex-wrap items-center gap-[21px] text-[14px] text-white/70">
                {info.state && (
                  <span className="flex items-center gap-[6px]">
                    <MapPin size={14} /> {info.state}
                  </span>
                )}
                {info.website && (
                  <a
                    href={info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                  >
                    {info.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
            <Pill white>Apply Through Us</Pill>
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className="border-b border-black/10 bg-[#f5efeb]">
        <div className={`${wrap} grid grid-cols-2 gap-[21px] py-[26px] sm:grid-cols-4`}>
          <div className="flex items-center gap-[10px]">
            <GraduationCap size={20} className="shrink-0 text-[#285b50]" />
            <div>
              <p className="text-[16px] font-bold leading-none">{stats.totalPrograms || "—"}</p>
              <p className="mt-[4px] text-[12px] text-black/55">Programmes</p>
            </div>
          </div>
          <div className="flex items-center gap-[10px]">
            <Layers size={20} className="shrink-0 text-[#285b50]" />
            <div>
              <p className="text-[16px] font-bold leading-none">{levels.length || "—"}</p>
              <p className="mt-[4px] text-[12px] text-black/55">Study levels</p>
            </div>
          </div>
          <div className="flex items-center gap-[10px]">
            <Wallet size={20} className="shrink-0 text-[#285b50]" />
            <div>
              <p className="text-[16px] font-bold leading-none">{feeRangeText ?? "—"}</p>
              <p className="mt-[4px] text-[12px] text-black/55">Fee range (sample)</p>
            </div>
          </div>
          <div className="flex items-center gap-[10px]">
            <BadgeCheck size={20} className="shrink-0 text-[#285b50]" />
            <div>
              <p className="text-[16px] font-bold leading-none">{TYPE_LABELS[info.type] ?? info.type}</p>
              <p className="mt-[4px] text-[12px] text-black/55">Institution type</p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className={`${wrap} py-[42px]`}>
        <Label>About</Label>
        <p className="max-w-[750px] text-[16px] leading-relaxed text-black/70">
          {displayName} is a {(TYPE_LABELS[info.type] ?? info.type).toLowerCase()}
          {info.state ? ` based in ${info.state}, Malaysia` : " in Malaysia"}. We list{" "}
          {stats.totalPrograms > 0 ? `${stats.totalPrograms} programmes` : "programmes"} across{" "}
          {levels.length} study level{levels.length === 1 ? "" : "s"}
          {levels.length > 0 && ` (${levels.map((l) => LEVEL_LABELS[l] ?? l).join(", ")})`}.{" "}
          {info.website && (
            <>
              Visit the official website at{" "}
              <a href={info.website} target="_blank" rel="noopener noreferrer" className="underline">
                {info.website.replace(/^https?:\/\//, "")}
              </a>{" "}
              for admissions and campus details.
            </>
          )}
        </p>
        {sourceCount > 0 && (
          <p className="mt-[10px] text-[12px] text-black/40">
            Programme and fee data compiled from {sourceCount} source{sourceCount === 1 ? "" : "s"}, including
            the university&apos;s official site where available. Figures are indicative — always confirm with
            the university before applying.
          </p>
        )}
      </div>

      {/* Gallery */}
      <div className={`${wrap} pb-[42px]`}>
        <Label>Gallery</Label>
        <div className="grid grid-cols-2 gap-[10px] md:grid-cols-[1.45fr_1fr] md:grid-rows-2">
          <img
            src={gallery[0].url}
            alt={displayName}
            className="row-span-2 h-[220px] w-full object-cover md:h-full"
          />
          <img src={gallery[1].url} alt={displayName} className="h-[105px] w-full object-cover md:h-full" />
          <img src={gallery[2].url} alt={displayName} className="h-[105px] w-full object-cover md:h-full" />
        </div>
        <p className="mt-[10px] text-[11px] text-black/40">
          {hasSpecificGallery
            ? "Campus photos via Wikimedia Commons."
            : "Illustrative student-life photography — not specific to this campus."}
        </p>
      </div>

      {/* Programs by Level */}
      <div className={`${wrap} pb-[52px]`}>
        <Label>Programmes</Label>
        <UniversityProgramsExplorer slug={slug} levels={levelPrograms} />
      </div>

      {/* CTA */}
      <div className="bg-[#f5efeb] pb-[62px]">
        <div className={wrap}>
          <div className="mx-auto mb-[21px] grid h-[52px] w-[52px] place-items-center rounded-full border-[3px] border-[#285b50] text-[#285b50]">
            <ArrowUpRight size={25} />
          </div>
          <div className="grid h-[270px] grid-cols-[130px_1fr_130px] items-center bg-white text-center md:grid-cols-[237px_1fr_231px]">
            <Pic src={gallery[0].url} className="h-[270px] w-full" />
            <div>
              <Label>Free consultation</Label>
              <Heading className="text-[29px] md:text-[36px]">
                Ready to apply to
                <br />
                {displayName}?
              </Heading>
              <div className="mt-[21px]">
                <Pill>Talk to us</Pill>
              </div>
            </div>
            <Pic src={gallery[gallery.length > 2 ? 2 : 1].url} className="h-[270px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
