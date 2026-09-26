"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { NotificationBell } from "@/components/discovery/notification-bell";
import { PublicationActions } from "@/components/discovery/publication-actions";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
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
  artist: "from-fuchsia-600 to-purple-900",
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
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
            <div className="flex items-center gap-3">
              <ProfileAvatarLink />
              <h1 className="text-[20px] font-semibold tracking-tight text-white">
                Saved
              </h1>
            </div>
            <NotificationBell />
          </div>
          <div className="mx-auto flex max-w-lg gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-none md:max-w-2xl">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  tab === t.id
                    ? "bg-omniv-gold text-black"
                    : "bg-white/[0.06] text-zinc-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-3 md:max-w-2xl">
          {!ready ? (
            <p className="py-16 text-center text-zinc-600">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[15px] text-zinc-400">Nothing saved yet.</p>
              <p className="mt-1 text-[13px] text-zinc-600">
                Bookmark publications and profiles as you explore.
              </p>
              <Link
                href="/explore"
                className="mt-5 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
              >
                Explore
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((item) => {
                const key = `${item.kind}-${item.type}-${item.slug}`;
                const tone =
                  TONE[item.pubType || item.type] || "from-zinc-700 to-zinc-900";
                const href =
                  item.kind === "entity"
                    ? `/e/${item.type}/${item.slug}`
                    : `/p/${item.slug}`;
                const label =
                  item.kind === "entity"
                    ? item.type
                    : item.pubType || item.type;

                return (
                  <li
                    key={key}
                    className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.07]"
                  >
                    <Link
                      href={href}
                      className="flex items-center gap-3 p-2.5 pr-3"
                    >
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-[11px] font-bold uppercase text-white/90`}
                      >
                        {label.slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                          {label}
                        </p>
                        <p className="truncate text-[14px] font-semibold text-white">
                          {item.name}
                        </p>
                        <p className="truncate text-[11px] text-zinc-500">
                          {item.kind === "entity" ? "Profile" : "Publication"}
                        </p>
                      </div>
                      <span className="text-omniv-gold">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.2L6 21V4.5a1 1 0 0 1 1-1z" />
                        </svg>
                      </span>
                      <span className="text-zinc-600">›</span>
                    </Link>
                    {item.kind === "publication" && (
                      <div className="border-t border-white/[0.05] px-2 py-0.5">
                        <PublicationActions
                          slug={item.slug}
                          type={item.pubType || item.type}
                          title={item.name}
                          initialLikes={0}
                          compact
                          showTime={false}
                        />
                      </div>
                    )}
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
