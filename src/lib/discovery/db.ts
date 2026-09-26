import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DiscoveryEntity,
  EntityIntent,
  EntityType,
  Publication,
  PublicationType,
  ArticleContentBlock,
  ArticleSource,
  EntityReference,
} from "./types";
import { SEED_ENTITIES, SEED_PUBLICATIONS, getPublication as seedGetPub } from "./seed";

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
  verified?: boolean | null;
  avatar_url?: string | null;
  cover_url?: string | null;
};

type PubRow = {
  id: string;
  type: PublicationType;
  slug: string;
  title: string;
  summary: string;
  body: string | null;
  tags: string[] | null;
  meta: string | null;
  cover_url: string | null;
  media_url: string | null;
  heat: number | null;
  published_at: string;
  publisher_id: string | null;
  publisher_name: string | null;
  subtitle?: string | null;
  excerpt?: string | null;
  content?: ArticleContentBlock[] | null;
  sources?: ArticleSource[] | null;
  what_this_means?: string | null;
  question_nobody_asks?: string | null;
  reading_time?: number | null;
  entity_refs?: EntityReference[] | null;
  related_publication_ids?: string[] | null;
  status?: "draft" | "published" | "archived" | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  updated_at?: string | null;
};

export type LivePublication = Publication & {
  publisherName?: string;
  mediaUrl?: string;
  coverUrl?: string;
};

/** Entity with optional media (after migration) */
export type LiveEntity = DiscoveryEntity & {
  avatarUrl?: string;
  coverUrl?: string;
};

function rowToEntity(r: Row): LiveEntity {
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
    verified: Boolean(r.verified),
    avatarUrl: r.avatar_url ?? undefined,
    coverUrl: r.cover_url ?? undefined,
  };
}

function rowToPublication(r: PubRow): LivePublication {
  return {
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    body: r.body ?? undefined,
    subtitle: r.subtitle ?? undefined,
    excerpt: r.excerpt ?? undefined,
    content: Array.isArray(r.content) ? r.content : undefined,
    sources: Array.isArray(r.sources) ? r.sources : undefined,
    whatThisMeans: r.what_this_means ?? undefined,
    questionNobodyAsks: r.question_nobody_asks ?? undefined,
    readingTime: r.reading_time ?? undefined,
    entityRefs: Array.isArray(r.entity_refs) ? r.entity_refs : undefined,
    relatedPublicationIds: Array.isArray(r.related_publication_ids)
      ? r.related_publication_ids
      : undefined,
    status: r.status ?? "published",
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
    canonicalUrl: r.canonical_url ?? undefined,
    updatedAt: r.updated_at ?? undefined,
    publisherId: r.publisher_id || "live",
    publisherName: r.publisher_name ?? undefined,
    mediaUrl: r.media_url ?? undefined,
    coverUrl: r.cover_url ?? undefined,
    tags: Array.isArray(r.tags) ? r.tags : [],
    meta: r.meta ?? undefined,
    publishedAt: (r.published_at || "").slice(0, 10),
    heat: r.heat ?? 10,
  };
}

const PUB_SELECT =
  "id, type, slug, title, summary, body, tags, meta, cover_url, media_url, heat, published_at, publisher_id, publisher_name";
const PUB_SELECT_ARTICLE =
  `${PUB_SELECT}, subtitle, excerpt, content, entity_refs, related_publication_ids, sources, what_this_means, question_nobody_asks, reading_time, status, seo_title, seo_description, canonical_url, updated_at`;

const ENT_SELECT =
  "id, type, slug, name, tagline, location, about, intents, tags, links, heat, published_at, verified, avatar_url, cover_url";

const ENT_SELECT_SAFE =
  "id, type, slug, name, tagline, location, about, intents, tags, links, heat, published_at, verified";

export async function listDiscoveryEntities(
  supabase: SupabaseClient | null
): Promise<DiscoveryEntity[]> {
  if (!supabase) return SEED_ENTITIES;

  try {
    const fullResult = await supabase
      .from("discovery_entities")
      .select(ENT_SELECT)
      .order("heat", { ascending: false })
      .limit(200);
    let data = fullResult.data as Row[] | null;
    let { error } = fullResult;

    if (error) {
      const retry = await supabase
        .from("discovery_entities")
        .select(ENT_SELECT_SAFE)
        .order("heat", { ascending: false })
        .limit(200);
      data = retry.data as Row[] | null;
      error = retry.error;
    }

    if (error || !data?.length) {
      return SEED_ENTITIES;
    }

    const live = (data as Row[]).map(rowToEntity);
    const liveKeys = new Set(live.map((e) => `${e.type}:${e.slug}`));
    const extras = SEED_ENTITIES.filter(
      (e) => !liveKeys.has(`${e.type}:${e.slug}`)
    );
    return [...live, ...extras];
  } catch {
    return SEED_ENTITIES;
  }
}

export async function getDiscoveryEntity(
  supabase: SupabaseClient | null,
  type: string,
  slug: string
): Promise<LiveEntity | null> {
  if (supabase) {
    try {
      const fullResult = await supabase
        .from("discovery_entities")
        .select(ENT_SELECT)
        .eq("type", type)
        .eq("slug", slug)
        .maybeSingle();
      let data = fullResult.data as Row | null;

      if (!data) {
        const retry = await supabase
          .from("discovery_entities")
          .select(ENT_SELECT_SAFE)
          .eq("type", type)
          .eq("slug", slug)
          .maybeSingle();
        data = retry.data as Row | null;
      }

      if (data) return rowToEntity(data as Row);
    } catch {
      /* fall through */
    }
  }

  return SEED_ENTITIES.find((e) => e.type === type && e.slug === slug) ?? null;
}

export async function getLivePublication(
  supabase: SupabaseClient | null,
  slug: string
): Promise<LivePublication | null> {
  if (supabase) {
    try {
      const fullResult = await supabase
        .from("discovery_publications")
        .select(PUB_SELECT_ARTICLE)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (fullResult.data) return rowToPublication(fullResult.data as PubRow);
      if (fullResult.error) {
        const { data } = await supabase
          .from("discovery_publications")
          .select(PUB_SELECT)
          .eq("slug", slug)
          .maybeSingle();
        if (data) return rowToPublication(data as PubRow);
      }
    } catch {
      /* fall through */
    }
  }
  return seedGetPub(slug) ?? null;
}

export async function listLivePublications(
  supabase: SupabaseClient | null,
  limit = 50
): Promise<LivePublication[]> {
  if (!supabase) return SEED_PUBLICATIONS;

  try {
    const fullResult = await supabase
      .from("discovery_publications")
      .select(PUB_SELECT_ARTICLE)
      .order("published_at", { ascending: false })
      .eq("status", "published")
      .limit(limit);
    let data: PubRow[] | null = fullResult.data as PubRow[] | null;
    let error: typeof fullResult.error = fullResult.error;

    if (error) {
      const fallback = await supabase
        .from("discovery_publications")
        .select(PUB_SELECT)
        .order("published_at", { ascending: false })
        .limit(limit);
      data = fallback.data as PubRow[] | null;
      error = fallback.error;
    }

    if (error || !data?.length) {
      return SEED_PUBLICATIONS;
    }

    const live = (data as PubRow[]).map(rowToPublication);
    const liveSlugs = new Set(live.map((p) => p.slug));
    const extras = SEED_PUBLICATIONS.filter((p) => !liveSlugs.has(p.slug));
    return [...live, ...extras];
  } catch {
    return SEED_PUBLICATIONS;
  }
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
