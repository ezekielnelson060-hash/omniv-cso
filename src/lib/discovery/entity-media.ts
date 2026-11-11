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
}): { coverUrl?: string; avatarUrl?: string } {
  const slug = (e.slug || "").trim();
  const seedCover = slug ? SEED_COVERS[slug] : undefined;
  const seedAvatar = slug
    ? SEED_AVATARS[slug] || SEED_COVERS[slug]
    : undefined;

  return {
    coverUrl: e.coverUrl || seedCover || undefined,
    avatarUrl: e.avatarUrl || seedAvatar || undefined,
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
