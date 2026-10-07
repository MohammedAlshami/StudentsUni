"use client";

import { motion } from "framer-motion";
import { NiMicrophone } from "@/components/notion-icons";

type Centre = { slug: string; name: string };

// One pass of the list. Rendered twice back-to-back so the -50% translate
// loops seamlessly (same trick as MarqueeStrip).
const COPIES = 2;
const SECONDS_PER_COPY = 40;

export function LanguageCentreStrip({ centres }: { centres: Centre[] }) {
  if (!centres.length) return null;

  const group = (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: COPIES }, (_, g) =>
        centres.map((c) => (
          <span
            key={`${g}-${c.slug}`}
            className="flex items-center gap-[22px] whitespace-nowrap px-[22px] text-[36px] font-bold tracking-[-.05em] text-white md:text-[56px]"
          >
            {c.name}
            <NiMicrophone size={34} className="shrink-0 text-[#6fc7ae]"/>
          </span>
        ))
      )}
    </div>
  );

  return (
    <div
      dir="ltr"
      className="flex h-[104px] w-full items-center overflow-hidden bg-[#123f38]"
    >
      <motion.div
        className="flex shrink-0 items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: SECONDS_PER_COPY * COPIES * Math.max(1, centres.length / 8),
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {group}
        <div aria-hidden>{group}</div>
      </motion.div>
    </div>
  );
}
