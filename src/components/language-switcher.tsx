"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/routing";

export function LanguageSwitcher({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const isLight = variant === "light";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className={
          isLight
            ? "flex items-center gap-[6px] rounded-full border border-black/15 px-[14px] py-[8px] text-[13px] font-semibold text-[#242927]"
            : "flex items-center gap-[6px] rounded-full border border-white/25 px-[14px] py-[8px] text-[13px] font-semibold text-white"
        }
      >
        <Globe size={14} />
        {localeNames[locale as Locale]}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          className="absolute end-0 top-[calc(100%+8px)] z-30 min-w-[140px] overflow-hidden rounded-[14px] border border-black/10 bg-white text-[#242927] shadow-[0_16px_40px_rgba(0,0,0,.15)]"
          role="menu"
        >
          {locales.map((l) => (
            <Link
              key={l}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={{ pathname, params } as any}
              locale={l}
              onClick={() => setOpen(false)}
              className={`block px-[16px] py-[11px] text-[13px] font-semibold hover:bg-[#f5efeb] ${
                l === locale ? "bg-[#f5efeb] text-[#285b50]" : ""
              }`}
              role="menuitem"
            >
              {localeNames[l]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
