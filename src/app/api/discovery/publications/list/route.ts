import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const owner = searchParams.get("owner"); // "me" for current user
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

    const supabase = await createClient();

    let query = supabase
      .from("discovery_publications")
      .select(
        "id, type, slug, title, summary, body, tags, meta, cover_url, heat, published_at, publisher_id, publisher_name, owner_id"
      )
      .order("published_at", { ascending: false })
      .limit(limit);

    if (type) query = query.eq("type", type);

    if (owner === "me") {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ publications: [], auth: false });
      }
      query = query.eq("owner_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("list publications", error);
      return NextResponse.json({
        publications: [],
        error: error.message,
      });
    }

    const publications = (data || []).map((r) => ({
      id: r.id,
      type: r.type,
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      body: r.body,
      tags: r.tags || [],
      meta: r.meta,
      coverUrl: r.cover_url,
      heat: r.heat,
      publishedAt: r.published_at?.slice?.(0, 10) ?? r.published_at,
      publisherId: r.publisher_id,
      publisherName: r.publisher_name,
    }));

    return NextResponse.json({ publications });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ publications: [] });
  }
}
