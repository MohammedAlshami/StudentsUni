import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { AtSign, Globe2, Send, Users } from "lucide-react";
import { wrap, Pic, Heading } from "@/components/marketing-ui";
import { LanguageSwitcher } from "@/components/language-switcher";

const Facebook = Globe2;
const Instagram = AtSign;
const Linkedin = Send;

const BUILDING_IMG =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=85";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  return (
    <footer className="bg-white py-[42px] font-sans text-[#242927]">
      <div className={wrap}>
        <div className="grid items-center gap-[26px] border-b border-black/10 pb-[36px] md:grid-cols-3">
          <Link href="/" className="flex items-center gap-[10px] text-[23px] font-bold text-[#285b50]">
            <img src="/logo.svg" alt="" className="h-[31px] w-auto" />
            StudentsUni
          </Link>
          <b className="text-[18px]">{t("newsletterHeading")}</b>
          <form className="flex h-[47px] items-center rounded-full border border-black/15 bg-[#f5efeb] p-[5px]">
            <input
              placeholder={t("emailPlaceholder")}
              className="min-w-0 flex-1 bg-transparent px-[16px] text-[13px] outline-none placeholder:text-black/40"
            />
            <button className="h-full shrink-0 rounded-full bg-[#242927] px-[21px] text-[13px] font-semibold text-white">
              {t("subscribe")}
            </button>
          </form>
        </div>
        <div className="mt-[36px] flex flex-wrap items-start justify-between gap-[26px] md:flex-nowrap md:gap-[42px]">
          <div>
            <Heading className="text-[29px]">&ldquo;{t("quote")}&rdquo;</Heading>
            <p className="mt-[26px] flex items-center gap-[10px] text-[18px]">
              <Users size={22} /> {t("counsellors")}
              <br />
              <small className="ms-[31px] text-black/55">{t("counsellorsSubtext")}</small>
            </p>
          </div>
          <Pic src={BUILDING_IMG} className="h-[250px] w-[45%] md:w-[374px]" />
        </div>
        <div className="mt-[36px] flex flex-wrap items-center justify-between gap-[26px]">
          <div className="flex flex-wrap gap-[26px] text-[13px] font-semibold">
            <Link href="/about">{tNav("about").toUpperCase()}</Link>
            <Link href="/programs">{tNav("programs").toUpperCase()}</Link>
            <Link href="/blog">{tNav("blog").toUpperCase()}</Link>
            <Link href="/services">{tNav("howWeHelp").toUpperCase()}</Link>
            <Link href="/contact">{t("contact").toUpperCase()}</Link>
          </div>
          <LanguageSwitcher variant="light" />
        </div>
        <div className="mt-[36px] flex items-center justify-between border-t border-black/10 pt-[16px] text-[12px] text-black/55">
          {t("copyright")}
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
