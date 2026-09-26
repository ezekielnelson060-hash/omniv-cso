import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug")?.trim();

    if (slug) {
      const { count } = await supabase
        .from("discovery_likes")
        .select("id", { count: "exact", head: true })
        .eq("publication_slug", slug);

      let liked = false;
      if (user) {
        const { data } = await supabase
          .from("discovery_likes")
          .select("id")
          .eq("user_id", user.id)
          .eq("publication_slug", slug)
          .maybeSingle();
        liked = Boolean(data?.id);
      }

      return NextResponse.json({
        auth: Boolean(user),
        slug,
        liked,
        count: count ?? 0,
      });
    }

    if (!user) {
      return NextResponse.json({ likes: [], auth: false });
    }

    const { data, error } = await supabase
      .from("discovery_likes")
      .select("publication_slug, publication_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        likes: [],
        auth: true,
        error: error.message,
      });
    }

    return NextResponse.json({
      auth: true,
      likes: (data || []).map((r) => ({
        slug: r.publication_slug,
        type: r.publication_type,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ likes: [], auth: false });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const slug = String(body.slug || "").trim();
    const type = String(body.type || "article").trim();

    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("discovery_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("publication_slug", slug)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from("discovery_likes").delete().eq("id", existing.id);
      // decrement heat if column exists
      try {
        await supabase.rpc("discovery_bump_heat", {
          p_slug: slug,
          p_delta: -1,
        });
      } catch {
        /* optional */
      }
      const { count } = await supabase
        .from("discovery_likes")
        .select("id", { count: "exact", head: true })
        .eq("publication_slug", slug);
      return NextResponse.json({ liked: false, count: count ?? 0 });
    }

    const { error } = await supabase.from("discovery_likes").insert({
      user_id: user.id,
      publication_slug: slug,
      publication_type: type,
    });

    if (error) {
      console.error("like insert", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await supabase.rpc("discovery_bump_heat", {
        p_slug: slug,
        p_delta: 1,
      });
    } catch {
      /* optional */
    }

    const { count } = await supabase
      .from("discovery_likes")
      .select("id", { count: "exact", head: true })
      .eq("publication_slug", slug);

    return NextResponse.json({ liked: true, count: count ?? 1 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
