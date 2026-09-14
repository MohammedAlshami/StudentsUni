"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import { wrap } from "@/components/marketing-ui";

// Pages whose very first section is a full-bleed photo/color hero get a
// transparent header that overlays it (matching the landing page). Everywhere
// else the header stays solid and in normal flow so it doesn't sit on top of
// plain white/beige content.
const HERO_PAGES = ["/", "/universities", "/programs", "/about", "/contact", "/blog"];

function isHeroPage(pathname: string): boolean {
  if (HERO_PAGES.includes(pathname)) return true;
  if (/^\/universities\/[^/]+$/.test(pathname)) return true;
  if (/^\/blog\/[^/]+$/.test(pathname)) return true;
  return false;
}

export function SiteHeader() {
  const pathname = usePathname();
  const transparent = isHeroPage(pathname);

  return (
    <header className={transparent ? "absolute inset-x-0 top-0 z-20 bg-transparent text-white" : "relative bg-[#285b50] text-white"}>
      <div
        className={`${wrap} flex h-[83px] items-center gap-[42px] text-[14px] font-semibold uppercase tracking-wide`}
      >
        <Link href="/" className="mr-auto flex items-center gap-[10px] text-[23px] font-bold normal-case tracking-tight">
          <img src="/logo-light.svg" alt="" className="h-[31px] w-auto" />
          StudentsUni
        </Link>
        <nav className="hidden gap-[31px] md:flex">
          <Link href="/universities">Universities</Link>
          <Link href="/programs">Programs</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/services">How we help</Link>
          <Link href="/about">About</Link>
        </nav>
        <a
          href="tel:+60102067888"
          className="hidden items-center gap-[5px] rounded-full bg-white px-[16px] py-[10px] text-[13px] text-[#242927] md:flex"
        >
          <Phone size={14} /> +60 10 206 7888
        </a>
        <Menu className="md:hidden" />
      </div>
    </header>
  );
}
