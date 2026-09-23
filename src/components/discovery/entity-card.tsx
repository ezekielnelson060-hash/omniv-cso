import Link from "next/link";
import {
  ENTITY_LABELS,
  INTENT_LABELS,
  entityPath,
  type DiscoveryEntity,
} from "@/lib/discovery/types";

export function EntityCard({ entity }: { entity: DiscoveryEntity }) {
  const primaryIntent = entity.intents[0];

  return (
    <Link
      href={entityPath(entity)}
      className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.05]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {ENTITY_LABELS[entity.type]}
        </span>
        {entity.location && (
          <span className="text-[11px] text-zinc-600">{entity.location}</span>
        )}
      </div>
      <p className="mt-2 text-[16px] font-semibold tracking-tight text-white group-hover:text-omniv-gold">
        {entity.name}
      </p>
      <p className="mt-1 text-[13px] leading-snug text-zinc-400">{entity.tagline}</p>
      {primaryIntent && (
        <p className="mt-3 text-[12px] text-omniv-gold/90">
          {INTENT_LABELS[primaryIntent.kind]}
          {primaryIntent.detail ? ` · ${primaryIntent.detail}` : ""}
        </p>
      )}
    </Link>
  );
}
