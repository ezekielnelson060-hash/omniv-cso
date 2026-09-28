import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Flip discovery_publications with status=scheduled and published_at <= now
 * to status=published. Secure with CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase admin not configured" },
      { status: 503 }
    );
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = new Date().toISOString();

  const { data: due, error: selectError } = await admin
    .from("discovery_publications")
    .select("id, slug, title")
    .eq("status", "scheduled")
    .lte("published_at", now)
    .limit(100);

  if (selectError) {
    console.error("publish-scheduled select", selectError);
    return NextResponse.json(
      { error: selectError.message },
      { status: 500 }
    );
  }

  if (!due?.length) {
    return NextResponse.json({ ok: true, published: 0 });
  }

  const ids = due.map((r) => r.id);
  const { error: updateError } = await admin
    .from("discovery_publications")
    .update({ status: "published" })
    .in("id", ids);

  if (updateError) {
    console.error("publish-scheduled update", updateError);
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    published: ids.length,
    slugs: due.map((r) => r.slug),
  });
}

export async function POST(req: Request) {
  return GET(req);
}
