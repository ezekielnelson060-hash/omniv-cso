import { coverFor } from "./seed-covers";

/** Resolve cover + avatar for an entity (seed covers when DB has none) */
export function entityMedia(e: {
  slug: string;
  coverUrl?: string | null;
  avatarUrl?: string | null;
}) {
  return {
    coverUrl: e.coverUrl || coverFor(e.slug),
    avatarUrl: e.avatarUrl || coverFor(e.slug),
  };
}
