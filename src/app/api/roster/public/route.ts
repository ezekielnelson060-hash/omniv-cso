import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mergePublicPage } from "@/lib/artist-public-page";

/** Public roster lookup by slug (artist page, tip, fan gate). */
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
    owner_user_id?: string | null;
    image_url?: string | null;
    public_page?: unknown;
  } | null = null;

  const full = await admin
    .from("roster_artists")
    .select(
      "stage_name, slug, gate_tagline, tip_tagline, owner_user_id, image_url, public_page"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (full.error) {
    const basic = await admin
      .from("roster_artists")
      .select("stage_name, slug, owner_user_id, gate_tagline, tip_tagline, image_url")
      .eq("slug", slug)
      .maybeSingle();
    data = basic.data as typeof data;
  } else {
    data = full.data;
  }

  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let avatarUrl: string | null =
    (data.image_url && String(data.image_url).trim()) || null;

  if (!avatarUrl && data.owner_user_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("avatar_url")
      .eq("id", data.owner_user_id)
      .maybeSingle();
    if (profile?.avatar_url) {
      avatarUrl = String(profile.avatar_url);
    }
  }

  if (!avatarUrl) {
    const withOrg = await admin
      .from("roster_artists")
      .select("org_id")
      .eq("slug", slug)
      .maybeSingle();
    const orgId = withOrg.data?.org_id as string | undefined;
    if (orgId) {
      const { data: org } = await admin
        .from("orgs")
        .select("owner_user_id")
        .eq("id", orgId)
        .maybeSingle();
      if (org?.owner_user_id) {
        const { data: profile } = await admin
          .from("profiles")
          .select("avatar_url")
          .eq("id", org.owner_user_id)
          .maybeSingle();
        if (profile?.avatar_url) avatarUrl = String(profile.avatar_url);
      }
    }
  }

  const page = mergePublicPage(data.public_page);
  // Fall back taglines into page messages if empty
  if (!page.messageTop?.trim() && data.gate_tagline) {
    page.messageTop = String(data.gate_tagline);
  }
  if (!page.messageBottom?.trim() && data.tip_tagline) {
    page.messageBottom = String(data.tip_tagline);
  }

  return NextResponse.json({
    stageName: cleanStageName(String(data.stage_name || "")),
    slug: data.slug,
    gateTagline: data.gate_tagline || null,
    tipTagline: data.tip_tagline || null,
    avatarUrl,
    page,
  });
}

function cleanStageName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "Artist";
  return (
    trimmed
      .replace(/\s+[a-z0-9]{3,5}$/i, (m) => {
        const token = m.trim();
        if (/^[a-z]*\d[a-z0-9]*$/i.test(token) || /^\d+[a-z]+$/i.test(token)) {
          return "";
        }
        return m;
      })
      .trim() || trimmed
  );
}
