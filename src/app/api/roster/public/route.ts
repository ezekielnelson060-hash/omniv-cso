import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Public roster lookup by slug (tip page, fan gate). */
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
  const { data } = await admin
    .from("roster_artists")
    .select("stage_name, slug, user_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    stageName: data.stage_name,
    slug: data.slug,
  });
}
