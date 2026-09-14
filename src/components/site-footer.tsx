import Link from "next/link";
import { AtSign, Globe2, Send, Users } from "lucide-react";
import { wrap, Pic, Heading } from "@/components/marketing-ui";

const Facebook = Globe2;
const Instagram = AtSign;
const Linkedin = Send;

const BUILDING_IMG =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=85";

export function SiteFooter() {
  return (
    <footer className="bg-white py-[42px] font-sans text-[#242927]">
      <div className={wrap}>
        <div className="grid items-center gap-[26px] border-b border-black/10 pb-[36px] md:grid-cols-3">
          <Link href="/" className="flex items-center gap-[10px] text-[23px] font-bold text-[#285b50]">
            <img src="/logo.svg" alt="" className="h-[31px] w-auto" />
            StudentsUni
          </Link>
          <b className="text-[18px]">Get Malaysia study updates</b>
          <form className="flex h-[47px] items-center rounded-full border border-black/15 bg-[#f5efeb] p-[5px]">
            <input
              placeholder="YOUR EMAIL ADDRESS"
              className="min-w-0 flex-1 bg-transparent px-[16px] text-[13px] outline-none placeholder:text-black/40"
            />
            <button className="h-full shrink-0 rounded-full bg-[#242927] px-[21px] text-[13px] font-semibold text-white">
              SUBSCRIBE
            </button>
          </form>
        </div>
        <div className="mt-[36px] flex items-start justify-between gap-[42px]">
          <div>
            <Heading className="text-[29px]">
              &ldquo;The right guidance turns a university application into a confident next step.&rdquo;
            </Heading>
            <p className="mt-[26px] flex items-center gap-[10px] text-[18px]">
              <Users size={22} /> StudentsUni counsellors
              <br />
              <small className="ml-[31px] text-black/55">Here from search to registration</small>
            </p>
          </div>
          <Pic src={BUILDING_IMG} className="h-[250px] w-[45%] md:w-[374px]" />
        </div>
        <div className="mt-[36px] flex flex-wrap gap-[26px] text-[13px] font-semibold">
          <Link href="/about">ABOUT</Link>
          <Link href="/programs">PROGRAMS</Link>
          <Link href="/blog">BLOG</Link>
          <Link href="/services">SERVICES</Link>
          <Link href="/contact">CONTACT</Link>
        </div>
        <div className="mt-[36px] flex items-center justify-between border-t border-black/10 pt-[16px] text-[12px] text-black/55">
          COPYRIGHT &copy; STUDENTSUNI &mdash; 2026
          <span className="flex gap-[16px] text-black">
            <Facebook size={20} />
            <Instagram size={20} />
            <Linkedin size={20} />
          </span>
        </div>
      </div>
    </footer>
  );
}
