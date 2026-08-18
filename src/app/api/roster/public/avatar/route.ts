import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Separate avatar payload so the main public JSON stays small/fast.
 * Allows http(s) URLs and data-URIs (profile photos stored inline).
 */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug")?.trim().toLowerCase();
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

  const { data: artist } = await admin
    .from("roster_artists")
    .select("id, owner_user_id, org_id, image_url")
    .eq("slug", slug)
    .maybeSingle();

  let row = artist as {
    id?: string;
    owner_user_id?: string | null;
    org_id?: string | null;
    image_url?: string | null;
  } | null;

  if (!row) {
    const { data: list } = await admin
      .from("roster_artists")
      .select("id, owner_user_id, org_id, image_url, slug")
      .ilike("slug", `${slug}%`)
      .limit(5);
    if (list?.length) {
      const sorted = [...list].sort(
        (a, b) =>
          String((b as { slug?: string }).slug || "").length -
          String((a as { slug?: string }).slug || "").length
      );
      row = sorted[0] as typeof row;
    }
  }

  if (!row) {
    return NextResponse.json({ avatarUrl: null }, { status: 200 });
  }

  let avatarUrl = row.image_url?.trim() || null;

  if (!avatarUrl && row.owner_user_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("avatar_url")
      .eq("id", row.owner_user_id)
      .maybeSingle();
    avatarUrl = profile?.avatar_url?.trim() || null;
  }

  if (!avatarUrl && row.org_id) {
    const { data: org } = await admin
      .from("orgs")
      .select("owner_user_id")
      .eq("id", row.org_id)
      .maybeSingle();
    if (org?.owner_user_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("avatar_url")
        .eq("id", org.owner_user_id)
        .maybeSingle();
      avatarUrl = profile?.avatar_url?.trim() || null;
    }
  }

  return NextResponse.json(
    { avatarUrl },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    }
  );
}
