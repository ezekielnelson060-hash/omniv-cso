"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicationActions } from "@/components/discovery/publication-actions";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  SEED_ENTITIES,
  SEED_PUBLICATIONS,
} from "@/lib/discovery/seed";
import {
  entityPath,
  publicationPath,
  type DiscoveryEntity,
  type Publication,
} from "@/lib/discovery/types";

type LivePub = {
  id: string;
  type: string;
  slug: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  publisherName?: string;
  coverUrl?: string;
  heat?: number;
};

function FollowChip({ e }: { e: DiscoveryEntity }) {
  const initial = (e.name || "?").charAt(0).toUpperCase();
  return (
    <Link
      href={entityPath(e)}
      className="flex w-[120px] shrink-0 flex-col items-center rounded-2xl bg-white/[0.03] px-3 py-3.5 ring-1 ring-white/[0.07] transition hover:bg-white/[0.06]"
    >
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-omniv-gold/40 to-omniv-gold/10 ring-1 ring-white/10">
        {e.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[18px] font-semibold text-omniv-gold">
            {initial}
          </span>
        )}
      </div>
      <p className="mt-2 w-full truncate text-center text-[13px] font-medium text-white">
        {e.name}
      </p>
      <p className="w-full truncate text-center text-[11px] capitalize text-zinc-500">
        {e.type}
      </p>
      <span className="mt-2 inline-flex h-7 items-center rounded-full bg-omniv-gold/15 px-3 text-[11px] font-semibold text-omniv-gold ring-1 ring-omniv-gold/25">
        View
      </span>
    </Link>
  );
}

function ArticleRow({ p }: { p: Publication }) {
  return (
    <Link
      href={publicationPath(p)}
      className="flex gap-3 rounded-xl px-1 py-2.5 transition hover:bg-white/[0.03]"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/[0.08]">
        {p.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wide text-zinc-600">
            {p.type}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[14px] font-medium leading-snug text-white">
          {p.title}
        </p>
        <p className="mt-1 text-[12px] capitalize text-zinc-500">
          {p.type}
          {p.publisherName ? ` · ${p.publisherName}` : ""}
        </p>
      </div>
    </Link>
  );
}

function ProfileDiscover() {
  const people = useMemo(
    () =>
      [...SEED_ENTITIES]
        .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
        .slice(0, 8),
    []
  );
  const articles = useMemo(
    () =>
      [...SEED_PUBLICATIONS]
        .filter((p) => p.type === "article" || p.type === "research")
        .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
        .slice(0, 5),
    []
  );
  const more = useMemo(
    () =>
      [...SEED_PUBLICATIONS]
        .filter((p) => p.type !== "article" && p.type !== "research")
        .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
        .slice(0, 4),
    []
  );

  return (
    <div className="space-y-7 pb-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-omniv-gold/15 via-omniv-gold/5 to-transparent px-4 py-3.5 ring-1 ring-omniv-gold/20">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-white">
            Put something into the world
          </p>
          <p className="mt-0.5 text-[12px] text-zinc-400">
            Articles, products, research — explorers are waiting.
          </p>
        </div>
        <Link
          href="/publish"
          className="shrink-0 rounded-full bg-omniv-gold px-4 py-2 text-[12px] font-semibold text-black"
        >
          Publish
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-white">People to follow</p>
          <Link
            href="/explore"
            className="text-[12px] font-medium text-omniv-gold"
          >
            See all
          </Link>
        </div>
        <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
          {people.map((e) => (
            <FollowChip key={e.id} e={e} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-white">Worth reading</p>
          <Link
            href="/explore"
            className="text-[12px] font-medium text-omniv-gold"
          >
            Explore
          </Link>
        </div>
        <ul className="divide-y divide-white/[0.05] rounded-2xl bg-white/[0.02] px-3 ring-1 ring-white/[0.06]">
          {articles.map((p) => (
            <li key={p.id}>
              <ArticleRow p={p} />
            </li>
          ))}
        </ul>
      </section>

      {more.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-white">Also on Omniv</p>
            <Link href="/explore" className="text-[12px] font-medium text-omniv-gold">
              Discover
            </Link>
          </div>
          <ul className="divide-y divide-white/[0.05] rounded-2xl bg-white/[0.02] px-3 ring-1 ring-white/[0.06]">
            {more.map((p) => (
              <li key={p.id}>
                <ArticleRow p={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/home"
        className="flex h-11 items-center justify-center rounded-full bg-white/[0.06] text-[13px] font-medium text-white ring-1 ring-white/10"
      >
        Open For You feed
      </Link>
    </div>
  );
}

export function ProfilePosts() {
  const [pubs, setPubs] = useState<LivePub[] | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState("You");

  useEffect(() => {
    const p = readProfile();
    setAvatar(p.avatarUrl || null);
    setName(p.displayName || "You");

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "/api/discovery/publications/list?owner=me&limit=20"
        );
        const data = await res.json();
        if (cancelled) return;
        setPubs(Array.isArray(data.publications) ? data.publications : []);
      } catch {
        if (!cancelled) setPubs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (pubs === null) {
    return (
      <p className="py-8 text-center text-[14px] text-zinc-600">Loading…</p>
    );
  }

  if (pubs.length === 0) {
    return <ProfileDiscover />;
  }

  return (
    <ul className="divide-y divide-white/[0.06]">
      {pubs.map((p) => {
        const who = p.publisherName || name;
        return (
          <li key={p.id} className="py-4 first:pt-1">
            <div className="flex gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-omniv-gold/20 ring-1 ring-white/10">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[13px] font-semibold text-omniv-gold">
                    {who.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="truncate text-[14px] font-semibold text-white">
                    {who}
                  </span>
                  <span className="shrink-0 text-[12px] capitalize text-zinc-600">
                    · {p.type}
                    {p.publishedAt ? ` · ${p.publishedAt}` : ""}
                  </span>
                </div>
                <Link href={`/p/${p.slug}`} className="mt-1 block">
                  <p className="text-[15px] font-medium leading-snug text-white">
                    {p.title}
                  </p>
                  {p.summary && (
                    <p className="mt-1 line-clamp-3 text-[14px] leading-relaxed text-zinc-400">
                      {p.summary}
                    </p>
                  )}
                  {p.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverUrl}
                      alt=""
                      className="mt-3 max-h-48 w-full rounded-2xl object-cover ring-1 ring-white/[0.08]"
                    />
                  )}
                </Link>
                <div className="mt-1.5">
                  <PublicationActions
                    slug={p.slug}
                    type={p.type}
                    title={p.title}
                    publishedAt={p.publishedAt}
                    initialLikes={p.heat ?? 0}
                    compact
                  />
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
