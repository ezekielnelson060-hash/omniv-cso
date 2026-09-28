"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicationActions } from "@/components/discovery/publication-actions";
import { SaveButton } from "@/components/discovery/save-button";
import { readProfile } from "@/lib/discovery/local-profile";
import { coverFor } from "@/lib/discovery/seed-covers";
import { SEED_ENTITIES, SEED_PUBLICATIONS } from "@/lib/discovery/seed";
import {
  ENTITY_LABELS,
  PUBLICATION_LABELS,
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
  meta?: string;
};

const ENTITY_TONE: Record<string, string> = {
  company: "from-sky-600/40 via-blue-950/20 to-transparent",
  brand: "from-rose-600/35 via-red-950/20 to-transparent",
  person: "from-violet-600/35 via-purple-950/20 to-transparent",
  artist: "from-fuchsia-600/35 via-purple-950/20 to-transparent",
  product: "from-amber-600/35 via-orange-950/20 to-transparent",
  project: "from-emerald-600/30 via-teal-950/20 to-transparent",
  organization: "from-cyan-600/35 via-slate-950/20 to-transparent",
  place: "from-lime-600/30 via-green-950/20 to-transparent",
};

const PUBLICATION_TONE: Record<string, string> = {
  article: "from-sky-900/80 to-slate-950",
  music: "from-fuchsia-900/70 to-purple-950",
  video: "from-rose-900/70 to-red-950",
  research: "from-emerald-900/60 to-teal-950",
  product: "from-amber-900/50 to-orange-950",
  event: "from-violet-900/60 to-indigo-950",
  announcement: "from-zinc-800/50 to-zinc-950",
  opportunity: "from-yellow-900/40 to-yellow-950",
  file: "from-cyan-900/50 to-slate-950",
};

function EntityCard({ entity }: { entity: DiscoveryEntity }) {
  const media = entity.avatarUrl || coverFor(entity.slug);
  const tone = ENTITY_TONE[entity.type] || ENTITY_TONE.project;
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#0b0b0b] p-4 ring-1 ring-white/[0.08] transition hover:ring-omniv-gold/35">
      <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-25`} />
      <div className="relative flex items-start gap-3">
        <Link href={entityPath(entity)} className="flex min-w-0 flex-1 gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/40 text-[16px] font-semibold text-white ring-1 ring-white/15">
            {media ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{entity.name.slice(0, 1)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-white group-hover:text-omniv-gold">
              {entity.name}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              {ENTITY_LABELS[entity.type] || entity.type}
            </p>
            {entity.tagline && (
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-400">
                {entity.tagline}
              </p>
            )}
          </div>
        </Link>
        <SaveButton
          kind="entity"
          type={entity.type}
          slug={entity.slug}
          name={entity.name}
        />
      </div>
    </div>
  );
}

function PubCard({
  p,
  publisherName,
}: {
  p: LivePub | Publication;
  publisherName?: string;
}) {
  const type = p.type;
  const cover = ("coverUrl" in p && p.coverUrl) || coverFor(p.slug);
  const tone = PUBLICATION_TONE[type] || PUBLICATION_TONE.article;
  const label =
    PUBLICATION_LABELS[type as keyof typeof PUBLICATION_LABELS] || type;
  const meta =
    ("meta" in p && p.meta) ||
    [label, publisherName].filter(Boolean).join(" · ");

  return (
    <div className="group overflow-hidden rounded-2xl bg-[#0b0b0b] ring-1 ring-white/[0.08] transition hover:ring-omniv-gold/35">
      <div className="flex gap-3.5 p-3">
        <Link
          href={`/p/${p.slug}`}
          className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl sm:w-32"
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${tone}`} />
          )}
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
            {label}
          </span>
        </Link>
        <div className="min-w-0 flex-1 py-0.5">
          <Link href={`/p/${p.slug}`}>
            <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-white group-hover:text-omniv-gold">
              {p.title}
            </p>
            {p.summary && (
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                {p.summary}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-zinc-600">{meta}</p>
          </Link>
          <div className="mt-1">
            <PublicationActions
              slug={p.slug}
              type={type}
              title={p.title}
              publishedAt={p.publishedAt}
              initialLikes={0}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function WorthRow({ p }: { p: Publication }) {
  const label =
    PUBLICATION_LABELS[p.type as keyof typeof PUBLICATION_LABELS] || p.type;
  return (
    <Link
      href={publicationPath(p)}
      className="flex items-center gap-3 px-1 py-3 transition hover:bg-white/[0.03]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.08]">
        <span className="max-w-[44px] truncate text-center text-[8px] font-semibold uppercase leading-tight tracking-wide text-zinc-500">
          {label}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[14px] font-medium leading-snug text-white">
          {p.title}
        </p>
        <p className="mt-0.5 text-[12px] capitalize text-zinc-500">{label}</p>
      </div>
    </Link>
  );
}

function ProfileDiscover() {
  const people = useMemo(
    () => SEED_ENTITIES.filter((e) => e.type === "person").slice(0, 8),
    []
  );
  const companies = useMemo(
    () =>
      SEED_ENTITIES.filter((e) =>
        ["company", "brand", "organization", "product"].includes(e.type)
      ).slice(0, 6),
    []
  );
  const entities = useMemo(() => {
    const mixed = [...companies, ...people];
    if (mixed.length >= 6) return mixed.slice(0, 8);
    return SEED_ENTITIES.slice(0, 8);
  }, [companies, people]);

  const articles = useMemo(
    () =>
      SEED_PUBLICATIONS.filter((p) =>
        ["article", "research"].includes(p.type)
      ).slice(0, 6),
    []
  );
  const musicAndMore = useMemo(
    () =>
      SEED_PUBLICATIONS.filter((p) =>
        ["music", "product", "opportunity", "event"].includes(p.type)
      ).slice(0, 8),
    []
  );

  return (
    <div className="space-y-8 pt-2">
      <div className="rounded-2xl bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.06]">
        <p className="text-[14px] font-medium text-white">
          Your publications will live here
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Articles, music, research, products — explorers discover them from
          your profile.
        </p>
        <Link
          href="/publish"
          className="mt-3 inline-flex h-9 items-center rounded-full bg-omniv-gold px-4 text-[12px] font-semibold text-black"
        >
          Publish
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-white">Entities</h3>
            <p className="mt-1 text-[13px] text-zinc-600">
              People, entities, and systems to follow on Omniv.
            </p>
          </div>
          <span className="text-[11px] text-zinc-700">
            {entities.length} connections
          </span>
        </div>
        <div className="space-y-3">
          {entities.map((e) => (
            <EntityCard key={e.id} entity={e} />
          ))}
        </div>
      </section>

      {musicAndMore.length > 0 && (
        <section>
          <div className="mb-3">
            <h3 className="text-[15px] font-semibold text-white">
              Publications
            </h3>
            <p className="mt-1 text-[13px] text-zinc-600">
              More to read, listen to, or act on.
            </p>
          </div>
          <div className="space-y-3">
            {musicAndMore.map((p) => (
              <PubCard key={p.id} p={p} publisherName={p.publisherName} />
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[15px] font-semibold text-white">Worth reading</p>
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
                <WorthRow p={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/explore"
        className="flex h-11 items-center justify-center rounded-full bg-white/[0.06] text-[13px] font-medium text-white ring-1 ring-white/10"
      >
        Open Explore
      </Link>
    </div>
  );
}

export function ProfilePosts() {
  const [pubs, setPubs] = useState<LivePub[] | null>(null);
  const [name, setName] = useState("You");

  useEffect(() => {
    const p = readProfile();
    setName(p.displayName || "You");

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "/api/discovery/publications/list?owner=me&limit=40"
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
    <div className="space-y-3 pt-1">
      <div className="mb-1">
        <h3 className="text-[15px] font-semibold text-white">Publications</h3>
        <p className="mt-0.5 text-[13px] text-zinc-600">
          What you've published on Omniv.
        </p>
      </div>
      {pubs.map((p) => (
        <PubCard key={p.id} p={p} publisherName={p.publisherName || name} />
      ))}
      <div className="pt-4">
        <p className="mb-3 text-[13px] font-semibold text-white">Discover more</p>
        <div className="space-y-3">
          {SEED_ENTITIES.slice(0, 4).map((e) => (
            <EntityCard key={e.id} entity={e} />
          ))}
        </div>
      </div>
    </div>
  );
}
