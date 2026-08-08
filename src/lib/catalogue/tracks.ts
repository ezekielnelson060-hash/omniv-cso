/** Catalogue tracks — local first, cloud when Supabase is available */

import type { CatalogueTrack } from "@/types";
import type { AudioPassport } from "@/lib/audio-passport";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const KEY = "omniv_catalogue_tracks_v1";

function uid() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadTracksLocal(): CatalogueTrack[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as CatalogueTrack[];
  } catch {
    return [];
  }
}

function saveLocal(list: CatalogueTrack[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 80)));
}

export function passportToAnalysis(p: AudioPassport) {
  return {
    bpm: p.bpm,
    bpmConfidence: p.bpmConfidence,
    peakDb: p.peakDb,
    rmsDb: p.rmsDb,
    energy: p.energy,
    durationSec: p.durationSec,
    analyzedAt: p.analyzedAt,
  };
}

export async function listCatalogueTracks(): Promise<CatalogueTrack[]> {
  const local = loadTracksLocal();
  if (!isSupabaseConfigured()) return local;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return local;
    const { data, error } = await supabase
      .from("catalogue_tracks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error || !data?.length) return local;
    return data.map((r) => {
      let analysis = null;
      if (r.notes && String(r.notes).startsWith("{")) {
        try {
          analysis = JSON.parse(String(r.notes)).analysis;
        } catch {
          analysis = null;
        }
      }
      return {
        id: String(r.id),
        userId: String(r.user_id),
        releaseId: r.release_id || null,
        title: String(r.title),
        trackNumber: r.track_number,
        durationSec: r.duration_sec,
        spotifyUrl: r.spotify_url,
        youtubeUrl: r.youtube_url,
        audioPath: r.audio_path,
        analysis,
        notes: r.notes,
        createdAt: r.created_at,
      };
    });
  } catch {
    return local;
  }
}

export async function addCatalogueTrack(input: {
  title: string;
  releaseId?: string | null;
  durationSec?: number | null;
  analysis?: CatalogueTrack["analysis"];
  audioPath?: string | null;
  notes?: string | null;
}): Promise<CatalogueTrack> {
  const row: CatalogueTrack = {
    id: uid(),
    userId: "local",
    releaseId: input.releaseId || null,
    title: input.title.trim().slice(0, 160),
    durationSec: input.durationSec ?? input.analysis?.durationSec ?? null,
    analysis: input.analysis || null,
    audioPath: input.audioPath || null,
    notes: input.notes || null,
    createdAt: new Date().toISOString(),
  };
  saveLocal([row, ...loadTracksLocal()]);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const payload = {
          user_id: user.id,
          release_id: input.releaseId || null,
          title: row.title,
          duration_sec: row.durationSec,
          audio_path: input.audioPath || null,
          notes: JSON.stringify({
            analysis: input.analysis || null,
            source: "omniv_upload",
          }),
        };
        const { data } = await supabase
          .from("catalogue_tracks")
          .insert(payload)
          .select("id")
          .maybeSingle();
        if (data?.id) {
          row.id = String(data.id);
          row.userId = user.id;
          const list = loadTracksLocal().filter((t) => t.id !== row.id);
          saveLocal([row, ...list].slice(0, 80));
        }
      }
    } catch {
      /* local kept */
    }
  }
  return row;
}

export function catalogueTracksForZiki(tracks: CatalogueTrack[]): string {
  if (!tracks.length) return "Catalogue tracks: none uploaded yet.";
  return (
    "Catalogue tracks (use for release/content advice):\n" +
    tracks
      .slice(0, 12)
      .map((t) => {
        const a = t.analysis;
        const bits = [
          t.title,
          a?.bpm ? `~${a.bpm} BPM` : null,
          a?.energy ? `energy ${a.energy}` : null,
          t.durationSec ? `${Math.round(t.durationSec)}s` : null,
        ].filter(Boolean);
        return `- ${bits.join(" · ")}`;
      })
      .join("\n")
  );
}
