"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NetworkHeader } from "@/components/discovery/network-header";
import { SiteFooter } from "@/components/site-footer";
import { readSaved, type SavedRef } from "@/components/discovery/save-button";

export default function SavedPage() {
  const [items, setItems] = useState<SavedRef[]>([]);

  useEffect(() => {
    setItems(readSaved());
  }, []);

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <NetworkHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Saved</h1>
        <p className="mt-1 text-[14px] text-zinc-500">
          Listings you saved on this device.
        </p>

        {items.length === 0 ? (
          <p className="mt-12 text-center text-[14px] text-zinc-500">
            Nothing saved yet.{" "}
            <Link href="/explore" className="text-omniv-gold hover:underline">
              Explore the network
            </Link>
          </p>
        ) : (
          <ul className="mt-8 space-y-2">
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
      <SiteFooter />
    </div>
  );
}
