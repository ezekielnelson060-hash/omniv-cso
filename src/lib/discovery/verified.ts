/**
 * Server-safe verification helpers.
 * Do NOT put "use client" here — imported by server pages and client components.
 */

const ALWAYS_VERIFIED_SLUGS = new Set([
  "omniv",
  "omniv-editorial",
  "omniv-media",
  "omniv-media-inc",
]);

const ALWAYS_VERIFIED_NAMES = new Set([
  "omniv",
  "omniv editorial",
  "omniv media",
]);

export function isAlwaysVerified(opts: {
  slug?: string | null;
  name?: string | null;
  verified?: boolean | null;
}): boolean {
  if (opts.verified) return true;
  const slug = (opts.slug || "").toLowerCase().trim();
  if (slug && ALWAYS_VERIFIED_SLUGS.has(slug)) return true;
  if (slug.startsWith("omniv-")) return true;
  const name = (opts.name || "").toLowerCase().trim();
  if (name && ALWAYS_VERIFIED_NAMES.has(name)) return true;
  return false;
}

export type VerifyCategory =
  | "person"
  | "company"
  | "brand"
  | "artist"
  | "organization"
  | "project"
  | "media"
  | "entity";

export function resolveVerifyCategory(verifyType?: string): VerifyCategory {
  const t = (verifyType || "").toLowerCase().trim();
  if (
    t === "personal" ||
    t === "person" ||
    t === "profile" ||
    t === "individual"
  )
    return "person";
  if (t === "company") return "company";
  if (t === "brand") return "brand";
  if (t === "artist") return "artist";
  if (t === "organization" || t === "org") return "organization";
  if (t === "project") return "project";
  if (t === "media" || t === "publisher" || t === "editorial") return "media";
  return "entity";
}
