"use client";

import { useEffect, useState } from "react";

const PROMPTS = [
  "AI companies in Africa",
  "independent artists in Lagos",
  "research about energy",
  "new products",
  "people worth following",
];

export function RotatingSearch({ value = "" }: { value?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (value) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % PROMPTS.length),
      3200
    );
    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <input
      name="q"
      type="search"
      defaultValue={value}
      placeholder={value ? "Search Omniv…" : PROMPTS[index]}
      aria-label="Search Omniv"
      className="h-12 w-full rounded-full bg-white/[0.06] px-4 text-[15px] text-white outline-none placeholder:text-zinc-500 focus:bg-white/[0.08]"
    />
  );
}
