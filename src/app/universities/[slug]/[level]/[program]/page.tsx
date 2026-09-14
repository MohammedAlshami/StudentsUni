import fs from "fs";
import path from "path";
import Link from "next/link";
import { BadgeCheck, Calendar, Clock, GraduationCap, ShieldCheck, Wallet } from "lucide-react";
import { wrap, Label, Pill } from "@/components/marketing-ui";

const LEVEL_LABELS: Record<string, string> = {
  foundation: "Foundation",
  "pre-university": "Pre-University",
  "pre-university-foundation-studies": "Pre-University / Foundation",
  diploma: "Diploma",
  "advanced-diploma": "Advanced Diploma",
  bachelor: "Bachelor's Degree",
  "bachelors-degree": "Bachelor's Degree",
  master: "Master's Degree",
  "masters-degree": "Master's Degree",
  phd: "PhD",
  "doctoral-degree": "PhD / Doctoral Degree",
  certificate: "Certificate",
  language: "Language Program",
};

type ProgramDetail = {
  university: string;
  university_slug: string;
  level: string;
  program_name: string;
  field: string;
  duration: string | null;
  mode: string | null;
  intakes: string[];
  fees: {
    currency: string;
    local_total: number | null;
    international_total: number | null;
    per_year_local: number | null;
    per_year_international: number | null;
    notes: string;
  };
  requirements: {
    malaysian: {
      spm: string | null;
      stpm: string | null;
      foundation_matriculation: string | null;
      diploma_pathway: string | null;
    };
    international: {
      a_level: string | null;
      ib: string | null;
      other_qualifications: string | null;
      english_requirement: string | null;
    };
  };
  accreditation: {
    mqa_status: string | null;
    mqa_ref: string | null;
  };
  confidence: string;
};

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-[16px] border-b border-black/10 py-[12px] text-[14px]">
      <span className="text-black/50">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string; level: string; program: string }>;
}) {
  const { slug, level, program } = await params;
  const programPath = path.join(
    process.cwd(),
    "public/data/universities",
    slug,
    level,
    `${program}.json`
  );

  if (!fs.existsSync(programPath)) {
    return (
      <div className="bg-white py-[83px] text-center font-sans text-[#242927]">
        <h1 className="text-[21px] font-bold">Program not found</h1>
        <Link href={`/universities/${slug}`} className="mt-[16px] inline-block text-[14px] underline">
          &larr; Back to university
        </Link>
      </div>
    );
  }

  const prog: ProgramDetail = JSON.parse(fs.readFileSync(programPath, "utf-8"));
  const fee = prog.fees;
  const hasFees = fee.local_total || fee.international_total || fee.per_year_local || fee.per_year_international;
  const hasMalaysianReq = Object.values(prog.requirements.malaysian).some(Boolean);
  const hasIntlReq = Object.values(prog.requirements.international).some(Boolean);

  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Header */}
      <div className="bg-[#285b50] text-white">
        <div className={`${wrap} py-[42px]`}>
          <div className="flex flex-wrap items-center gap-[6px] text-[12px] text-white/60">
            <Link href="/universities" className="hover:underline">
              Universities
            </Link>
            <span>/</span>
            <Link href={`/universities/${slug}`} className="hover:underline">
              {prog.university}
            </Link>
            <span>/</span>
            <span className="text-white/85">{prog.program_name}</span>
          </div>

          <Label>
            {LEVEL_LABELS[prog.level] ?? prog.level}
            {prog.field ? ` · ${prog.field}` : ""}
          </Label>
          <h1 className="max-w-[750px] text-[29px] font-bold leading-[1.05] tracking-[-.03em] md:text-[36px]">
            {prog.program_name}
          </h1>

          <div className="mt-[21px] flex flex-wrap gap-[21px] text-[14px] text-white/75">
            {prog.duration && (
              <span className="flex items-center gap-[6px]">
                <Clock size={14} /> {prog.duration}
              </span>
            )}
            {prog.mode && (
              <span className="flex items-center gap-[6px]">
                <GraduationCap size={14} /> {prog.mode}
              </span>
            )}
            {prog.intakes.length > 0 && (
              <span className="flex items-center gap-[6px]">
                <Calendar size={14} /> Intakes: {prog.intakes.join(", ")}
              </span>
            )}
          </div>

          <div className="mt-[26px]">
            <Pill white>Apply Through Us</Pill>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${wrap} grid grid-cols-1 gap-[42px] py-[42px] lg:grid-cols-3`}>
        {/* Main */}
        <div className="space-y-[34px] lg:col-span-2">
          {/* Fees */}
          <section>
            <h2 className="flex items-center gap-[8px] border-b border-black/10 pb-[10px] text-[19px] font-bold">
              <Wallet size={18} className="text-[#285b50]" /> Fees
            </h2>
            <div className="mt-[10px]">
              <Fact
                label="Local students (Total)"
                value={fee.local_total ? `${fee.currency} ${fee.local_total.toLocaleString()}` : null}
              />
              <Fact
                label="International students (Total)"
                value={fee.international_total ? `${fee.currency} ${fee.international_total.toLocaleString()}` : null}
              />
              <Fact
                label="Local students (Per Year)"
                value={fee.per_year_local ? `${fee.currency} ${fee.per_year_local.toLocaleString()}` : null}
              />
              <Fact
                label="International students (Per Year)"
                value={
                  fee.per_year_international ? `${fee.currency} ${fee.per_year_international.toLocaleString()}` : null
                }
              />
              {fee.notes && <p className="mt-[10px] text-[12px] italic text-black/50">{fee.notes}</p>}
              {!hasFees && (
                <p className="py-[12px] text-[13px] text-black/40">Fee information is being collected.</p>
              )}
            </div>
          </section>

          {/* Requirements */}
          <section>
            <h2 className="flex items-center gap-[8px] border-b border-black/10 pb-[10px] text-[19px] font-bold">
              <BadgeCheck size={18} className="text-[#285b50]" /> Entry Requirements
            </h2>
            <div className="mt-[16px] grid gap-[26px] sm:grid-cols-2">
              <div>
                <p className="mb-[6px] text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
                  Malaysian Qualifications
                </p>
                <Fact label="SPM" value={prog.requirements.malaysian.spm} />
                <Fact label="STPM" value={prog.requirements.malaysian.stpm} />
                <Fact label="Foundation / Matriculation" value={prog.requirements.malaysian.foundation_matriculation} />
                <Fact label="Diploma Pathway" value={prog.requirements.malaysian.diploma_pathway} />
                {!hasMalaysianReq && <p className="py-[12px] text-[13px] text-black/40">Not yet available.</p>}
              </div>
              <div>
                <p className="mb-[6px] text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
                  International Qualifications
                </p>
                <Fact label="A-Levels" value={prog.requirements.international.a_level} />
                <Fact label="IB" value={prog.requirements.international.ib} />
                <Fact label="Other" value={prog.requirements.international.other_qualifications} />
                <Fact label="English Requirement" value={prog.requirements.international.english_requirement} />
                {!hasIntlReq && <p className="py-[12px] text-[13px] text-black/40">Not yet available.</p>}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-[16px]">
          <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
            <p className="flex items-center gap-[6px] text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
              <ShieldCheck size={14} /> Accreditation
            </p>
            <p className="mt-[8px] text-[15px] font-semibold">{prog.accreditation.mqa_status ?? "Unknown"}</p>
          </div>

          <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
            <p className="text-[12px] font-bold uppercase tracking-[.08em] text-black/50">Data Confidence</p>
            <p className="mt-[8px] text-[15px] font-semibold capitalize">{prog.confidence}</p>
          </div>

          <div className="border border-black/10 bg-[#285b50] p-[21px] text-white">
            <p className="text-[12px] font-bold uppercase tracking-[.08em] text-white/60">Need Help Applying?</p>
            <p className="mt-[8px] text-[13px] leading-relaxed text-white/80">
              We provide free consultation and application assistance, from shortlisting to registration.
            </p>
            <div className="mt-[16px]">
              <Pill white>Contact Us</Pill>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
