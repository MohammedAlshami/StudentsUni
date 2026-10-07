import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LanguageCentresClient from "@/components/language-centres-client";
import { wrap, Label } from "@/components/marketing-ui";
import { loadAllLanguageCentres } from "@/lib/language-centres";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LanguageCentresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const centres = loadAllLanguageCentres();
  const t = await getTranslations("languageCentresPage");

  return (
    <div className="bg-white font-sans text-[#242927]">
      <div className="bg-[#f5efeb] py-[62px] md:py-[104px]">
        <div className={wrap}>
          <Label>{t("label")}</Label>
          <h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h1>
          <p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed text-black/60">
            {t("subtitle", { count: centres.length })}
          </p>
        </div>
      </div>
      <div className="py-[42px] md:py-[62px]">
        <Suspense>
          <LanguageCentresClient items={centres} />
        </Suspense>
      </div>
    </div>
  );
}
