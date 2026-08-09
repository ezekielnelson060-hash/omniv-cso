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
  | "Trend"
  | "Strategy"
  | "Growth"
  | "Brand";

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
  platforms?: string[];
  timing?: string;
  positioning?: string;
  connections?: string;
  strategicFrame?: string;
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
  /** Confirmable product actions proposed by Ziki */
  actions?: {
    type: string;
    label: string;
    city?: string;
    title?: string;
    id?: string;
  }[];
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

/** Catalogue */
export type ReleaseType =
  | "single"
  | "ep"
  | "album"
  | "mixtape"
  | "live"
  | "other";
export type ReleaseStatus =
  | "idea"
  | "draft"
  | "scheduled"
  | "released"
  | "archived";

export interface CatalogueRelease {
  id: string;
  userId: string;
  rosterArtistId?: string | null;
  title: string;
  releaseType: ReleaseType;
  status: ReleaseStatus;
  releaseDate?: string | null;
  primaryGenre?: string | null;
  coverUrl?: string | null;
  spotifyUrl?: string | null;
  appleUrl?: string | null;
  youtubeUrl?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface CatalogueTrack {
  id: string;
  userId: string;
  releaseId?: string | null;
  title: string;
  trackNumber?: number | null;
  isrc?: string | null;
  durationSec?: number | null;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  audioPath?: string | null;
  analysis?: {
    bpm?: number | null;
    bpmConfidence?: number;
    peakDb?: number;
    rmsDb?: number;
    energy?: string;
    durationSec?: number;
    analyzedAt?: number;
  } | null;
  notes?: string | null;
  createdAt?: string;
}

export type AuditSourceType = "spotify" | "youtube" | "unknown";

export interface AuditFinding {
  id: string;
  severity: "critical" | "watch" | "strength";
  title: string;
  detail: string;
}

export interface AuditPayload {
  sourceUrl: string;
  sourceType: AuditSourceType;
  artistName: string;
  thumbnail?: string;
  overall: number;
  reach: number;
  revenue: number;
  momentum: number;
  findings: AuditFinding[];
  nextMove: string;
  disclaimer: string;
  signals: Record<string, string | number | boolean | null>;
}
