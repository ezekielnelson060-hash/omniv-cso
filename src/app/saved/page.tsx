"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { readSaved, type SavedItem } from "@/lib/discovery/local-graph";

const TABS = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "music", label: "Music" },
  { id: "product", label: "Products" },
  { id: "event", label: "Events" },
  { id: "entity", label: "Profiles" },
] as const;

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [tab, setTab] = useState<string>("all");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/save");
        const data = await res.json();
        if (cancelled) return;
        if (data.auth && Array.isArray(data.saves) && data.saves.length > 0) {
          setItems(data.saves as SavedItem[]);
        } else {
          setItems(readSaved());
        }
      } catch {
        if (!cancelled) setItems(readSaved());
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    if (tab === "entity") return items.filter((x) => x.kind === "entity");
    return items.filter(
      (x) => x.kind === "publication" && (x.pubType === tab || x.type === tab)
    );
  }, [items, tab]);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm md:border-b-0">
          <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3 md:max-w-2xl md:px-6">
            <Image
              src="/logo.svg"
              alt="Omniv"
              width={28}
              height={28}
              className="rounded-md md:hidden"
            />
            <span className="text-[15px] font-semibold text-white">Saved</span>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-24 pt-5 md:max-w-2xl md:px-6">
          <p className="text-[13px] text-zinc-500">
            Keep what matters. Access it anytime.
          </p>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  tab === t.id
                    ? "bg-omniv-gold text-black"
                    : "border border-white/12 text-zinc-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {!ready ? (
            <p className="mt-16 text-center text-[14px] text-zinc-600">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="mt-16 text-center text-[14px] text-zinc-500">
              Nothing saved yet.{" "}
              <Link href="/explore" className="text-omniv-gold hover:underline">
                Explore
              </Link>
            </p>
          ) : (
            <ul className="mt-6 space-y-2">
              {filtered.map((x) => {
                const href =
                  x.kind === "publication"
                    ? `/p/${x.slug}`
                    : `/e/${x.type}/${x.slug}`;
                const badge =
                  x.kind === "publication" ? x.pubType ?? x.type : x.type;
                return (
                  <li key={`${x.kind}-${x.type}-${x.slug}`}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:border-white/25"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[10px] font-semibold uppercase text-zinc-400">
                        {badge.slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-white">
                          {x.name}
                        </p>
                        <p className="text-[11px] capitalize text-zinc-500">
                          {badge}
                        </p>
                      </div>
                      <span className="text-zinc-600">›</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
