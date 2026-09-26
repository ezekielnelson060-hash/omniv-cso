"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { NotificationBell } from "@/components/discovery/notification-bell";
import { SEED_ENTITIES } from "@/lib/discovery/seed";

type Follower = {
  type: string;
  slug: string;
  name: string;
  tagline?: string;
  location?: string;
  isEntity: boolean;
  youFollow: boolean;
};

const PEOPLE_TYPES = new Set(["person", "artist"]);

export default function FollowersPage() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [followingSlugs, setFollowingSlugs] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"all" | "people" | "entities">("all");
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/discovery/follow");
        const data = await res.json();
        const follows = Array.isArray(data.follows) ? data.follows : [];
        const set = new Set<string>(
          follows.map(
            (f: { type: string; slug: string }) => `${f.type}/${f.slug}`
          )
        );
        setFollowingSlugs(set);

        const fromFollows: Follower[] = follows.map(
          (f: { type: string; slug: string; name: string }) => {
            const entity = SEED_ENTITIES.find(
              (e) => e.type === f.type && e.slug === f.slug
            );
            return {
              type: f.type,
              slug: f.slug,
              name: f.name,
              tagline: entity?.tagline,
              location: entity?.location,
              isEntity: !PEOPLE_TYPES.has(f.type),
              youFollow: true,
            };
          }
        );

        const extras: Follower[] = SEED_ENTITIES.slice(0, 8).map((e) => ({
          type: e.type,
          slug: e.slug,
          name: e.name,
          tagline: e.tagline,
          location: e.location,
          isEntity: !PEOPLE_TYPES.has(e.type),
          youFollow: set.has(`${e.type}/${e.slug}`),
        }));

        const map = new Map<string, Follower>();
        for (const f of [...fromFollows, ...extras]) {
          map.set(`${f.type}/${f.slug}`, f);
        }
        setFollowers(Array.from(map.values()));
      } catch {
        setFollowers([]);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = followers;
    if (tab === "people") list = list.filter((f) => !f.isEntity);
    if (tab === "entities") list = list.filter((f) => f.isEntity);
    if (q.trim()) {
      const n = q.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(n) ||
          (f.tagline || "").toLowerCase().includes(n)
      );
    }
    return list;
  }, [followers, tab, q]);

  async function toggleFollow(f: Follower) {
    try {
      const res = await fetch("/api/discovery/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: f.type,
          slug: f.slug,
          name: f.name,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFollowers((prev) =>
          prev.map((x) =>
            x.type === f.type && x.slug === f.slug
              ? { ...x, youFollow: Boolean(data.following) }
              : x
          )
        );
        setFollowingSlugs((prev) => {
          const next = new Set(prev);
          const key = `${f.type}/${f.slug}`;
          if (data.following) next.add(key);
          else next.delete(key);
          return next;
        });
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400"
              >
                ←
              </Link>
              <h1 className="text-[17px] font-semibold text-white">Followers</h1>
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search followers…"
            className="h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/30"
          />

          <p className="mt-3 text-[13px] text-zinc-500">
            {filtered.length}{" "}
            {tab === "people"
              ? "people"
              : tab === "entities"
                ? "entities"
                : "followers"}
          </p>

          <div className="mt-4 flex gap-2">
            {(
              [
                { id: "all" as const, label: "All" },
                { id: "people" as const, label: "People" },
                { id: "entities" as const, label: "Entities" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-medium ${
                  tab === t.id
                    ? "bg-omniv-gold text-black"
                    : "bg-white/[0.06] text-zinc-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {!ready ? (
            <p className="mt-16 text-center text-zinc-600">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="mt-16 text-center text-[14px] text-zinc-500">
              No followers in this view yet.
            </p>
          ) : (
            <ul className="mt-5 space-y-2">
              {filtered.map((f) => (
                <li
                  key={`${f.type}-${f.slug}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3"
                >
                  <Link
                    href={`/e/${f.type}/${f.slug}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center text-sm font-semibold ${
                        f.isEntity
                          ? "rounded-xl bg-omniv-gold/15 text-omniv-gold"
                          : "rounded-full bg-white/10 text-white"
                      }`}
                    >
                      {f.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-white">
                        {f.name}
                      </p>
                      <p className="truncate text-[12px] text-zinc-500">
                        {f.isEntity ? "Entity" : "Explorer"}
                        {f.location ? ` · ${f.location}` : ""}
                        {f.tagline ? ` · ${f.tagline}` : ""}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void toggleFollow(f)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${
                      f.youFollow || followingSlugs.has(`${f.type}/${f.slug}`)
                        ? "bg-white/[0.08] text-zinc-300"
                        : "bg-omniv-gold text-black"
                    }`}
                  >
                    {f.youFollow || followingSlugs.has(`${f.type}/${f.slug}`)
                      ? "Following"
                      : "Follow"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
