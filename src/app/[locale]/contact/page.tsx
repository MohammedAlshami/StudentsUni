"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, Mail } from "lucide-react";
import { wrap, Label } from "@/components/marketing-ui";

const inputClass =
  "w-full rounded-[10px] border border-black/15 bg-[#f5efeb] px-[16px] py-[12px] text-[14px] outline-none focus:border-[#285b50]";
const labelClass = "mb-[6px] block text-[12px] font-bold uppercase tracking-[.06em] text-black/50";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("contact");

  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Hero */}
      <div className="flex h-[520px] items-center pt-[83px]">
        <div className={wrap}>
          <Label>{t("hero.label")}</Label>
          <h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">
            {t("hero.titleLine1")}<br />{t("hero.titleLine2")}
          </h1>
          <p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed text-black/60">
            {t("hero.subtitle")}
          </p>
        </div>
      </div>

      {/* Form + info — straddles the header photo and the white body */}
      <div className={`${wrap} -mt-[70px] pb-[83px]`}>
        <div className="grid grid-cols-1 gap-[26px] lg:grid-cols-3">
          {/* Form */}
          <div className="border-t-[4px] border-x border-b border-x-black/10 border-b-black/10 border-t-[#285b50] bg-white p-[32px] lg:col-span-2">
            <Label>{t("form.label")}</Label>
            {submitted ? (
              <div className="py-[52px] text-center">
                <p className="text-[19px] font-bold">{t("form.thankYouTitle")}</p>
                <p className="mt-[10px] text-[14px] text-black/60">
                  {t("form.thankYouBody")}
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const get = (k: string) => String(data.get(k) ?? "").trim();
                  const lines = [
                    `Name: ${get("fullName")}`,
                    `Email: ${get("email")}`,
                    `Phone: ${get("phone")}`,
                    `I am a: ${get("iAmA")}`,
                    `Level of study: ${get("level")}`,
                    "",
                    get("message"),
                  ];
                  const subject = encodeURIComponent(`Website enquiry from ${get("fullName") || "a student"}`);
                  const body = encodeURIComponent(lines.join("\n"));
                  window.location.href = `mailto:info@arabicera.com?subject=${subject}&body=${body}`;
                  setSubmitted(true);
                }}
                className="mt-[16px] space-y-[16px]"
              >
                <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t("form.fullName")}</label>
                    <input type="text" name="fullName" required className={inputClass} placeholder={t("form.fullNamePlaceholder")} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("form.email")}</label>
                    <input type="email" name="email" required className={inputClass} placeholder="you@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t("form.phone")}</label>
                    <input type="tel" name="phone" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("form.iAmA")}</label>
                    <select name="iAmA" className={inputClass}>
                      <option>{t("form.options.student")}</option>
                      <option>{t("form.options.parent")}</option>
                      <option>{t("form.options.other")}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t("form.levelOfStudy")}</label>
                  <select name="level" className={inputClass}>
                    <option>{t("form.levels.foundation")}</option>
                    <option>{t("form.levels.diploma")}</option>
                    <option>{t("form.levels.bachelor")}</option>
                    <option>{t("form.levels.master")}</option>
                    <option>{t("form.levels.phd")}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("form.message")}</label>
                  <textarea
                    name="message"
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder={t("form.messagePlaceholder")}
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-[#285b50] px-[28px] py-[12px] text-[14px] font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                >
                  {t("form.send")}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-[16px]">
            <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
              <p className="flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[.06em] text-black/50">
                <Mail size={14} /> {t("info.email")}
              </p>
              <p className="mt-[8px] text-[15px] font-semibold">info@arabicera.com</p>
            </div>
            <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
              <p className="flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[.06em] text-black/50">
                <Clock size={14} /> {t("info.hours")}
              </p>
              <p className="mt-[8px] text-[14px] text-black/70">{t("info.hoursLine1")}</p>
              <p className="text-[12px] text-black/50">{t("info.hoursLine2")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
