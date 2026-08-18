export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string;
  /** Optional hero image URL or /public path */
  image?: string;
  /**
   * Body blocks:
   * - "## Heading" → h2
   * - "### Subheading" → h3
   * - "IMG:url" → image
   * - otherwise paragraph
   */
  body: string[];
};

/** Campaign 01 hero set — empty room → demand → intimate room */
const IMG_EMPTY =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&h=675&q=80";
const IMG_FILLED =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&h=675&q=80";
const IMG_INTIMATE =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&h=675&q=80";

export const posts: BlogPost[] = [
  {
    slug: "you-dont-need-more-fans",
    title: "You Don't Need More Fans. You Need to Know Which Fans Would Show Up.",
    description:
      "More followers don't automatically mean more music revenue. Learn how independent artists can identify real fan demand, find their strongest cities and turn listeners into ticket buyers.",
    keywords: [
      "independent artist fan growth",
      "music audience demand",
      "concert demand independent artist",
      "fans who would show up",
      "music monetization",
    ],
    date: "2026-08-18",
    image: IMG_EMPTY,
    body: [
      "Most independent artists think their biggest problem is audience size.",
      "It usually isn't.",
      "The harder problem is knowing which people in that audience actually have intent.",
      "An artist can have thousands of followers and still have no idea where their next 20 ticket buyers will come from.",
      "That's because followers, listeners and buyers are three different things.",
      `IMG:${IMG_EMPTY}`,
      "## Followers aren't demand",
      "A follower has expressed interest.",
      "That's useful.",
      "But it doesn't mean they're going to buy your next release, attend your show or support your next project.",
      "The same applies to streaming.",
      "Spotify can tell you that people listened.",
      "Instagram can tell you that people watched.",
      "Neither necessarily tells you:",
      "\"these are the people who would show up.\"",
      "That's the information independent artists need.",
      "## Start measuring intent",
      "Instead of asking only:",
      "How many followers do I have?",
      "How many streams did I get?",
      "How many views did the video receive?",
      "start asking:",
      "Which cities have the strongest audience?",
      "Which fans engage repeatedly?",
      "Which fans would attend an event?",
      "Which songs create the strongest response?",
      "Where is demand concentrated?",
      "What action should happen next?",
      "Those questions turn an audience into something you can actually operate.",
      "## Why city matters",
      "An independent artist might live in Lagos but have stronger demand in Accra.",
      "Another might have listeners spread across London, Abuja and Nairobi.",
      "Without understanding that distribution, an artist can spend months promoting themselves in the wrong market.",
      "The biggest audience isn't always the best market.",
      "The better question is:",
      "\"where is the strongest actionable demand?\"",
      `IMG:${IMG_FILLED}`,
      "## 20 buyers can teach you more than 20,000 views",
      "Imagine two artists.",
      "Artist A receives 20,000 views on a video.",
      "Artist B gets 20 people to buy tickets to a small listening room.",
      "Artist A has more attention.",
      "Artist B has stronger evidence of demand.",
      "That doesn't mean views are worthless.",
      "It means they're upstream.",
      "The career gets interesting when attention becomes action.",
      "## Build from demand",
      "The independent artist doesn't necessarily need another content calendar.",
      "They need a system that can connect the signals:",
      "audience → city → intent → opportunity → action",
      "That's the problem Omniv is built around.",
      "Instead of asking an artist to guess what they should do next, Omniv analyzes their career signals and ranks the highest-impact move.",
      "Sometimes that move is content.",
      "Sometimes it's a release.",
      "Sometimes it's a city.",
      "Sometimes it's a room.",
      "The point is that the answer shouldn't be predetermined.",
      "It should come from the data.",
      `IMG:${IMG_INTIMATE}`,
      "## The real question",
      "You don't need to know whether you have \"enough\" fans.",
      "You need to know:",
      "who would show up?",
      "Because once you know that, you can build around something real.",
      "Find the city.",
      "Open the room.",
      "Own the relationship.",
      "Get paid.",
      "Then do it again.",
      "Start with the free Omniv Artist Scan and find out what your audience is actually telling you.",
    ],
  },
  {
    slug: "how-to-make-money-independent-artist",
    title: "How to Make Money as an Independent Artist in 2026",
    description:
      "Monetize without a label: ticketed rooms, sync licensing, fan tiers, and the moves that actually pay.",
    keywords: [
      "how to make money as an independent artist",
      "music monetization",
      "indie artist revenue",
    ],
    date: "2026-08-11",
    body: [
      "The streaming payout for an independent artist with 10,000 monthly listeners is roughly $40. That will not cover rent in Lagos, let alone London. Yet every day, thousands of talented musicians release music hoping the algorithm will save them.",
      "It will not. Not alone.",
      "The artists making money in 2026 treat streaming as a discovery channel, not a salary. Real money lives in rooms you own, fans you can reach directly, and opportunities you create rather than wait for.",
      "Spotify typically pays about $0.003–$0.005 per stream. To earn $1,000 a month from streaming alone you need on the order of 250,000 streams. Most independents never hit that — and even if they do, playlists and algorithms can cut income overnight.",
      "Revenue stream 1: ticketed rooms and listening parties. A 50-capacity room with a $5 ticket and a tip jar can clear $250–$400 in one night. The artist keeps most of it and collects email, city, and intent data they own.",
      "The key is knowing which city is ready — not guessing. Fan maps that show where listeners marked would attend turn a guess into a plan: open the room, share the link, fill the seats.",
      "Revenue stream 2: sync licensing. A single placement in film, TV, or ads can pay more than a year of streaming. Supervisors work from briefs (mood, BPM, territory), not from scrolling Spotify. Sync-ready catalogues have clean intros, instrumentals, and accurate metadata.",
      "Revenue stream 3: direct fan support. Tiers beat vague support my music. Early access, listening-party seats, and name-in-the-notes for superfans convert better than a tip jar alone.",
      "Revenue stream 4: production and session work. Beats, mixes, and vocal production fund your own releases while you grow the artist brand.",
      "Independent artists who get paid stop waiting for permission. They open rooms where traction already exists, pitch to briefs that match, and own the list — not just the follower count.",
      "Ready to find your first revenue move? Open Omniv, run your free artist scan, and see which city, track, and opportunity should come next.",
    ],
  },
  {
    slug: "how-to-find-fans-in-any-city",
    title: "How to Find Your Fans in Any City: A Data-Driven Guide",
    description:
      "Stop guessing where to perform. Map listeners by city, measure intent to attend, and plan rooms that sell.",
    keywords: [
      "how to find music fans",
      "fan mapping for artists",
      "where are my Spotify listeners",
    ],
    date: "2026-08-11",
    body: [
      "Every independent artist asks: Where should I perform? The answer is not everywhere and not always home. It is the city with the highest concentration of fans who would actually show up.",
      "Country-level charts do not book a room. You need city-level concentration and signals beyond passive streams.",
      "Three sources of city data: streaming city charts for growth; Instagram and TikTok engagement by location; a Fan Gate that captures email, city, and would attend. Owned intent beats rented followers.",
      "Listener count is vanity. Intent-to-attend is revenue. A city with 300 listeners and 15% intent can beat 1,000 listeners with 2% intent when you price a small room.",
      "Simple filter: addressable audience is listeners times intent rate. Addressable times ticket price is minimum viable room revenue.",
      "Test demand before you spend: free listening night, coffee-shop set, or low cover virtual room. If 15–20 people show for free, a modest ticketed room is realistic.",
      "Once one city works, run a cycle — each room funding the next. Think city cycles, not only album cycles.",
      "Find your top city in minutes with an Omniv scan: ranked cities, intent signals, and a clear first room to open.",
    ],
  },
  {
    slug: "sync-licensing-guide",
    title: "How to Get Your Music on Netflix: Sync Licensing for Independents",
    description:
      "What music supervisors look for, how to make tracks sync-ready, and how to pitch without a publisher.",
    keywords: [
      "sync licensing for musicians",
      "how to get music on Netflix",
      "music supervisor pitch",
    ],
    date: "2026-08-11",
    body: [
      "A single sync placement can out-earn a year of streaming. For independents, sync is pitchable work — not a lottery — if you understand briefs and clearance.",
      "Sync is the right to pair music with picture: film, TV, ads, games, trailers. Fees depend on prominence, territory, term, and media.",
      "Supervisors fulfill briefs: tempo, mood, vocal type, lyrical theme, and technical needs such as a clean intro under dialogue.",
      "Make the catalogue sync-ready: BPM, key, mood, themes; clean intros; full instrumentals; accurate lyric sheets; avoid uncleared samples.",
      "Find opportunities via non-exclusive libraries, fast responses to public briefs, and partner signals when tools surface open briefs in your lane.",
      "Pitch short: match the brief, list BPM key mood, attach clip plus full plus instrumental, state you control rights and can clear now.",
      "Never pitch what you cannot clear. Reputation compounds faster than one bad submission.",
      "Upload a track in Omniv for a sync-readiness pass: structure notes, gaps, and which title to pitch first.",
    ],
  },
  {
    slug: "owned-audience-vs-followers",
    title: "Owned Audience vs Followers: Why Independents Must Own Their Fans",
    description:
      "Followers can vanish overnight. Emails, cities, and intent data are assets you control.",
    keywords: [
      "owned audience for musicians",
      "email list for artists",
      "why followers don't matter",
    ],
    date: "2026-08-11",
    body: [
      "Artists lose accounts, reach, and playlists every year. Building only on Instagram, TikTok, or Spotify is building on rented land.",
      "Rented: followers, monthly listeners, subscribers. Owned: emails, phone numbers, city tags, payment relationships, intent to attend.",
      "A follower clicked once. An owned fan opted in, named a city, and said they would show up. That is a relationship, not a vanity count.",
      "Build ownership with a Fan Gate on every drop, rooms that collect RSVPs, and segmentation so messages stay relevant.",
      "Platform risk is real: algorithm cuts, regional bans, playlist removals. Lists and direct invites survive those swings.",
      "An owned list is the rare career asset that can appreciate. Songs age; platforms change; opted-in fans compound.",
      "Start capturing with Omniv Fan Gate — email, city, intent — so your next room is sold to people you can actually reach.",
    ],
  },
  {
    slug: "ticketed-listening-party-guide",
    title: "How to Open Your First Ticketed Listening Party",
    description:
      "Price, format, space, ticket link, and follow-up — a practical playbook for independents.",
    keywords: [
      "ticketed listening party",
      "how to host a listening party",
      "independent artist live events",
    ],
    date: "2026-08-11",
    body: [
      "A ticketed listening party needs a room, a link, and fans who want in — not a promoter or a minimum guarantee.",
      "It is intimate by design: play tracks, tell stories, take questions, collect tips. Fans get access streaming cannot offer; you get revenue and proof of live demand.",
      "Choose the city with the strongest intent, not only the largest stream count. Set a first price low enough to remove friction while still signaling value.",
      "Formats: classic listening set, acoustic set, or hybrid. Spaces can be studios, galleries, co-working rooms — 20–50 capacity is enough to start.",
      "Sell the owned list first, then social. Prepare stories, seed Q&A, film short clips, run a tip link, and capture emails at the door.",
      "Within 24 hours: thank attendees, share proof, ask what would make them bring a friend, and teaser the next room or release.",
      "Simple math: modest ticket sales plus tips can net a few hundred after a small space fee — plus deeper fan relationships.",
      "Scan on Omniv for the first city and a concrete open-room step so the first party is a plan, not a hope.",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function allSlugs(): string[] {
  return posts.map((p) => p.slug);
}
