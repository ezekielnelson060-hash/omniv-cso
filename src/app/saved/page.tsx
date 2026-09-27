"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { NotificationBell } from "@/components/discovery/notification-bell";
import { PublicationActions } from "@/components/discovery/publication-actions";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { readSaved, type SavedItem } from "@/lib/discovery/local-graph";
import {
  listCollections,
  createCollection,
  deleteCollection,
  addToCollection,
  itemKey,
  type Collection,
} from "@/lib/discovery/collections";

const TABS = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "music", label: "Music" },
  { id: "product", label: "Products" },
  { id: "event", label: "Events" },
  { id: "entity", label: "Profiles" },
  { id: "collections", label: "Collections" },
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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newName, setNewName] = useState("");

  function refreshCollections() {
    setCollections(listCollections());
  }

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
        if (!cancelled) {
          refreshCollections();
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all" || tab === "collections") return items;
    if (tab === "entity") return items.filter((x) => x.kind === "entity");
    return items.filter(
      (x) => x.kind === "publication" && (x.pubType === tab || x.type === tab)
    );
  }, [items, tab]);

  function handleCreate() {
    if (!newName.trim()) return;
    createCollection(newName.trim());
    setNewName("");
    refreshCollections();
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
            <h1 className="text-[17px] font-semibold tracking-tight">Saved</h1>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ProfileAvatarLink />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 pb-28 pt-4">
          <p className="text-[13px] text-zinc-500">
            Your personal library — saves and collections.
          </p>

          <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex h-8 shrink-0 items-center rounded-full px-4 text-[13px] font-medium transition ${
                    active
                      ? "bg-omniv-gold text-black"
                      : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === "collections" ? (
            <div className="mt-5 space-y-4">
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="New collection name"
                  className="h-11 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[14px] text-white outline-none placeholder:text-zinc-600 focus:border-omniv-gold/40"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  className="h-11 shrink-0 rounded-xl bg-omniv-gold px-4 text-[13px] font-semibold text-black"
                >
                  Create
                </button>
              </div>

              {!collections.length ? (
                <div className="rounded-2xl bg-white/[0.03] p-8 text-center">
                  <p className="text-[14px] text-zinc-400">No collections yet</p>
                  <p className="mt-1 text-[12px] text-zinc-600">
                    e.g. African AI · Companies to contact · Music to investigate
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {collections.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold text-white">
                            {c.name}
                          </p>
                          <p className="mt-0.5 text-[12px] text-zinc-500">
                            {c.items.length} item{c.items.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            deleteCollection(c.id);
                            refreshCollections();
                          }}
                          className="text-[12px] text-zinc-600 hover:text-rose-400"
                        >
                          Delete
                        </button>
                      </div>
                      {c.items.length > 0 && (
                        <ul className="mt-3 space-y-1.5 border-t border-white/[0.05] pt-3">
                          {c.items.slice(0, 8).map((k) => {
                            const [kind, type, slug] = k.split(":");
                            const match = items.find(
                              (i) =>
                                i.kind === kind &&
                                i.type === type &&
                                i.slug === slug
                            );
                            const href =
                              kind === "entity"
                                ? `/e/${type}/${slug}`
                                : `/p/${slug}`;
                            return (
                              <li key={k}>
                                <Link
                                  href={href}
                                  className="block truncate text-[13px] text-zinc-300 hover:text-omniv-gold"
                                >
                                  {match?.name || slug}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {items.length > 0 && collections.length > 0 && (
                <div className="rounded-2xl border border-dashed border-white/[0.1] p-4">
                  <p className="text-[12px] font-medium text-zinc-400">
                    Add a saved item to a collection
                  </p>
                  <div className="mt-3 space-y-2">
                    {items.slice(0, 12).map((item) => {
                      const key = itemKey(item.kind, item.type, item.slug);
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate text-[13px] text-zinc-300">
                            {item.name}
                          </span>
                          <select
                            className="h-8 max-w-[140px] rounded-lg border border-white/[0.08] bg-[#0c0c0c] px-2 text-[11px] text-zinc-300"
                            defaultValue=""
                            onChange={(e) => {
                              const id = e.target.value;
                              if (!id) return;
                              addToCollection(id, key);
                              refreshCollections();
                              e.target.value = "";
                            }}
                          >
                            <option value="">Add to…</option>
                            {collections.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : !ready ? (
            <div className="mt-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-white/[0.04]"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-10 rounded-2xl bg-white/[0.03] p-10 text-center">
              <p className="text-[15px] font-medium text-white">Nothing saved</p>
              <p className="mt-1 text-[13px] text-zinc-500">
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
            <ul className="mt-5 space-y-3">
              {filtered.map((item) => {
                const key = `${item.kind}:${item.type}:${item.slug}`;
                const href =
                  item.kind === "entity"
                    ? `/e/${item.type}/${item.slug}`
                    : `/p/${item.slug}`;
                const tone =
                  TONE[item.pubType || item.type] || "from-zinc-700 to-zinc-900";
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
