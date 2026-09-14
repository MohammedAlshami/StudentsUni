import { BadgeCheck, Globe2, HeartHandshake, ArrowUpRight } from "lucide-react";
import { wrap, Pic, Label, Heading, Pill } from "@/components/marketing-ui";

const HERO_IMG =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85";
const STORY_IMG =
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80";
const TEAM_IMGS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
];
const CTA_IMG_1 =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80";
const CTA_IMG_2 =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80";

const TEAM = [
  { name: "Counselor 1", role: "Senior Education Counselor" },
  { name: "Counselor 2", role: "University Relations Manager" },
  { name: "Counselor 3", role: "Student Support Specialist" },
];

const MILESTONES = [
  { year: "2020", event: "Founded" },
  { year: "2021", event: "Helped first 100 students" },
  { year: "2023", event: "Partnered with 30+ universities" },
  { year: "2025", event: "Expanded to 96 university listings" },
];

const MISSION = [
  {
    icon: BadgeCheck,
    title: "Transparency",
    desc: "Accurate, sourced data on fees, requirements, and accreditation.",
  },
  {
    icon: Globe2,
    title: "Accessibility",
    desc: "Free tools and consultation for every student.",
  },
  {
    icon: HeartHandshake,
    title: "Guidance",
    desc: "Personal support from first inquiry to enrollment.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Hero */}
      <div
        className="flex h-[762px] items-center bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(10,45,36,.82),rgba(10,45,36,.42)),url(${HERO_IMG})`,
        }}
      >
        <div className={wrap}>
          <Label>Who we are</Label>
          <h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">
            Helping students find<br />their right fit.
          </h1>
          <p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed text-white/80">
            We help students find and enroll in the right university in Malaysia — free,
            transparent, and student-first.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="py-[83px]">
        <div className={`${wrap} grid grid-cols-1 items-center gap-[52px] md:grid-cols-2`}>
          <div>
            <Label>Our story</Label>
            <Heading>A single place for every option.</Heading>
            <p className="mt-[21px] text-[16px] leading-relaxed text-black/60">
              StudentsUni was created to simplify the university search and application process
              for students in Malaysia. We noticed that finding the right program — with accurate
              fees, requirements, and accreditation info — was unnecessarily difficult.
            </p>
            <p className="mt-[16px] text-[16px] leading-relaxed text-black/60">
              Our platform aggregates data from official university sources and recognized
              education portals, giving students a single place to compare options and make
              informed decisions.
            </p>
            <p className="mt-[16px] text-[16px] leading-relaxed text-black/60">
              Beyond the website, we offer free consultation services to guide students through
              the application and enrollment process.
            </p>
          </div>
          <Pic src={STORY_IMG} className="h-[420px] w-full" />
        </div>
      </div>

      {/* Mission */}
      <div className="bg-[#f5efeb] py-[83px]">
        <div className={wrap}>
          <div className="text-center">
            <Label>What drives us</Label>
            <Heading>Our mission</Heading>
          </div>
          <div className="mt-[42px] grid grid-cols-1 gap-[26px] sm:grid-cols-3">
            {MISSION.map((item) => (
              <div key={item.title} className="border border-black/10 bg-white p-[26px] text-center">
                <item.icon size={28} className="mx-auto text-[#285b50]" />
                <p className="mt-[16px] text-[16px] font-bold">{item.title}</p>
                <p className="mt-[8px] text-[13px] leading-relaxed text-black/55">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-[83px]">
        <div className={wrap}>
          <div className="text-center">
            <Label>Meet the team</Label>
            <Heading>Our counsellors</Heading>
          </div>
          <div className="mt-[42px] grid grid-cols-1 gap-[26px] sm:grid-cols-3">
            {TEAM.map((member, i) => (
              <div key={member.name} className="border border-black/10 bg-white p-[26px] text-center">
                <img
                  src={TEAM_IMGS[i]}
                  alt={member.name}
                  className="mx-auto h-[84px] w-[84px] rounded-full object-cover"
                />
                <p className="mt-[16px] text-[15px] font-bold">{member.name}</p>
                <p className="mt-[4px] text-[13px] text-black/50">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[#f5efeb] py-[83px]">
        <div className={wrap}>
          <div className="text-center">
            <Label>Since 2020</Label>
            <Heading>Our journey</Heading>
          </div>
          <div className="mt-[42px] flex justify-center">
            <div className="space-y-[16px]">
              {MILESTONES.map((m) => (
                <div key={m.year} className="flex items-center gap-[16px]">
                  <span className="w-[48px] text-right text-[15px] font-bold text-[#285b50]">
                    {m.year}
                  </span>
                  <div className="h-px w-[16px] bg-black/20" />
                  <span className="text-[15px]">{m.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-[83px]">
        <div className={wrap}>
          <div className="mx-auto mb-[21px] grid h-[52px] w-[52px] place-items-center rounded-full border-[3px] border-[#285b50] text-[#285b50]">
            <ArrowUpRight size={25} />
          </div>
          <div className="grid grid-cols-[130px_1fr_130px] items-center gap-[16px] bg-[#f5efeb] p-[26px] text-center md:grid-cols-[237px_1fr_231px] md:gap-[26px] md:p-[42px]">
            <Pic src={CTA_IMG_1} className="h-[220px] w-full md:h-[270px]" />
            <div>
              <Label>Get in touch</Label>
              <Heading className="text-[29px] md:text-[36px]">
                Want to work
                <br />
                with us?
              </Heading>
              <div className="mt-[21px]">
                <Pill href="/contact">Get in Touch</Pill>
              </div>
            </div>
            <Pic src={CTA_IMG_2} className="h-[220px] w-full md:h-[270px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
