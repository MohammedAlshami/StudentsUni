import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CalendarDays, Check, Clock, GraduationCap, Landmark, Search, ShieldCheck, Users } from "lucide-react";
import { wrap, Pic, Label, Pill, Heading } from "@/components/marketing-ui";
import { MarqueeStrip } from "@/components/marquee-strip";
import { FeaturedUniversities, type FeaturedUniversity } from "@/components/featured-universities";
import { FEATURED_UNIVERSITY_SLUGS } from "@/lib/university-images";

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;
const p = { hero:u("photo-1564981797816-1043664bf78d"), graduates:u("photo-1523580846011-d3a5bc25702b"), woman:u("photo-1494790108377-be9c29b29330"), student:u("photo-1524504388940-b1c1722653e1"), arts:u("photo-1509062522246-3755977927d7"), science:u("photo-1532094349884-543bc11b234d"), business:u("photo-1521737711867-e3b97375f902"), students:u("photo-1523240795612-9a054b0db644"), campus:u("photo-1541339907198-e08756dedf3f"), speaker:u("photo-1560250097-0b93528c311a"), building:u("photo-1562774053-701939374585") };

const FIELDS = [
  { name: "Arts & Humanities", query: "arts", img: p.arts },
  { name: "Sciences & Technology", query: "science", img: p.science },
  { name: "Business & Economics", query: "business", img: p.business },
];

const FAQS = [
  {
    q: "Is StudentsUni actually free to use?",
    a: "Yes. Browsing universities, comparing programmes, and getting consultation from our counsellors is free for students. We work with universities and don't charge students for guidance.",
  },
  {
    q: "How accurate and up to date is your fee and requirement data?",
    a: "We compile programme data from official university sources and recognised education portals, cross-checking where possible. Fees and requirements change yearly, so we always recommend confirming final figures directly with the university before you apply.",
  },
  {
    q: "Do you help with the actual application, not just comparisons?",
    a: "Yes. Beyond browsing, our counsellors help with shortlisting, document preparation, and application submission. Book a free consultation and we'll walk you through it.",
  },
  {
    q: "Do you only cover public universities, or private ones too?",
    a: "Both. Our directory includes public universities, private universities, and private university colleges across Malaysia, so you can compare across all of them in one place.",
  },
];

function getFeaturedUniversities(): FeaturedUniversity[] {
  const dataPath = path.join(process.cwd(), "public/data/institutions.json");
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const bySlug = new Map(raw.institutions.map((i: FeaturedUniversity) => [i.slug, i]));
  return FEATURED_UNIVERSITY_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (i): i is FeaturedUniversity => Boolean(i)
  );
}

type BlogPostSummary = {
  slug: string;
  title: string;
  category: string;
  coverImage: string;
  date: string;
  readTimeMin: number;
  excerpt: string;
};

function getLatestPosts(count: number): BlogPostSummary[] {
  const indexPath = path.join(process.cwd(), "public/data/blog/index.json");
  const raw = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  return raw.posts.slice(0, count);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export default function Home() {
  const featured = getFeaturedUniversities();
  const latestPosts = getLatestPosts(3);
  return <main className="overflow-x-hidden bg-[#f5efeb] font-sans text-[#242927]">
  <section className="relative flex h-[762px] items-center bg-cover bg-center text-white" style={{backgroundImage:`linear-gradient(90deg,rgba(10,45,36,.58),rgba(10,45,36,.08)),url(${p.hero})`}}>
    <div className={wrap}><h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">Find your place at a<br/>Malaysian university.</h1><p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed">Compare programmes, check entry requirements, and get free guidance from application to registration.</p><form action="/universities" className="mt-[31px] flex max-w-[749px] overflow-hidden rounded-full bg-white p-[5px] text-[#242927] shadow-xl"><Search className="ml-[16px] self-center text-[#285b50]" size={26}/><input name="q" aria-label="Search universities or programmes" placeholder="Search universities or programmes" className="min-w-0 flex-1 px-[16px] py-[10px] text-[18px] outline-none"/><button className="rounded-full bg-[#285b50] px-[26px] text-[16px] font-bold uppercase tracking-wide text-white">Search</button></form></div>
    <MarqueeStrip text="Your pathway to higher education in Malaysia." />
  </section>
  <section className="py-[62px] md:py-[83px]"><div className={wrap}><div className="flex items-start justify-between gap-[21px]"><div><Label>Featured universities</Label><Heading>A closer look at where<br/>students are heading.</Heading></div><Pill href="/universities">All universities</Pill></div><FeaturedUniversities items={featured} /></div></section>
  <section className="bg-[#285b50] py-[52px] text-white"><div className={`${wrap} grid grid-cols-2 gap-[31px] md:grid-cols-[169px_1fr_130px_130px]`}><Pic src={p.graduates} className="h-[250px] w-full md:h-[291px]"/><div><Label>Your Malaysia study partner</Label><Heading className="text-[33px] md:text-[39px]">The right university starts with the right guidance.</Heading><p className="mt-[21px] max-w-[499px] text-[18px] leading-relaxed text-white/80">We make university registration clearer with trusted programme information and experienced education counsellors.</p></div><Stat n="96" t="Malaysian universities to explore"/><Stat n="4,000+" t="Programmes and pathways listed"/><Pic src={p.student} className="col-start-2 h-[229px] w-[208px] md:h-[250px]"/></div><div className={`${wrap} mt-[42px] flex flex-wrap justify-between gap-[26px] text-[18px] font-bold text-white/85`}><span className="flex items-center gap-[10px]"><Landmark size={22}/> University options</span><span className="flex items-center gap-[10px]"><BadgeCheck size={22}/> Trusted guidance</span><span className="flex items-center gap-[10px]"><Users size={22}/> Student-first support</span></div></section>
  <section className="py-[62px] md:py-[83px]"><div className={wrap}><SectionTop label="Explore study options" title={<>Find the right programme<br/>for your next step.</>} href="/programs" cta="Browse all programmes"/><div className="mt-[42px] grid gap-[26px] md:grid-cols-3">{FIELDS.map((field)=><Link href={`/programs?q=${field.query}`} className="group block bg-white pb-[26px]" key={field.name}><Pic src={field.img} className="h-[187px] w-full"/><h3 className="mt-[21px] px-[21px] text-[21px] font-bold group-hover:underline">{field.name}</h3><p className="mt-[10px] px-[21px] text-[18px] leading-relaxed text-black/60">Compare university programmes, entry requirements, tuition fees, and intakes.</p><small className="mt-[21px] flex items-center gap-[5px] px-[21px] text-[16px] font-bold"><BadgeCheck size={18}/> Guided application support</small></Link>)}</div></div></section>
  <section className="py-[62px] md:py-[104px]"><div className={`${wrap} grid items-center gap-[52px] md:grid-cols-2 md:gap-[104px]`}><div className="grid h-[333px] grid-cols-[1fr_1.45fr] grid-rows-2 gap-[10px]"><Pic src={p.woman} className="row-span-2 h-full w-full"/><Pic src={p.students} className="h-full w-full"/><Pic src={p.campus} className="h-full w-full"/></div><div><Label>Why choose us?</Label><Heading>Straightforward guidance, not a sales pitch.</Heading><p className="mt-[26px] text-[18px] leading-relaxed text-black/60">We compile programme data straight from official university sources so you can compare fees, requirements, and accreditation without digging through 96 different websites, then get free, personal guidance from application to registration.</p><ul className="my-[26px] space-y-[10px] text-[18px] font-bold"><li className="flex gap-[10px]"><Check size={22}/>96 universities, one place to compare</li><li className="flex gap-[10px]"><Check size={22}/>Free consultation, no hidden fees</li></ul><Pill href="/contact">Talk to us</Pill></div></div></section>
  <section className="border-t border-black/10 py-[62px] md:py-[83px]"><div className={`${wrap} grid gap-[52px] md:grid-cols-[299px_1fr] md:gap-[104px]`}><div><Label>Student stories</Label><Heading>Confident choices<br/>start with trusted<br/>support.</Heading></div><blockquote className="border-l border-black/15 pl-[31px]"><Label>A clearer path forward</Label><p className="text-[23px] font-semibold leading-relaxed">&ldquo;StudentsUni made it easy to compare my options and understand each application requirement. My counsellor was there at every step until I registered.&rdquo;</p><footer className="mt-[36px] flex items-center gap-[10px] text-[18px] font-bold"><Users size={22}/> Aina R.<small className="ml-[10px] text-black/55">Undergraduate applicant</small></footer></blockquote></div></section>
  <section className="pb-[62px]"><div className={wrap}><div className="mx-auto mb-[21px] grid h-[52px] w-[52px] place-items-center rounded-full border-[3px] border-[#285b50] text-[#285b50]"><ArrowUpRight size={25}/></div><div className="grid h-[270px] grid-cols-[130px_1fr_130px] items-center bg-white text-center md:grid-cols-[237px_1fr_231px]"><Pic src={p.graduates} className="h-[270px] w-full"/><div><Label>Free consultation</Label><Heading className="text-[29px] md:text-[36px]">Your Malaysian university<br/>journey starts here.</Heading><div className="mt-[21px]"><Pill href="/contact">Talk to us</Pill></div></div><Pic src={p.student} className="h-[270px] w-full"/></div></div></section>
  <section className="bg-white py-[62px]"><div className={wrap}><SectionTop label="From the blog" title={<>Guides to help you<br/>decide with confidence.</>} href="/blog" cta="All articles"/><div className="mt-[42px] grid gap-[26px] md:grid-cols-3">{latestPosts.map((post)=><Link key={post.slug} href={`/blog/${post.slug}`} className="group block border border-black/10 bg-white transition-colors hover:border-[#285b50]"><Pic src={post.coverImage} className="h-[187px] w-full border-b border-black/10"/><div className="p-[21px]"><p className="text-[12px] font-bold uppercase tracking-[.08em] text-[#285b50]">{post.category}</p><h3 className="mt-[8px] text-[17px] font-bold leading-snug group-hover:underline">{post.title}</h3><p className="mt-[10px] text-[13px] leading-relaxed text-black/55 line-clamp-3">{post.excerpt}</p><div className="mt-[16px] flex items-center gap-[16px] border-t border-black/10 pt-[16px] text-[12px] text-black/50"><span className="flex items-center gap-[5px]"><CalendarDays size={12}/> {formatDate(post.date)}</span><span className="flex items-center gap-[5px]"><Clock size={12}/> {post.readTimeMin} min read</span></div></div></Link>)}</div></div></section>
  <section className="py-[62px]"><div className={wrap}><div className="text-center"><Label>Find an answer</Label><Heading>Answers to your questions, every<br/>step of the way.</Heading></div><div className="mt-[52px] grid gap-[52px] md:grid-cols-[1fr_1.1fr]"><div className="grid grid-cols-1 gap-[10px]"><StatCard icon={GraduationCap} n="96" t="Universities compared"/><StatCard icon={ShieldCheck} n="Free" t="Guidance, always"/></div><div>{FAQS.map((faq)=><div className="border-b border-black/15 py-[26px] text-[18px]" key={faq.q}><b>{faq.q}</b><p className="mt-[10px] max-w-[582px] text-[16px] leading-relaxed text-black/55">{faq.a}</p></div>)}</div></div></div></section>
</main> }
function Stat({n,t}:{n:string;t:string}) { return <div className="self-end border-t border-white/50 pt-[16px]"><strong className="block text-[31px]">{n}</strong><span className="mt-[5px] block text-[16px] leading-tight">{t}</span></div> }
function StatCard({icon:Icon,n,t}:{icon:React.ElementType;n:string;t:string}) { return <div className="flex h-[161px] flex-col justify-center bg-white px-[26px]"><Icon size={28} className="text-[#285b50]"/><strong className="mt-[16px] block text-[25px]">{n}</strong><span className="mt-[2px] block text-[14px] text-black/55">{t}</span></div> }
function SectionTop({label,title,href,cta}:{label:string;title:React.ReactNode;href:string;cta:string}) { return <div className="flex items-start justify-between gap-[21px]"><div><Label>{label}</Label><Heading>{title}</Heading></div><Pill href={href}>{cta}</Pill></div> }
