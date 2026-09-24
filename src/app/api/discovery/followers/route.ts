import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type")?.trim() || "";
    const slug = searchParams.get("slug")?.trim() || "";

    if (!type || !slug) {
      return NextResponse.json(
        { error: "type and slug required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Prefer RPC if migration 033 is applied
    const { data: rpcCount, error: rpcErr } = await supabase.rpc(
      "discovery_follower_count",
      { p_type: type, p_slug: slug }
    );

    if (!rpcErr && typeof rpcCount === "number") {
      return NextResponse.json({ count: rpcCount });
    }
    if (!rpcErr && typeof rpcCount === "string") {
      return NextResponse.json({ count: Number(rpcCount) || 0 });
    }

    // Fallback: head-only count (needs public select policy — may fail)
    const { count, error } = await supabase
      .from("discovery_follows")
      .select("id", { count: "exact", head: true })
      .eq("target_type", type)
      .eq("target_slug", slug);

    if (error) {
      // Silent zero when RLS blocks unauthenticated aggregate
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ count: 0 });
  }
}
