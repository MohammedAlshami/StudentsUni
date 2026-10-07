"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { wrap } from "@/components/marketing-ui";
import { LanguageSwitcher } from "@/components/language-switcher";

// Pages whose very first section is a full-bleed photo/color hero get a
// transparent header that overlays it (matching the landing page). Everywhere
// else the header stays solid and in normal flow so it doesn't sit on top of
// plain white/beige content.
const HERO_PAGES = ["/", "/universities", "/programs", "/about", "/blog", "/services"];

function isHeroPage(pathname: string): boolean {
  if (HERO_PAGES.includes(pathname)) return true;
  if (/^\/universities\/[^/]+$/.test(pathname)) return true;
  if (/^\/blog\/[^/]+$/.test(pathname)) return true;
  if (/^\/programs\/[^/]+$/.test(pathname)) return true;
  return false;
}

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bareHero = pathname === "/contact";
  const transparent = isHeroPage(pathname) || bareHero;
  const darkText = bareHero && !lifted && !menuOpen;

  // Once the page is scrolled the bar "lifts": it shrinks and becomes a
  // rounded floating pill instead of hiding away on scroll-down.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-20 transition-colors duration-300 ${darkText ? "text-[#242927]" : "text-white"} ${menuOpen || (!transparent && !lifted) ? "bg-[#285b50]" : "bg-transparent"}`}
      >
        <div
          className={`flex items-center text-[14px] font-semibold uppercase tracking-wide transition-all duration-300 ease-out ${
            lifted
              ? "mx-auto my-[14px] h-[62px] w-[min(1140px,calc(100%-2.6rem))] gap-[26px] rounded-[24px] bg-[#285b50] px-[22px] shadow-[0_12px_34px_rgba(0,0,0,0.20)] md:w-[min(1140px,calc(100%-5.2rem))] md:px-[26px]"
              : `${wrap} h-[83px] gap-[42px]`
          }`}
        >
          <Link href="/" className="me-auto flex items-center gap-[10px] text-[23px] font-bold normal-case tracking-tight">
            <img
              src={darkText ? "/logo.svg" : "/logo-light.svg"}
              alt=""
              className={`w-auto transition-[height] duration-300 ${lifted ? "h-[25px]" : "h-[31px]"}`}
            />
            Arabic Era
          </Link>
          <nav className="hidden gap-[31px] md:flex">
            <Link href="/universities">{t("universities")}</Link>
            <Link href="/programs">{t("programs")}</Link>
            <Link href="/blog">{t("blog")}</Link>
            <Link href="/services">{t("howWeHelp")}</Link>
            <Link href="/about">{t("about")}</Link>
          </nav>
          <LanguageSwitcher variant={darkText ? "light" : "dark"} />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-white/25 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-white/15 bg-[#285b50] md:hidden">
            <div className={`${wrap} flex flex-col gap-[4px] py-[16px] text-[15px] font-semibold uppercase tracking-wide`}>
              <Link href="/universities" className="py-[12px]" onClick={() => setMenuOpen(false)}>{t("universities")}</Link>
              <Link href="/programs" className="py-[12px]" onClick={() => setMenuOpen(false)}>{t("programs")}</Link>
              <Link href="/blog" className="py-[12px]" onClick={() => setMenuOpen(false)}>{t("blog")}</Link>
              <Link href="/services" className="py-[12px]" onClick={() => setMenuOpen(false)}>{t("howWeHelp")}</Link>
              <Link href="/about" className="py-[12px]" onClick={() => setMenuOpen(false)}>{t("about")}</Link>
              <div className="pt-[8px]">
                <LanguageSwitcher variant="dark" />
              </div>
            </div>
          </nav>
        )}
      </header>
      {!transparent && <div className="h-[83px]" aria-hidden />}
    </>
  );
}
