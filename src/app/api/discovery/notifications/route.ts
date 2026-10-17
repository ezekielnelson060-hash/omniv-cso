import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-backed network notifications.
 * GET  — list current user's notifications
 * POST — create (own inbox)
 * PATCH — mark one or all read { id? , all?: true }
 */

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ auth: false, notifications: [] });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)));

    const { data, error } = await supabase
      .from("discovery_notifications")
      .select(
        "id, kind, title, body, href, actor_name, actor_type, actor_id, read, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({
        auth: true,
        notifications: [],
        error: error.message,
        hint: "Run migration 051_notifications_search_moderation.sql",
      });
    }

    const notifications = (data || []).map((n) => ({
      id: n.id as string,
      kind: n.kind as string,
      title: n.title as string,
      body: (n.body as string) || undefined,
      href: (n.href as string) || undefined,
      actorName: (n.actor_name as string) || undefined,
      actorType: (n.actor_type as string) || undefined,
      read: Boolean(n.read),
      createdAt: n.created_at as string,
    }));

    const unread = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      auth: true,
      notifications,
      unread,
    });
  } catch (e) {
    console.error("notifications GET", e);
    return NextResponse.json({ auth: false, notifications: [] });
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
    const kind = String(body.kind || "").trim();
    const title = String(body.title || "").trim();
    if (!kind || !title) {
      return NextResponse.json(
        { error: "kind and title required" },
        { status: 400 }
      );
    }

    const targetUserId = String(body.userId || user.id).trim();
    if (targetUserId !== user.id) {
      return NextResponse.json(
        { error: "Can only create notifications for yourself from client" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("discovery_notifications")
      .insert({
        user_id: targetUserId,
        kind,
        title,
        body: body.body ? String(body.body).slice(0, 500) : null,
        href: body.href ? String(body.href).slice(0, 300) : null,
        actor_name: body.actorName ? String(body.actorName).slice(0, 120) : null,
        actor_type: body.actorType ? String(body.actorType).slice(0, 40) : null,
        actor_id: body.actorId ? String(body.actorId).slice(0, 80) : null,
        read: false,
      })
      .select("id, kind, title, body, href, actor_name, read, created_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          hint: "Run migration 051_notifications_search_moderation.sql",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, notification: data });
  } catch (e) {
    console.error("notifications POST", e);
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

    const body = await req.json();
    const all = Boolean(body.all);
    const id = body.id ? String(body.id).trim() : null;

    if (all) {
      const { error } = await supabase
        .from("discovery_notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, all: true });
    }

    if (!id) {
      return NextResponse.json(
        { error: "id or all required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("discovery_notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("notifications PATCH", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
