import type {
  AIRecommendation,
  ArtistBrain,
  ArtistScore,
  ScoreHistoryPoint,
} from "@/types";

export const mockScores: ArtistScore = {
  overall: 74,
  growth: 68,
  momentum: 81,
  audienceHealth: 72,
  releaseReadiness: 58,
  contentHealth: 65,
  fanGrowth: 79,
  streamingTrend: 71,
  socialGrowth: 84,
  opportunity: 77,
};

export const mockScoreHistory: ScoreHistoryPoint[] = [
  { label: "W1", overall: 61, streams: 52, social: 58 },
  { label: "W2", overall: 63, streams: 55, social: 62 },
  { label: "W3", overall: 66, streams: 58, social: 68 },
  { label: "W4", overall: 68, streams: 61, social: 71 },
  { label: "W5", overall: 70, streams: 64, social: 74 },
  { label: "W6", overall: 71, streams: 67, social: 78 },
  { label: "W7", overall: 73, streams: 69, social: 81 },
  { label: "W8", overall: 74, streams: 71, social: 84 },
];

export const mockRecommendations: AIRecommendation[] = [
  {
    id: "1",
    title: "Strike the TikTok trend window this week",
    summary:
      "A rising audio in your genre is accelerating. Artists posting original content to it within 72 hours are seeing 3–5× organic reach.",
    why: "Your recent content velocity and audience overlap with this trend cluster is in the top quartile. The sound’s growth curve is still early-stage.",
    impact: "High",
    difficulty: "Easy",
    confidence: 87,
    expectedOutcome: "+18–32% short-form views over 7 days if executed within 48h",
    priority: 1,
    category: "Trend",
    supportingData: "Sound velocity +214% / 48h · Your niche share of voice on similar sounds: 1.8%",
    alternative: "If capacity is tight, post a 15s teaser using the sound as B-roll over studio footage.",
    timeWindow: "Next 48–72 hours",
    detectedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Prioritise a mid-tempo single for Q3",
    summary:
      "Your catalogue skews high-energy. Mid-tempo tracks in your genre currently hold stronger playlist conversion rates.",
    why: "Playlist placement probability for mid-tempo releases matching your vocal signature is currently elevated versus your last three drops.",
    impact: "High",
    difficulty: "Moderate",
    confidence: 79,
    expectedOutcome: "Improved editorial playlist odds and steadier weekly stream baseline",
    priority: 2,
    category: "Release",
    supportingData: "Mid-tempo editorial add rate +19% QoQ in your sub-genre · Your last mid-tempo held 2.1× longer on Discover Weekly",
    alternative: "Test a mid-tempo rewrite of an existing high-energy demo before committing a full production cycle.",
    timeWindow: "Next 4–6 weeks",
    detectedAt: "Today",
  },
  {
    id: "3",
    title: "Re-engage the 30–45 day dormant cohort",
    summary:
      "12% of your engaged listeners have gone quiet. A targeted Story + short clip sequence can recover a meaningful slice.",
    why: "Historical recovery rate for this segment when contacted via Stories is 22–28% within two weeks.",
    impact: "Medium",
    difficulty: "Easy",
    confidence: 74,
    expectedOutcome: "+4–7% monthly active listener recovery",
    priority: 3,
    category: "Audience",
    supportingData: "Dormant cohort size: ~11.4K · Prior Story recovery rate on similar cohorts: 24%",
    alternative: "Email / newsletter drop with an exclusive snippet if Stories capacity is limited.",
    timeWindow: "This week",
    detectedAt: "Yesterday",
  },
  {
    id: "8",
    title: "Emerging market: increased streams from Lagos & Accra",
    summary:
      "West African listening share of your catalogue rose 38% month-over-month. Local playlist and radio pathways remain unaddressed.",
    why: "Organic discovery is outpacing your current geo-targeting. Competitors who localised content saw sustained retention.",
    impact: "High",
    difficulty: "Moderate",
    confidence: 76,
    expectedOutcome: "Geo-specific content + playlist pitching could double regional streams over 60 days",
    priority: 1,
    category: "Market",
    supportingData: "Lagos + Accra share: 9.4% of monthly listeners (was 6.8%) · No local playlist placements yet",
    alternative: "Partner with a regional curator/influencer before formal radio outreach.",
    timeWindow: "Next 30–45 days",
    detectedAt: "4 days ago",
  },
];

export const platforms = [
  { id: "spotify", name: "Spotify", icon: "spotify" },
  { id: "apple", name: "Apple Music", icon: "apple" },
  { id: "youtube", name: "YouTube", icon: "youtube" },
  { id: "instagram", name: "Instagram", icon: "instagram" },
  { id: "tiktok", name: "TikTok", icon: "tiktok" },
  { id: "x", name: "X", icon: "x" },
  { id: "facebook", name: "Facebook", icon: "facebook" },
  { id: "soundcloud", name: "SoundCloud", icon: "soundcloud" },
];

export const scanMessages = [
  "Reading audience geography...",
  "Weighing engagement vs passive reach...",
  "Looking for city concentration...",
  "Checking intent and repeat signals...",
  "Scoring market demand strength...",
  "Ranking the first validation move...",
];

export const mockArtistBrain: ArtistBrain = {
  name: "Nova Hex",
  stageName: "NOVA HEX",
  genre: ["Alt-R&B", "Electronic"],
  subGenre: ["Hyper-soul", "Dark pop"],
  musicStyle:
    "Moody mid-tempo productions with stacked vocal harmonies, sparse drums, and cinematic pads. Melodic but emotionally heavy.",
  brandVoice:
    "Quiet confidence. Intimate, slightly cryptic. Speaks to late-night listeners who want depth without pretension.",
  visualIdentity:
    "Deep charcoal, cold neon accents, grain photography, silhouette-forward framing. Avoid bright lifestyle stock.",
  targetAudience:
    "18–28, urban & suburban, playlist-native, high TikTok/IG Reels consumption, values authenticity over polish.",
  careerStage: "developing",
  strengths: [
    "Distinctive vocal texture",
    "Strong short-form storytelling",
    "Loyal core fan cluster",
    "Consistent aesthetic",
  ],
  weaknesses: [
    "Release readiness lag",
    "Low YouTube Shorts cadence",
    "Playlist pitching underdeveloped",
    "Geographic concentration in US/UK only",
  ],
  goals: [
    "Break 250K monthly listeners by Q4",
    "Land 2 editorial playlist adds",
    "Tour 8 secondary markets",
    "Build a repeatable content system",
  ],
  pastReleases: [
    { title: "Voltage", year: "2025", type: "Single" },
    { title: "Afterglow", year: "2025", type: "Single" },
    { title: "Night Circuit EP", year: "2024", type: "EP" },
  ],
  contentStyle:
    "Behind-the-scenes process clips, lyric moments, muted performance takes. Hooks in first 1.5s. Captions sparse and poetic.",
  competitors: ["The Weeknd-adjacent indie acts", "Local hyperpop-adjacent peers", "Mid-tier alt-R&B playlist regulars"],
  notes:
    "Avoid over-producing TikToks. Fans respond to imperfect, in-room energy. Strategy Engine prioritises conversion from social → streams.",
  lastUpdated: "2026-07-28",
};

export const zikiSuggestions = [
  "Where is my strongest market?",
  "Which city should I test with a room?",
  "Do I have demand or just attention?",
  "What is the one move this week?",
  "How do I verify Accra vs Lagos?",
  "What should I release next?",
];

/** Simulated CSO replies keyed by simple intent matching */
export function simulateZikiReply(userText: string): string {
  const t = userText.toLowerCase();

  if (t.includes("market") || t.includes("city") || t.includes("demand") || t.includes("where")) {
    return `**Market demand brief**\n\nAttention is not demand. Followers and streams tell you someone noticed — not whether they will show up.\n\n**What I look for**\n- Geographic concentration\n- Repeat engagement\n- Intent (would attend / list signup)\n- Commercial signals (tickets, tips)\n\n**Next validation**\nOpen Fan Gate, collect city + intent, then test a 30–50 person paid room in the strongest city.\n\nAsk: “Which city should I test first?” for a ranked shortlist.`;
  }

  if (t.includes("release") || t.includes("drop") || t.includes("single")) {
    return `**Release timing**\n\nDon’t release because it’s Friday. Release when a market is warm enough to act.\n\nCheck demand signals first, then sequence: proof room → list growth → catalogue event.\n\nWant a ranked city before you pick a drop date?`;
  }

  if (t.includes("room") || t.includes("show") || t.includes("ticket")) {
    return `**Room as verification**\n\nA 30-person paid room is the cheapest proof of demand.\n\n1. Rank cities by density + intent\n2. Size the room to known demand\n3. Sell the list first\n4. Measure who actually comes\n\nThat result trains the next move.`;
  }

  return `**Noted.**\n\nOmniv is built to verify market demand — where people concentrate, how strong the signals are, and what to test next.\n\nTry:\n- “Where is my strongest market?”\n- “Which city should I test with a room?”\n- “Do I have demand or just attention?”`;
}
