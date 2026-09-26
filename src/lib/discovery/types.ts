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
  "partner",
  "invest",
  "book",
  "collaborate",
  "press",
  "other",
] as const;

export type IntentKind = (typeof INTENT_KINDS)[number];

export const INTENT_LABELS: Record<IntentKind, string> = {
  hire: "Hire",
  partner: "Partner",
  invest: "Invest",
  book: "Book",
  collaborate: "Collaborate",
  press: "Press",
  other: "Other",
};

export type EntityIntent = {
  kind: IntentKind;
  label?: string;
};

export type DiscoveryEntity = {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  handle?: string;
  about?: string;
  location?: string;
  website?: string;
  tags?: string[];
  verified?: boolean;
  coverUrl?: string;
  avatarUrl?: string;
  heat?: number;
  intents?: EntityIntent[];
};

export type ArticleContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level?: number }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "callout"; title?: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "entity-reference"; slug: string; label: string; entityType?: string };

export type ArticleSource = {
  label: string;
  href?: string;
};

export type EntityReference = {
  type?: string;
  slug: string;
  label?: string;
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
  status?: "draft" | "published" | "archived";
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

export function publicationPath(p: Pick<Publication, "slug">) {
  return `/p/${p.slug}`;
}

export const EXPLORE_NAV: { label: string; href: string }[] = [
  { label: "Companies", href: "/explore?publisher=company" },
  { label: "People", href: "/explore?publisher=person" },
  { label: "Artists", href: "/explore?publisher=artist" },
  { label: "Projects", href: "/explore?publisher=project" },
];
