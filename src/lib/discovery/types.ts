/**
 * Omniv — public publishing + discovery network
 * Publishers put things into the world. Explorers find them.
 * Loop: Publish → Discover → Follow / Save / Connect
 */

/** Who publishes (the profile / home base) */
export const PUBLISHER_TYPES = [
  "person",
  "company",
  "brand",
  "project",
] as const;

export type PublisherType = (typeof PUBLISHER_TYPES)[number];

export const PUBLISHER_LABELS: Record<PublisherType, string> = {
  person: "Person",
  company: "Company",
  brand: "Brand",
  project: "Project",
};

/** What gets discovered (first-class publication types) */
export const PUBLICATION_TYPES = [
  "article",
  "music",
  "video",
  "research",
  "product",
  "event",
  "announcement",
  "opportunity",
  "file",
] as const;

export type PublicationType = (typeof PUBLICATION_TYPES)[number];

export const PUBLICATION_LABELS: Record<PublicationType, string> = {
  article: "Article",
  music: "Music",
  video: "Video",
  research: "Research",
  product: "Product",
  event: "Event",
  announcement: "Announcement",
  opportunity: "Opportunity",
  file: "File",
};

/** @deprecated use PUBLISHER_TYPES + PUBLICATION_TYPES — kept for route compat */
export const ENTITY_TYPES = [
  ...PUBLISHER_TYPES,
  "product",
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

/** Publisher profile (home base) */
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

/** A thing published into the world — primary discovery unit */
export type Publication = {
  id: string;
  type: PublicationType;
  slug: string;
  title: string;
  summary: string;
  body?: string;
  /** publisher entity id */
  publisherId: string;
  category?: string;
  location?: string;
  tags: string[];
  /** e.g. "8 min read", "PDF · 42 pages", "Single" */
  meta?: string;
  cta?: { label: string; href: string };
  publishedAt: string;
  heat?: number;
};

export function entityPath(e: Pick<DiscoveryEntity, "type" | "slug">) {
  return `/e/${e.type}/${e.slug}`;
}

export function publicationPath(p: Pick<Publication, "slug">) {
  return `/p/${p.slug}`;
}

export const EXPLORE_NAV: { label: string; href: string }[] = [
  { label: "For You", href: "/explore" },
  { label: "Trending", href: "/explore?sort=trending" },
  { label: "New", href: "/explore?sort=new" },
  { label: "Articles", href: "/explore?type=article" },
  { label: "Music", href: "/explore?type=music" },
  { label: "Research", href: "/explore?type=research" },
  { label: "Products", href: "/explore?type=product" },
  { label: "Events", href: "/explore?type=event" },
  { label: "Files", href: "/explore?type=file" },
  { label: "Opportunities", href: "/explore?type=opportunity" },
  { label: "Companies", href: "/explore?publisher=company" },
  { label: "People", href: "/explore?publisher=person" },
  { label: "Projects", href: "/explore?publisher=project" },
];
