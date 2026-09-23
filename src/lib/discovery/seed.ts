import type { DiscoveryEntity, Publication } from "./types";

/** Publisher profiles (home base) */
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
      "Long-form briefings and research for operators building across markets.",
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
    type: "company",
    slug: "relay-desk",
    name: "Relay Desk",
    tagline: "Ops inbox for remote teams",
    location: "Remote",
    about:
      "One shared desk for customer ops across WhatsApp, email, and Slack.",
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
    about: "Limited drops, local makers, no fast-fashion calendar.",
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
    type: "person",
    slug: "amara-okafor",
    name: "Amara Okafor",
    tagline: "Product & growth for marketplaces",
    location: "London, UK",
    about:
      "Ex-marketplace operator. Writing on distribution, pricing, and West African consumer tech.",
    intents: [
      { kind: "partners" },
      { kind: "other", detail: "Advising early teams" },
    ],
    tags: ["product", "growth", "marketplaces"],
    publishedAt: "2026-09-19",
    heat: 58,
  },
  {
    id: "6",
    type: "project",
    slug: "grid-notes",
    name: "Grid Notes",
    tagline: "Open research on African energy logistics",
    location: "Nairobi, Kenya",
    about:
      "Independent research project mapping cooling, storage, and last-mile energy.",
    intents: [{ kind: "contributors" }, { kind: "partners" }],
    tags: ["energy", "research", "Africa"],
    publishedAt: "2026-09-12",
    heat: 55,
  },
  {
    id: "7",
    type: "person",
    slug: "kai-mendez",
    name: "Kai Mendez",
    tagline: "Alternative R&B · independent releases",
    location: "Atlanta, USA",
    about:
      "Writing and releasing outside the major pipeline. New singles monthly.",
    intents: [{ kind: "partners", detail: "Sync / playlist" }],
    tags: ["music", "R&B", "independent"],
    publishedAt: "2026-09-22",
    heat: 81,
  },
  {
    id: "8",
    type: "company",
    slug: "harbor-labs",
    name: "Harbor Labs",
    tagline: "Privacy infrastructure for consumer apps",
    location: "Berlin, Germany",
    about: "SDKs and policy tooling for teams that ship in regulated markets.",
    intents: [{ kind: "customers" }, { kind: "hires" }],
    tags: ["privacy", "devtools", "B2B"],
    publishedAt: "2026-09-14",
    heat: 49,
  },
];

/** First-class publications — what explorers discover */
export const SEED_PUBLICATIONS: Publication[] = [
  {
    id: "p1",
    type: "article",
    slug: "why-african-language-models-need-local-infrastructure",
    title: "Why African language models need local infrastructure",
    summary:
      "English-first stacks break on tone, code-switching, and low-resource languages. The fix is infrastructure, not another fine-tune.",
    body: "Most AI products still assume English as the default interface. Across African markets that assumption fails in production — not in demos.\n\nNokanda is building speech and language infrastructure for those markets: models, evaluation, and deployment paths that respect local language reality.",
    publisherId: "1",
    category: "AI",
    location: "Lagos",
    tags: ["AI", "Africa", "infrastructure"],
    meta: "8 min read",
    publishedAt: "2026-09-22",
    heat: 96,
  },
  {
    id: "p2",
    type: "research",
    slug: "african-language-model-landscape-2026",
    title: "African Language Model Landscape 2026",
    summary:
      "A structured map of datasets, models, labs, and gaps across African languages.",
    publisherId: "1",
    category: "Research",
    tags: ["AI", "research", "datasets"],
    meta: "PDF · 42 pages",
    cta: { label: "Download PDF", href: "#" },
    publishedAt: "2026-09-20",
    heat: 88,
  },
  {
    id: "p3",
    type: "product",
    slug: "nokanda-api",
    title: "Nokanda API",
    summary:
      "Speech and language endpoints for African languages — designed for product teams, not research notebooks.",
    publisherId: "1",
    category: "Product",
    tags: ["API", "speech", "NLP"],
    meta: "Product",
    cta: { label: "Explore API", href: "#" },
    publishedAt: "2026-09-18",
    heat: 84,
  },
  {
    id: "p4",
    type: "file",
    slug: "nokanda-developer-docs",
    title: "Developer documentation",
    summary: "Auth, endpoints, rate limits, and sample apps for the Nokanda API.",
    publisherId: "1",
    tags: ["docs", "API"],
    meta: "Docs",
    publishedAt: "2026-09-18",
    heat: 60,
  },
  {
    id: "p5",
    type: "announcement",
    slug: "nokanda-api-open-to-developers",
    title: "Nokanda AI opens its API to developers",
    summary: "Public beta access is live. Apply for keys; rate limits lift with usage.",
    publisherId: "1",
    tags: ["announcement", "API"],
    meta: "Announcement",
    publishedAt: "2026-09-21",
    heat: 79,
  },
  {
    id: "p6",
    type: "opportunity",
    slug: "nokanda-looking-for-investors",
    title: "Nokanda AI is looking for investors",
    summary: "Seed extension for speech infrastructure. Deck + traction required.",
    publisherId: "1",
    tags: ["fundraising", "seed"],
    meta: "Opportunity",
    publishedAt: "2026-09-19",
    heat: 90,
  },
  {
    id: "p7",
    type: "article",
    slug: "distribution-is-the-product",
    title: "Distribution is the product",
    summary:
      "Most early marketplace failures are distribution failures dressed up as product problems.",
    body: "If growth depends on paid acquisition before the loop works, you don't have a product problem — you have a distribution thesis that hasn't been tested.",
    publisherId: "5",
    category: "Growth",
    tags: ["marketplaces", "growth"],
    meta: "6 min read",
    publishedAt: "2026-09-21",
    heat: 73,
  },
  {
    id: "p8",
    type: "music",
    slug: "kai-mendez-midnight-bus",
    title: "Midnight Bus",
    summary: "New single. Alternative R&B — written and released independently.",
    publisherId: "7",
    category: "R&B",
    location: "Atlanta",
    tags: ["music", "R&B", "single"],
    meta: "Single · 3:14",
    publishedAt: "2026-09-22",
    heat: 82,
  },
  {
    id: "p9",
    type: "music",
    slug: "kai-mendez-glass-water",
    title: "Glass Water (EP preview)",
    summary: "Three tracks from the forthcoming EP.",
    publisherId: "7",
    tags: ["music", "EP"],
    meta: "EP · 3 tracks",
    publishedAt: "2026-09-10",
    heat: 67,
  },
  {
    id: "p10",
    type: "product",
    slug: "relay-desk-product",
    title: "Relay Desk",
    summary: "Shared ops inbox across WhatsApp, email, and Slack.",
    publisherId: "3",
    tags: ["ops", "B2B"],
    meta: "Product",
    cta: { label: "Request access", href: "#" },
    publishedAt: "2026-09-21",
    heat: 70,
  },
  {
    id: "p11",
    type: "announcement",
    slug: "relay-desk-beta",
    title: "Relay Desk public beta",
    summary: "Opening the waitlist for teams under 50 people.",
    publisherId: "3",
    tags: ["beta"],
    meta: "Announcement",
    publishedAt: "2026-09-20",
    heat: 62,
  },
  {
    id: "p12",
    type: "research",
    slug: "cooling-logistics-nairobi",
    title: "Cooling & last-mile energy in Nairobi",
    summary: "Field notes and maps from Grid Notes' 2026 survey.",
    publisherId: "6",
    tags: ["energy", "Nairobi"],
    meta: "Research · 18 pages",
    publishedAt: "2026-09-16",
    heat: 58,
  },
  {
    id: "p13",
    type: "event",
    slug: "northline-operator-dinner-toronto",
    title: "Operator dinner — Toronto",
    summary: "Small room for operators shipping across borders. Invitation only.",
    publisherId: "2",
    location: "Toronto",
    tags: ["event", "operators"],
    meta: "Event · Oct 4",
    publishedAt: "2026-09-17",
    heat: 54,
  },
  {
    id: "p14",
    type: "article",
    slug: "slow-fashion-without-the-calendar",
    title: "Slow fashion without the calendar",
    summary: "Why Ember ships in drops, not seasons.",
    publisherId: "4",
    tags: ["fashion", "culture"],
    meta: "5 min read",
    publishedAt: "2026-09-14",
    heat: 51,
  },
  {
    id: "p15",
    type: "opportunity",
    slug: "ember-creator-open-call",
    title: "Ember Cloth open call for creators",
    summary: "Photographers and stylists in West Africa and the diaspora.",
    publisherId: "4",
    tags: ["creators", "fashion"],
    meta: "Opportunity",
    publishedAt: "2026-09-15",
    heat: 56,
  },
  {
    id: "p16",
    type: "file",
    slug: "harbor-privacy-checklist",
    title: "Consumer privacy launch checklist",
    summary: "A practical checklist for shipping in regulated markets.",
    publisherId: "8",
    tags: ["privacy", "checklist"],
    meta: "File · PDF",
    publishedAt: "2026-09-13",
    heat: 47,
  },
];

export function getEntity(type: string, slug: string) {
  return SEED_ENTITIES.find((e) => e.type === type && e.slug === slug);
}

export function getEntityById(id: string) {
  return SEED_ENTITIES.find((e) => e.id === id);
}

export function getPublication(slug: string) {
  return SEED_PUBLICATIONS.find((p) => p.slug === slug);
}

export function publicationsByPublisher(publisherId: string) {
  return SEED_PUBLICATIONS.filter((p) => p.publisherId === publisherId).sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt)
  );
}

export function trendingPublications(n = 20) {
  return [...SEED_PUBLICATIONS]
    .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
    .slice(0, n);
}

export function newestPublications(n = 20) {
  return [...SEED_PUBLICATIONS]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, n);
}

export function publicationsByType(type: string) {
  return SEED_PUBLICATIONS.filter((p) => p.type === type);
}

export function searchPublications(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return SEED_PUBLICATIONS;
  return SEED_PUBLICATIONS.filter(
    (p) =>
      p.title.toLowerCase().includes(s) ||
      p.summary.toLowerCase().includes(s) ||
      p.tags.some((t) => t.toLowerCase().includes(s)) ||
      p.type.includes(s)
  );
}

export function trending(n = 12) {
  return [...SEED_ENTITIES]
    .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0))
    .slice(0, n);
}

export function newest(n = 12) {
  return [...SEED_ENTITIES]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, n);
}

export function listByIntent(kind: string) {
  return SEED_ENTITIES.filter((e) => e.intents.some((i) => i.kind === kind));
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
}      "Ex-ops lead at two marketplace startups. Advising early teams on supply-side growth.",
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
