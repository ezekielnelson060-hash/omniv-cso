/**
 * Single source of truth for entity/profile avatars across the app.
 * Prefer real image → known Omniv logo → null (OmnivAvatar branded fallback).
 */
export function resolveEntityAvatar(opts: {
  avatarUrl?: string | null;
  slug?: string | null;
  name?: string | null;
}): string | null {
  const url = (opts.avatarUrl || "").trim();
  if (url) return url;

  const slug = (opts.slug || "").toLowerCase().trim();
  const name = (opts.name || "").toLowerCase().trim();

  // Official Omniv identities always get the brand mark
  if (
    slug === "omniv" ||
    slug === "omniv-editorial" ||
    slug === "omniv-media" ||
    slug === "omniv-media-inc" ||
    slug.startsWith("omniv-") ||
    name === "omniv" ||
    name === "omniv editorial" ||
    name === "omniv media"
  ) {
    return "/logo.png";
  }

  return null;
}
