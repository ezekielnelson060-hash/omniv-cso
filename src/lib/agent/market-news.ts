import type { AgentProposal } from "@/lib/agent/types";

export type MarketArticle = {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
};

/**
 * Global music-market queries (not region-locked).
 * NewsAPI free tier: keep each query tight; we merge + dedupe.
 */
const MARKET_QUERIES = [
  // Labels / A&R looking at independents
  '("independent artist" OR "indie artist" OR "unsigned artist" OR "open submissions") AND (label OR "A&R" OR signing OR imprint OR "record deal")',
  // Sync / supervisors / placements worldwide
  '("music supervisor" OR "sync licensing" OR soundtrack OR "music placement" OR "needle drop") AND (film OR TV OR advertising OR game OR trailer)',
  // Playlists / radio / editorial
  '("playlist" OR editorial OR curator OR "New Music Friday") AND (Spotify OR Apple OR "radio add") AND (music OR artist)',
  // Global scenes as equal weight (not Afro-only)
  '(K-pop OR Latin OR Afrobeats OR "UK drill" OR "indie pop" OR "alt-R&B" OR country OR "hip-hop") AND (label OR licensing OR playlist OR tour OR deal)',
];

/**
 * Fetch music-market headlines from NewsAPI.
 * Env: NEWS_API_KEY or NEWSAPI_KEY
 */
export async function fetchMarketNews(opts?: {
  query?: string;
  pageSize?: number;
}): Promise<MarketArticle[]> {
  const key =
    process.env.NEWS_API_KEY ||
    process.env.NEWSAPI_KEY ||
    process.env.NEWS_API_TOKEN;
  if (!key) return [];

  const pageSize = Math.min(12, Math.max(3, opts?.pageSize ?? 8));

  if (opts?.query) {
    return fetchOneQuery(key, opts.query, pageSize);
  }

  const per = Math.max(2, Math.ceil(pageSize / MARKET_QUERIES.length));
  const batches = await Promise.all(
    MARKET_QUERIES.map((q) => fetchOneQuery(key, q, per))
  );

  const byUrl = new Map<string, MarketArticle>();
  for (const list of batches) {
    for (const a of list) {
      const k = a.url || a.title;
      if (!byUrl.has(k)) byUrl.set(k, a);
    }
  }

  return Array.from(byUrl.values())
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, pageSize);
}

async function fetchOneQuery(
  key: string,
  q: string,
  pageSize: number
): Promise<MarketArticle[]> {
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", q);
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", String(pageSize));

  const res = await fetch(url.toString(), {
    headers: { "X-Api-Key": key },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[market-news]", res.status, text.slice(0, 200));
    return [];
  }

  const json = (await res.json()) as {
    articles?: {
      title?: string;
      description?: string | null;
      url?: string;
      source?: { name?: string };
      publishedAt?: string;
    }[];
  };

  const out: MarketArticle[] = [];
  for (const a of json.articles || []) {
    const title = (a.title || "").trim();
    if (!title || title === "[Removed]") continue;
    out.push({
      title: title.slice(0, 160),
      description: (a.description || "").trim().slice(0, 280) || null,
      url: a.url || "",
      source: a.source?.name || "Market",
      publishedAt: a.publishedAt || new Date().toISOString(),
    });
  }
  return out;
}

function slugId(title: string, publishedAt: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const day = publishedAt.slice(0, 10).replace(/-/g, "");
  return `market-${day}-${base || "news"}`;
}

function inferPitchAction(
  title: string,
  body: string
): AgentProposal["action"] {
  const hay = `${title} ${body}`.toLowerCase();

  if (
    /label|a&r|signing|record deal|imprint|unsigned|independent artist|indie artist|open submission|roster/.test(
      hay
    )
  ) {
    return {
      type: "OPEN_LABEL",
      label: "Open Label · shortlist",
      payload: {
        q: `Industry label / A&R signal (global):\n${title}\n${body}\n\nUsing my Artist Brain + catalogue, list 3 labels or A&R angles that fit me and draft one short intro email.`,
      },
    };
  }

  if (
    /sync|supervisor|soundtrack|licensing|placement|brief|netflix|film|tv|ad |advert|commercial|trailer|needle drop|game/.test(
      hay
    )
  ) {
    return {
      type: "OPEN_ZIKI",
      label: "Draft pitch in Ziki",
      payload: {
        q: `Market signal for a possible pitch (any region):\n${title}\n${body}\n\nUsing my catalogue + Artist Brain, pick the best track (prefer clean intro / instrumental if sync). Write a short supervisor-style pitch: subject + 4 sentences max + what to attach.`,
      },
    };
  }

  if (/playlist|editorial|curator|radio|new music friday/.test(hay)) {
    return {
      type: "DRAFT_OUTREACH",
      label: "Draft playlist note",
      payload: {
        topic: title.slice(0, 80),
        q: `Draft a short playlist/curator pitch from this market news:\n${title}\n${body}`,
      },
    };
  }

  return {
    type: "OPEN_ZIKI",
    label: "Review in Ziki",
    payload: {
      q: `Music market news (global):\n${title}\n${body}\nIs there a deal or pitch angle for me this week? One clear move.`,
    },
  };
}

/** Turn news articles into Agent Outside proposals (source: webhook). */
export function articlesToProposals(
  articles: MarketArticle[],
  now = Date.now()
): AgentProposal[] {
  return articles.map((a, i) => {
    const body = [
      a.description ||
        "Industry headline — check if your catalogue or roster fits (any market).",
      a.source ? `Source: ${a.source}` : "",
      a.url ? `Read: ${a.url}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const labelish =
      /label|a&r|signing|unsigned|independent|indie artist|imprint|record deal/i.test(
        a.title + (a.description || "")
      );

    return {
      id: slugId(a.title, a.publishedAt),
      title: a.title.length > 90 ? `${a.title.slice(0, 87)}…` : a.title,
      body: body.slice(0, 400),
      urgency: i < 2 ? ("today" as const) : ("this_week" as const),
      impact:
        labelish ||
        /sync|supervisor|licensing|playlist|netflix/i.test(
          a.title + (a.description || "")
        )
          ? ("high" as const)
          : ("medium" as const),
      source: "webhook" as const,
      action: inferPitchAction(a.title, body),
      status: "pending" as const,
      createdAt: now - i * 1000,
    };
  });
}

export async function loadMarketProposals(
  pageSize = 6
): Promise<AgentProposal[]> {
  const articles = await fetchMarketNews({ pageSize });
  return articlesToProposals(articles);
}
