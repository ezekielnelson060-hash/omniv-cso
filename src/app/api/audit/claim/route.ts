import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdmin(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { slug?: string };
    const slug = body.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "auth required" }, { status: 401 });
    }

    const sb = admin() || supabase;
    const { data: audit } = await sb
      .from("public_audits")
      .select("payload, artist_name, source_url, source_type")
      .eq("share_slug", slug)
      .maybeSingle();

    if (!audit) {
      return NextResponse.json({ error: "audit not found" }, { status: 404 });
    }

    const payload = (audit.payload || {}) as {
      artistName?: string;
      sourceUrl?: string;
      signals?: { genres?: string | null };
    };

    const name =
      payload.artistName || (audit.artist_name as string) || "Artist";
    const genresRaw = payload.signals?.genres;
    const genres = genresRaw
      ? String(genresRaw)
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

    const brainPatch: Record<string, unknown> = {
      user_id: user.id,
      name,
      last_updated: new Date().toISOString().slice(0, 10),
    };
    if (genres.length) brainPatch.genre = genres;

    const { data: existing } = await supabase
      .from("artist_brains")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("artist_brains")
        .update(brainPatch)
        .eq("user_id", user.id);
    } else {
      await supabase.from("artist_brains").insert({
        ...brainPatch,
        music_style: "",
        brand_voice: "",
        career_stage: "emerging",
        goals: ["Grow from public audit baseline"],
      });
    }

    const sourceUrl = (audit.source_url as string) || payload.sourceUrl;
    if (sourceUrl) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("social_links")
        .eq("id", user.id)
        .maybeSingle();
      const links = {
        ...((prof?.social_links as Record<string, string>) || {}),
      };
      if (audit.source_type === "youtube") links.youtube = sourceUrl;
      else links.spotify = sourceUrl;
      await supabase
        .from("profiles")
        .update({ full_name: name, social_links: links })
        .eq("id", user.id);
    }

    return NextResponse.json({ ok: true, name, genres });
  } catch (e) {
    console.error("claim audit", e);
    return NextResponse.json({ error: "claim failed" }, { status: 500 });
  }
}
