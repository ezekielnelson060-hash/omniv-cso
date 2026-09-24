import Link from "next/link";
import {
  ENTITY_LABELS,
  INTENT_LABELS,
  entityPath,
  type DiscoveryEntity,
} from "@/lib/discovery/types";

const COVER: Record<string, string> = {
  person: "from-violet-600/80 to-indigo-900",
  company: "from-sky-600/70 to-slate-900",
  brand: "from-rose-500/70 to-stone-900",
  product: "from-emerald-500/70 to-teal-950",
  project: "from-amber-500/60 to-orange-950",
  event: "from-fuchsia-500/60 to-purple-950",
  opportunity: "from-amber-400/40 to-yellow-950",
};

export function EntityCard({ entity }: { entity: DiscoveryEntity }) {
  const primaryIntent = entity.intents[0];
  const cover = COVER[entity.type] ?? "from-zinc-600 to-zinc-900";
  const initial = entity.name.slice(0, 1).toUpperCase();

  return (
    <Link
      href={entityPath(entity)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0c] ring-1 ring-white/[0.06] transition hover:ring-white/15"
    >
      <div
        className={`relative flex aspect-[16/10] items-end bg-gradient-to-br ${cover} p-3`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-black/35 text-[17px] font-semibold text-white ring-1 ring-white/20">
          {initial}
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
          {ENTITY_LABELS[entity.type]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[15px] font-semibold tracking-tight text-white group-hover:text-omniv-gold">
          {entity.name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-zinc-400">
          {entity.tagline}
        </p>
        {entity.location && (
          <p className="mt-2 text-[11px] text-zinc-600">📍 {entity.location}</p>
        )}
        {primaryIntent && (
          <p className="mt-2 text-[11px] font-medium text-omniv-gold/90">
            {INTENT_LABELS[primaryIntent.kind]}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-1 pt-3">
          {entity.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
