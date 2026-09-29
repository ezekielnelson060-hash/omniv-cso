"use client";

import Link from "next/link";
import Image from "next/image";
import { SEED_ENTITIES } from "@/lib/discovery/seed";
import { risingScore } from "@/lib/discovery/signals";
import type { Publication } from "@/lib/discovery/types";

function pubPath(p: Publication) {
  return `/p/${p.slug}`;
}

function topicFromPub(p: Publication): string {
  const tag = (p.tags || []).find(
    (t) => t && t.length > 2 && !/^(money|people|article|event)$/i.test(t)
  );
  if (tag) return tag;
  if (p.category && p.category.length > 2) return p.category;
  const words = (p.title || "").split(/\s+/).slice(0, 4).join(" ");
  return words || p.type || "Discovery";
}

function dedupeTopics(
  rows: { topic: string; weight: number }[],
  limit = 5
) {
  const seen = new Set<string>();
  const out: { topic: string; weight: number }[] = [];
  for (const r of rows) {
    const key = r.topic.trim().toLowerCase();
    if (!key || key.length < 2 || seen.has(key)) continue;
    if (
      ["article", "music", "research", "product", "event", "file"].includes(
        key
      )
    )
      continue;
    seen.add(key);
    out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}

export function HomeDiscoverySurface({
  items,
  momentumTopics,
}: {
  items: Publication[];
  momentumTopics: { topic: string; weight: number }[];
}) {
  const hero = items[0];
  const thread = items.slice(1, 4);
  const threadTopic =
    hero?.category ||
    hero?.tags?.[0] ||
    (hero?.title ? hero.title.split(" ").slice(0, 3).join(" ") : "this thread");

  const serendipity =
    items.length > 6
      ? items[
          4 +
            (Math.floor(Date.now() / 300000) % Math.max(1, items.length - 4))
        ]
      : items[items.length - 1];

  const tags = new Set(
    [...(hero?.tags || []), hero?.category || ""]
      .filter(Boolean)
      .map((t) => String(t).toLowerCase())
  );
  const related = SEED_ENTITIES.filter((e) => {
    const hay = `${e.name} ${e.type} ${e.tagline || ""}`.toLowerCase();
    return [...tags].some(
      (t) => t && t.length > 2 && hay.includes(t.slice(0, 5))
    );
  }).slice(0, 4);

  const rising = dedupeTopics(
    momentumTopics.length > 0
      ? momentumTopics.map((t) => ({
          topic: t.topic,
          weight: t.weight,
        }))
      : items.map((p, i) => ({
          topic: topicFromPub(p),
          weight: risingScore(p) * 100 + (20 - i),
        })),
    5
  );

  if (!hero) return null;

  return (
    <div className="mb-8 space-y-8">
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Discover what's moving
        </p>
        <Link
          href={pubPath(hero)}
          className="mt-3 block overflow-hidden rounded-2xl ring-1 ring-white/[0.08] transition hover:ring-omniv-gold/30"
        >
          {hero.coverUrl ? (
            <div className="relative aspect-[16/9] bg-zinc-900">
              <Image
                src={hero.coverUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-omniv-gold">
                  {(hero.type || "article").replace(/_/g, " ")}
                </p>
                <h2 className="mt-1 text-[20px] font-semibold leading-snug text-white">
                  {hero.title}
                </h2>
                <p className="mt-1 text-[13px] text-zinc-300">
                  {hero.publisherName || "Omniv"}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.03] p-5">
              <p className="text-[11px] uppercase tracking-wide text-omniv-gold">
                {(hero.type || "article").replace(/_/g, " ")}
              </p>
              <h2 className="mt-2 text-[20px] font-semibold text-white">
                {hero.title}
              </h2>
              <p className="mt-2 text-[13px] text-zinc-500">
                {hero.summary || hero.publisherName}
              </p>
            </div>
          )}
        </Link>
      </section>

      {thread.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Continue exploring
          </p>
          <p className="mt-1 text-[13px] text-zinc-500">
            You started exploring{" "}
            <span className="text-zinc-300">{threadTopic}</span>
          </p>
          <p className="mt-0.5 text-[12px] text-zinc-600">
            You might want to continue with:
          </p>
          <div className="mt-3 space-y-2">
            {thread.map((p) => (
              <Link
                key={p.id}
                href={pubPath(p)}
                className="flex gap-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06] transition hover:bg-white/[0.05]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                    {(p.type || "article").replace(/_/g, " ")}
                  </p>
                  <p className="mt-0.5 text-[14px] font-medium leading-snug text-white">
                    {p.title}
                  </p>
                </div>
                <span className="shrink-0 self-center text-zinc-600">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Then there's this
          </p>
          <p className="mt-1 text-[13px] text-zinc-500">
            Connected to what you just saw
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {related.map((e) => (
              <Link
                key={e.id}
                href={`/e/${e.type}/${e.slug}`}
                className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06] transition hover:ring-omniv-gold/25"
              >
                <p className="text-[11px] capitalize text-zinc-500">{e.type}</p>
                <p className="mt-1 text-[14px] font-medium text-white">{e.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {rising.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Rising now
          </p>
          <p className="mt-1 text-[13px] text-zinc-500">
            Things people are starting to discover
          </p>
          <ul className="mt-3 space-y-1">
            {rising.map((t, i) => (
              <li key={t.topic + i}>
                <Link
                  href={`/explore?q=${encodeURIComponent(t.topic)}`}
                  className="flex items-center justify-between rounded-xl px-1 py-2 transition hover:bg-white/[0.03]"
                >
                  <span className="text-[14px] text-white">{t.topic}</span>
                  <span className="text-[12px] text-omniv-gold">
                    ↑{" "}
                    {Math.max(
                      12,
                      Math.round(Math.min(99, t.weight || 20 + i * 7))
                    )}
                    %
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {serendipity && serendipity.id !== hero.id && (
        <section className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.08]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            You probably weren't looking for this
          </p>
          <p className="mt-1 text-[12px] text-zinc-600">
            But you might want to see it.
          </p>
          <Link href={pubPath(serendipity)} className="mt-3 block">
            <p className="text-[16px] font-semibold leading-snug text-white">
              {serendipity.title}
            </p>
            <p className="mt-1 text-[13px] text-zinc-500">
              {(serendipity.type || "article").replace(/_/g, " ")}
              {serendipity.publisherName
                ? ` · ${serendipity.publisherName}`
                : ""}
            </p>
          </Link>
        </section>
      )}
    </div>
  );
}
