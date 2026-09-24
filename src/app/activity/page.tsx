"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { readFollows, type FollowedRef } from "@/lib/discovery/local-graph";
import { SEED_ENTITIES, SEED_PUBLICATIONS } from "@/lib/discovery/seed";
import { PUBLICATION_LABELS, publicationPath } from "@/lib/discovery/types";

export default function ActivityPage() {
  const [follows, setFollows] = useState<FollowedRef[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/follow");
        const data = await res.json();
        if (cancelled) return;
        if (data.auth && Array.isArray(data.follows) && data.follows.length > 0) {
          setFollows(data.follows as FollowedRef[]);
        } else {
          setFollows(readFollows());
        }
      } catch {
        if (!cancelled) setFollows(readFollows());
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const feed = useMemo(() => {
    const ids = new Set<string>();
    const names = new Set<string>();
    for (const f of follows) {
      names.add(f.name.toLowerCase());
      const e =
        SEED_ENTITIES.find((x) => x.type === f.type && x.slug === f.slug) ??
        (f.id ? SEED_ENTITIES.find((x) => x.id === f.id) : undefined);
      if (e) ids.add(e.id);
    }

    let pubs =
      ids.size > 0
        ? SEED_PUBLICATIONS.filter((p) => ids.has(p.publisherId))
        : [...SEED_PUBLICATIONS];

    return pubs
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 40)
      .map((p) => {
        const publisher = SEED_ENTITIES.find((e) => e.id === p.publisherId);
        return { pub: p, publisher };
      });
  }, [follows]);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl md:px-6">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Omniv" width={28} height={28} className="rounded-md" />
              <span className="text-[17px] font-semibold tracking-tight text-white">Activity</span>
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
              <ProfileAvatarLink />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6">
          {!ready ? (
            <p className="pt-10 text-center text-[14px] text-zinc-600">Loading…</p>
          ) : feed.length === 0 ? (
            <div className="pt-10 text-center">
              <p className="text-[15px] text-zinc-400">
                Follow publishers to see new publications here.
              </p>
              <Link
                href="/explore"
                className="mt-6 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Explore
              </Link>
            </div>
          ) : (
            <>
              {follows.length === 0 && (
                <p className="mb-4 text-[13px] text-zinc-500">
                  Network pulse.{" "}
                  <Link href="/explore" className="text-omniv-gold hover:underline">Follow people</Link>{" "}
                  to personalize this feed.
                </p>
              )}
              <ul className="space-y-2.5">
                {feed.map(({ pub, publisher }) => (
                  <li key={pub.id}>
                    <Link
                      href={publicationPath(pub)}
                      className="block rounded-2xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.08] transition hover:ring-white/15"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-omniv-gold/20 text-[10px] font-bold text-omniv-gold">
                          {(publisher?.name ?? "P").charAt(0)}
                        </span>
                        <p className="min-w-0 truncate text-[12px] text-zinc-500">
                          <span className="font-medium text-zinc-300">
                            {publisher?.name ?? "Publisher"}
                          </span>{" "}
                          published a {PUBLICATION_LABELS[pub.type].toLowerCase()}
                        </p>
                      </div>
                      <p className="mt-2 text-[15px] font-semibold leading-snug text-white">
                        {pub.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                        {pub.summary}
                      </p>
                      <p className="mt-2 text-[11px] text-zinc-600">
                        {pub.publishedAt}
                        {pub.meta ? ` · ${pub.meta}` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {follows.length > 0 && (
            <div className="mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                Following · {follows.length}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {follows.map((f) => (
                  <Link
                    key={`${f.type}-${f.slug}`}
                    href={`/e/${f.type}/${f.slug}`}
                    className="rounded-full bg-white/[0.04] px-3 py-1.5 text-[12px] text-zinc-400 ring-1 ring-white/[0.08] hover:text-white"
                  >
                    {f.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
