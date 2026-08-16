import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mergePublicPage } from "@/lib/artist-public-page";

/** Public roster lookup by slug (artist page, tip, fan gate). */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("slug")?.trim() || "";
  const slug = raw.toLowerCase();
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

  type Row = {
    stage_name?: string | null;
    slug?: string | null;
    gate_tagline?: string | null;
    tip_tagline?: string | null;
    owner_user_id?: string | null;
    image_url?: string | null;
    public_page?: unknown;
    org_id?: string | null;
  };

  async function lookup(selectCols: string): Promise<Row | null> {
    // exact
    let q = await admin
      .from("roster_artists")
      .select(selectCols)
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (!q.error && q.data) return q.data as unknown as Row;

    // case-insensitive
    q = await admin
      .from("roster_artists")
      .select(selectCols)
      .ilike("slug", slug)
      .limit(1)
      .maybeSingle();
    if (!q.error && q.data) return q.data as unknown as Row;

    // prefix (handles truncated URLs like /f/zil)
    if (slug.length >= 3) {
      const list = await admin
        .from("roster_artists")
        .select(selectCols)
        .ilike("slug", `${slug}%`)
        .limit(5);
      if (!list.error && list.data && list.data.length === 1) {
        return list.data[0] as unknown as Row;
      }
      // if multiple, prefer longest match starting with slug
      if (!list.error && list.data && list.data.length > 1) {
        const sorted = [...list.data].sort(
          (a, b) =>
            String((b as Row).slug || "").length -
            String((a as Row).slug || "").length
        );
        return sorted[0] as unknown as Row;
      }
    }
    return null;
  }

  // Prefer full columns; fall back if public_page column missing
  let data = await lookup(
    "stage_name, slug, gate_tagline, tip_tagline, owner_user_id, image_url, public_page, org_id"
  );
  if (!data) {
    data = await lookup(
      "stage_name, slug, gate_tagline, tip_tagline, owner_user_id, image_url, org_id"
    );
  }
  if (!data) {
    data = await lookup("stage_name, slug, owner_user_id, org_id");
  }

  if (!data) {
    return NextResponse.json(
      { error: "not found", slug },
      { status: 404 }
    );
  }

  let avatarUrl: string | null =
    (data.image_url && String(data.image_url).trim()) || null;

  if (!avatarUrl && data.owner_user_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("avatar_url")
      .eq("id", data.owner_user_id)
      .maybeSingle();
    if (profile?.avatar_url) avatarUrl = String(profile.avatar_url);
  }

  if (!avatarUrl && data.org_id) {
    const { data: org } = await admin
      .from("orgs")
      .select("owner_user_id")
      .eq("id", data.org_id)
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

  const page = mergePublicPage(data.public_page);
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
