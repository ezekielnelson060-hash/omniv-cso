import type { ArticleContentBlock } from "./types";

/** Dense article bodies for seed publications — shown after click */
export const SEED_BODIES: Record<
  string,
  {
    body?: string;
    content?: ArticleContentBlock[];
    whatThisMeans?: string;
    questionNobodyAsks?: string;
    subtitle?: string;
  }
> = {
  "african-language-model-landscape-2026": {
    subtitle: "A structured map of datasets, models, labs, and gaps.",
    body: "This landscape is not a leaderboard. It is a map of what exists, what is usable, and where the hard gaps still sit — evaluation, speech data, and deployment paths that work outside English-first defaults.",
    content: [
      { type: "paragraph", text: "Most public reporting on African language models still collapses into a single question: which model scored highest on a shared benchmark. That question is useful. It is not enough." },
      { type: "heading", text: "What this landscape tracks", level: 2 },
      { type: "paragraph", text: "We map datasets by language coverage and license, models by intended use, labs by continuity of funding, and gaps by where production teams still fail — not demos." },
      { type: "list", items: ["Speech and text datasets with clear licenses", "Models that ship beyond research notebooks", "Evaluation suites that include code-switching", "Deployment paths for low-bandwidth markets"] },
      { type: "callout", title: "How to read it", text: "Treat this as a working map. The useful output is not a ranking — it is a shortlist of where to invest next." },
    ],
    whatThisMeans: "Teams building for African languages need shared maps more than they need another isolated benchmark win.",
    questionNobodyAsks: "Which gaps are structural — and which are just underfunded?",
  },
  "nokanda-api": {
    subtitle: "Speech and language endpoints designed for product teams.",
    body: "Nokanda API is built for product engineers who need speech and language features that hold up when users code-switch, speak over noise, or use languages that English-first stacks still treat as edge cases.",
    content: [
      { type: "paragraph", text: "The product surface is intentionally narrow: endpoints product teams can ship without reinventing evaluation." },
      { type: "heading", text: "What you get", level: 2 },
      { type: "list", items: ["Speech-to-text for priority languages", "Language identification and routing", "Rate limits that scale with real usage", "Docs written for engineers, not research notebooks"] },
      { type: "quote", text: "Infrastructure is the product. The model is one layer inside it.", attribution: "Nokanda AI" },
    ],
    whatThisMeans: "If your users do not speak the benchmark language, your API has to own evaluation — not just inference.",
  },
  "distribution-is-the-product": {
    subtitle: "If paid acquisition is the only path in, the loop is not working.",
    body: "Most early marketplace failures are distribution failures dressed up as product problems.",
    content: [
      { type: "paragraph", text: "Most early marketplace failures are not product failures. They are distribution failures wearing product language." },
      { type: "heading", text: "The paid-acquisition trap", level: 2 },
      { type: "paragraph", text: "If the only way to get the next user is to buy the next click, the loop is not working. Paid can amplify a loop. It cannot invent one." },
      { type: "quote", text: "Distribution is not a channel plan. It is the product's path into the world.", attribution: "Amara Okafor" },
      { type: "paragraph", text: "Teams that treat distribution as a post-launch problem end up with polished inventory and no demand. Teams that treat distribution as the product test earlier, ship smaller, and learn where density actually lives." },
      { type: "callout", title: "The Omniv read", text: "Publish where demand can be measured. Followers are not distribution. Density is." },
    ],
    whatThisMeans: "Fix the path into the market before you scale the surface of the product.",
    questionNobodyAsks: "If paid acquisition stopped tomorrow, would anyone still find this?",
  },
  "charging-is-a-building-problem": {
    subtitle: "Most EV friction in dense cities sits in the electrical room.",
    body: "Cities with high multi-unit housing share will not hit EV targets by hoping every driver has a private garage.\n\nVoltPath treats the building as the customer — property managers, condo boards, and utilities — not only the driver.",
    content: [
      { type: "paragraph", text: "The public conversation still frames EV adoption as a car problem. In dense cities, the bottleneck is the building." },
      { type: "heading", text: "Why the building is the customer", level: 2 },
      { type: "paragraph", text: "Multi-unit housing does not get solved with a driveway charger. The electrical room, the board approval process, and shared load management decide whether drivers can charge at home." },
      { type: "list", items: ["Property managers control installation windows", "Utilities constrain peak load", "Residents need simple billing", "Hardware has to survive shared use"] },
      { type: "callout", title: "The Omniv read", text: "When the customer is the building, product, policy, and ops have to ship together." },
    ],
    whatThisMeans: "EV infrastructure that ignores multi-unit housing will miss the densest demand.",
  },
  "the-operator-brief-you-actually-read": {
    subtitle: "One page. Once a week. No affiliate theater.",
    body: "Founders are drowning in content that pretends to be signal.\n\nWe write for people who already ship — distribution notes, pricing experiments, and hiring patterns that held up under scrutiny.",
    content: [
      { type: "paragraph", text: "Founders are drowning in content that pretends to be signal." },
      { type: "heading", text: "What Signal Room refuses to do", level: 2 },
      { type: "list", items: ["No affiliate links", "No growth-hack recycling", "No fundraising theater", "No 2,000-word essays when one page is enough"] },
      { type: "paragraph", text: "The brief is written for operators who already ship. Distribution notes. Pricing experiments. Hiring patterns that held up under scrutiny." },
      { type: "quote", text: "If it does not change a decision this week, it does not ship.", attribution: "Signal Room" },
    ],
    whatThisMeans: "Attention is scarce. Signal is a product decision.",
  },
  "slow-fashion-without-the-calendar": {
    subtitle: "Why Ember ships in drops, not seasons.",
    body: "Fashion calendars were built for wholesale cycles, not for makers who want limited runs and honest inventory.",
    content: [
      { type: "paragraph", text: "Seasonal calendars force overproduction. Ember ships in drops because the alternative is inventory that never should have existed." },
      { type: "heading", text: "What a drop forces you to decide", level: 2 },
      { type: "list", items: ["How many units you can stand behind", "Which makers can deliver quality on time", "What story the piece is allowed to carry"] },
      { type: "callout", title: "The Omniv read", text: "Constraint is not a brand aesthetic. It is an operating system." },
    ],
    whatThisMeans: "Limited drops only work when the supply chain is designed for them — not when they are a marketing skin on fast fashion.",
  },
  "kai-mendez-midnight-bus": {
    subtitle: "Alternative R&B — written and released independently.",
    body: "Midnight Bus is a late-night single: muted drums, close vocals, no major-label pipeline. Written and released on Kai's own schedule.",
    content: [
      { type: "paragraph", text: "Midnight Bus is not a playlist strategy track. It is a late-night record — close vocals, muted drums, room noise left in." },
      { type: "heading", text: "Released outside the pipeline", level: 2 },
      { type: "paragraph", text: "Independent does not mean unfinished. It means the calendar belongs to the artist, not a release committee." },
    ],
  },
  "relay-desk-product": {
    subtitle: "Shared ops inbox across WhatsApp, email, and Slack.",
    body: "Remote teams still answer customers in three tools. Relay Desk puts the thread in one place so ops does not depend on who was online last.",
    content: [
      { type: "paragraph", text: "Customer ops breaks when the conversation is split across WhatsApp, email, and Slack." },
      { type: "heading", text: "What Relay Desk centralizes", level: 2 },
      { type: "list", items: ["Incoming messages across channels", "Assignment and ownership", "A single history the team can search"] },
    ],
  },
  "cooling-logistics-nairobi": {
    subtitle: "Field notes from Grid Notes' 2026 survey.",
    body: "Cooling and last-mile energy in Nairobi are not abstract climate topics. They are logistics problems — storage, diesel backup, and who pays for uptime.",
    content: [
      { type: "paragraph", text: "This research maps cooling and last-mile energy as logistics — not only as climate policy." },
      { type: "heading", text: "What the field notes emphasize", level: 2 },
      { type: "list", items: ["Where cold storage actually sits", "How diesel backup is priced in practice", "Which last-mile routes lose product to heat"] },
    ],
  },
  "east-asia-clean-manufacturing-notes": {
    subtitle: "Policy instruments that moved factories — not press releases.",
    body: "Clean manufacturing policy only matters when it changes where factories invest. These notes track instruments that moved capital, not announcements that moved headlines.",
    content: [
      { type: "paragraph", text: "Industrial policy is easy to announce and hard to measure. These notes focus on instruments that changed factory investment." },
      { type: "heading", text: "What to watch", level: 2 },
      { type: "list", items: ["Subsidy design that requires local capacity", "Grid and permitting timelines", "Export rules that reshape supply chains"] },
    ],
  },
  "nokanda-looking-for-investors": {
    subtitle: "Seed extension for speech infrastructure.",
    body: "Nokanda is raising a seed extension to expand speech infrastructure for markets where English-first stacks still fail in production.",
    content: [
      { type: "paragraph", text: "This is an open opportunity for investors who understand infrastructure — not only application-layer AI." },
      { type: "list", items: ["Deck + traction required", "Focus: speech + language infrastructure", "Geography: African language markets first"] },
    ],
  },
  "ember-creator-open-call": {
    subtitle: "Photographers and stylists in West Africa and the diaspora.",
    body: "Ember Cloth is opening a creator call for photographers and stylists who can document limited drops with the same discipline as the makers.",
    content: [
      { type: "paragraph", text: "We are looking for creators who treat documentation as craft — not as content filler." },
      { type: "list", items: ["West Africa + diaspora", "Still and motion", "Portfolio required"] },
    ],
  },
  "open-maps-lagos-mappers": {
    subtitle: "Join a weekend mapping sprint.",
    body: "Open Maps Lagos needs weekend mappers — phone, data, and a bus stop near you. The goal is a public map of informal transit that city teams can actually use.",
    content: [
      { type: "paragraph", text: "Informal transit is real infrastructure. It is still largely unmapped in a form that operators and city teams can use." },
      { type: "list", items: ["Weekend sprints", "Phone + data", "Stops, routes, last-mile gaps"] },
    ],
  },
  "danfo-route-map-v1": {
    subtitle: "First public dump of community-mapped informal transit lines.",
    body: "Version one of the danfo route map is a community dump — imperfect, public, and more useful than another closed dataset.",
    content: [
      { type: "paragraph", text: "This is a first public release of community-mapped danfo routes in Lagos." },
      { type: "callout", title: "How to use it", text: "Treat v1 as a base layer. Corrections and new routes are the product." },
    ],
  },
  "northline-operator-dinner-toronto": {
    subtitle: "Small room for operators shipping across borders.",
    body: "An invitation-only dinner for operators who ship across markets. No stage pitches. No fundraising theater.",
    content: [
      { type: "paragraph", text: "Northline hosts small rooms for operators — the people who actually ship across borders." },
      { type: "list", items: ["Toronto", "Invitation only", "No stage pitches"] },
    ],
  },
  "signal-room-nyc-meetup": {
    subtitle: "Small room for operators. No pitches on stage.",
    body: "Signal Room's NYC meetup is built for operators who want signal, not a showcase.",
    content: [
      { type: "paragraph", text: "A small room. No pitches on stage. The same standard as the weekly brief." },
    ],
  },
  "harbor-privacy-checklist": {
    subtitle: "A practical checklist for shipping in regulated markets.",
    body: "Privacy work fails when it stays in policy decks. This checklist is for teams that need to ship in regulated markets without treating compliance as a slide.",
    content: [
      { type: "paragraph", text: "Use this checklist before launch — not after a regulator email." },
      { type: "list", items: ["Data inventory", "Consent surfaces", "Retention defaults", "Vendor review"] },
    ],
  },
  "voltpath-residential": {
    subtitle: "Shared EV chargers for apartment buildings.",
    body: "VoltPath Residential is hardware and software for multi-unit charging — install windows that work for property managers, billing that works for residents.",
    content: [
      { type: "paragraph", text: "Shared residential charging only works when the building is the customer." },
      { type: "list", items: ["Weekend install targets", "Shared load management", "Resident billing"] },
    ],
  },
  "nokanda-api-open-to-developers": {
    body: "Public beta access is live. Apply for keys; rate limits lift with usage.",
    content: [
      { type: "paragraph", text: "Nokanda AI is opening its API to developers in public beta." },
      { type: "paragraph", text: "Apply for keys. Rate limits lift with demonstrated usage." },
    ],
  },
  "relay-desk-beta": {
    body: "Opening the waitlist for teams under 50 people.",
    content: [
      { type: "paragraph", text: "Relay Desk public beta is open for teams under 50 people who need a shared ops inbox." },
    ],
  },
  "nokanda-developer-docs": {
    body: "Auth, endpoints, rate limits, and sample apps for the Nokanda API.",
    content: [
      { type: "paragraph", text: "Developer documentation covers authentication, endpoints, rate limits, and sample applications." },
    ],
  },
  "kai-mendez-glass-water": {
    body: "Three tracks from the forthcoming EP — early listen.",
    content: [
      { type: "paragraph", text: "Glass Water is an EP preview: three tracks from sessions that continue the Midnight Bus direction." },
    ],
  },
  "kai-mendez-after-hours": {
    body: "B-side from the Midnight Bus sessions.",
    content: [
      { type: "paragraph", text: "After Hours is a B-side from the same sessions as Midnight Bus — shorter, later, same room." },
    ],
  },
};

export function bodyFor(slug: string) {
  return SEED_BODIES[slug];
}
