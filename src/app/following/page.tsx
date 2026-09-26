"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { NotificationBell } from "@/components/discovery/notification-bell";
import { ProfileAvatarLink } from "@/components/discovery/profile-avatar-link";
import { readFollows, type FollowedRef } from "@/lib/discovery/local-graph";
import { SEED_ENTITIES, publicationsByPublisher } from "@/lib/discovery/seed";

const PEOPLE_TYPES = new Set(["person", "artist"]);

const TOPICS = [
  "Artificial Intelligence",
  "African infrastructure",
  "Music",
  "Energy",
  "Research",
  "Technology",
  "Business",
];

export default function FollowingPage() {
  const [follows, setFollows] = useState<FollowedRef[]>([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"people" | "entities" | "topics">("people");

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

  const people = useMemo(
    () => follows.filter((f) => PEOPLE_TYPES.has(f.type)),
    [follows]
  );
  const entities = useMemo(
    () => follows.filter((f) => !PEOPLE_TYPES.has(f.type)),
    [follows]
  );

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
            <div className="flex items-center gap-1">
              <NotificationBell />
              <ProfileAvatarLink />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl md:px-6">
          <p className="text-[13px] text-zinc-500">
            Discovery subscriptions — people, entities, and topics.
          </p>

          <div className="mt-4 flex gap-2">
            {(
              [
                { id: "people" as const, label: "People" },
                { id: "entities" as const, label: "Entities" },
                { id: "topics" as const, label: "Topics" },
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
            <p className="mt-16 text-center text-[14px] text-zinc-600">
              Loading…
            </p>
          ) : tab === "topics" ? (
            <ul className="mt-5 space-y-2">
              {TOPICS.map((topic) => (
                <li key={topic}>
                  <Link
                    href={`/explore?interest=${encodeURIComponent(topic)}`}
                    className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3.5"
                  >
                    <span className="text-[14px] font-medium text-white">
                      {topic}
                    </span>
                    <span className="text-zinc-600">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (tab === "people" ? people : entities).length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-[14px] text-zinc-500">
                {tab === "people"
                  ? "Not following any people yet."
                  : "Not following any entities yet."}
              </p>
              <Link
                href="/explore"
                className="mt-5 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Explore
              </Link>
            </div>
          ) : (
            <ul className="mt-5 space-y-2.5">
              {(tab === "people" ? people : entities).map((f) => {
                const entity = SEED_ENTITIES.find(
                  (e) => e.type === f.type && e.slug === f.slug
                );
                const pubCount = entity
                  ? publicationsByPublisher(entity.id).length
                  : 0;
                const isPerson = PEOPLE_TYPES.has(f.type);
                return (
                  <li key={`${f.type}-${f.slug}`}>
                    <Link
                      href={`/e/${f.type}/${f.slug}`}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 transition hover:bg-white/[0.05]"
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center text-base font-semibold ${
                          isPerson
                            ? "rounded-full bg-white/10 text-white"
                            : "rounded-xl bg-omniv-gold/20 text-omniv-gold"
                        }`}
                      >
                        {f.name.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-white">
                          {f.name}
                        </p>
                        <p className="truncate text-[12px] text-zinc-500">
                          {entity?.tagline ?? f.type}
                          {entity?.location ? ` · ${entity.location}` : ""}
                          {pubCount > 0 ? ` · ${pubCount} posts` : ""}
                        </p>
                      </div>
                      <span className="text-[12px] text-zinc-500">Following</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-8 flex justify-center gap-4 text-[13px]">
            <Link href="/followers" className="text-omniv-gold hover:underline">
              Followers →
            </Link>
            <Link href="/activity" className="text-zinc-500 hover:text-white">
              Activity →
            </Link>
          </div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
