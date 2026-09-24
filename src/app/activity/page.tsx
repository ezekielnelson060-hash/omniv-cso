"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { readFollows, type FollowedRef } from "@/lib/discovery/local-graph";
import {
  SEED_ENTITIES,
  SEED_PUBLICATIONS,
  publicationsByPublisher,
} from "@/lib/discovery/seed";
import { PUBLICATION_LABELS, publicationPath } from "@/lib/discovery/types";

export default function ActivityPage() {
  const [follows, setFollows] = useState<FollowedRef[]>([]);

  useEffect(() => {
    setFollows(readFollows());
  }, []);

  const feed = useMemo(() => {
    if (follows.length === 0) return [];

    const ids = new Set<string>();
    for (const f of follows) {
      const e =
        SEED_ENTITIES.find((x) => x.type === f.type && x.slug === f.slug) ??
        (f.id ? SEED_ENTITIES.find((x) => x.id === f.id) : undefined);
      if (e) ids.add(e.id);
    }

    return SEED_PUBLICATIONS.filter((p) => ids.has(p.publisherId))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 40)
      .map((p) => {
        const publisher = SEED_ENTITIES.find((e) => e.id === p.publisherId);
        return { pub: p, publisher };
      });
  }, [follows]);

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
          <span className="text-[15px] font-semibold text-white">Activity</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-24 pt-5 md:max-w-2xl">
        {follows.length === 0 ? (
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
        ) : feed.length === 0 ? (
          <p className="pt-10 text-center text-[14px] text-zinc-500">
            People you follow haven't published yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {feed.map(({ pub, publisher }) => (
              <li key={pub.id}>
                <Link
                  href={publicationPath(pub)}
                  className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-white/25"
                >
                  <p className="text-[12px] text-zinc-500">
                    <span className="font-medium text-zinc-300">
                      {publisher?.name ?? "Publisher"}
                    </span>{" "}
                    published a{" "}
                    {PUBLICATION_LABELS[pub.type].toLowerCase()}
                  </p>
                  <p className="mt-1.5 text-[15px] font-semibold text-white">
                    {pub.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[12px] text-zinc-500">
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
                  className="rounded-full border border-white/10 px-3 py-1 text-[12px] text-zinc-400 hover:text-white"
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
  );
}
