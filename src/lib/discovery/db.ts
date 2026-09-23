import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscoveryEntity, EntityIntent, EntityType } from "./types";
import { SEED_ENTITIES } from "./seed";

type Row = {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  tagline: string;
  location: string | null;
  about: string;
  intents: EntityIntent[] | null;
  tags: string[] | null;
  links: { label: string; href: string }[] | null;
  heat: number | null;
  published_at: string;
};

function rowToEntity(r: Row): DiscoveryEntity {
  return {
    id: r.id,
    type: r.type,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    location: r.location ?? undefined,
    about: r.about,
    intents: Array.isArray(r.intents) ? r.intents : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    links: Array.isArray(r.links) ? r.links : undefined,
    publishedAt: r.published_at.slice(0, 10),
    heat: r.heat ?? 0,
  };
}

/** Live rows + seed demos (seed fills empty network). */
export async function listDiscoveryEntities(
  supabase: SupabaseClient | null
): Promise<DiscoveryEntity[]> {
  if (!supabase) return SEED_ENTITIES;

  try {
    const { data, error } = await supabase
      .from("discovery_entities")
      .select(
        "id, type, slug, name, tagline, location, about, intents, tags, links, heat, published_at"
      )
      .order("heat", { ascending: false })
      .limit(200);

    if (error || !data?.length) {
      // Table missing or empty — show seed so product isn't blank
      return SEED_ENTITIES;
    }

    const live = (data as Row[]).map(rowToEntity);
    const liveKeys = new Set(live.map((e) => `${e.type}:${e.slug}`));
    const extras = SEED_ENTITIES.filter((e) => !liveKeys.has(`${e.type}:${e.slug}`));
    return [...live, ...extras];
  } catch {
    return SEED_ENTITIES;
  }
}

export async function getDiscoveryEntity(
  supabase: SupabaseClient | null,
  type: string,
  slug: string
): Promise<DiscoveryEntity | null> {
  if (supabase) {
    try {
      const { data } = await supabase
        .from("discovery_entities")
        .select(
          "id, type, slug, name, tagline, location, about, intents, tags, links, heat, published_at"
        )
        .eq("type", type)
        .eq("slug", slug)
        .maybeSingle();

      if (data) return rowToEntity(data as Row);
    } catch {
      /* fall through */
    }
  }

  return SEED_ENTITIES.find((e) => e.type === type && e.slug === slug) ?? null;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
