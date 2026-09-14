import fs from "fs";
import path from "path";
import Link from "next/link";
import { CalendarDays, Clock, User } from "lucide-react";
import { wrap, Label, Pill } from "@/components/marketing-ui";

type BlogPost = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  coverImage: string;
  author: string;
  date: string;
  readTimeMin: number;
  excerpt: string;
  intro: string[];
  sections: Array<{
    heading: string;
    paragraphs: string[];
    list?: string[];
    table?: { caption?: string; headers: string[]; rows: string[][] };
  }>;
  faqs?: Array<{ question: string; answer: string }>;
};

type BlogPostSummary = Omit<BlogPost, "intro" | "sections">;

const BLOG_DIR = path.join(process.cwd(), "public/data/blog");

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" });
}

export function generateStaticParams() {
  const raw = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, "index.json"), "utf-8"));
  return raw.posts.map((p: BlogPostSummary) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postPath = path.join(BLOG_DIR, `${slug}.json`);

  if (!fs.existsSync(postPath)) {
    return (
      <div className="bg-white py-[83px] text-center font-sans text-[#242927]">
        <h1 className="text-[21px] font-bold">Article not found</h1>
        <Link href="/blog" className="mt-[16px] inline-block text-[14px] underline">
          &larr; Back to blog
        </Link>
      </div>
    );
  }

  const post: BlogPost = JSON.parse(fs.readFileSync(postPath, "utf-8"));

  const indexRaw = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, "index.json"), "utf-8"));
  const allPosts: BlogPostSummary[] = indexRaw.posts;
  const related = allPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3);
  const fallbackRelated =
    related.length > 0 ? related : allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Header */}
      <div
        className="relative bg-[#285b50] bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(10,45,36,.82),rgba(10,45,36,.55)),url(${post.coverImage})`,
        }}
      >
        <div className={`${wrap} pt-[125px] pb-[52px]`}>
          <Link href="/blog" className="text-[13px] text-white/60 hover:underline">
            &larr; All Articles
          </Link>
          <Label>{post.category}</Label>
          <h1 className="max-w-[750px] text-[36px] font-bold leading-[1.05] tracking-[-.03em] md:text-[48px]">
            {post.title}
          </h1>
          <div className="mt-[21px] flex flex-wrap items-center gap-[21px] text-[14px] text-white/75">
            <span className="flex items-center gap-[6px]">
              <User size={14} /> {post.author}
            </span>
            <span className="flex items-center gap-[6px]">
              <CalendarDays size={14} /> {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-[6px]">
              <Clock size={14} /> {post.readTimeMin} min read
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${wrap} grid grid-cols-1 gap-[52px] py-[52px] lg:grid-cols-[1fr_280px]`}>
        <article className="max-w-[700px]">
          {post.intro.map((para, i) => (
            <p key={i} className="mb-[21px] text-[17px] leading-relaxed text-black/75">
              {para}
            </p>
          ))}

          {post.sections.map((section, i) => (
            <section key={i} className="mt-[34px]">
              <h2 className="text-[23px] font-bold tracking-[-.01em]">{section.heading}</h2>
              {section.paragraphs.map((para, j) => (
                <p key={j} className="mt-[16px] text-[16px] leading-relaxed text-black/70">
                  {para}
                </p>
              ))}
              {section.list && (
                <ul className="mt-[16px] space-y-[8px]">
                  {section.list.map((item, k) => (
                    <li key={k} className="flex gap-[10px] text-[15px] leading-relaxed text-black/70">
                      <span className="mt-[8px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#285b50]" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div className="mt-[21px] overflow-x-auto border border-black/10">
                  <table className="w-full min-w-[480px] border-collapse text-left text-[14px]">
                    <thead>
                      <tr className="bg-[#285b50] text-white">
                        {section.table.headers.map((h, k) => (
                          <th key={k} className="px-[16px] py-[10px] text-[12px] font-bold uppercase tracking-[.04em]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, ri) => (
                        <tr key={ri} className={ri % 2 === 1 ? "bg-[#f5efeb]" : "bg-white"}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="border-t border-black/10 px-[16px] py-[10px] align-top text-black/75">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {section.table.caption && (
                    <p className="border-t border-black/10 bg-white px-[16px] py-[8px] text-[12px] text-black/45">
                      {section.table.caption}
                    </p>
                  )}
                </div>
              )}
            </section>
          ))}

          {post.faqs && post.faqs.length > 0 && (
            <section className="mt-[42px] border-t border-black/10 pt-[34px]">
              <h2 className="text-[23px] font-bold tracking-[-.01em]">Frequently Asked Questions</h2>
              <div className="mt-[16px] space-y-[21px]">
                {post.faqs.map((faq, i) => (
                  <div key={i}>
                    <p className="text-[16px] font-bold">{faq.question}</p>
                    <p className="mt-[6px] text-[15px] leading-relaxed text-black/70">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-[42px] flex flex-wrap gap-[8px] border-t border-black/10 pt-[26px]">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#f5efeb] px-[14px] py-[6px] text-[12px] font-semibold text-black/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-[16px]">
          <div className="border border-black/10 bg-[#285b50] p-[21px] text-white">
            <p className="text-[12px] font-bold uppercase tracking-[.08em] text-white/60">
              Need Personal Guidance?
            </p>
            <p className="mt-[8px] text-[13px] leading-relaxed text-white/80">
              Get free, one-on-one consultation matched to your grades, budget, and goals.
            </p>
            <div className="mt-[16px]">
              <Pill white href="/contact">
                Talk to us
              </Pill>
            </div>
          </div>

          {fallbackRelated.length > 0 && (
            <div className="border border-black/10 p-[21px]">
              <p className="text-[12px] font-bold uppercase tracking-[.08em] text-black/50">
                Related Articles
              </p>
              <div className="mt-[16px] space-y-[16px]">
                {fallbackRelated.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="block group">
                    <p className="text-[14px] font-semibold leading-snug group-hover:underline">
                      {p.title}
                    </p>
                    <p className="mt-[4px] text-[12px] text-black/45">{p.readTimeMin} min read</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
