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

const TONE: Record<string, string> = {
  article: "from-sky-700 to-slate-900",
  music: "from-fuchsia-700 to-purple-950",
  product: "from-amber-600 to-orange-950",
  event: "from-violet-700 to-indigo-950",
  research: "from-emerald-700 to-teal-950",
  video: "from-rose-700 to-red-950",
  opportunity: "from-yellow-700 to-yellow-950",
  announcement: "from-zinc-600 to-zinc-900",
  company: "from-sky-600 to-slate-900",
  person: "from-violet-600 to-indigo-900",
  brand: "from-rose-500 to-stone-900",
  project: "from-amber-500 to-orange-950",
};

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
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Omniv"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-[17px] font-semibold tracking-tight text-white">
                Saved
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/explore"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white"
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
              </Link>
              <Link
                href="/profile"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-omniv-gold/20 text-[12px] font-semibold text-omniv-gold ring-1 ring-omniv-gold/30"
                aria-label="Profile"
              >
                ·
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6">
          <p className="text-[13px] text-zinc-500">
            Keep what matters. Access it anytime.
          </p>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  tab === t.id
                    ? "bg-omniv-gold text-black"
                    : "text-zinc-400 ring-1 ring-white/15"
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
            <ul className="mt-5 space-y-2.5">
              {filtered.map((x) => {
                const href =
                  x.kind === "publication"
                    ? `/p/${x.slug}`
                    : `/e/${x.type}/${x.slug}`;
                const badge =
                  x.kind === "publication" ? x.pubType ?? x.type : x.type;
                const tone = TONE[badge] || "from-zinc-700 to-zinc-900";
                return (
                  <li key={`${x.kind}-${x.type}-${x.slug}`}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-2.5 pr-3 ring-1 ring-white/[0.08] transition hover:ring-white/15"
                    >
                      <div
                        className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${tone}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wide text-white/90">
                          {badge.slice(0, 4)}
                        </span>
                        <span className="absolute bottom-1 right-1 text-omniv-gold">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-3.5L5 20V5a1 1 0 0 1 1-1z" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-white">
                          {x.name}
                        </p>
                        <p className="mt-0.5 text-[12px] capitalize text-zinc-500">
                          {badge}
                          {x.kind === "entity" ? " · Profile" : ""}
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
