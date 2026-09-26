"use client";

import { useEffect, useState } from "react";

const PROMPTS = [
  "AI companies in Africa",
  "independent artists in Lagos",
  "research about energy infrastructure",
  "new products",
  "people worth following",
];

export function RotatingSearch({ value = "" }: { value?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (value) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % PROMPTS.length), 3200);
    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <input
      name="q"
      type="search"
      defaultValue={value}
      placeholder={value ? "Search Omniv..." : PROMPTS[index]}
      aria-label="Search Omniv"
      className="h-14 w-full rounded-2xl bg-white/[0.06] px-5 text-[15px] text-white outline-none ring-1 ring-white/[0.12] placeholder:text-zinc-500 focus:ring-omniv-gold/50"
    />
  );
}
