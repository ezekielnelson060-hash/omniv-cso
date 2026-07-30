import type { ArtistBrain, UserRole } from "@/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole | null;
  platforms: string[] | null;
  social_links?: Record<string, string> | null;
  onboarding_complete: boolean | null;
  last_scan_at?: string | null;
  last_scan_briefing?: string | null;
};

function emptyBrain(name = "Artist"): ArtistBrain {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name,
    stageName: name,
    genre: [],
    subGenre: [],
    musicStyle: "",
    brandVoice: "",
    visualIdentity: "",
    targetAudience: "",
    careerStage: "emerging",
    strengths: [],
    weaknesses: [],
    goals: [],
    pastReleases: [],
    contentStyle: "",
    competitors: [],
    notes: "",
    lastUpdated: today,
  };
}

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
    careerStage: (row.career_stage as ArtistBrain["careerStage"]) || "emerging",
    strengths: (row.strengths as string[]) || [],
    weaknesses: (row.weaknesses as string[]) || [],
    goals: (row.goals as string[]) || [],
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
}): ArtistBrain {
  const today = new Date().toISOString().slice(0, 10);
  const name = opts.fullName.trim() || "Artist";
  const linkList = Object.entries(opts.social_links || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
  return {
    name,
    stageName: name,
    genre: ["TBD"],
    subGenre: [],
    musicStyle:
      "To be refined by Ziki after first content + catalogue signals are connected.",
    brandVoice: "Authentic, intentional, growth-focused.",
    visualIdentity:
      "Define with cover art and content system during first 14 days.",
    targetAudience: "To be inferred from platform signals after connect.",
    careerStage: "emerging",
    strengths: ["Early strategy OS adoption", "Clear intent to systematise"],
    weaknesses: [
      "Catalogue signals incomplete until platforms sync",
      "Release readiness unknown",
    ],
    goals: [
      "Complete platform connections",
      "Ship one high-leverage content experiment this week",
      "Clarify next release window",
    ],
    pastReleases: [],
    contentStyle: `Primary surfaces: ${opts.platforms.join(", ") || "not set"}.`,
    competitors: [],
    notes: `Role: ${opts.role}. Social links: ${linkList || "none yet"}. Seeded at onboarding.`,
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
  if (error) {
    console.error("getProfile", error);
    return null;
  }
  return data as Profile | null;
}

export async function upsertProfile(patch: {
  full_name?: string;
  role?: UserRole;
  platforms?: string[];
  social_links?: Record<string, string>;
  onboarding_complete?: boolean;
  last_scan_at?: string;
  last_scan_briefing?: string;
}): Promise<{ ok: boolean; error?: string }> {
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

  if (error) {
    console.error("getArtistBrain", error);
    return null;
  }
  if (!data) return null;
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
}): Promise<{ ok: boolean; error?: string }> {
  const profile = await upsertProfile({
    full_name: opts.fullName,
    role: opts.role,
    platforms: opts.platforms,
    social_links: opts.social_links || {},
    onboarding_complete: true,
  });
  if (!profile.ok) return profile;

  const brain = seedBrainFromOnboarding(opts);
  return saveArtistBrain(brain);
}

export { emptyBrain };
