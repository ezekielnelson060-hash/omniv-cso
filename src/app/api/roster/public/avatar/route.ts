import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Avatar for public artist pages — loaded separately so /api/roster/public stays fast.
 * Returns data-URIs or http URLs. Never 500s; null avatar is OK (initials fallback).
 */
export async function GET(req: Request) {
  try {
    const slug = new URL(req.url).searchParams.get("slug")?.trim().toLowerCase();
    if (!slug) {
      return NextResponse.json({ avatarUrl: null }, { status: 200 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({ avatarUrl: null }, { status: 200 });
    }

    const admin = createClient(url, key, { auth: { persistSession: false } });

    // Minimal select — no optional columns that can 400 the whole request
    let ownerId: string | null = null;
    let orgId: string | null = null;

    const exact = await admin
      .from("roster_artists")
      .select("owner_user_id, org_id")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (!exact.error && exact.data) {
      ownerId = (exact.data as { owner_user_id?: string | null }).owner_user_id || null;
      orgId = (exact.data as { org_id?: string | null }).org_id || null;
    } else {
      const prefix = await admin
        .from("roster_artists")
        .select("owner_user_id, org_id, slug")
        .ilike("slug", `${slug}%`)
        .limit(8);
      if (!prefix.error && prefix.data?.length) {
        const rows = prefix.data as {
          owner_user_id?: string | null;
          org_id?: string | null;
          slug?: string | null;
        }[];
        rows.sort(
          (a, b) => String(b.slug || "").length - String(a.slug || "").length
        );
        ownerId = rows[0]?.owner_user_id || null;
        orgId = rows[0]?.org_id || null;
      }
    }

    async function avatarForUser(uid: string): Promise<string | null> {
      const { data, error } = await admin
        .from("profiles")
        .select("avatar_url")
        .eq("id", uid)
        .maybeSingle();
      if (error || !data) return null;
      const a = (data as { avatar_url?: string | null }).avatar_url;
      return a && String(a).trim() ? String(a).trim() : null;
    }

    let avatarUrl: string | null = null;
    if (ownerId) avatarUrl = await avatarForUser(ownerId);

    if (!avatarUrl && orgId) {
      const { data: org } = await admin
        .from("orgs")
        .select("owner_user_id")
        .eq("id", orgId)
        .maybeSingle();
      const uid = (org as { owner_user_id?: string } | null)?.owner_user_id;
      if (uid) avatarUrl = await avatarForUser(uid);
    }

    return NextResponse.json(
      { avatarUrl },
      {
        headers: {
          "Cache-Control": "public, max-age=120, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json({ avatarUrl: null }, { status: 200 });
  }
}
