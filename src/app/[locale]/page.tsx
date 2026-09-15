import fs from "fs";
import path from "path";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ArrowUpRight, BadgeCheck, Briefcase, CalendarDays, Check, ClipboardList, Clock, Cog, Cpu, FlaskConical, GraduationCap, HeartPulse, Landmark, Palette, Scale, Search, SendHorizontal, ShieldCheck, Users } from "lucide-react";
import { wrap, Pic, Label, Pill, Heading } from "@/components/marketing-ui";
import { MarqueeStrip } from "@/components/marquee-strip";
import { FeaturedUniversities, type FeaturedUniversity } from "@/components/featured-universities";
import { FEATURED_UNIVERSITY_SLUGS } from "@/lib/university-images";
import { normalizeProgramsList } from "@/lib/university-detail";

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;
const p = { hero:u("photo-1564981797816-1043664bf78d"), graduates:u("photo-1523580846011-d3a5bc25702b"), woman:u("photo-1494790108377-be9c29b29330"), student:u("photo-1524504388940-b1c1722653e1"), students:u("photo-1523240795612-9a054b0db644"), campus:u("photo-1541339907198-e08756dedf3f") };

const FIELD_CATEGORIES = [
  { keyword: "business", icon: Briefcase },
  { keyword: "science", icon: FlaskConical },
  { keyword: "engineering", icon: Cog },
  { keyword: "comput", icon: Cpu },
  { keyword: "medic", icon: HeartPulse },
  { keyword: "education", icon: GraduationCap },
  { keyword: "design", icon: Palette },
  { keyword: "law", icon: Scale },
];

const HOW_WE_HELP_ICONS = [Search, ClipboardList, SendHorizontal];

function getFeaturedUniversities(): FeaturedUniversity[] {
  const dataPath = path.join(process.cwd(), "public/data/institutions.json");
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const bySlug = new Map(raw.institutions.map((i: FeaturedUniversity) => [i.slug, i]));
  return FEATURED_UNIVERSITY_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (i): i is FeaturedUniversity => Boolean(i)
  );
}

function getFieldCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cat of FIELD_CATEGORIES) counts[cat.keyword] = 0;

  const uniDir = path.join(process.cwd(), "public/data/universities");
  for (const uniSlug of fs.readdirSync(uniDir)) {
    const uniPath = path.join(uniDir, uniSlug);
    if (!fs.statSync(uniPath).isDirectory()) continue;
    for (const level of fs.readdirSync(uniPath)) {
      const indexPath = path.join(uniPath, level, "index.json");
      if (!fs.existsSync(indexPath)) continue;
      const raw = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      for (const prog of normalizeProgramsList(raw)) {
        if (typeof prog === "string") continue;
        const field = String(prog.field ?? "").toLowerCase();
        if (!field) continue;
        for (const cat of FIELD_CATEGORIES) {
          if (field.includes(cat.keyword)) counts[cat.keyword]++;
        }
      }
    }
  }
  return counts;
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

function formatDate(iso: string, locale: string): string {
  const localeMap: Record<string, string> = { en: "en-MY", ar: "ar", zh: "zh-CN" };
  return new Date(iso).toLocaleDateString(localeMap[locale] ?? "en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const featured = getFeaturedUniversities();
  const latestPosts = getLatestPosts(3);
  const fieldCounts = getFieldCounts();
  const howWeHelpSteps = t.raw("howWeHelp.steps") as Array<{ title: string; desc: string }>;
  const faqItems = t.raw("faq.items") as Array<{ q: string; a: string }>;
  return <main className="overflow-x-hidden bg-[#f5efeb] font-sans text-[#242927]">
  <section className="relative flex h-[762px] items-center bg-cover bg-center text-white" style={{backgroundImage:`linear-gradient(90deg,rgba(10,45,36,.58),rgba(10,45,36,.08)),url(${p.hero})`}}>
    <div className={wrap}><h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">{t("hero.titleLine1")}<br/>{t("hero.titleLine2")}</h1><p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed">{t("hero.subtitle")}</p><form action="/universities" className="mt-[31px] flex max-w-[749px] overflow-hidden rounded-full bg-white p-[5px] text-[#242927] shadow-xl"><Search className="ms-[16px] self-center text-[#285b50]" size={26}/><input name="q" aria-label={t("hero.searchPlaceholder")} placeholder={t("hero.searchPlaceholder")} className="min-w-0 flex-1 px-[16px] py-[10px] text-[18px] outline-none"/><button className="rounded-full bg-[#285b50] px-[26px] text-[16px] font-bold uppercase tracking-wide text-white">{t("hero.searchButton")}</button></form></div>
    <MarqueeStrip text={t("hero.marquee")} />
  </section>
  <section className="py-[62px] md:py-[83px]"><div className={wrap}><div className="flex items-start justify-between gap-[21px]"><div><Label>{t("featured.label")}</Label><Heading>{t("featured.titleLine1")}<br/>{t("featured.titleLine2")}</Heading></div><Pill href="/universities">{t("featured.cta")}</Pill></div><FeaturedUniversities items={featured} /></div></section>
  <section className="bg-white py-[62px] md:py-[83px]"><div className={wrap}><Label>{t("howWeHelp.label")}</Label><Heading>{t("howWeHelp.titleLine1")}<br/>{t("howWeHelp.titleLine2")}</Heading><div className="mt-[42px] grid gap-[26px] md:grid-cols-3">{howWeHelpSteps.map((step,i)=>{const Icon=HOW_WE_HELP_ICONS[i];return <div className="border border-black/10 p-[26px]" key={step.title}><div className="flex items-center gap-[16px]"><span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#285b50] text-[16px] font-bold text-white">{i+1}</span><Icon size={26} className="text-[#285b50]"/></div><h3 className="mt-[16px] text-[19px] font-bold">{step.title}</h3><p className="mt-[8px] text-[15px] leading-relaxed text-black/60">{step.desc}</p></div>})}</div></div></section>
  <section className="bg-[#285b50] py-[52px] text-white"><div className={`${wrap} grid grid-cols-2 gap-[31px] md:grid-cols-[169px_1fr_130px_130px]`}><Pic src={p.graduates} className="h-[250px] w-full md:h-[291px]"/><div><Label>{t("partner.label")}</Label><Heading className="text-[33px] md:text-[39px]">{t("partner.title")}</Heading><p className="mt-[21px] max-w-[499px] text-[18px] leading-relaxed text-white/80">{t("partner.desc")}</p></div><Stat n="96" t={t("partner.stat1")}/><Stat n="4,000+" t={t("partner.stat2")}/><Pic src={p.student} className="col-start-2 h-[229px] w-[208px] md:h-[250px]"/></div><div className={`${wrap} mt-[42px] flex flex-wrap justify-between gap-[26px] text-[18px] font-bold text-white/85`}><span className="flex items-center gap-[10px]"><Landmark size={22}/> {t("partner.tag1")}</span><span className="flex items-center gap-[10px]"><BadgeCheck size={22}/> {t("partner.tag2")}</span><span className="flex items-center gap-[10px]"><Users size={22}/> {t("partner.tag3")}</span></div></section>
  <section className="py-[62px] md:py-[83px]"><div className={wrap}><SectionTop label={t("fields.label")} title={<>{t("fields.titleLine1")}<br/>{t("fields.titleLine2")}</>} href="/programs" cta={t("fields.cta")}/><div className="mt-[42px] grid grid-cols-2 gap-[16px] sm:grid-cols-3 md:grid-cols-4">{FIELD_CATEGORIES.map((field)=><Link href={`/programs?q=${field.keyword}`} className="group block border border-black/10 bg-white p-[21px] transition-colors hover:border-[#285b50]" key={field.keyword}><field.icon size={26} className="text-[#285b50]"/><h3 className="mt-[16px] text-[15px] font-bold leading-tight group-hover:underline">{t(`fields.categories.${field.keyword}`)}</h3><p className="mt-[6px] text-[13px] text-black/50">{fieldCounts[field.keyword] ?? 0}+ {t("fields.programmesSuffix")}</p></Link>)}</div></div></section>
  <section className="py-[62px] md:py-[104px]"><div className={`${wrap} grid items-center gap-[52px] md:grid-cols-2 md:gap-[104px]`}><div className="grid h-[333px] grid-cols-[1fr_1.45fr] grid-rows-2 gap-[10px]"><Pic src={p.woman} className="row-span-2 h-full w-full"/><Pic src={p.students} className="h-full w-full"/><Pic src={p.campus} className="h-full w-full"/></div><div><Label>{t("why.label")}</Label><Heading>{t("why.title")}</Heading><p className="mt-[26px] text-[18px] leading-relaxed text-black/60">{t("why.desc")}</p><ul className="my-[26px] space-y-[10px] text-[18px] font-bold"><li className="flex gap-[10px]"><Check size={22}/>{t("why.bullet1")}</li><li className="flex gap-[10px]"><Check size={22}/>{t("why.bullet2")}</li></ul><Pill href="/contact">{tCommon("talkToUs")}</Pill></div></div></section>
  <section className="border-t border-black/10 py-[62px] md:py-[83px]"><div className={`${wrap} grid gap-[52px] md:grid-cols-[299px_1fr] md:gap-[104px]`}><div><Label>{t("stories.label")}</Label><Heading>{t("stories.titleLine1")}<br/>{t("stories.titleLine2")}<br/>{t("stories.titleLine3")}</Heading></div><blockquote className="border-s border-black/15 ps-[31px]"><Label>{t("stories.quoteLabel")}</Label><p className="text-[23px] font-semibold leading-relaxed">&ldquo;{t("stories.quote")}&rdquo;</p><footer className="mt-[36px] flex items-center gap-[10px] text-[18px] font-bold"><Users size={22}/> {t("stories.author")}<small className="ms-[10px] text-black/55">{t("stories.role")}</small></footer></blockquote></div></section>
  <section className="pb-[62px]"><div className={wrap}><div className="mx-auto mb-[21px] grid h-[52px] w-[52px] place-items-center rounded-full border-[3px] border-[#285b50] text-[#285b50]"><ArrowUpRight size={25} className="rtl:rotate-90"/></div><div className="grid h-[270px] grid-cols-[130px_1fr_130px] items-center bg-white text-center md:grid-cols-[237px_1fr_231px]"><Pic src={p.graduates} className="h-[270px] w-full"/><div><Label>{t("cta.label")}</Label><Heading className="text-[29px] md:text-[36px]">{t("cta.titleLine1")}<br/>{t("cta.titleLine2")}</Heading><div className="mt-[21px]"><Pill href="/contact">{tCommon("talkToUs")}</Pill></div></div><Pic src={p.student} className="h-[270px] w-full"/></div></div></section>
  <section className="bg-white py-[62px]"><div className={wrap}><SectionTop label={t("blog.label")} title={<>{t("blog.titleLine1")}<br/>{t("blog.titleLine2")}</>} href="/blog" cta={t("blog.cta")}/><div className="mt-[42px] grid gap-[26px] md:grid-cols-3">{latestPosts.map((post)=><Link key={post.slug} href={`/blog/${post.slug}`} className="group block border border-black/10 bg-white transition-colors hover:border-[#285b50]"><Pic src={post.coverImage} className="h-[187px] w-full border-b border-black/10"/><div className="p-[21px]"><p className="text-[12px] font-bold uppercase tracking-[.08em] text-[#285b50]">{post.category}</p><h3 className="mt-[8px] text-[17px] font-bold leading-snug group-hover:underline">{post.title}</h3><p className="mt-[10px] text-[13px] leading-relaxed text-black/55 line-clamp-3">{post.excerpt}</p><div className="mt-[16px] flex items-center gap-[16px] border-t border-black/10 pt-[16px] text-[12px] text-black/50"><span className="flex items-center gap-[5px]"><CalendarDays size={12}/> {formatDate(post.date, locale)}</span><span className="flex items-center gap-[5px]"><Clock size={12}/> {t("blog.readTime", {min: post.readTimeMin})}</span></div></div></Link>)}</div></div></section>
  <section className="py-[62px]"><div className={wrap}><div className="text-center"><Label>{t("faq.label")}</Label><Heading>{t("faq.titleLine1")}<br/>{t("faq.titleLine2")}</Heading></div><div className="mt-[52px] grid gap-[52px] md:grid-cols-[1fr_1.1fr]"><div className="grid grid-cols-1 gap-[10px]"><StatCard icon={GraduationCap} n="96" t={t("faq.stat1Label")}/><StatCard icon={ShieldCheck} n={t("faq.stat2Value")} t={t("faq.stat2Label")}/></div><div>{faqItems.map((faq)=><div className="border-b border-black/15 py-[26px] text-[18px]" key={faq.q}><b>{faq.q}</b><p className="mt-[10px] max-w-[582px] text-[16px] leading-relaxed text-black/55">{faq.a}</p></div>)}</div></div></div></section>
</main> }
function Stat({n,t}:{n:string;t:string}) { return <div className="self-end border-t border-white/50 pt-[16px]"><strong className="block text-[31px]">{n}</strong><span className="mt-[5px] block text-[16px] leading-tight">{t}</span></div> }
function StatCard({icon:Icon,n,t}:{icon:React.ElementType;n:string;t:string}) { return <div className="flex h-[161px] flex-col justify-center bg-white px-[26px]"><Icon size={28} className="text-[#285b50]"/><strong className="mt-[16px] block text-[25px]">{n}</strong><span className="mt-[2px] block text-[14px] text-black/55">{t}</span></div> }
function SectionTop({label,title,href,cta}:{label:string;title:React.ReactNode;href:string;cta:string}) { return <div className="flex items-start justify-between gap-[21px]"><div><Label>{label}</Label><Heading>{title}</Heading></div><Pill href={href}>{cta}</Pill></div> }
