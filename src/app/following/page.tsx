"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { readFollows, type FollowedRef } from "@/lib/discovery/local-graph";
import { SEED_ENTITIES, publicationsByPublisher } from "@/lib/discovery/seed";

export default function FollowingPage() {
  const [follows, setFollows] = useState<FollowedRef[]>([]);

  useEffect(() => {
    setFollows(readFollows());
  }, []);

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3 md:max-w-2xl">
          <Image
            src="/logo.svg"
            alt="Omniv"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-[15px] font-semibold text-white">Following</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-24 pt-5 md:max-w-2xl">
        <p className="text-[13px] text-zinc-500">
          Publishers you follow. Their new work shows up in Activity.
        </p>

        {follows.length === 0 ? (
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
          <ul className="mt-6 space-y-3">
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
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-white/25"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-omniv-gold/20 text-base font-semibold text-omniv-gold">
                      {f.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-white">
                        {f.name}
                      </p>
                      <p className="truncate text-[12px] text-zinc-500">
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
  );
}
