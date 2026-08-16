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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(url, service, { auth: { persistSession: false } });

  const { data: artist } = await admin
    .from("roster_artists")
    .select("id, org_id, stage_name, slug, public_page")
    .eq("id", artistId)
    .maybeSingle();
  if (!artist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: org } = await admin
    .from("orgs")
    .select("owner_user_id")
    .eq("id", artist.org_id)
    .maybeSingle();
  const { data: member } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", artist.org_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (org?.owner_user_id !== user.id && !member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    return NextResponse.json({ error: "artistId and page required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(url, service, { auth: { persistSession: false } });

  const { data: artist } = await admin
    .from("roster_artists")
    .select("id, org_id")
    .eq("id", body.artistId)
    .maybeSingle();
  if (!artist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: org } = await admin
    .from("orgs")
    .select("owner_user_id")
    .eq("id", artist.org_id)
    .maybeSingle();
  const { data: member } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", artist.org_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (org?.owner_user_id !== user.id && !member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  return NextResponse.json({
    ok: true,
    page: mergePublicPage(data.public_page),
    slug: data.slug,
  });
}
