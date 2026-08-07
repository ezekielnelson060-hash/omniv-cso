import { NextResponse } from "next/server";
import { runPublicAudit, makeShareSlug } from "@/lib/audit/engine";
import { createClient } from "@supabase/supabase-js";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { url?: string };
    const url = body.url?.trim();
    if (!url || url.length < 8) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    const payload = await runPublicAudit(url);
    const shareSlug = makeShareSlug(payload.artistName);

    const sb = admin();
    if (sb) {
      const { data, error } = await sb
        .from("public_audits")
        .insert({
          share_slug: shareSlug,
          source_url: payload.sourceUrl,
          source_type: payload.sourceType,
          artist_name: payload.artistName,
          headline: `${payload.artistName} · relevance ${payload.overall}`,
          overall_score: payload.overall,
          payload,
        })
        .select("id, share_slug")
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({
          id: data.id,
          slug: data.share_slug,
          payload,
        });
      }
      console.error("public_audits insert", error?.message);
    }

    return NextResponse.json({
      id: null,
      slug: shareSlug,
      payload,
      ephemeral: true,
    });
  } catch (e) {
    console.error("audit", e);
    return NextResponse.json({ error: "audit failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  const sb = admin();
  if (!sb) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  const { data, error } = await sb
    .from("public_audits")
    .select("id, share_slug, artist_name, overall_score, payload, created_at")
    .eq("share_slug", slug)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
