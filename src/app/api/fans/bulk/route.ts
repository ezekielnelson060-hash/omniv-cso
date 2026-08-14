import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Bulk actions for pre-release workflow.
 * POST { artistId, fanIds, action, tag?, tier? }
 * actions: add_tag | remove_tag | set_tier | mark_release | clear_release | set_would_attend
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
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

  const body = (await req.json()) as {
    artistId?: string;
    fanIds?: string[];
    action?:
      | "add_tag"
      | "remove_tag"
      | "set_tier"
      | "mark_release"
      | "clear_release"
      | "set_would_attend";
    tag?: string;
    tier?: string;
    wouldAttend?: boolean;
  };

  const { artistId, fanIds, action } = body;
  if (!artistId || !fanIds?.length || !action) {
    return NextResponse.json(
      { error: "artistId, fanIds, and action required" },
      { status: 400 }
    );
  }

  const admin = createClient(url, service, { auth: { persistSession: false } });

  const { data: artist } = await admin
    .from("roster_artists")
    .select("id, org_id")
    .eq("id", artistId)
    .maybeSingle();
  if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

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

  const { data: fans, error: fetchErr } = await admin
    .from("fans")
    .select("id, tags")
    .eq("artist_id", artistId)
    .in("id", fanIds);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const tag = (body.tag || "").trim().toLowerCase();
  let updated = 0;

  for (const f of fans || []) {
    const current: string[] = Array.isArray(f.tags) ? (f.tags as string[]) : [];
    let nextTags = [...current];
    const patch: Record<string, unknown> = {};

    if (action === "add_tag" && tag) {
      nextTags = Array.from(new Set([...nextTags, tag]));
      patch.tags = nextTags;
    } else if (action === "remove_tag" && tag) {
      nextTags = nextTags.filter((t) => t !== tag);
      patch.tags = nextTags;
    } else if (action === "mark_release") {
      nextTags = Array.from(new Set([...nextTags, "release"]));
      patch.tags = nextTags;
    } else if (action === "clear_release") {
      nextTags = nextTags.filter((t) => t !== "release");
      patch.tags = nextTags;
    } else if (action === "set_tier" && body.tier) {
      patch.fan_tier = body.tier;
    } else if (action === "set_would_attend") {
      patch.would_attend = Boolean(body.wouldAttend);
    } else {
      continue;
    }

    const { error } = await admin.from("fans").update(patch).eq("id", f.id);
    if (!error) updated += 1;
  }

  return NextResponse.json({ ok: true, updated });
}
