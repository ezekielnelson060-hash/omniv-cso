import type { DiscoveryEntity } from "./types";

/** Demo network content — replace with DB when publish flow ships. */
export const SEED_ENTITIES: DiscoveryEntity[] = [
  {
    id: "1",
    type: "company",
    slug: "nokanda-ai",
    name: "Nokanda AI",
    tagline: "Infrastructure for African language models",
    location: "Lagos, Nigeria",
    about:
      "Building speech and language tools for markets where English-first AI fails. Research + applied products for finance, health, and media.",
    intents: [
      { kind: "investors", detail: "Seed extension" },
      { kind: "hires", detail: "ML engineers" },
    ],
    tags: ["AI", "Africa", "infrastructure"],
    links: [{ label: "Website", href: "https://omniv.media" }],
    publishedAt: "2026-09-18",
    heat: 92,
  },
  {
    id: "2",
    type: "brand",
    slug: "northline-media",
    name: "Northline Media",
    tagline: "Editorial studio for operators",
    location: "Toronto, Canada",
    about:
      "Long-form briefings and research for operators building across markets. Open to distribution partners and guest contributors.",
    intents: [
      { kind: "partners", detail: "Distribution" },
      { kind: "contributors" },
    ],
    tags: ["media", "editorial", "research"],
    publishedAt: "2026-09-20",
    heat: 78,
  },
  {
    id: "3",
    type: "product",
    slug: "relay-desk",
    name: "Relay Desk",
    tagline: "Ops inbox for remote teams",
    location: "Remote",
    about:
      "One shared desk for customer ops across WhatsApp, email, and Slack. Built for teams that live in chat.",
    intents: [{ kind: "beta_users" }, { kind: "customers" }],
    tags: ["ops", "B2B", "productivity"],
    publishedAt: "2026-09-21",
    heat: 71,
  },
  {
    id: "4",
    type: "brand",
    slug: "ember-cloth",
    name: "Ember Cloth",
    tagline: "Slow fashion from Accra",
    location: "Accra, Ghana",
    about:
      "Limited drops, local makers, no fast-fashion calendar. Publishing collections and open calls for creators.",
    intents: [
      { kind: "creators", detail: "West Africa + diaspora" },
      { kind: "distributors" },
    ],
    tags: ["fashion", "culture", "Ghana"],
    publishedAt: "2026-09-15",
    heat: 64,
  },
  {
    id: "5",
    type: "opportunity",
    slug: "series-a-climate-africa",
    name: "Climate tech — Africa focus",
    tagline: "Investors reviewing seed–A",
    location: "Global",
    about:
      "Thesis: grid, cooling, and logistics for African cities. Warm intros preferred; deck + traction required.",
    intents: [{ kind: "other", detail: "Founders apply with deck" }],
    tags: ["climate", "funding", "Africa"],
    publishedAt: "2026-09-19",
    heat: 88,
  },
  {
    id: "6",
    type: "event",
    slug: "lagos-makers-night",
    name: "Lagos Makers Night",
    tagline: "Builders + designers, one room",
    location: "Lagos, Nigeria",
    about:
      "Evening for people shipping products. Short demos, no pitch theater. Monthly.",
    intents: [
      { kind: "attendees" },
      { kind: "partners", detail: "Venue & sponsors" },
    ],
    tags: ["events", "startups", "Lagos"],
    publishedAt: "2026-09-22",
    heat: 55,
  },
  {
    id: "7",
    type: "person",
    slug: "amina-diallo",
    name: "Amina Diallo",
    tagline: "Operator · marketplaces",
    location: "Dakar / Paris",
    about:
      "Ex-ops lead at two marketplace startups. Advising early teams on supply-side growth.",
    intents: [{ kind: "partners", detail: "Advisory" }],
    tags: ["operator", "marketplaces"],
    publishedAt: "2026-09-10",
    heat: 48,
  },
  {
    id: "8",
    type: "project",
    slug: "open-maps-sahel",
    name: "Open Maps Sahel",
    tagline: "Community mapping for logistics",
    location: "Sahel region",
    about:
      "Open data project improving road and market maps for last-mile delivery. Contributors welcome.",
    intents: [{ kind: "contributors" }, { kind: "partners" }],
    tags: ["open data", "logistics", "civic"],
    publishedAt: "2026-09-12",
    heat: 52,
  },
  {
    id: "9",
    type: "company",
    slug: "harbor-studio",
    name: "Harbor Studio",
    tagline: "Product design for fintech",
    location: "London, UK",
    about:
      "Design partner for regulated products. From research to shipped UI systems.",
    intents: [
      { kind: "customers", detail: "Series A–B fintechs" },
      { kind: "hires" },
    ],
    tags: ["design", "fintech", "agency"],
    publishedAt: "2026-09-08",
    heat: 60,
  },
  {
    id: "10",
    type: "product",
    slug: "fieldnote",
    name: "Fieldnote",
    tagline: "Research notes that stay structured",
    location: "Remote",
    about:
      "Field interviews → coded insights without a mess of docs. For researchers and ops teams.",
    intents: [{ kind: "beta_users" }],
    tags: ["research", "productivity"],
    publishedAt: "2026-09-23",
    heat: 40,
  },
];

export function getEntity(type: string, slug: string) {
  return SEED_ENTITIES.find((e) => e.type === type && e.slug === slug) ?? null;
}

export function listByIntent(kind: string) {
  return SEED_ENTITIES.filter((e) => e.intents.some((i) => i.kind === kind));
}

export function trending(limit = 6) {
  return [...SEED_ENTITIES]
    .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
    .slice(0, limit);
}

export function newest(limit = 6) {
  return [...SEED_ENTITIES]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function searchEntities(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return SEED_ENTITIES;
  return SEED_ENTITIES.filter(
    (e) =>
      e.name.toLowerCase().includes(s) ||
      e.tagline.toLowerCase().includes(s) ||
      e.about.toLowerCase().includes(s) ||
      e.tags.some((t) => t.toLowerCase().includes(s)) ||
      e.location?.toLowerCase().includes(s) ||
      e.type.includes(s)
  );
}
