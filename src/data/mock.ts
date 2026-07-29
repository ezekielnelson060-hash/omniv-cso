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
    id: "4",
    title: "Pitch ‘Afterglow’ to three rising independent playlists",
    summary:
      "Three curators in your lane are actively refreshing mid-size lists. Your track’s tempo and energy sit inside their recent acceptance band.",
    why: "Overlap between your audio fingerprint and their last 20 adds is above threshold. Timing aligns with their typical refresh cycle (Thu–Sun).",
    impact: "High",
    difficulty: "Moderate",
    confidence: 82,
    expectedOutcome: "2–4 playlist adds possible · estimated +8–15K streams over 14 days if 2 land",
    priority: 4,
    category: "Playlist",
    supportingData: "Curator refresh cadence: weekly · Match score: 0.78–0.84 across the three lists",
    alternative: "Submit via SubmitHub Premium to the same lists if direct outreach stalls.",
    timeWindow: "Thursday–Sunday window",
    detectedAt: "5 hours ago",
  },
  {
    id: "5",
    title: "Feature collab with rising act in adjacent city scene",
    summary:
      "A peer artist 1.4× your monthly listeners shares 31% audience overlap and is actively seeking features.",
    why: "Audience overlap + complementary vocal range + their recent collab posts outperform solo drops by ~40% engagement.",
    impact: "Medium",
    difficulty: "Hard",
    confidence: 71,
    expectedOutcome: "Cross-pollination of 8–12% of their engaged base; content co-promotion cycle of 2–3 weeks",
    priority: 5,
    category: "Collab",
    supportingData: "Audience overlap 31% · Their last feature: +22% 28-day listeners",
    alternative: "Remix exchange instead of full feature if schedules conflict.",
    timeWindow: "Next 30 days",
    detectedAt: "2 days ago",
  },
  {
    id: "6",
    title: "Festival circuit soft-pitch for late summer",
    summary:
      "Two regional festivals matching your energy profile still have undercard slots. Booking windows close in ~3 weeks.",
    why: "Your live-set length and recent ticket sell-through on comparable rooms match their historical undercard profile.",
    impact: "Medium",
    difficulty: "Hard",
    confidence: 66,
    expectedOutcome: "1 undercard slot would lift Instagram reach 2–3× during the festival week and seed touring demand",
    priority: 6,
    category: "Festival",
    supportingData: "Slot fill rate currently 61% · Genre fit score: 0.72",
    alternative: "Satellite / side-stage day party if main undercard is full.",
    timeWindow: "Pitch within 14 days",
    detectedAt: "3 days ago",
  },
  {
    id: "7",
    title: "YouTube Shorts cadence gap vs peers",
    summary:
      "Peers in your tier post 4–6 Shorts/week. You average 1.2. Algorithmic distribution is under-utilised on the platform.",
    why: "Your long-form watch time is strong; Shorts would act as top-of-funnel into full videos and releases.",
    impact: "Medium",
    difficulty: "Easy",
    confidence: 80,
    expectedOutcome: "Closing half the gap could add 15–25% YouTube-sourced traffic to smart links within 30 days",
    priority: 7,
    category: "Platform",
    supportingData: "Peer median Shorts/week: 5 · Yours: 1.2 · Long-form AVD: above niche median",
    alternative: "Repurpose existing Reel/TikTok cuts as Shorts with platform-native captions first.",
    timeWindow: "Start this week",
    detectedAt: "Today",
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
    priority: 8,
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
  "Scanning digital footprint...",
  "Learning audience signals...",
  "Understanding artistic style...",
  "Analysing competitive set...",
  "Mapping content patterns...",
  "Building strategic profile...",
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
  "What should I release next?",
  "What content should I post this week?",
  "Why did streams drop?",
  "What are my biggest opportunities?",
  "What mistakes am I making?",
  "Draft a 7-day content plan",
];

/** Simulated CSO replies keyed by simple intent matching */
export function simulateZikiReply(userText: string): string {
  const t = userText.toLowerCase();

  if (t.includes("release") || t.includes("drop") || t.includes("single")) {
    return `**Executive briefing — next release**\n\nBased on your Artist Brain and current Opportunity Score (77), the highest-leverage move is a **mid-tempo single** in the next 4–6 weeks — not another high-energy cut.\n\n**Why**\n- Your catalogue skews high-energy; mid-tempo tracks in alt-R&B currently convert better on editorial lists.\n- Release Readiness is your weakest score (58). A focused single with clear pitching assets closes that gap faster than an EP.\n\n**Recommended sequence**\n1. Lock a mid-tempo demo this week (or rewrite an existing one).\n2. Align cover + 15s teaser to visual identity (charcoal, grain, silhouette).\n3. Pitch three independent playlists in the Thu–Sun window (see Opportunity #4).\n\n**Expected outcome**\nImproved playlist odds and a steadier weekly stream baseline. Confidence: **79%**.\n\nAsk me to draft the pitch email or the teaser caption if you want the next layer.`;
  }

  if (t.includes("content") || t.includes("post") || t.includes("tiktok") || t.includes("week")) {
    return `**7-day content plan — aligned to your brand voice**\n\nYour Content Health is 65; social growth is strong (84). The gap is **cadence and conversion**, not creativity.\n\n| Day | Asset | Hook |\n|-----|--------|------|\n| Mon | Process clip (30s) | First 1.5s: vocal stack alone, no text |\n| Tue | Lyric moment | One line from *Afterglow*, grain still |\n| Wed | Trend sound (Priority #1) | Original take — window closes in ~48h |\n| Thu | Studio silhouette B-roll | Caption: sparse, one sentence max |\n| Fri | Shorts repurpose | Same Wed cut, YouTube-native caption |\n| Sat | Story poll | “Which tempo next — night drive or peak energy?” |\n| Sun | Rest / reply to comments | Re-engage dormant cohort (Opportunity #3) |\n\n**Principle:** imperfect in-room energy > polished lifestyle. That matches your Artist Brain.\n\nWant me to write the exact captions for Wed + Fri?`;
  }

  if (t.includes("stream") || t.includes("decline") || t.includes("down")) {
    return `**Why streams may have softened**\n\nCross-checking your scores and footprint pattern:\n\n1. **Conversion gap** — Social growth (+11) outpaced streaming trend. Short-form is rising; smart-link click-through is not.\n2. **Release readiness (58)** — No new catalogue event in the recent window; algorithmic decay is normal without a fresh signal.\n3. **Geo shift** — Lagos & Accra share rose 38% MoM, but you have no local playlist placements yet. Discovery is happening where you are not pitching.\n\n**Highest-impact fix this week**\nExecute the TikTok trend window (Opportunity #1) *and* one smart-link CTA in Stories aimed at the 30–45 day dormant cohort.\n\nI can draft both assets if you say the word.`;
  }

  if (t.includes("opportunit") || t.includes("biggest") || t.includes("should i do")) {
    return `**Top opportunities ranked for you right now**\n\n1. **TikTok trend window** — 87% confidence · Easy · Next 48–72h\n2. **Mid-tempo single for Q3** — 79% confidence · Moderate · 4–6 weeks\n3. **Dormant cohort re-engagement** — 74% confidence · Easy · This week\n4. **Independent playlist pitch** — 82% confidence · Thu–Sun window\n\nFull briefings live in Opportunity Feed. The single highest-ROI action *today* is the trend sound before the window closes.\n\nOpen **/opportunities** or ask me to expand any one of these.`;
  }

  if (t.includes("mistake") || t.includes("wrong") || t.includes("missing")) {
    return `**Strategic gaps (not personal criticism)**\n\nFrom Artist Brain + scores:\n\n- **Under-investing in mid-tempo** while the market rewards it\n- **YouTube Shorts cadence** at 1.2/week vs peer median ~5\n- **Playlist outreach** still reactive, not scheduled\n- **No geo strategy** despite West Africa momentum\n\nNone of these are talent problems. They are system problems — and systems are what I optimise.\n\nPick one gap and I’ll give you a 14-day execution plan.`;
  }

  if (t.includes("plan") || t.includes("7-day") || t.includes("schedule")) {
    return `**14-day execution spine**\n\n**Week 1 — Capture attention**\n- Hit the active trend sound within 48h\n- 4 short-form posts (process, lyric, trend, silhouette)\n- Stories sequence for dormant listeners\n\n**Week 2 — Convert + pitch**\n- Smart-link CTA on best-performing cut\n- Three playlist pitches (Thu–Sun)\n- Lock mid-tempo demo direction with producer\n\nThis sequence attacks Opportunities #1, #3, and #4 in order. Say “expand week 1” for day-level detail.`;
  }

  return `**Noted.**\n\nI’ve read that against your Artist Brain (NOVA HEX · developing · alt-R&B / hyper-soul) and current scores.\n\nOverall **74** · Momentum **81** · Release readiness **58** — so I will bias advice toward moves that raise readiness and convert social heat into streams.\n\nTry one of these:\n- “What should I release next?”\n- “Draft a 7-day content plan”\n- “What are my biggest opportunities?”\n- “Why did streams drop?”\n\nOr ask anything specific about catalogue, audience, or timing.`;
}
