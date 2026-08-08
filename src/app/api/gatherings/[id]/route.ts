import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(ctx.params);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await admin
    .from("gatherings")
    .select(
      "id, title, city, capacity, ticket_price_cents, status, venue, starts_at, room_type, now_playing_url, now_playing_title, industry_guest_name, industry_guest_role, industry_guest_active, host_notes"
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ gathering: data });
}
