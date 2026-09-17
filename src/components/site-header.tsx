"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
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
  const [hidden, setHidden] = useState(false);
  const [lifted, setLifted] = useState(false);
  const bareHero = pathname === "/contact";
  const transparent = isHeroPage(pathname) || bareHero;
  const darkText = bareHero && !lifted;

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setLifted(y > 8);
      setHidden(y > lastY && y > 83);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-20 transition-[transform,background-color,color] duration-300 ${darkText ? "text-[#242927]" : "text-white"} ${hidden ? "-translate-y-full" : "translate-y-0"} ${transparent && !lifted ? "bg-transparent" : "bg-[#285b50]"}`}
      >
        <div
          className={`${wrap} flex h-[83px] items-center gap-[42px] text-[14px] font-semibold uppercase tracking-wide`}
        >
          <Link href="/" className="me-auto flex items-center gap-[10px] text-[23px] font-bold normal-case tracking-tight">
            <img src={darkText ? "/logo.svg" : "/logo-light.svg"} alt="" className="h-[31px] w-auto" />
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
          <Menu className="md:hidden" />
        </div>
      </header>
      {!transparent && <div className="h-[83px]" aria-hidden />}
    </>
  );
}
