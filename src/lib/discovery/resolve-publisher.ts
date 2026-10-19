/**
 * Resolve a publisher profile path + display name when seed lookup fails
 * (live Omniv entities, renamed entities, etc.).
 */

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function resolvePublisherPath(opts: {
  type?: string | null;
  slug?: string | null;
  name?: string | null;
  publisherId?: string | null;
}): string | undefined {
  const slug = (opts.slug || "").toLowerCase().trim();
  const name = (opts.name || "").trim();
  const type = (opts.type || "artist").toLowerCase().trim() || "artist";

  if (slug) {
    return `/e/${type}/${slug}`;
  }

  const nameLower = name.toLowerCase();

  // Known Omniv identities (live DB, not in seed)
  if (
    nameLower === "omniv" ||
    nameLower === "omniv editorial" ||
    nameLower === "omniv media" ||
    nameLower.startsWith("omniv")
  ) {
    if (nameLower === "omniv" || nameLower === "omniv editorial") {
      return "/e/company/omniv-editorial";
    }
    return "/e/company/omniv-media";
  }

  // Fallback: slugify display name so the byline is always clickable
  if (name) {
    const s = slugify(name);
    if (s) return `/e/${type}/${s}`;
  }

  return undefined;
}
