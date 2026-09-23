/**
 * Omniv Discovery Network — Phase 1 model
 * Loop: Publish → Discover → Intent → Connect
 */

export const ENTITY_TYPES = [
  "person",
  "company",
  "brand",
  "product",
  "project",
  "event",
  "opportunity",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export const ENTITY_LABELS: Record<EntityType, string> = {
  person: "Person",
  company: "Company",
  brand: "Brand",
  product: "Product",
  project: "Project",
  event: "Event",
  opportunity: "Opportunity",
};

export const INTENT_KINDS = [
  "investors",
  "partners",
  "distributors",
  "creators",
  "hires",
  "cofounders",
  "beta_users",
  "attendees",
  "contributors",
  "customers",
  "other",
] as const;

export type IntentKind = (typeof INTENT_KINDS)[number];

export const INTENT_LABELS: Record<IntentKind, string> = {
  investors: "Looking for investors",
  partners: "Looking for partners",
  distributors: "Looking for distributors",
  creators: "Looking for creators",
  hires: "Hiring",
  cofounders: "Looking for co-founders",
  beta_users: "Accepting beta users",
  attendees: "Looking for attendees",
  contributors: "Looking for contributors",
  customers: "Looking for customers",
  other: "Open to connections",
};

export type EntityIntent = {
  kind: IntentKind;
  detail?: string;
};

export type DiscoveryEntity = {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  tagline: string;
  location?: string;
  about: string;
  intents: EntityIntent[];
  tags: string[];
  links?: { label: string; href: string }[];
  publishedAt: string;
  heat?: number;
};

export function entityPath(e: Pick<DiscoveryEntity, "type" | "slug">) {
  return `/e/${e.type}/${e.slug}`;
}
