import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isAdmin(userId: string): boolean {
  const raw = process.env.ADMIN_USER_IDS || process.env.OMNIV_ADMIN_IDS || "";
  if (!raw.trim()) return false;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(userId);
}

async function allowAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  if (isAdmin(userId)) return true;
  const { data: ents } = await supabase
    .from("discovery_entities")
    .select("id, name, slug, verified")
    .eq("owner_id", userId)
    .limit(20);
  return Boolean(
    (ents || []).some(
      (e) =>
        e.verified ||
        /omniv/i.test(e.name || "") ||
        /omniv/i.test(e.slug || "")
    )
  );
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    if (!(await allowAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "open";

    let q = supabase
      .from("discovery_reports")
      .select(
        "id, reporter_id, target_kind, target_id, target_slug, reason, details, status, created_at, resolved_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (status !== "all") {
      q = q.eq("status", status);
    }

    const { data, error } = await q;

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          hint: "Run migration 050; reports RLS may block non-reporter select",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ auth: true, reports: data || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    if (!(await allowAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const id = String(body.id || "").trim();
    const status = String(body.status || "").trim();

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    if (!["open", "reviewing", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const patch: Record<string, unknown> = { status };
    if (status === "resolved" || status === "dismissed") {
      patch.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("discovery_reports")
      .update(patch)
      .eq("id", id)
      .select("id, status, resolved_at, target_kind, target_slug, target_id")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          hint: "Add admin select/update policy on discovery_reports if needed",
        },
        { status: 500 }
      );
    }

    let hidden = false;
    const action = String(body.action || "").trim();
    if (action === "hide" && data) {
      const slug = data.target_slug || data.target_id;
      if (slug) {
        const { error: hideErr } = await supabase
          .from("discovery_publications")
          .update({ moderated_hidden: true })
          .eq("slug", String(slug));
        if (!hideErr) hidden = true;
      }
    }
    if (action === "unhide" && data) {
      const slug = data.target_slug || data.target_id;
      if (slug) {
        await supabase
          .from("discovery_publications")
          .update({ moderated_hidden: false })
          .eq("slug", String(slug));
      }
    }

    return NextResponse.json({ ok: true, report: data, hidden });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
