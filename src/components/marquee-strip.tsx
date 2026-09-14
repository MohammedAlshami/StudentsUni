"use client";

import { motion } from "framer-motion";

export function MarqueeStrip({ text }: { text: string }) {
  return (
    <div className="absolute bottom-0 flex h-[104px] w-full items-center overflow-hidden bg-[#123f38e6]">
      <motion.div
        className="flex shrink-0 items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {[0, 1].map((i) => (
          <span
            key={i}
            className="whitespace-nowrap px-[24px] text-[44px] font-bold tracking-[-.06em] md:text-[62px]"
            aria-hidden={i === 1}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
