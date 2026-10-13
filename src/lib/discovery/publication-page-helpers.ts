/**
 * Publication page helpers — pure functions (no JSX).
 */
import { createClient } from "@/lib/supabase/server";
import {
  getDiscoveryEntity,
  getEntityByIdLive,
  type LivePublication,
  type LiveEntity,
} from "@/lib/discovery/db";

export function readMinutes(text: string) {
  const plain = text.replace(/<[^>]+>/g, " ");
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function parseMeta(meta: string | undefined | null): Record<string, string> {
  if (!meta) return {};
  try {
    const o = JSON.parse(meta);
    if (o && typeof o === "object") {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(o)) {
        if (v != null && String(v).trim()) out[k] = String(v).trim();
      }
      return out;
    }
  } catch {
    /* plain meta string */
  }
  return {};
}

export function isAudioUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes(".mp3") ||
    u.includes(".wav") ||
    u.includes(".m4a") ||
    u.includes(".aac") ||
    u.includes(".ogg") ||
    u.includes(".opus") ||
    u.includes("discovery-media")
  );
}

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes(".mp4") ||
    u.includes(".webm") ||
    u.includes(".mov") ||
    u.includes("youtube.com") ||
    u.includes("youtu.be") ||
    u.includes("vimeo.com")
  );
}

export function youtubeEmbed(url: string): string | null {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    const u = new URL(url);
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export async function resolvePublisher(
  supabase: Awaited<ReturnType<typeof createClient>> | null,
  p: LivePublication
): Promise<LiveEntity | null> {
  try {
    if (p.publisherId) {
      const byId = await getEntityByIdLive(supabase, p.publisherId);
      if (byId) return byId;
    }
    const name = (p.publisherName || "").toLowerCase().trim();
    if (name.includes("omniv") || !p.publisherId) {
      for (const slug of ["omniv-editorial", "omniv", "omniv-media"]) {
        const e = await getDiscoveryEntity(supabase, "company", slug);
        if (e) return e;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export const HERO: Record<string, string> = {
  article: "from-sky-800 via-slate-900 to-[#050505]",
  music: "from-fuchsia-800 via-purple-950 to-[#050505]",
  video: "from-rose-800 via-red-950 to-[#050505]",
  research: "from-emerald-800 via-teal-950 to-[#050505]",
  product: "from-amber-700 via-orange-950 to-[#050505]",
  event: "from-violet-800 via-indigo-950 to-[#050505]",
  announcement: "from-zinc-700 via-zinc-900 to-[#050505]",
  opportunity: "from-yellow-700 via-yellow-950 to-[#050505]",
  file: "from-cyan-800 via-slate-900 to-[#050505]",
};
