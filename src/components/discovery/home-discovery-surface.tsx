"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { PublicationCard } from "@/components/discovery/publication-card";
import { RecommendationReason } from "@/components/discovery/recommendation-reason";
import {
  PUBLICATION_LABELS,
  publicationPath,
  entityPath,
  type Publication,
} from "@/lib/discovery/types";
import { SEED_ENTITIES } from "@/lib/discovery/seed";
import { coverFor } from "@/lib/discovery/seed-covers";
import {
  moreLikeThis,
  lessLikeThis,
  recommendationReason,
} from "@/lib/discovery/recommend";
import { readInterests } from "@/lib/discovery/interests";

type Props = {
  publications: Publication[];
  firstName?: string;
};

function shuffle<T>(arr: T[], salt = 0): T[] {
  const a = [...arr];
  let s = (salt * 1103515245 + 12345) >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function readMins(pub: Publication) {
  const body =
    (pub as Publication & { body?: string }).body || pub.summary || "";
  const words = body.split(/\s+/).filter(Boolean).length;
  const m = Math.max(3, Math.min(18, Math.round(words / 180) || 6));
  return `${m} min`;
}

function primaryTopic(pub: Publication): string {
  const t = (pub.tags || []).find((x) => x && x.length > 2);
  if (t) return t;
  if (pub.category) return pub.category;
  return PUBLICATION_LABELS[pub.type] || "Discovery";
}

function StreamFeedback({ pub }: { pub: Publication }) {
  const [tick, setTick] = useState(0);
  const interests = useMemo(() => {
    void tick;
    try {
      return readInterests();
    } catch {
      return [];
    }
  }, [tick]);
  const reason = recommendationReason(pub, "for-you", interests);

  function onMore() {
    moreLikeThis(pub);
    setTick((n) => n + 1);
  }
  function onLess() {
    lessLikeThis(pub);
    setTick((n) => n + 1);
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
      {reason ? (
        <RecommendationReason reason={reason} />
      ) : (
        <span className="text-[12px] font-medium text-zinc-400">
          Why am I seeing this?
        </span>
      )}
      <span className="text-[12px] text-zinc-600" aria-hidden>
        ·
      </span>
      <button
        type="button"
        onClick={onMore}
        className="text-[12px] font-medium text-zinc-400 hover:text-omniv-gold"
      >
        More like this
      </button>
      <span className="text-[12px] text-zinc-600" aria-hidden>
        ·
      </span>
      <button
        type="button"
        onClick={onLess}
        className="text-[12px] font-medium text-zinc-500 hover:text-zinc-300"
      >
        Less
      </button>
    </div>
  );
}

export function HomeDiscoverySurface({ publications, firstName }: Props) {
  const [salt, setSalt] = useState(0);
  const [followSlugs, setFollowSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSalt(Date.now() % 997);
    (async () => {
      try {
        const res = await fetch("/api/discovery/follow");
        const data = await res.json();
        if (Array.isArray(data.follows)) {
          setFollowSlugs(
            data.follows
              .map((f: { slug?: string; name?: string }) =>
                String(f.slug || f.name || "").toLowerCase()
              )
              .filter(Boolean)
          );
        }
      } catch {
        /* guest */
      }
    })();
  }, []);

  const pool = useMemo(
    () => shuffle(
      publications.filter((p) => p.slug),
      salt
    ),
    [publications, salt]
  );

  const featured = pool[0] || null;
  const threadTopic = featured ? primaryTopic(featured) : "Discovery";

  const threadPubs = useMemo(() => {
    if (!featured) return [];
    const topic = threadTopic.toLowerCase();
    const related = pool.filter((p) => {
      if (p.id === featured.id) return false;
      const hay = [...(p.tags || []), p.category || "", p.type]
        .join(" ")
        .toLowerCase();
      return topic
        .split(/\s+/)
        .some((w) => w.length > 2 && hay.includes(w.slice(0, 5)));
    });
    return (related.length ? related : pool.slice(1)).slice(0, 6);
  }, [pool, featured, threadTopic]);

  const thenEntities = useMemo(() => {
    const shuffled = shuffle(SEED_ENTITIES, salt + 7);
    const topic = threadTopic.toLowerCase();
    const matched = shuffled.filter((e) => {
      const hay = `${e.name} ${e.type} ${e.tagline || ""} ${(e.tags || []).join(" ")}`.toLowerCase();
      return topic
        .split(/\s+/)
        .some((w) => w.length > 2 && hay.includes(w.slice(0, 4)));
    });
    return (matched.length >= 2 ? matched : shuffled).slice(0, 4);
  }, [threadTopic, salt]);

  const risingTopics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of pool) {
      for (const t of [...(p.tags || []), p.category || ""]) {
        const k = (t || "").trim();
        if (k.length < 3) continue;
        counts.set(k, (counts.get(k) || 0) + 1 + (p.heat || 0) / 50);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .filter(
        (t, i, arr) =>
          arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i
      )
      .slice(0, 6);
  }, [pool]);

  const moreStream = useMemo(
    () => shuffle(pool.slice(1), salt + 13).slice(0, 24),
    [pool, salt]
  );

  const followedPubs = useMemo(() => {
    if (!followSlugs.length) return [];
    return pool.filter((p) => {
      const slug = (
        (p as Publication & { publisherSlug?: string }).publisherSlug ||
        p.publisherName ||
        ""
      ).toLowerCase();
      const id = (p.publisherId || "").toLowerCase();
      return followSlugs.some(
        (f) =>
          (slug && (slug.includes(f) || f.includes(slug))) || (id && id === f)
      );
    });
  }, [pool, followSlugs]);

  const name = firstName?.trim() || null;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[15px] text-zinc-400">
          {greeting()}
          {name ? (
            <>
              , <span className="text-white">{name}</span>.
            </>
          ) : (
            "."
          )}
        </p>
      </div>

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Discover what's moving
        </p>
        <div className="mt-1 h-px w-full bg-white/[0.06]" />

        {featured && (
          <div className="mt-4 space-y-4">
            <Link
              href={`/explore?interest=${encodeURIComponent(threadTopic)}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3.5 py-1.5 text-[12px] font-medium text-zinc-200 ring-1 ring-white/[0.08] transition hover:bg-white/[0.08] hover:text-white"
            >
              {threadTopic}
              <span className="text-zinc-500">→</span>
            </Link>
            <p className="text-[12px] text-zinc-500">
              {Math.min(pool.length, 12)} things worth knowing
            </p>

            <Link
              href={publicationPath(featured)}
              className="group block overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.07] transition hover:ring-omniv-gold/30"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {featured.coverUrl || coverFor(featured.slug) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.coverUrl || coverFor(featured.slug)}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h2 className="text-[18px] font-semibold leading-snug text-white md:text-[20px]">
                    {featured.title}
                  </h2>
                  <p className="mt-2 text-[12px] text-zinc-300">
                    <span className="font-semibold text-white">
                      {featured.publisherName || "Publisher"}
                    </span>
                    {" · "}
                    {PUBLICATION_LABELS[featured.type] || featured.type}
                    {" · "}
                    {readMins(featured)}
                  </p>
                </div>
              </div>
            </Link>

            <StreamFeedback pub={featured} />

            <Link
              href={`/explore?interest=${encodeURIComponent(threadTopic)}`}
              className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 transition hover:text-omniv-gold"
            >
              <span className="text-zinc-600">↓</span> Keep exploring
            </Link>
          </div>
        )}
      </section>

      {threadPubs.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {threadTopic}
          </p>
          <div className="mt-1 h-px w-full bg-white/[0.06]" />

          <div className="mt-3 flex flex-wrap gap-2">
            {["Article", "Research", "Company"].map((label) => (
              <span
                key={label}
                className="rounded-full bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-zinc-400 ring-1 ring-white/[0.06]"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {threadPubs.slice(0, 2).map((p) => (
              <Link
                key={p.id}
                href={publicationPath(p)}
                className="block rounded-2xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.06] transition hover:bg-white/[0.05] hover:ring-omniv-gold/20"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {PUBLICATION_LABELS[p.type] || p.type}
                </p>
                <p className="mt-1 text-[15px] font-medium leading-snug text-white">
                  {p.title}
                </p>
              </Link>
            ))}
          </div>

          <Link
            href={`/explore?interest=${encodeURIComponent(threadTopic)}`}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-omniv-gold"
          >
            Explore this thread <span>→</span>
          </Link>
        </section>
      )}

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Then there's this
        </p>
        <div className="mt-1 h-px w-full bg-white/[0.06]" />
        <p className="mt-3 text-[13px] text-zinc-500">
          You read: <span className="text-zinc-300">{threadTopic}</span>
        </p>
        <p className="mt-0.5 text-[13px] text-zinc-500">You might want to see:</p>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {thenEntities.map((e) => (
            <Link
              key={e.id}
              href={entityPath(e)}
              className="flex flex-col rounded-2xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.06] transition hover:bg-white/[0.05] hover:ring-omniv-gold/25"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                {e.type}
              </span>
              <span className="mt-1.5 text-[14px] font-medium leading-snug text-white">
                {e.name}
              </span>
              {e.tagline && (
                <span className="mt-1 line-clamp-2 text-[11px] text-zinc-500">
                  {e.tagline}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {risingTopics.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Rising now
          </p>
          <div className="mt-1 h-px w-full bg-white/[0.06]" />
          <p className="mt-3 text-[13px] text-zinc-500">
            Things people are starting to discover
          </p>
          <ul className="mt-3 space-y-2.5">
            {risingTopics.map((t) => (
              <li key={t}>
                <Link
                  href={`/explore?interest=${encodeURIComponent(t)}`}
                  className="flex items-center gap-2 text-[14px] text-zinc-200 transition hover:text-omniv-gold"
                >
                  <span className="text-zinc-600">•</span>
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {followedPubs.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            From people you follow
          </p>
          <div className="mt-1 h-px w-full bg-white/[0.06]" />
          <div className="mt-4 space-y-3">
            {followedPubs.slice(0, 4).map((p) => (
              <div key={`f-${p.id}`}>
                <PublicationCard pub={p} />
                <StreamFeedback pub={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Keep exploring
        </p>
        <div className="mt-1 h-px w-full bg-white/[0.06]" />
        <Link
          href={`/explore?interest=${encodeURIComponent(threadTopic)}`}
          className="mt-4 flex items-center justify-between rounded-2xl bg-omniv-gold/10 px-4 py-3.5 ring-1 ring-omniv-gold/25 transition hover:bg-omniv-gold/15"
        >
          <span className="text-[14px] font-medium text-omniv-gold">
            Explore {threadTopic}
          </span>
          <span className="text-omniv-gold">→</span>
        </Link>
      </section>

      {moreStream.length > 0 && (
        <section className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            More to discover
          </p>
          <div className="h-px w-full bg-white/[0.06]" />
          {moreStream.map((p) => (
            <div key={p.id}>
              <PublicationCard pub={p} />
              <StreamFeedback pub={p} />
            </div>
          ))}
          <div className="mt-6 rounded-2xl bg-white/[0.03] px-5 py-8 text-center ring-1 ring-white/[0.06]">
            <p className="text-[15px] font-medium text-white">
              Looking for something specific?
            </p>
            <p className="mt-1.5 text-[13px] text-zinc-500">
              Search people, companies, brands, products, and opportunities.
            </p>
            <Link
              href="/explore"
              className="mt-5 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
            >
              Open Explore
            </Link>
          </div>
        </section>
      )}

      {moreStream.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white/[0.03] px-5 py-8 text-center ring-1 ring-white/[0.06]">
          <p className="text-[15px] font-medium text-white">
            Looking for something specific?
          </p>
          <p className="mt-1.5 text-[13px] text-zinc-500">
            Search people, companies, brands, products, and opportunities.
          </p>
          <Link
            href="/explore"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
          >
            Open Explore
          </Link>
        </div>
      )}
    </div>
  );
}
