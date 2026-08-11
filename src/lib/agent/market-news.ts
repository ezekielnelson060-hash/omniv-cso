import type { AgentProposal } from "@/lib/agent/types";

export type MarketArticle = {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
};

const DEFAULT_QUERY =
  '("sync licensing" OR "music supervisor" OR soundtrack OR "music placement" OR Afrobeats OR "playlist editorial" OR "A&R") AND (music OR artist OR label OR Netflix OR advertising)';

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
  const q = opts?.query || DEFAULT_QUERY;

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
    /sync|supervisor|soundtrack|licensing|placement|brief|netflix|film|tv|ad |advert|commercial|trailer/.test(
      hay
    )
  ) {
    return {
      type: "OPEN_ZIKI",
      label: "Draft pitch in Ziki",
      payload: {
        q: `Market signal for a possible pitch:\n${title}\n${body}\n\nUsing my catalogue + Artist Brain, pick the best track (prefer one with clean intro / instrumental if sync). Write a short supervisor-style pitch email: subject + 4 sentences max + what to attach.`,
      },
    };
  }

  if (/playlist|editorial|curator|radio/.test(hay)) {
    return {
      type: "DRAFT_OUTREACH",
      label: "Draft playlist note",
      payload: {
        topic: title.slice(0, 80),
        q: `Draft a short playlist/curator pitch from this market news:\n${title}\n${body}`,
      },
    };
  }

  if (/label|a&r|signing|record deal|imprint/.test(hay)) {
    return {
      type: "OPEN_LABEL",
      label: "Open Label hub",
      payload: {
        q: `Industry label signal:\n${title}\n${body}\nHow should I position my roster/catalogue?`,
      },
    };
  }

  return {
    type: "OPEN_ZIKI",
    label: "Review in Ziki",
    payload: {
      q: `Music market news:\n${title}\n${body}\nIs there a deal or pitch angle for me this week? One clear move.`,
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
      a.description || "Industry headline — check if your catalogue fits.",
      a.source ? `Source: ${a.source}` : "",
      a.url ? `Read: ${a.url}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      id: slugId(a.title, a.publishedAt),
      title: a.title.length > 90 ? `${a.title.slice(0, 87)}…` : a.title,
      body: body.slice(0, 400),
      urgency: i < 2 ? ("today" as const) : ("this_week" as const),
      impact: /sync|supervisor|licensing|playlist|label|netflix/i.test(
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
