/** Cover & avatar map — curated images for seed/demo content only.
 * User-created profiles and publications must not receive invented stock photos.
 */

const U = (id: string, w = 1200, h = 675) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** Explicit slug → thematic Unsplash cover (seed publications + entities only) */
export const SEED_COVERS: Record<string, string> = {
  // Network seed publications
  "why-african-language-models-need-local-infrastructure":
    U("photo-1620712943543-bcc4688e7485"),
  "african-language-model-landscape-2026":
    U("photo-1677442136019-21780ecad995"),
  "nokanda-api": U("photo-1555949963-aa79dcee981c"),
  "nokanda-developer-docs": U("photo-1516321318423-f06f85e504b3"),
  "nokanda-api-open-to-developers": U("photo-1519389950473-47ba0277781c"),
  "nokanda-looking-for-investors": U("photo-1559136555-9303baea8ebd"),
  "distribution-is-the-product": U("photo-1586528116311-ad8dd3c8310d"),
  "kai-mendez-midnight-bus": U("photo-1514525253161-7a46d19cd819"),
  "kai-mendez-glass-water": U("photo-1511671782779-c97d3d27a1d4"),
  "relay-desk-product": U("photo-1551434678-e076c223a692"),
  "relay-desk-beta": U("photo-1522071820081-009f0129c71c"),
  "cooling-logistics-nairobi": U("photo-1473341304170-971dccb5ac1e"),
  "northline-operator-dinner-toronto": U("photo-1414235077428-338989a2e8c0"),
  "slow-fashion-without-the-calendar": U("photo-1558769132-cb1aea458c5e"),
  "ember-creator-open-call": U("photo-1483985988355-763728e1935b"),
  "harbor-privacy-checklist": U("photo-1563986768609-322da13575f3"),
  "voltpath-residential": U("photo-1593941707882-a5bba14938c7"),
  "charging-is-a-building-problem": U("photo-1593941707882-a5bba14938c7"),
  "east-asia-clean-manufacturing-notes": U("photo-1565793298595-6a879b1d9492"),
  "the-operator-brief-you-actually-read": U("photo-1504711434969-e33886168f5c"),
  "signal-room-nyc-meetup": U("photo-1540575467063-178a50c2df87"),
  "danfo-route-map-v1": U("photo-1449824913935-59a10b8d2000"),
  "open-maps-lagos-mappers": U("photo-1524661135-423995f22d0b"),
  "after-hours": U("photo-1514525253161-7a46d19cd819"),

  // Omniv Editorial — geopolitics
  "why-putin-still-has-leverage-after-four-years-of-war":
    U("photo-1541872703-74c5e44368f9"),
  "how-russias-economy-has-adapted-to-sanctions":
    U("photo-1611974789855-9c2a0a7236a3"),
  "the-russia-china-relationship-is-bigger-than-ukraine":
    U("photo-1529107386315-e1a2ed48a620"),
  "why-russia-wants-a-stronger-relationship-with-north-korea":
    U("photo-1451187580459-43490279c0fa"),
  "what-putin-actually-wants-from-negotiations":
    U("photo-1529107386315-e1a2ed48a620"),
  "russias-shadow-fleet-how-oil-keeps-moving-around-sanctions":
    U("photo-1578662996442-48f60103fc96"),
  "how-drones-changed-modern-warfare":
    U("photo-1473968512647-3e447244af8f"),

  // Infrastructure / data
  "the-physical-internet-what-exists-behind-the-cloud":
    U("photo-1558494949-ef010cbdcc31"),
  "the-new-geography-of-computing":
    U("photo-1451187580459-43490279c0fa"),
  "what-happens-when-countries-start-treating-data-like-oil":
    U("photo-1551288049-bebda4e38f71"),
  "the-infrastructure-wars-nobody-is-talking-about":
    U("photo-1486406146926-c627a92ad1ab"),

  // AI
  "ai-is-not-just-a-software-revolution":
    U("photo-1677442136019-21780ecad995"),
  "the-race-to-control-the-ai-infrastructure-layer":
    U("photo-1620712943543-bcc4688e7485"),
  "why-ai-needs-more-than-better-models":
    U("photo-1555255707-c07966088b7b"),
  "who-actually-makes-money-when-ai-becomes-cheaper":
    U("photo-1460925895917-afdab827c52f"),
  "the-coming-battle-over-ai-compute":
    U("photo-1558494949-ef010cbdcc31"),
  "why-data-centers-may-matter-more-than-ai-startups":
    U("photo-1558494949-ef010cbdcc31"),
  "what-happens-when-intelligence-becomes-cheap":
    U("photo-1677442136019-21780ecad995"),
  "the-ai-companies-building-the-models-vs-the-companies-building-everything-arou":
    U("photo-1518770660439-4636190af475"),
  "why-every-country-wants-its-own-ai-stack":
    U("photo-1451187580459-43490279c0fa"),
  "the-geopolitics-of-artificial-intelligence":
    U("photo-1529107386315-e1a2ed48a620"),

  // Markets / capital
  "what-actually-makes-an-asset-valuable":
    U("photo-1611974789855-9c2a0a7236a3"),
  "why-infrastructure-attracts-long-term-capital":
    U("photo-1486406146926-c627a92ad1ab"),
  "the-difference-between-price-and-value":
    U("photo-1554224155-6726b3ff858f"),
  "why-investors-care-about-cash-flow":
    U("photo-1579621970563-ebec7560ff3e"),
  "what-makes-a-market-attractive":
    U("photo-1590283603385-17ffb3a7f29f"),

  // Founders / startups
  "stop-looking-for-ideas-look-for-problems":
    U("photo-1517245386807-bb43f82c33c4"),
  "the-best-businesses-often-begin-with-something-broken":
    U("photo-1454165804606-c3d57bc86b40"),
  "why-entrepreneurs-should-study-infrastructure":
    U("photo-1504384308090-c894fdcc538d"),
  "the-new-solo-founder-economy":
    U("photo-1498050108023-c4ad1e5eaf00"),
  "what-ai-changed-about-starting-a-company":
    U("photo-1552664730-d307ca884978"),
  "why-africa-could-produce-a-different-kind-of-startup":
    U("photo-1489392191049-fc10c379c0fb"),
  "the-startup-ideas-hiding-inside-broken-infrastructure":
    U("photo-1504384308090-c894fdcc538d"),
  "what-investors-actually-mean-when-they-say-moat":
    U("photo-1559136555-9303baea8ebd"),
  "why-timing-matters-more-than-most-founders-admit":
    U("photo-1501139083538-0139583c060f"),

  // Science
  "what-we-still-dont-understand-about-the-brain":
    U("photo-1559757175-5700dde675bc"),
  "the-race-to-understand-aging":
    U("photo-1576091160399-112ba8d25d1d"),
  "why-quantum-computing-is-so-difficult":
    U("photo-1635070041078-e363dbe005cb"),
  "what-happens-when-biology-becomes-programmable":
    U("photo-1532187863486-abf9dbad1b69"),
  "the-new-race-for-space":
    U("photo-1446776811953-b23d57bd21aa"),

  // Entity landscape covers (seed identities only)
  "nokanda-ai": U("photo-1677442136019-21780ecad995", 1200, 400),
  "northline-media": U("photo-1504711434969-e33886168f5c", 1200, 400),
  "relay-desk": U("photo-1551434678-e076c223a692", 1200, 400),
  "ember-cloth": U("photo-1558769132-cb1aea458c5e", 1200, 400),
  "amara-okafor": U("photo-1497366216548-37526070297c", 1200, 400),
  "grid-notes": U("photo-1473341304170-971dccb5ac1e", 1200, 400),
  "kai-mendez": U("photo-1470229722913-7c0e2dbbafd3", 1200, 400),
  "harbor-labs": U("photo-1563986768609-322da13575f3", 1200, 400),
  "voltpath": U("photo-1593941707882-a5bba14938c7", 1200, 400),
  "lena-cho": U("photo-1497366811353-6870744d04b2", 1200, 400),
  "signal-room": U("photo-1540575467063-178a50c2df87", 1200, 400),
  "open-maps-lagos": U("photo-1524661135-423995f22d0b", 1200, 400),
};

export const SEED_AVATARS: Record<string, string> = {
  "nokanda-ai": U("photo-1677442136019-21780ecad995", 400, 400),
  "northline-media": U("photo-1504711434969-e33886168f5c", 400, 400),
  "relay-desk": U("photo-1522071820081-009f0129c71c", 400, 400),
  "ember-cloth": U("photo-1483985988355-763728e1935b", 400, 400),
  "amara-okafor": U("photo-1573496359142-b8d87734a5a2", 400, 400),
  "grid-notes": U("photo-1451187580459-43490279c0fa", 400, 400),
  "kai-mendez": U("photo-1507003211169-0a1dd7228f2d", 400, 400),
  "harbor-labs": U("photo-1563986768609-322da13575f3", 400, 400),
  "voltpath": U("photo-1593941707882-a5bba14938c7", 400, 400),
  "lena-cho": U("photo-1580489944761-15a19d654956", 400, 400),
  "signal-room": U("photo-1475721027785-f74eccf877e2", 400, 400),
  "open-maps-lagos": U("photo-1524661135-423995f22d0b", 400, 400),
};

/**
 * Cover for seed content only. Returns null for user-created slugs
 * so we never invent Unsplash stock on real profiles or publications.
 */
export function coverFor(slug: string): string | null {
  if (!slug) return null;
  return SEED_COVERS[slug] || null;
}

/** Avatar for seed identities only. */
export function avatarFor(slug: string): string | null {
  if (!slug) return null;
  return SEED_AVATARS[slug] || SEED_COVERS[slug] || null;
}

export const SEED_CTAS: Record<string, { label: string; href: string }> = {
  "african-language-model-landscape-2026": {
    label: "Read research",
    href: "/p/african-language-model-landscape-2026",
  },
  "nokanda-api": { label: "View product", href: "/e/company/nokanda-ai" },
  "relay-desk-product": {
    label: "Request access",
    href: "/e/company/relay-desk",
  },
  "voltpath-residential": {
    label: "Contact VoltPath",
    href: "/e/company/voltpath",
  },
  "danfo-route-map-v1": { label: "Open map", href: "/p/danfo-route-map-v1" },
};

export function ctaFor(slug: string) {
  return SEED_CTAS[slug];
}
