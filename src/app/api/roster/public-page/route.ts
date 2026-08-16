import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { mergePublicPage, type ArtistPublicPage } from "@/lib/artist-public-page";

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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createClient(url, service, { auth: { persistSession: false } });

  const { data: rawArtist } = await admin
    .from("roster_artists")
    .select("id, owner_user_id, org_id, stage_name, slug, public_page")
    .eq("id", artistId)
    .maybeSingle();

  const artist = rawArtist as {
    id: string;
    owner_user_id?: string | null;
    org_id?: string | null;
    stage_name?: string | null;
    slug?: string | null;
    public_page?: unknown;
  } | null;

  if (!artist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let allowed = artist.owner_user_id === user.id;
  if (!allowed && artist.org_id) {
    const { data: org } = await admin
      .from("orgs")
      .select("owner_user_id")
      .eq("id", artist.org_id)
      .maybeSingle();
    const orgRow = org as { owner_user_id?: string } | null;
    if (orgRow?.owner_user_id === user.id) allowed = true;
    if (!allowed) {
      const { data: member } = await admin
        .from("org_members")
        .select("id")
        .eq("org_id", artist.org_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (member) allowed = true;
    }
  }
  if (!allowed) {
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
    return NextResponse.json(
      { error: "artistId and page required" },
      { status: 400 }
    );
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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createClient(url, service, { auth: { persistSession: false } });

  const { data: rawArtist } = await admin
    .from("roster_artists")
    .select("id, owner_user_id, org_id")
    .eq("id", body.artistId)
    .maybeSingle();

  const artist = rawArtist as {
    id: string;
    owner_user_id?: string | null;
    org_id?: string | null;
  } | null;

  if (!artist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let allowed = artist.owner_user_id === user.id;
  if (!allowed && artist.org_id) {
    const { data: org } = await admin
      .from("orgs")
      .select("owner_user_id")
      .eq("id", artist.org_id)
      .maybeSingle();
    const orgRow = org as { owner_user_id?: string } | null;
    if (orgRow?.owner_user_id === user.id) allowed = true;
    if (!allowed) {
      const { data: member } = await admin
        .from("org_members")
        .select("id")
        .eq("org_id", artist.org_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (member) allowed = true;
    }
  }
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const page = mergePublicPage(body.page);
  const { data: rawUpdated, error } = await admin
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

  const data = rawUpdated as {
    id: string;
    slug?: string;
    public_page?: unknown;
  };

  return NextResponse.json({
    ok: true,
    page: mergePublicPage(data.public_page),
    slug: data.slug,
  });
}
