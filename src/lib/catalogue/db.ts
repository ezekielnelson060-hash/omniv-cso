"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CatalogueRelease, ReleaseStatus, ReleaseType } from "@/types";
import {
  addRelease as localAdd,
  loadReleases as localLoad,
  removeRelease as localRemove,
  saveReleases as localSave,
} from "@/lib/catalogue/store";

function mapRow(r: Record<string, unknown>): CatalogueRelease {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    rosterArtistId: (r.roster_artist_id as string) || null,
    title: String(r.title),
    releaseType: (r.release_type as ReleaseType) || "single",
    status: (r.status as ReleaseStatus) || "draft",
    releaseDate: (r.release_date as string) || null,
    primaryGenre: (r.primary_genre as string) || null,
    coverUrl: (r.cover_url as string) || null,
    spotifyUrl: (r.spotify_url as string) || null,
    appleUrl: (r.apple_url as string) || null,
    youtubeUrl: (r.youtube_url as string) || null,
    notes: (r.notes as string) || null,
    createdAt: (r.created_at as string) || undefined,
  };
}

export async function listCatalogueReleases(): Promise<CatalogueRelease[]> {
  if (!isSupabaseConfigured()) return localLoad();
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return localLoad();
    const { data, error } = await supabase
      .from("catalogue_releases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("catalogue list", error.message);
      return localLoad();
    }
    return (data || []).map((r) => mapRow(r as Record<string, unknown>));
  } catch {
    return localLoad();
  }
}

export async function createCatalogueRelease(input: {
  title: string;
  releaseType: ReleaseType;
  status: ReleaseStatus;
  releaseDate?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  primaryGenre?: string;
}): Promise<CatalogueRelease> {
  if (!isSupabaseConfigured()) return localAdd(input);
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return localAdd(input);

    const { data, error } = await supabase
      .from("catalogue_releases")
      .insert({
        user_id: user.id,
        title: input.title.trim(),
        release_type: input.releaseType,
        status: input.status,
        release_date: input.releaseDate || null,
        spotify_url: input.spotifyUrl || null,
        youtube_url: input.youtubeUrl || null,
        primary_genre: input.primaryGenre || null,
      })
      .select("*")
      .maybeSingle();

    if (error || !data) {
      console.warn("catalogue insert", error?.message);
      return localAdd(input);
    }
    return mapRow(data as Record<string, unknown>);
  } catch {
    return localAdd(input);
  }
}

export async function deleteCatalogueRelease(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localRemove(id);
    return;
  }
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      localRemove(id);
      return;
    }
    const { error } = await supabase
      .from("catalogue_releases")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      console.warn("catalogue delete", error.message);
      localRemove(id);
    }
  } catch {
    localRemove(id);
  }
}

export async function syncLocalCatalogueToCloud(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const local = localLoad();
  if (local.length === 0) return;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    for (const r of local) {
      if (r.userId !== "local") continue;
      await supabase.from("catalogue_releases").insert({
        user_id: user.id,
        title: r.title,
        release_type: r.releaseType,
        status: r.status,
        release_date: r.releaseDate,
        spotify_url: r.spotifyUrl,
        youtube_url: r.youtubeUrl,
        primary_genre: r.primaryGenre,
      });
    }
    localSave([]);
  } catch {
    /* ignore */
  }
}
