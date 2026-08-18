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
    id?: string;
    stage_name?: string | null;
    slug?: string | null;
    gate_tagline?: string | null;
    tip_tagline?: string | null;
    owner_user_id?: string | null;
    image_url?: string | null;
    public_page?: unknown;
    org_id?: string | null;
  };

  // 1) Find row by slug (minimal columns — always works)
  let found: Row | null = null;

  {
    const { data, error } = await admin
      .from("roster_artists")
      .select(
        "id, stage_name, slug, gate_tagline, tip_tagline, owner_user_id, image_url, org_id"
      )
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (!error && data) found = data as Row;
  }

  if (!found) {
    const { data, error } = await admin
      .from("roster_artists")
      .select(
        "id, stage_name, slug, gate_tagline, tip_tagline, owner_user_id, image_url, org_id"
      )
      .ilike("slug", slug)
      .limit(1)
      .maybeSingle();
    if (!error && data) found = data as Row;
  }

  if (!found && slug.length >= 3) {
    const { data, error } = await admin
      .from("roster_artists")
      .select(
        "id, stage_name, slug, gate_tagline, tip_tagline, owner_user_id, image_url, org_id"
      )
      .ilike("slug", `${slug}%`)
      .limit(5);
    if (!error && data && data.length) {
      const rows = data as Row[];
      // Prefer exact-ish longest slug (e.g. ziki-worldwide-t1ax over ziki-worldwide)
      rows.sort(
        (a, b) => String(b.slug || "").length - String(a.slug || "").length
      );
      found = rows[0];
    }
  }

  if (!found) {
    return NextResponse.json({ error: "not found", slug }, { status: 404 });
  }

  // 2) Load public_page separately so a missing column never wipes the row
  let publicPageRaw: unknown = null;
  if (found.id) {
    const { data: pageRow, error: pageErr } = await admin
      .from("roster_artists")
      .select("public_page")
      .eq("id", found.id)
      .maybeSingle();
    if (!pageErr && pageRow) {
      publicPageRaw = (pageRow as { public_page?: unknown }).public_page;
    }
  }

  let avatarUrl: string | null =
    (found.image_url && String(found.image_url).trim()) || null;

  if (!avatarUrl && found.owner_user_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("avatar_url")
      .eq("id", found.owner_user_id)
      .maybeSingle();
    if (profile?.avatar_url) avatarUrl = String(profile.avatar_url);
  }

  if (!avatarUrl && found.org_id) {
    const { data: org } = await admin
      .from("orgs")
      .select("owner_user_id")
      .eq("id", found.org_id)
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

  const page = mergePublicPage(publicPageRaw);
  if (!page.messageTop?.trim() && found.gate_tagline) {
    page.messageTop = String(found.gate_tagline);
  }
  if (!page.messageBottom?.trim() && found.tip_tagline) {
    page.messageBottom = String(found.tip_tagline);
  }

  return NextResponse.json(
    {
      stageName: cleanStageName(String(found.stage_name || "")),
      slug: found.slug,
      gateTagline: found.gate_tagline || null,
      tipTagline: found.tip_tagline || null,
      avatarUrl,
      page,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
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
