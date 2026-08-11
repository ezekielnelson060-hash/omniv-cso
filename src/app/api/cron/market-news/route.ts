import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { loadMarketProposals } from "@/lib/agent/market-news";
import type { AgentProposal } from "@/lib/agent/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Pull music-market news → Agent Outside cards for every profile.
 * Vercel Cron: GET /api/cron/market-news
 * Auth: Authorization: Bearer CRON_SECRET
 *
 * Env: NEWS_API_KEY (or NEWSAPI_KEY)
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newsKey =
    process.env.NEWS_API_KEY ||
    process.env.NEWSAPI_KEY ||
    process.env.NEWS_API_TOKEN;
  if (!newsKey) {
    return NextResponse.json(
      { error: "NEWS_API_KEY not set", injected: 0 },
      { status: 503 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json({ error: "Supabase missing" }, { status: 500 });
  }

  let proposals: AgentProposal[] = [];
  try {
    proposals = await loadMarketProposals(8);
  } catch (e) {
    console.error("[cron/market-news]", e);
    return NextResponse.json({ error: "news_fetch_failed" }, { status: 502 });
  }

  if (!proposals.length) {
    return NextResponse.json({
      ok: true,
      articles: 0,
      profiles: 0,
      note: "NewsAPI returned 0 usable articles",
    });
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false },
  });

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, agent_inbox")
    .limit(300);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;
  for (const p of profiles || []) {
    try {
      const existing = Array.isArray(p.agent_inbox)
        ? (p.agent_inbox as AgentProposal[])
        : [];
      const byId = new Map<string, AgentProposal>();
      for (const x of existing) {
        if (x?.id) byId.set(String(x.id), x);
      }
      for (const x of proposals) byId.set(x.id, x);
      const merged = Array.from(byId.values())
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 40);

      const { error: upErr } = await admin
        .from("profiles")
        .update({ agent_inbox: merged })
        .eq("id", p.id);
      if (!upErr) updated += 1;
    } catch (e) {
      console.error("[cron/market-news] profile", p.id, e);
    }
  }

  return NextResponse.json({
    ok: true,
    articles: proposals.length,
    profiles: updated,
    titles: proposals.map((x) => x.title).slice(0, 5),
  });
}
