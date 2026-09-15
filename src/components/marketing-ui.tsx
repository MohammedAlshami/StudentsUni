import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

const KNOWN_INSTITUTION_TYPES = ["public-university", "private-university", "private-university-college"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function institutionTypeLabel(t: any, type: string): string {
  return KNOWN_INSTITUTION_TYPES.includes(type) ? t(`institutionTypes.${type}`) : type;
}

export const wrap =
  "mx-auto w-[min(1279px,calc(100%-2.6rem))] md:w-[min(1279px,calc(100%-5.2rem))]";

export function Pic({ src, className }: { src: string; className: string }) {
  return <img src={src} alt="" className={`block object-cover ${className}`} />;
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="mb-[16px] block text-[13px] font-bold uppercase tracking-[.12em]">
      {children}
    </span>
  );
}

export function Pill({
  children,
  white = false,
  href = "/contact",
}: {
  children: ReactNode;
  white?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-[10px] rounded-full px-[21px] py-[10px] text-[13px] font-bold uppercase tracking-wide transition-opacity hover:opacity-90 ${
        white ? "bg-white text-[#242927]" : "bg-[#285b50] text-white"
      }`}
    >
      {children}
      <ArrowRight size={17} className="rtl:rotate-180" />
    </Link>
  );
}

export function Heading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-[34px] font-bold leading-[.98] tracking-[-.06em] md:text-[42px] ${className}`}
    >
      {children}
    </h2>
  );
}
