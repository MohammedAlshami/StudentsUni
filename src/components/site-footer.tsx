import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { wrap } from "@/components/marketing-ui";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  return (
    <footer className="m-[16px] rounded-[24px] bg-[#285b50] py-[42px] font-sans text-white">
      <div className={wrap}>
        <Link href="/" className="flex flex-col items-center gap-[10px] py-[26px] text-[44px] font-bold tracking-[-.05em] md:text-[64px]">
          <img src="/logo-light.svg" alt="" className="h-[52px] w-auto" />
          Arabic Era
        </Link>
        <div className="mt-[36px] flex flex-wrap items-center justify-between gap-[26px]">
          <div className="flex flex-wrap gap-[26px] text-[13px] font-semibold">
            <Link href="/about">{tNav("about").toUpperCase()}</Link>
            <Link href="/programs">{tNav("programs").toUpperCase()}</Link>
            <Link href="/blog">{tNav("blog").toUpperCase()}</Link>
            <Link href="/services">{tNav("howWeHelp").toUpperCase()}</Link>
            <Link href="/contact">{t("contact").toUpperCase()}</Link>
          </div>
          <LanguageSwitcher variant="dark" />
        </div>
        <div className="mt-[36px] flex items-center justify-between border-t border-white/20 pt-[16px] text-[12px] text-white/55">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
