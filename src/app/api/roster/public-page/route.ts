import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { mergePublicPage, type ArtistPublicPage } from "@/lib/artist-public-page";

async function getUserAndAdmin() {
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
  return { user, admin };
}

/** Solo artists use owner_user_id (same as /api/roster). Labels may use org. */
async function canEditArtist(
  admin: ReturnType<typeof createClient>,
  userId: string,
  artistId: string
): Promise<boolean> {
  const { data: artist } = await admin
    .from("roster_artists")
    .select("id, owner_user_id, org_id")
    .eq("id", artistId)
    .maybeSingle();
  if (!artist) return false;

  if (artist.owner_user_id && artist.owner_user_id === userId) return true;

  if (artist.org_id) {
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
    if (member) return true;
  }

  return false;
}

export async function GET(req: Request) {
  const artistId = new URL(req.url).searchParams.get("artistId");
  if (!artistId) {
    return NextResponse.json({ error: "artistId required" }, { status: 400 });
  }

  const ctx = await getUserAndAdmin();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await canEditArtist(ctx.admin, ctx.user.id, artistId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: artist, error } = await ctx.admin
    .from("roster_artists")
    .select("id, stage_name, slug, public_page")
    .eq("id", artistId)
    .maybeSingle();

  if (error || !artist) {
    return NextResponse.json(
      {
        error: error?.message?.includes("public_page")
          ? "Run migration 024_artist_public_page.sql in Supabase"
          : error?.message || "Not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    artistId: artist.id,
    stageName: artist.stage_name,
    slug: artist.slug,
    page: mergePublicPage(artist.public_page),
  });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    artistId?: string;
    page?: ArtistPublicPage;
  };
  if (!body.artistId || !body.page) {
    return NextResponse.json(
      { error: "artistId and page required" },
      { status: 400 }
    );
  }

  const ctx = await getUserAndAdmin();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await canEditArtist(ctx.admin, ctx.user.id, body.artistId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const page = mergePublicPage(body.page);
  const { data, error } = await ctx.admin
    .from("roster_artists")
    .update({ public_page: page })
    .eq("id", body.artistId)
    .select("id, slug, public_page")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: /public_page|column/i.test(error.message)
          ? "Run migration 024_artist_public_page.sql in Supabase SQL Editor"
          : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    page: mergePublicPage(data.public_page),
    slug: data.slug,
  });
}
