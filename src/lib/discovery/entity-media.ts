import { avatarFor, coverFor } from "./seed-covers";

/** Resolve cover + avatar for an entity (seed photos when DB has none) */
export function entityMedia(e: {
  slug: string;
  coverUrl?: string | null;
  avatarUrl?: string | null;
}) {
  return {
    coverUrl: e.coverUrl || coverFor(e.slug) || null,
    avatarUrl: e.avatarUrl || avatarFor(e.slug) || null,
  };
}

/** Attach seed photos onto entity objects for lists/cards */
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
