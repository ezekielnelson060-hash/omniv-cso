import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      patch.name = body.name.trim();
    }
    if (typeof body.tagline === "string") {
      patch.tagline = body.tagline.trim();
    }
    if (typeof body.about === "string") {
      patch.about = body.about.trim();
    }
    if (typeof body.location === "string") {
      patch.location = body.location.trim() || null;
    }
    if (body.avatar_url !== undefined) {
      patch.avatar_url = body.avatar_url || null;
    }
    if (body.cover_url !== undefined) {
      patch.cover_url = body.cover_url || null;
    }
    if (typeof body.website === "string") {
      const w = body.website.trim();
      if (w) {
        patch.links = [
          {
            label: "Website",
            href: w.startsWith("http") ? w : `https://${w}`,
          },
        ];
      } else {
        patch.links = [];
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("discovery_entities")
      .update(patch)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select("id, type, slug, name, tagline, location, about, avatar_url, cover_url, verified")
      .maybeSingle();

    if (error) {
      // Retry without avatar/cover if columns missing
      if (
        error.message?.includes("avatar") ||
        error.message?.includes("cover")
      ) {
        const slim = { ...patch };
        delete slim.avatar_url;
        delete slim.cover_url;
        const retry = await supabase
          .from("discovery_entities")
          .update(slim)
          .eq("id", id)
          .eq("owner_id", user.id)
          .select("id, type, slug, name")
          .maybeSingle();
        if (retry.error) {
          return NextResponse.json(
            { error: retry.error.message },
            { status: 500 }
          );
        }
        return NextResponse.json({
          ok: true,
          entity: retry.data,
          note: "Run SQL for avatar_url/cover_url columns",
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      entity: data,
      path: `/e/${data.type}/${data.slug}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
