"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { readSaved, type SavedRef } from "@/components/discovery/save-button";

export default function SavedPage() {
  const [items, setItems] = useState<SavedRef[]>([]);

  useEffect(() => {
    setItems(readSaved());
  }, []);

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3 md:max-w-2xl">
          <Image src="/logo.svg" alt="Omniv" width={28} height={28} className="rounded-md" />
          <span className="text-[15px] font-semibold text-white">Saved</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-24 pt-6 md:max-w-2xl">
        <p className="text-[13px] text-zinc-500">
          Keep what matters. Access it anytime.
        </p>

        {items.length === 0 ? (
          <p className="mt-16 text-center text-[14px] text-zinc-500">
            Nothing saved yet.{" "}
            <Link href="/explore" className="text-omniv-gold hover:underline">
              Explore
            </Link>
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {items.map((x) => (
              <li key={`${x.type}-${x.slug}`}>
                <Link
                  href={`/e/${x.type}/${x.slug}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/25"
                >
                  <span className="text-[14px] font-medium text-white">{x.name}</span>
                  <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                    {x.type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
