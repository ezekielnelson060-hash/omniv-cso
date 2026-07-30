import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { zikiComplete } from "@/lib/gemini";

/**
 * Weekly autonomous surface scan for all profiles with social_links.
 * Secure with CRON_SECRET. Schedule in vercel.json.
 *
 * Vercel Cron: GET /api/cron/weekly-scan
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json(
      { error: "Missing Supabase service role" },
      { status: 500 }
    );
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false },
  });

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, full_name, social_links, platforms")
    .not("social_links", "eq", "{}");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let scanned = 0;
  for (const p of profiles || []) {
    const links = (p.social_links || {}) as Record<string, string>;
    const urls = Object.values(links).filter(Boolean);
    if (urls.length === 0) continue;

    const prompt = `Weekly autonomous scan for artist "${p.full_name || "Unknown"}".
Saved profile URLs:\n${urls.map((u) => `- ${u}`).join("\n")}
Platforms: ${(p.platforms || []).join(", ")}

Produce an executive briefing:\n**Positioning**\n**Momentum signals**\n**Gaps**\n**This week's priority move**\n**Expected outcome**
Never mention Nova Hex or demo artists.`;

    const result = await zikiComplete(prompt);
    await admin
      .from("profiles")
      .update({
        last_scan_at: new Date().toISOString(),
        last_scan_briefing: result.text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id);
    scanned += 1;
  }

  return NextResponse.json({ ok: true, scanned });
}
