import fs from "fs";
import path from "path";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import ProgramsClient from "@/components/programs-client";
import { wrap, Pic, Label, Heading, Pill } from "@/components/marketing-ui";
import { normalizeProgramsList, entrySlug, entryFallbackName, entryField } from "@/lib/university-detail";

type ProgramRow = {
  university: string;
  university_slug: string;
  level: string;
  name: string;
  slug: string;
  field: string;
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=85";
const CTA_IMG_1 =
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80";
const CTA_IMG_2 =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80";

function loadPrograms(): ProgramRow[] {
  const uniDir = path.join(process.cwd(), "public/data/universities");
  const universities = fs.readdirSync(uniDir);
  const allPrograms: ProgramRow[] = [];

  const institutionsPath = path.join(process.cwd(), "public/data/institutions.json");
  const institutionsList: Array<{ slug: string; name: string }> = JSON.parse(
    fs.readFileSync(institutionsPath, "utf-8")
  ).institutions;
  const nameBySlug = new Map(institutionsList.map((i) => [i.slug, i.name]));

  for (const uniSlug of universities) {
    const uniPath = path.join(uniDir, uniSlug);
    const infoPath = path.join(uniPath, "info.json");

    let uniName = nameBySlug.get(uniSlug) || uniSlug;
    if (!nameBySlug.get(uniSlug) && fs.existsSync(infoPath)) {
      const info = JSON.parse(fs.readFileSync(infoPath, "utf-8"));
      uniName = info.name ?? info.university ?? uniSlug;
    }

    const levels = fs
      .readdirSync(uniPath, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== "_meta")
      .map((e) => e.name)
      .filter((name) => fs.existsSync(path.join(uniPath, name, "index.json")));

    for (const level of levels) {
      const indexPath = path.join(uniPath, level, "index.json");
      const raw = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      const programs = normalizeProgramsList(raw);

      for (const prog of programs) {
        const slug = entrySlug(prog);
        if (!slug) continue;
        allPrograms.push({
          university: uniName,
          university_slug: uniSlug,
          level,
          name: entryFallbackName(prog, slug),
          slug,
          field: entryField(prog),
        });
      }
    }
  }

  return allPrograms;
}

export default function ProgramsPage() {
  const allPrograms = loadPrograms();
  const universityCount = new Set(allPrograms.map((p) => p.university_slug)).size;

  return (
    <div className="bg-white font-sans text-[#242927]">
      <div
        className="flex h-[762px] items-center bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(10,45,36,.82),rgba(10,45,36,.42)),url(${HERO_IMG})`,
        }}
      >
        <div className={wrap}>
          <Label>Browse Programmes</Label>
          <h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">
            Find the programme<br />that fits your future.
          </h1>
          <p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed text-white/80">
            {allPrograms.length.toLocaleString()} programmes across {universityCount} Malaysian
            universities, from foundation to PhD.
          </p>
        </div>
      </div>
      <Suspense fallback={null}>
        <ProgramsClient programs={allPrograms} />
      </Suspense>

      {/* Consultation CTA */}
      <div className="bg-[#f5efeb] py-[83px]">
        <div className={wrap}>
          <div className="mx-auto mb-[21px] grid h-[52px] w-[52px] place-items-center rounded-full border-[3px] border-[#285b50] text-[#285b50]">
            <ArrowUpRight size={25} />
          </div>
          <div className="grid grid-cols-[130px_1fr_130px] items-center gap-[16px] bg-white p-[26px] text-center md:grid-cols-[237px_1fr_231px] md:gap-[26px] md:p-[42px]">
            <Pic src={CTA_IMG_1} className="h-[220px] w-full md:h-[270px]" />
            <div>
              <Label>Free consultation</Label>
              <Heading className="text-[29px] md:text-[36px]">
                Not sure which
                <br />
                programme fits you?
              </Heading>
              <p className="mx-auto mt-[16px] max-w-[380px] text-[14px] leading-relaxed text-black/60">
                Talk to a StudentsUni counsellor and get a shortlist matched to your grades, budget, and goals.
              </p>
              <div className="mt-[21px]">
                <Pill>Talk to us</Pill>
              </div>
            </div>
            <Pic src={CTA_IMG_2} className="h-[220px] w-full md:h-[270px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
