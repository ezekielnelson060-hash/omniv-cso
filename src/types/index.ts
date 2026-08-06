export type UserRole = "artist" | "manager" | "label";

export interface ArtistScore {
  overall: number;
  growth: number;
  momentum: number;
  audienceHealth: number;
  releaseReadiness: number;
  contentHealth: number;
  fanGrowth: number;
  streamingTrend: number;
  socialGrowth: number;
  opportunity: number;
}

export type OpportunityCategory =
  | "Content"
  | "Release"
  | "Audience"
  | "Playlist"
  | "Collab"
  | "Festival"
  | "Platform"
  | "Market"
  | "Trend";

export interface AIRecommendation {
  id: string;
  title: string;
  summary: string;
  why: string;
  impact: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Moderate" | "Hard";
  confidence: number;
  expectedOutcome: string;
  priority: number;
  category: OpportunityCategory | string;
  supportingData?: string;
  alternative?: string;
  timeWindow?: string;
  detectedAt?: string;
  /** Surfaces this move targets */
  platforms?: string[];
  /** When to act / deadline framing */
  timing?: string;
  /** Positioning / story angle */
  positioning?: string;
  /** Who or what to connect */
  connections?: string;
  /** Strategic frame in one line */
  strategicFrame?: string;
  /** Concrete next steps */
  nextActions?: string[];
}

export interface PlatformConnection {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
}

export interface OnboardingState {
  step: number;
  role: UserRole | null;
  platforms: string[];
  artistLinks: {
    website?: string;
    spotify?: string;
    youtube?: string;
    tiktok?: string;
    instagram?: string;
  };
  scanning: boolean;
  scanProgress: number;
  scanMessage: string;
}

export interface ScoreHistoryPoint {
  label: string;
  overall: number;
  streams: number;
  social: number;
}

export type CareerStage =
  | "emerging"
  | "developing"
  | "breakthrough"
  | "established"
  | "legacy";

export interface ArtistBrain {
  name: string;
  stageName?: string;
  genre: string[];
  subGenre: string[];
  musicStyle: string;
  brandVoice: string;
  visualIdentity: string;
  targetAudience: string;
  careerStage: CareerStage;
  strengths: string[];
  weaknesses: string[];
  goals: string[];
  /** North-star career image held across the product */
  bigDream?: string;
  pastReleases: { title: string; year: string; type: string }[];
  contentStyle: string;
  competitors: string[];
  notes: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface ReleaseSimulation {
  title: string;
  commercialPotential: number;
  viralPotential: number;
  genreFit: number;
  playlistPotential: number;
  audienceFit: number;
  riskScore: number;
  viralProbability: number;
  bestReleaseDate: string;
  timingRationale: string;
  competition: string;
  marketingStrategy: string[];
  budgetRecommendation: string;
  launchPlan: { week: string; focus: string; actions: string[] }[];
}

export interface ContentAnalysis {
  sourceLabel: string;
  hookScore: number;
  retentionScore: number;
  editingScore: number;
  storytellingScore: number;
  emotionScore: number;
  overall: number;
  strengths: string[];
  improvements: string[];
  captions: string[];
  hashtags: string[];
  titleSuggestions: string[];
  bestPostingTimes: string[];
  platformNotes: string;
}

export interface ViralPrediction {
  sourceLabel: string;
  engagement: number;
  watchTime: number;
  retention: number;
  shares: number;
  comments: number;
  algorithmScore: number;
  overallViral: number;
  why: string[];
  risks: string[];
}

export interface StudioOutput {
  platform: string;
  content: string;
}
