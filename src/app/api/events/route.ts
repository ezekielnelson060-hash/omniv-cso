import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

/**
 * POST { name, path?, meta? }
 * Authenticated → user_id attached. Anonymous allowed for public discovery pages.
 */
export async function POST(req: Request) {
  try {
    let body: {
      name?: string;
      path?: string;
      meta?: Record<string, unknown>;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const name = body.name?.trim();
    if (!name || name.length > 80) {
      return NextResponse.json({ error: "invalid name" }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* anonymous */
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && service) {
      const admin = createAdmin(url, service, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await admin.from("app_events").insert({
        name,
        user_id: userId,
        path: body.path?.slice(0, 200) || null,
        meta: body.meta || {},
      });
      if (error) console.error("events insert", error);

      if (name === "discovery_view" && body.meta) {
        const slug =
          typeof body.meta.publication_slug === "string"
            ? body.meta.publication_slug
            : null;
        if (slug) {
          try {
            await admin.rpc("discovery_bump_heat", {
              p_slug: slug,
              p_delta: 1,
            });
          } catch (e) {
            console.error("bump heat", e);
          }
        }
        const entityType =
          typeof body.meta.entity_type === "string"
            ? body.meta.entity_type
            : null;
        const entitySlug =
          typeof body.meta.entity_slug === "string"
            ? body.meta.entity_slug
            : null;
        if (entityType && entitySlug) {
          try {
            await admin.rpc("discovery_bump_entity_heat", {
              p_type: entityType,
              p_slug: entitySlug,
              p_delta: 1,
            });
          } catch (e) {
            console.error("bump entity heat", e);
          }
        }
      }

      return NextResponse.json({ ok: true });
    }

    if (url && anon && userId) {
      try {
        const supabase = await createClient();
        await supabase.from("app_events").insert({
          name,
          user_id: userId,
          path: body.path?.slice(0, 200) || null,
          meta: body.meta || {},
        });
      } catch (e) {
        console.error(e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: true });
  }
}
