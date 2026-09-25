"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { readFollows, type FollowedRef } from "@/lib/discovery/local-graph";
import { SEED_ENTITIES, publicationsByPublisher } from "@/lib/discovery/seed";

export default function FollowingPage() {
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
                Following
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/explore"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white"
                aria-label="Search"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
              </Link>
              <ProfileAvatarLink />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6">
          <p className="text-[13px] text-zinc-500">
            Publishers you follow. Their new work shows up in Activity.
          </p>

          {!ready ? (
            <p className="mt-16 text-center text-[14px] text-zinc-600">
              Loading…
            </p>
          ) : follows.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-[14px] text-zinc-500">
                You're not following anyone yet.
              </p>
              <Link
                href="/explore"
                className="mt-5 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Explore publishers
              </Link>
            </div>
          ) : (
            <ul className="mt-5 space-y-2.5">
              {follows.map((f) => {
                const entity = SEED_ENTITIES.find(
                  (e) => e.type === f.type && e.slug === f.slug
                );
                const pubCount = entity
                  ? publicationsByPublisher(entity.id).length
                  : 0;
                return (
                  <li key={`${f.type}-${f.slug}`}>
                    <Link
                      href={`/e/${f.type}/${f.slug}`}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/[0.08] transition hover:ring-white/15"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-omniv-gold/20 text-base font-semibold text-omniv-gold">
                        {f.name.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-white">
                          {f.name}
                        </p>
                        <p className="truncate text-[12px] capitalize text-zinc-500">
                          {entity?.tagline ?? f.type}
                          {pubCount > 0 ? ` · ${pubCount} posts` : ""}
                        </p>
                      </div>
                      <span className="text-zinc-600">›</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {follows.length > 0 && (
            <Link
              href="/activity"
              className="mt-8 block text-center text-[13px] text-omniv-gold hover:underline"
            >
              See activity feed →
            </Link>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
