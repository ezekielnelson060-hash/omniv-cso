import type { DiscoveryEntity, Publication } from "./types";

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
  {
    id: "9",
    type: "company",
    slug: "voltpath",
    name: "VoltPath",
    tagline: "EV charging for dense cities",
    location: "São Paulo, Brazil",
    about: "Hardware + software for multi-unit residential charging in Latin America.",
    intents: [{ kind: "investors" }, { kind: "partners", detail: "Property managers" }],
    tags: ["energy", "EV", "hardware"],
    publishedAt: "2026-09-23",
    heat: 76,
  },
  {
    id: "10",
    type: "person",
    slug: "lena-cho",
    name: "Lena Cho",
    tagline: "Climate policy · independent research",
    location: "Seoul, South Korea",
    about: "Writing on industrial policy, clean manufacturing, and East Asian supply chains.",
    intents: [{ kind: "contributors" }, { kind: "partners" }],
    tags: ["climate", "policy", "research"],
    publishedAt: "2026-09-21",
    heat: 68,
  },
  {
    id: "11",
    type: "brand",
    slug: "signal-room",
    name: "Signal Room",
    tagline: "Weekly briefings for founders",
    location: "New York, USA",
    about: "Curated operator notes — no hype, no fundraising theater.",
    intents: [{ kind: "customers" }, { kind: "contributors" }],
    tags: ["media", "founders", "newsletter"],
    publishedAt: "2026-09-19",
    heat: 72,
  },
  {
    id: "12",
    type: "project",
    slug: "open-maps-lagos",
    name: "Open Maps Lagos",
    tagline: "Community mapping of informal transit",
    location: "Lagos, Nigeria",
    about: "Volunteers mapping danfo routes, stops, and last-mile gaps.",
    intents: [{ kind: "contributors" }, { kind: "partners", detail: "City data teams" }],
    tags: ["maps", "transit", "Lagos"],
    publishedAt: "2026-09-11",
    heat: 61,
  },
];

export const SEED_PUBLICATIONS: Publication[] = [
  {
    id: "p1",
    type: "article",
    slug: "why-african-language-models-need-local-infrastructure",
    title: "Why African language models need local infrastructure",
    summary:
      "English-first stacks break on tone, code-switching, and low-resource languages. The fix is infrastructure, not another fine-tune.",
    subtitle: "The hard part is not making a model speak. It is making the whole system understand where it is.",
    body: "Most AI products still assume English as the default interface. Across African markets that assumption fails in production — not in demos.\n\nNokanda is building speech and language infrastructure for those markets: models, evaluation, and deployment paths that respect local language reality.",
    content: [
      { type: "paragraph", text: "Most AI products still assume English as the default interface. Across African markets that assumption fails in production — not in demos." },
      { type: "heading", text: "The demo is not the deployment", level: 2 },
      { type: "paragraph", text: "A model can produce an impressive sentence and still fail the moment a customer code-switches, uses a local name, or speaks over a noisy connection. The missing layer is not another benchmark. It is local infrastructure." },
      { type: "quote", text: "The chip is only the beginning.", attribution: "Nokanda AI" },
      { type: "paragraph", text: "Nokanda is building speech and language infrastructure for those markets: models, evaluation, and deployment paths that respect local language reality." },
      { type: "callout", title: "The Omniv read", text: "When language is infrastructure, distribution is part of the model. The teams closest to the user often see the failure modes first." },
    ],
    whatThisMeans: "The next advantage in African AI will come from teams that own the evaluation, deployment, and feedback loops—not just teams that fine-tune a model.",
    questionNobodyAsks: "Who gets to define quality when the benchmark language is not the language people use at home?",
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
  {
    id: "p17",
    type: "product",
    slug: "voltpath-residential",
    title: "VoltPath Residential",
    summary: "Shared EV chargers for apartment buildings — install in a weekend.",
    publisherId: "9",
    tags: ["EV", "hardware", "product"],
    meta: "Product",
    cta: { label: "Request a quote", href: "#" },
    publishedAt: "2026-09-23",
    heat: 75,
  },
  {
    id: "p18",
    type: "article",
    slug: "charging-is-a-building-problem",
    title: "Charging is a building problem, not a car problem",
    summary: "Most EV adoption friction in dense cities sits in the electrical room, not the driveway.",
    body: "Cities with high multi-unit housing share will not hit EV targets by hoping every driver has a private garage.\n\nVoltPath treats the building as the customer — property managers, condo boards, and utilities — not only the driver.",
    publisherId: "9",
    tags: ["EV", "cities", "infrastructure"],
    meta: "7 min read",
    publishedAt: "2026-09-22",
    heat: 74,
  },
  {
    id: "p19",
    type: "research",
    slug: "east-asia-clean-manufacturing-notes",
    title: "East Asia clean manufacturing — field notes",
    summary: "Policy instruments that actually moved factories, not press releases.",
    publisherId: "10",
    tags: ["climate", "policy", "manufacturing"],
    meta: "Research · 24 pages",
    publishedAt: "2026-09-20",
    heat: 69,
  },
  {
    id: "p20",
    type: "article",
    slug: "the-operator-brief-you-actually-read",
    title: "The operator brief you actually read",
    summary: "Why Signal Room ships one page, once a week, with no affiliate links.",
    body: "Founders are drowning in content that pretends to be signal.\n\nWe write for people who already ship — distribution notes, pricing experiments, and hiring patterns that held up under scrutiny.",
    publisherId: "11",
    tags: ["founders", "media"],
    meta: "4 min read",
    publishedAt: "2026-09-23",
    heat: 71,
  },
  {
    id: "p21",
    type: "event",
    slug: "signal-room-nyc-meetup",
    title: "Signal Room — NYC meetup",
    summary: "Small room for operators. No pitches on stage.",
    publisherId: "11",
    location: "New York",
    tags: ["event", "founders"],
    meta: "Event · Oct 12",
    publishedAt: "2026-09-18",
    heat: 63,
  },
  {
    id: "p22",
    type: "research",
    slug: "danfo-route-map-v1",
    title: "Danfo route map v1 — Lagos",
    summary: "First public dump of community-mapped informal transit lines.",
    publisherId: "12",
    tags: ["maps", "Lagos", "transit"],
    meta: "Dataset · GeoJSON",
    cta: { label: "View map", href: "#" },
    publishedAt: "2026-09-12",
    heat: 66,
  },
  {
    id: "p23",
    type: "opportunity",
    slug: "open-maps-lagos-mappers",
    title: "Open Maps Lagos needs weekend mappers",
    summary: "Join a mapping sprint — phone, data, and a bus stop near you.",
    publisherId: "12",
    tags: ["volunteers", "maps"],
    meta: "Opportunity",
    publishedAt: "2026-09-14",
    heat: 59,
  },
  {
    id: "p24",
    type: "music",
    slug: "kai-mendez-after-hours",
    title: "After Hours",
    summary: "B-side from the Midnight Bus sessions.",
    publisherId: "7",
    tags: ["music", "R&B"],
    meta: "Single · 2:48",
    publishedAt: "2026-09-23",
    heat: 80,
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
}
