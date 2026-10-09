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
import { SEED_ENTITIES, SEED_PUBLICATIONS, getPublication as seedGetPub, getEntityById as seedGetEntityById } from "./seed";

type Row = {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  tagline: string | null;
  location: string | null;
  about: string | null;
  intents: EntityIntent[] | null;
  tags: string[] | null;
  links: { label: string; href: string }[] | null;
  heat: number | null;
  published_at: string | null;
  verified?: boolean | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  owner_id?: string | null;
  visibility?: "public" | "private" | null;
};

type PubRow = {
  id: string;
  type: PublicationType;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  tags: string[] | null;
  meta: string | null;
  cover_url: string | null;
  media_url: string | null;
  heat: number | null;
  published_at: string | null;
  publisher_id: string | null;
  publisher_name: string | null;
  owner_id?: string | null;
  visibility?: "public" | "private" | null;
  subtitle?: string | null;
  excerpt?: string | null;
  content?: ArticleContentBlock[] | null;
  sources?: ArticleSource[] | null;
  what_this_means?: string | null;
  question_nobody_asks?: string | null;
  reading_time?: number | null;
  entity_refs?: EntityReference[] | null;
  related_publication_ids?: string[] | null;
  status?: "draft" | "published" | "archived" | "scheduled" | null;
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

export type LiveEntity = DiscoveryEntity & {
  avatarUrl?: string;
  coverUrl?: string;
  ownerId?: string;
};

function safeDate(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  try {
    const s = String(value);
    if (s.length >= 10) return s.slice(0, 10);
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch {
    /* ignore */
  }
  return new Date().toISOString().slice(0, 10);
}

function rowToEntity(r: Row): LiveEntity {
  return {
    id: r.id,
    type: r.type,
    slug: r.slug,
    name: r.name || "Untitled",
    tagline: r.tagline || "",
    location: r.location ?? undefined,
    about: r.about || "",
    intents: Array.isArray(r.intents) ? r.intents : [],
    tags: Array.isArray(r.tags) ? r.tags : [],
    links: Array.isArray(r.links) ? r.links : undefined,
    publishedAt: safeDate(r.published_at),
    heat: r.heat ?? 0,
    verified: Boolean(r.verified),
    avatarUrl: r.avatar_url ?? undefined,
    coverUrl: r.cover_url ?? undefined,
    ownerId: r.owner_id ?? undefined,
  };
}

function rowToPublication(r: PubRow): LivePublication {
  const content = Array.isArray(r.content)
    ? r.content.filter((b) => b && typeof b === "object")
    : undefined;
  return {
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title || "Untitled",
    summary: r.summary || "",
    body: r.body ?? undefined,
    subtitle: r.subtitle ?? undefined,
    excerpt: r.excerpt ?? undefined,
    content,
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
    ownerId: r.owner_id ?? undefined,
    publisherName: r.publisher_name ?? undefined,
    visibility: r.visibility ?? "public",
    mediaUrl: r.media_url ?? undefined,
    coverUrl: r.cover_url ?? undefined,
    tags: Array.isArray(r.tags) ? r.tags : [],
    meta: r.meta ?? undefined,
    publishedAt: safeDate(r.published_at),
    heat: r.heat ?? 10,
  };
}

const PUB_SELECT =
  "id, type, slug, title, summary, body, tags, meta, cover_url, media_url, heat, published_at, publisher_id, publisher_name, owner_id, visibility";
const PUB_SELECT_ARTICLE =
  `${PUB_SELECT}, subtitle, excerpt, content, entity_refs, related_publication_ids, sources, what_this_means, question_nobody_asks, reading_time, status, seo_title, seo_description, canonical_url, updated_at`;

const ENT_SELECT =
  "id, type, slug, name, tagline, location, about, intents, tags, links, heat, published_at, verified, avatar_url, cover_url, owner_id";

const ENT_SELECT_SAFE =
  "id, type, slug, name, tagline, location, about, intents, tags, links, heat, published_at, verified, owner_id";

function isPublicLivePub(r: PubRow, now: number): boolean {
  const vis = r.visibility ?? "public";
  if (vis === "private") return false;
  const s = r.status ?? "published";
  if (s === "draft" || s === "archived") return false;
  if (s === "scheduled" && r.published_at) {
    try {
      return new Date(r.published_at).getTime() <= now;
    } catch {
      return true;
    }
  }
  return s === "published" || s === "scheduled";
}

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

    const live = (data as Row[])
      .filter((r) => r && r.id && r.slug)
      .map((r) => {
        try {
          return rowToEntity(r);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as LiveEntity[];
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

/** Prefer live DB entity by id; fall back to seed. */
export async function getEntityByIdLive(
  supabase: SupabaseClient | null,
  id: string
): Promise<LiveEntity | null> {
  if (!id) return null;
  if (supabase) {
    try {
      const fullResult = await supabase
        .from("discovery_entities")
        .select(ENT_SELECT)
        .eq("id", id)
        .maybeSingle();
      let data = fullResult.data as Row | null;
      if (!data) {
        const retry = await supabase
          .from("discovery_entities")
          .select(ENT_SELECT_SAFE)
          .eq("id", id)
          .maybeSingle();
        data = retry.data as Row | null;
      }
      if (data) return rowToEntity(data as Row);
    } catch {
      /* fall through */
    }
  }
  const seed = seedGetEntityById(id);
  return seed ? (seed as LiveEntity) : null;
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
        .maybeSingle();
      let data = fullResult.data as PubRow | null;
      if (fullResult.error || !data) {
        const retry = await supabase
          .from("discovery_publications")
          .select(PUB_SELECT)
          .eq("slug", slug)
          .maybeSingle();
        data = retry.data as PubRow | null;
      }
      if (data) {
        const status = (data as PubRow).status;
        const at = (data as PubRow).published_at;
        if (status === "draft" || status === "archived") return null;
        if (
          status === "scheduled" &&
          at &&
          new Date(at).getTime() > Date.now()
        ) {
          return null;
        }
        return rowToPublication(data as PubRow);
      }
    } catch {
      /* fall through */
    }
  }

  const seed = seedGetPub?.(slug) ?? SEED_PUBLICATIONS.find((p) => p.slug === slug);
  return (seed as LivePublication) ?? null;
}

export async function listLivePublications(
  supabase: SupabaseClient | null,
  limit = 60
): Promise<LivePublication[]> {
  if (!supabase) {
    return SEED_PUBLICATIONS as LivePublication[];
  }

  try {
    const fullResult = await supabase
      .from("discovery_publications")
      .select(PUB_SELECT_ARTICLE)
      .order("published_at", { ascending: false })
      .limit(limit);
    let data = fullResult.data as PubRow[] | null;
    let { error } = fullResult;

    if (error) {
      const retry = await supabase
        .from("discovery_publications")
        .select(PUB_SELECT)
        .order("published_at", { ascending: false })
        .limit(limit);
      data = retry.data as PubRow[] | null;
      error = retry.error;
    }

    if (error || !data?.length) {
      return SEED_PUBLICATIONS as LivePublication[];
    }

    const now = Date.now();
    const live = (data as PubRow[])
      .filter((r) => r && r.slug && isPublicLivePub(r, now))
      .map((r) => {
        try {
          return rowToPublication(r);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as LivePublication[];

    live.sort((a, b) => {
      const heatDiff = (b.heat || 0) - (a.heat || 0);
      if (heatDiff !== 0) return heatDiff;
      return (b.publishedAt || "").localeCompare(a.publishedAt || "");
    });

    const liveSlugs = new Set(live.map((p) => p.slug));
    const extras =
      live.length >= 24
        ? []
        : (SEED_PUBLICATIONS as LivePublication[])
            .filter((p) => !liveSlugs.has(p.slug))
            .slice(0, Math.max(0, 24 - live.length));
    return [...live, ...extras];
  } catch {
    return SEED_PUBLICATIONS as LivePublication[];
  }
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
