import type { ArtistBrain, CareerStage, UserRole } from "@/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url?: string | null;
  role: UserRole | null;
  platforms: string[] | null;
  social_links?: Record<string, string> | null;
  interests?: string[] | null;
  onboarding_complete: boolean | null;
  last_scan_at?: string | null;
  last_scan_briefing?: string | null;
};

function rowToBrain(row: Record<string, unknown>): ArtistBrain {
  return {
    name: (row.name as string) || "",
    stageName: (row.stage_name as string) || undefined,
    genre: (row.genre as string[]) || [],
    subGenre: (row.sub_genre as string[]) || [],
    musicStyle: (row.music_style as string) || "",
    brandVoice: (row.brand_voice as string) || "",
    visualIdentity: (row.visual_identity as string) || "",
    targetAudience: (row.target_audience as string) || "",
    careerStage: (row.career_stage as CareerStage) || "emerging",
    strengths: (row.strengths as string[]) || [],
    weaknesses: (row.weaknesses as string[]) || [],
    goals: (row.goals as string[]) || [],
    bigDream: (row.big_dream as string) || undefined,
    pastReleases: (row.past_releases as ArtistBrain["pastReleases"]) || [],
    contentStyle: (row.content_style as string) || "",
    competitors: (row.competitors as string[]) || [],
    notes: (row.notes as string) || "",
    lastUpdated:
      (row.last_updated as string) || new Date().toISOString().slice(0, 10),
  };
}

function brainToRow(brain: ArtistBrain, userId: string) {
  return {
    user_id: userId,
    name: brain.name,
    stage_name: brain.stageName ?? null,
    genre: brain.genre,
    sub_genre: brain.subGenre,
    music_style: brain.musicStyle,
    brand_voice: brain.brandVoice,
    visual_identity: brain.visualIdentity,
    target_audience: brain.targetAudience,
    career_stage: brain.careerStage,
    strengths: brain.strengths,
    weaknesses: brain.weaknesses,
    goals: brain.goals,
    big_dream: brain.bigDream ?? null,
    past_releases: brain.pastReleases,
    content_style: brain.contentStyle,
    competitors: brain.competitors,
    notes: brain.notes,
    last_updated: brain.lastUpdated,
    updated_at: new Date().toISOString(),
  };
}

export function seedBrainFromOnboarding(opts: {
  fullName: string;
  role: UserRole;
  platforms: string[];
  social_links?: Record<string, string>;
  genre?: string[];
  musicStyle?: string;
  brandVoice?: string;
  careerStage?: CareerStage;
  goals?: string[];
  bigDream?: string;
  interests?: string[];
}): ArtistBrain {
  const today = new Date().toISOString().slice(0, 10);
  const name = opts.fullName.trim() || "Artist";
  const linkList = Object.entries(opts.social_links || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
  const interests = opts.interests || [];

  return {
    name,
    stageName: name,
    genre: opts.genre?.length ? opts.genre : ["TBD"],
    subGenre: [],
    musicStyle:
      opts.musicStyle ||
      "To be refined after first content + catalogue signals.",
    brandVoice: opts.brandVoice || "Authentic, intentional, growth-focused.",
    visualIdentity:
      "Define with cover art and content system during first 14 days.",
    targetAudience: "To be refined from platform analytics after connect.",
    careerStage: opts.careerStage || "emerging",
    strengths: [
      "Clear self-definition from onboarding",
      "Intent to run strategy as a system",
    ],
    weaknesses: [
      "Live platform metrics not yet connected",
      "Release readiness still being validated",
    ],
    goals:
      opts.goals && opts.goals.length > 0
        ? opts.goals
        : ["Clarify next release window", "Grow engaged audience"],
    bigDream:
      opts.bigDream?.trim() ||
      (opts.goals && opts.goals[0]) ||
      "Build a career where every release compounds audience and income.",
    pastReleases: [],
    contentStyle: `Surfaces: ${opts.platforms.join(", ") || "not set"}. Focus: ${interests.join(", ") || "general"}.`,
    competitors: [],
    notes: `Role: ${opts.role}. Interests: ${interests.join(", ") || "none"}. Links: ${linkList || "none"}.`,
    lastUpdated: today,
  };
}

export async function getProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export async function upsertProfile(
  patch: Partial<{
    full_name: string;
    role: UserRole;
    platforms: string[];
    social_links: Record<string, string>;
    interests: string[];
    onboarding_complete: boolean;
    avatar_url: string | null;
  }>
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured())
    return { ok: false, error: "Supabase not configured" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      ...patch,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getArtistBrain(): Promise<ArtistBrain | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("artist_brains")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToBrain(data as Record<string, unknown>);
}

export async function saveArtistBrain(
  brain: ArtistBrain
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured())
    return { ok: false, error: "Supabase not configured" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("artist_brains")
    .upsert(brainToRow(brain, user.id), { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function completeOnboarding(opts: {
  fullName: string;
  role: UserRole;
  platforms: string[];
  social_links?: Record<string, string>;
  genre?: string[];
  musicStyle?: string;
  brandVoice?: string;
  careerStage?: CareerStage;
  goals?: string[];
  bigDream?: string;
  interests?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const profile = await upsertProfile({
    full_name: opts.fullName,
    role: opts.role,
    platforms: opts.platforms,
    social_links: opts.social_links || {},
    interests: opts.interests || [],
    onboarding_complete: true,
  });
  if (!profile.ok) return profile;

  const brain = seedBrainFromOnboarding(opts);
  return saveArtistBrain(brain);
}
