import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(ctx.params);
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      nowPlayingUrl?: string | null;
      nowPlayingTitle?: string | null;
      industryGuestName?: string | null;
      industryGuestRole?: string | null;
      industryGuestActive?: boolean;
    };

    const patch: Record<string, unknown> = {};
    if (body.nowPlayingUrl !== undefined)
      patch.now_playing_url = body.nowPlayingUrl?.trim() || null;
    if (body.nowPlayingTitle !== undefined)
      patch.now_playing_title = body.nowPlayingTitle?.trim() || null;
    if (body.industryGuestName !== undefined)
      patch.industry_guest_name = body.industryGuestName?.trim() || null;
    if (body.industryGuestRole !== undefined)
      patch.industry_guest_role = body.industryGuestRole?.trim() || null;
    if (body.industryGuestActive !== undefined)
      patch.industry_guest_active = Boolean(body.industryGuestActive);

    const { data, error } = await supabase
      .from("gatherings")
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        "id, now_playing_url, now_playing_title, industry_guest_name, industry_guest_role, industry_guest_active"
      )
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && key && body.nowPlayingTitle) {
        const { createClient: createAdmin } = await import(
          "@supabase/supabase-js"
        );
        const admin = createAdmin(url, key, {
          auth: { persistSession: false },
        });
        await admin.from("room_messages").insert({
          gathering_id: id,
          display_name: "Omniv",
          body: `Now playing: ${body.nowPlayingTitle}`,
          kind: "system",
        });
      }
    } catch {
      /* optional */
    }

    return NextResponse.json({ ok: true, gathering: data });
  } catch (e) {
    console.error("live patch", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
