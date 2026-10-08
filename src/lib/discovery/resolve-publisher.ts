/**
 * Resolve a publisher profile path + display name when seed lookup fails
 * (live Omniv entities, renamed entities, etc.).
 */
export function resolvePublisherPath(opts: {
  type?: string | null;
  slug?: string | null;
  name?: string | null;
  publisherId?: string | null;
}): string | undefined {
  const slug = (opts.slug || "").toLowerCase().trim();
  const name = (opts.name || "").toLowerCase().trim();
  const type = (opts.type || "company").toLowerCase().trim();

  if (slug) {
    return `/e/${type || "company"}/${slug}`;
  }

  // Known Omniv identities (live DB, not in seed)
  if (
    name === "omniv" ||
    name === "omniv editorial" ||
    name === "omniv media" ||
    name.startsWith("omniv")
  ) {
    // Prefer the canonical editorial slug used on the live profile
    if (name === "omniv" || name === "omniv editorial") {
      return "/e/company/omniv-editorial";
    }
    return "/e/company/omniv-media";
  }

  return undefined;
}
