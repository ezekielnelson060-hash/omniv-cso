"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/** Shows title in a compact top bar once the hero title scrolls out of view */
export function StickyArticleHeader({
  title,
  backHref = "/home",
}: {
  title: string;
  backHref?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 220);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#050505]/92 backdrop-blur-xl transition-all duration-200 md:left-[260px] xl:left-[280px] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex h-12 max-w-2xl items-center gap-3 px-4">
        <Link
          href={backHref}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white"
          aria-label="Back"
        >
          ←
        </Link>
        <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-white">
          {title}
        </p>
      </div>
    </div>
  );
}
