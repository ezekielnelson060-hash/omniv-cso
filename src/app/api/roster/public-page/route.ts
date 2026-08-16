import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { mergePublicPage, type ArtistPublicPage } from "@/lib/artist-public-page";

/** GET/PATCH public_page for an artist the user owns */
export async function GET(req: Request) {
  const artistId = new URL(req.url).searchParams.get("artistId");
  if (!artistId) {
    return NextResponse.json({ error: "artistId required" }, { status: 400 });
  }
  const ctx = await authAdmin();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { admin, userId } = ctx;

  const ok = await assertAccess(admin, userId, artistId);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await admin
    .from("roster_artists")
    .select("id, stage_name, slug, public_page")
    .eq("id", artistId)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    artistId: data.id,
    stageName: data.stage_name,
    slug: data.slug,
    page: mergePublicPage(data.public_page),
  });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    artistId?: string;
    page?: ArtistPublicPage;
  };
  if (!body.artistId || !body.page) {
    return NextResponse.json({ error: "artistId and page required" }, { status: 400 });
  }
  const ctx = await authAdmin();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { admin, userId } = ctx;

  const ok = await assertAccess(admin, userId, body.artistId);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const page = mergePublicPage(body.page);
  const { data, error } = await admin
    .from("roster_artists")
    .update({ public_page: page })
    .eq("id", body.artistId)
    .select("id, slug, public_page")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: error.message.includes("public_page")
          ? "Run migration 024_artist_public_page.sql in Supabase"
          : error.message,
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, page: mergePublicPage(data.public_page), slug: data.slug });
}

async function authAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return null;
  const cookieStore = await cookies();
  const userClient = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return null;
  const admin = createClient(url, service, { auth: { persistSession: false } });
  return { admin, userId: user.id };
}

async function assertAccess(
  admin: ReturnType<typeof createClient>,
  userId: string,
  artistId: string
) {
  const { data: artist } = await admin
    .from("roster_artists")
    .select("id, org_id")
    .eq("id", artistId)
    .maybeSingle();
  if (!artist) return false;
  const { data: org } = await admin
    .from("orgs")
    .select("owner_user_id")
    .eq("id", artist.org_id)
    .maybeSingle();
  if (org?.owner_user_id === userId) return true;
  const { data: member } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", artist.org_id)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(member);
}
