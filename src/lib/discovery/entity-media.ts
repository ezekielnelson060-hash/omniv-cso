import { SEED_AVATARS, SEED_COVERS } from "./seed-covers";

/**
 * Resolve cover + avatar for an entity.
 * User-created pages show photos only when the owner set them.
 * Seed demo entities may still use curated Unsplash maps.
 * Never invent stock images for arbitrary new slugs.
 */
export function entityMedia(e: {
  slug: string;
  coverUrl?: string | null;
  avatarUrl?: string | null;
}) {
  const slug = (e.slug || "").trim();
  const seedCover = slug ? SEED_COVERS[slug] || null : null;
  const seedAvatar = slug
    ? SEED_AVATARS[slug] || SEED_COVERS[slug] || null
    : null;

  return {
    coverUrl: e.coverUrl || seedCover || null,
    avatarUrl: e.avatarUrl || seedAvatar || null,
  };
}

/** Attach seed photos onto entity objects for lists/cards (seed slugs only) */
export function withEntityMedia<
  T extends { slug: string; coverUrl?: string | null; avatarUrl?: string | null },
>(e: T): T & { coverUrl?: string; avatarUrl?: string } {
  const m = entityMedia(e);
  return {
    ...e,
    coverUrl: m.coverUrl || e.coverUrl || undefined,
    avatarUrl: m.avatarUrl || e.avatarUrl || undefined,
  };
}
