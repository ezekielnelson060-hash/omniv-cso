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
    id: string;
    stage_name?: string | null;
    slug?: string | null;
    owner_user_id?: string | null;
    org_id?: string | null;
  };

  async function findBySlug(): Promise<Row | null> {
    // Minimal columns only — never 404 because of optional columns
    const cols = "id, stage_name, slug, owner_user_id, org_id";

    const exact = await admin
      .from("roster_artists")
      .select(cols)
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (!exact.error && exact.data) return exact.data as unknown as Row;

    const ilike = await admin
      .from("roster_artists")
      .select(cols)
      .ilike("slug", slug)
      .limit(1)
      .maybeSingle();
    if (!ilike.error && ilike.data) return ilike.data as unknown as Row;

    if (slug.length >= 3) {
      const prefix = await admin
        .from("roster_artists")
        .select(cols)
        .ilike("slug", `${slug}%`)
        .limit(8);
      if (!prefix.error && prefix.data?.length) {
        const rows = prefix.data as unknown as Row[];
        rows.sort(
          (a, b) => String(b.slug || "").length - String(a.slug || "").length
        );
        return rows[0];
      }
    }
    return null;
  }

  const found = await findBySlug();
  if (!found?.id) {
    return NextResponse.json({ error: "not found", slug }, { status: 404 });
  }

  // Optional fields — each query isolated so one missing column never breaks the page
  let publicPageRaw: unknown = null;
  let gateTagline: string | null = null;
  let tipTagline: string | null = null;
  let imageUrl: string | null = null;

  try {
    const { data } = await admin
      .from("roster_artists")
      .select("public_page")
      .eq("id", found.id)
      .maybeSingle();
    if (data) publicPageRaw = (data as { public_page?: unknown }).public_page;
  } catch {
    /* column may not exist */
  }

  try {
    const { data } = await admin
      .from("roster_artists")
      .select("gate_tagline, tip_tagline, image_url")
      .eq("id", found.id)
      .maybeSingle();
    if (data) {
      const row = data as {
        gate_tagline?: string | null;
        tip_tagline?: string | null;
        image_url?: string | null;
      };
      gateTagline = row.gate_tagline ?? null;
      tipTagline = row.tip_tagline ?? null;
      imageUrl = row.image_url ?? null;
    }
  } catch {
    /* optional */
  }

  let avatarUrl: string | null =
    (imageUrl && String(imageUrl).trim()) || null;

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
  if (!page.messageTop?.trim() && gateTagline) {
    page.messageTop = String(gateTagline);
  }
  if (!page.messageBottom?.trim() && tipTagline) {
    page.messageBottom = String(tipTagline);
  }

  return NextResponse.json(
    {
      stageName: cleanStageName(String(found.stage_name || "")),
      slug: found.slug,
      gateTagline,
      tipTagline,
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
