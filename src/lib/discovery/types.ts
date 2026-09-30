/**
 * Omniv — public publishing + discovery network
 * Publishers put things into the world. Explorers find them.
 * Loop: Publish → Discover → Follow / Save / Connect
 */

export const PUBLISHER_TYPES = [
  "person",
  "artist",
  "company",
  "brand",
  "product",
  "project",
  "organization",
  "place",
] as const;

export type PublisherType = (typeof PUBLISHER_TYPES)[number];

export const PUBLISHER_LABELS: Record<PublisherType, string> = {
  person: "Person",
  artist: "Artist",
  company: "Company",
  brand: "Brand",
  product: "Product",
  project: "Project",
  organization: "Organization",
  place: "Place",
};

export const PUBLICATION_TYPES = [
  "article",
  "music",
  "video",
  "image",
  "file",
  "research",
  "announcement",
  "event",
  "opportunity",
  "product",
] as const;

export type PublicationType = (typeof PUBLICATION_TYPES)[number];

export const PUBLICATION_LABELS: Record<PublicationType, string> = {
  article: "Article",
  music: "Music",
  video: "Video",
  image: "Image",
  file: "File",
  research: "Research",
  announcement: "Announcement",
  event: "Event",
  opportunity: "Opportunity",
  product: "Product",
};

export const ENTITY_TYPES = PUBLISHER_TYPES;
export type EntityType = PublisherType;

export const ENTITY_LABELS: Record<EntityType, string> = {
  ...PUBLISHER_LABELS,
};

export const INTENT_KINDS = [
  "hire",
  "hires",
  "partner",
  "partners",
  "invest",
  "investors",
  "book",
  "collaborate",
  "press",
  "other",
  "beta_users",
  "customers",
  "contributors",
  "creators",
  "distributors",
] as const;

export type IntentKind = (typeof INTENT_KINDS)[number];

export const INTENT_LABELS: Record<string, string> = {
  hire: "Hire",
  hires: "Hiring",
  partner: "Partner",
  partners: "Partners",
  invest: "Invest",
  investors: "Investors",
  book: "Book",
  collaborate: "Collaborate",
  press: "Press",
  other: "Other",
  beta_users: "Beta users",
  customers: "Customers",
  contributors: "Contributors",
  creators: "Creators",
  distributors: "Distributors",
};

export type EntityIntent = {
  kind: IntentKind | string;
  label?: string;
  detail?: string;
};

export type DiscoveryEntity = {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  handle?: string;
  tagline: string;
  about: string;
  location?: string;
  website?: string;
  tags: string[];
  links?: { label: string; href: string }[];
  verified?: boolean;
  coverUrl?: string;
  avatarUrl?: string;
  heat?: number;
  publishedAt: string;
  intents: EntityIntent[];
};

export type ArticleContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "subheading"; text: string }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | { type: "caption"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "divider" }
  | { type: "entity-reference"; slug: string; label: string; entityType?: string }
  | { type: "publication-reference"; slug: string; label: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "callout"; title?: string; text: string };

export type ArticleSource = {
  name: string;
  title: string;
  date?: string;
  url: string;
};

export type EntityReference = {
  id?: string;
  type: string;
  slug: string;
  label: string;
};

export type Publication = {
  id: string;
  type: PublicationType;
  slug: string;
  title: string;
  summary: string;
  body?: string;
  subtitle?: string;
  excerpt?: string;
  content?: ArticleContentBlock[];
  entityRefs?: EntityReference[];
  relatedPublicationIds?: string[];
  sources?: ArticleSource[];
  readingTime?: number;
  whatThisMeans?: string;
  questionNobodyAsks?: string;
  status?: "draft" | "published" | "archived" | "scheduled";
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  updatedAt?: string;
  /** publisher entity id */
  publisherId: string;
  publisherName?: string;
  category?: string;
  location?: string;
  tags: string[];
  meta?: string;
  cta?: { label: string; href: string };
  publishedAt: string;
  heat?: number;
  coverUrl?: string;
  mediaUrl?: string;
};

export function entityPath(e: Pick<DiscoveryEntity, "type" | "slug">) {
  return `/e/${e.type}/${e.slug}`;
}

/** Permanent public URL prefix per publication type (SEO architecture). */
export const PUBLICATION_PATH_PREFIX: Record<PublicationType, string> = {
  article: "/p",
  announcement: "/p",
  research: "/research",
  music: "/music",
  video: "/video",
  product: "/product",
  event: "/event",
  opportunity: "/opportunity",
  file: "/p",
  image: "/p",
};

/** Permanent, crawlable public URL for a publication. */
export function publicationPath(
  p: Pick<Publication, "slug" | "type"> | { slug: string; type?: string }
) {
  const prefix =
    (p.type && PUBLICATION_PATH_PREFIX[p.type as PublicationType]) || "/p";
  return `${prefix}/${p.slug}`;
}

/** Absolute canonical URL for a publication. */
export function publicationCanonicalUrl(
  p: Pick<Publication, "slug" | "type"> & { canonicalUrl?: string | null },
  origin = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"
) {
  if (p.canonicalUrl) return p.canonicalUrl;
  return `${origin.replace(/\/$/, "")}${publicationPath(p)}`;
}

export const EXPLORE_NAV: { label: string; href: string }[] = [
  { label: "Companies", href: "/explore?publisher=company" },
  { label: "People", href: "/explore?publisher=person" },
  { label: "Artists", href: "/explore?publisher=artist" },
  { label: "Projects", href: "/explore?publisher=project" },
];
