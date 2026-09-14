import fs from "fs";
import path from "path";
import { ArrowUpRight } from "lucide-react";
import BlogClient from "@/components/blog-client";
import { wrap, Pic, Label, Heading, Pill } from "@/components/marketing-ui";

export type BlogPostSummary = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  coverImage: string;
  author: string;
  date: string;
  readTimeMin: number;
  excerpt: string;
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1600&q=85";
const CTA_IMG_1 =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80";
const CTA_IMG_2 =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80";

function loadPosts(): BlogPostSummary[] {
  const indexPath = path.join(process.cwd(), "public/data/blog/index.json");
  const raw = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  return raw.posts;
}

export default function BlogPage() {
  const posts = loadPosts();

  return (
    <div className="bg-white font-sans text-[#242927]">
      <div
        className="flex h-[762px] items-center bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(10,45,36,.82),rgba(10,45,36,.42)),url(${HERO_IMG})`,
        }}
      >
        <div className={wrap}>
          <Label>StudentsUni Blog</Label>
          <h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">
            Guides for your<br />next big decision.
          </h1>
          <p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed text-white/80">
            {posts.length} honest, practical guides on costs, applications, scholarships, and
            choosing the right path — written for students navigating Malaysian higher education.
          </p>
        </div>
      </div>
      <BlogClient posts={posts} />

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
                Still have
                <br />
                questions?
              </Heading>
              <p className="mx-auto mt-[16px] max-w-[380px] text-[14px] leading-relaxed text-black/60">
                Talk to a StudentsUni counsellor for guidance tailored to your grades, budget, and
                goals.
              </p>
              <div className="mt-[21px]">
                <Pill href="/contact">Talk to us</Pill>
              </div>
            </div>
            <Pic src={CTA_IMG_2} className="h-[220px] w-full md:h-[270px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
