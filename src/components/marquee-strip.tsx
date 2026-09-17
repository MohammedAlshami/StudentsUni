"use client";

import { motion } from "framer-motion";

const COPIES_PER_GROUP = 4;
const COPIES = Array.from({ length: COPIES_PER_GROUP }, (_, i) => i);
const SECONDS_PER_COPY = 60;

export function MarqueeStrip({ text }: { text: string }) {
  const group = (
    <div className="flex shrink-0 items-center">
      {COPIES.map((i) => (
        <span
          key={i}
          className="whitespace-nowrap px-[24px] text-[44px] font-bold tracking-[-.06em] md:text-[62px]"
        >
          {text}
        </span>
      ))}
    </div>
  );

  return (
    <div
      dir="ltr"
      className="absolute bottom-0 flex h-[104px] w-full items-center overflow-hidden bg-[#123f38]"
    >
      <motion.div
        className="flex shrink-0 items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: SECONDS_PER_COPY * COPIES_PER_GROUP, repeat: Infinity, ease: "linear" }}
      >
        {group}
        <div aria-hidden>{group}</div>
      </motion.div>
    </div>
  );
}
