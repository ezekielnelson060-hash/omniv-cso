"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ENTITY_LABELS,
  entityPath,
  type DiscoveryEntity,
} from "@/lib/discovery/types";
import { entityMedia } from "@/lib/discovery/entity-media";

const INITIAL = 5;

function ExploreEntityRow({ entity }: { entity: DiscoveryEntity }) {
  const initial = entity.name.charAt(0).toUpperCase();
  const { avatarUrl: img } = entityMedia(entity);
  return (
    <Link
      href={entityPath(entity)}
      className="group flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-3 ring-1 ring-white/[0.07] transition hover:ring-white/15"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[15px] font-semibold text-omniv-gold">
            {initial}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white group-hover:text-omniv-gold">
          {entity.name}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          {ENTITY_LABELS[entity.type] || entity.type}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[12px] text-zinc-400">
          {entity.tagline || entity.about?.slice(0, 90) || "On Omniv"}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[12px] font-medium text-zinc-300 ring-1 ring-white/10 group-hover:bg-omniv-gold/15 group-hover:text-omniv-gold group-hover:ring-omniv-gold/30">
        View
      </span>
    </Link>
  );
}

export function ExploreEntitiesList({
  entities,
}: {
  entities: DiscoveryEntity[];
}) {
  const [open, setOpen] = useState(false);
  const shown = open ? entities : entities.slice(0, INITIAL);
  const rest = Math.max(0, entities.length - INITIAL);

  if (!entities.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
          Entities
        </h2>
        <span className="text-[12px] text-zinc-600">
          {entities.length} on Omniv
        </span>
      </div>
      <div className="mt-3 space-y-2.5">
        {shown.map((e) => (
          <ExploreEntityRow key={e.id} entity={e} />
        ))}
      </div>
      {rest > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 flex h-10 w-full items-center justify-center rounded-full bg-white/[0.04] text-[13px] font-medium text-zinc-300 ring-1 ring-white/[0.08] transition hover:bg-white/[0.07] hover:text-white"
        >
          {open ? "Show less" : `See more · ${rest}`}
        </button>
      )}
    </section>
  );
}
