import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Public roster lookup by slug (tip page, fan gate). Audience-facing only. */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });

  let data: {
    stage_name?: string | null;
    slug?: string | null;
    gate_tagline?: string | null;
    tip_tagline?: string | null;
  } | null = null;

  const full = await admin
    .from("roster_artists")
    .select("stage_name, slug, gate_tagline, tip_tagline")
    .eq("slug", slug)
    .maybeSingle();

  if (full.error && /gate_tagline|tip_tagline|column/i.test(full.error.message)) {
    const basic = await admin
      .from("roster_artists")
      .select("stage_name, slug")
      .eq("slug", slug)
      .maybeSingle();
    data = basic.data;
  } else {
    data = full.data;
  }

  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    stageName: cleanStageName(String(data.stage_name || "")),
    slug: data.slug,
    gateTagline: data.gate_tagline || null,
    tipTagline: data.tip_tagline || null,
  });
}

/** Drop accidental slug suffixes that leaked into display names (e.g. "T1ax"). */
function cleanStageName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "Artist";
  return trimmed
    .replace(/\s+[a-z0-9]{3,5}$/i, (m) => {
      const token = m.trim();
      if (/^[a-z]*\d[a-z0-9]*$/i.test(token) || /^\d+[a-z]+$/i.test(token)) {
        return "";
      }
      return m;
    })
    .trim() || trimmed;
}
