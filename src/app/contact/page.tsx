"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { wrap, Label } from "@/components/marketing-ui";

const HERO_IMG =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=85";

const inputClass =
  "w-full rounded-[10px] border border-black/15 bg-[#f5efeb] px-[16px] py-[12px] text-[14px] outline-none focus:border-[#285b50]";
const labelClass = "mb-[6px] block text-[12px] font-bold uppercase tracking-[.06em] text-black/50";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-white font-sans text-[#242927]">
      {/* Hero */}
      <div
        className="flex h-[762px] items-center bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(10,45,36,.82),rgba(10,45,36,.42)),url(${HERO_IMG})`,
        }}
      >
        <div className={wrap}>
          <Label>Get in touch</Label>
          <h1 className="max-w-[874px] text-[55px] font-bold leading-[.9] tracking-[-.07em] md:text-[73px]">
            Let&apos;s find your<br />next step together.
          </h1>
          <p className="mt-[26px] max-w-[582px] text-[18px] leading-relaxed text-white/80">
            Free consultation, application help, and honest advice — reach out any way that
            works for you.
          </p>
        </div>
      </div>

      {/* Form + info — straddles the header photo and the white body */}
      <div className={`${wrap} -mt-[70px] pb-[83px]`}>
        <div className="grid grid-cols-1 gap-[26px] lg:grid-cols-3">
          {/* Form */}
          <div className="border-t-[4px] border-x border-b border-x-black/10 border-b-black/10 border-t-[#285b50] bg-white p-[32px] lg:col-span-2">
            <Label>Send a message</Label>
            {submitted ? (
              <div className="py-[52px] text-center">
                <p className="text-[19px] font-bold">Thank you!</p>
                <p className="mt-[10px] text-[14px] text-black/60">
                  We&apos;ve received your message. We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="mt-[16px] space-y-[16px]"
              >
                <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input type="text" required className={inputClass} placeholder="Your name" />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" required className={inputClass} placeholder="you@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Phone (WhatsApp)</label>
                    <input type="tel" className={inputClass} placeholder="6010-2067388" />
                  </div>
                  <div>
                    <label className={labelClass}>I am a</label>
                    <select className={inputClass}>
                      <option>Prospective Student</option>
                      <option>Parent / Guardian</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Level of Study</label>
                  <select className={inputClass}>
                    <option>Foundation</option>
                    <option>Diploma</option>
                    <option>Bachelor&apos;s Degree</option>
                    <option>Master&apos;s Degree</option>
                    <option>PhD</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Message</label>
                  <textarea
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us about your education goals, preferred university, or any questions..."
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-[#285b50] px-[28px] py-[12px] text-[14px] font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-[16px]">
            <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
              <p className="flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[.06em] text-black/50">
                <MessageCircle size={14} /> WhatsApp
              </p>
              <p className="mt-[8px] text-[15px] font-semibold">6010-2067388</p>
              <p className="text-[12px] text-black/50">Fastest way to reach us</p>
            </div>
            <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
              <p className="flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[.06em] text-black/50">
                <Mail size={14} /> Email
              </p>
              <p className="mt-[8px] text-[15px] font-semibold">info@studentsuni.com</p>
            </div>
            <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
              <p className="flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[.06em] text-black/50">
                <MapPin size={14} /> Office
              </p>
              <p className="mt-[8px] text-[14px] text-black/70">Kuala Lumpur, Malaysia</p>
              <p className="text-[12px] text-black/50">Walk-ins by appointment only</p>
            </div>
            <div className="border border-black/10 bg-[#f5efeb] p-[21px]">
              <p className="flex items-center gap-[8px] text-[12px] font-bold uppercase tracking-[.06em] text-black/50">
                <Clock size={14} /> Hours
              </p>
              <p className="mt-[8px] text-[14px] text-black/70">Monday – Friday: 9:00 AM – 6:00 PM</p>
              <p className="text-[12px] text-black/50">Saturday: 10:00 AM – 2:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
