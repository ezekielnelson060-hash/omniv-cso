import type { AgentProposal } from "@/lib/agent/types";

/**
 * Public X (Twitter) recent search → Agent Outside cards.
 * Env: X_BEARER_TOKEN (required)
 *
 * Global opportunity queries — not region-locked.
 */
const X_QUERIES = [
  '("looking for music" OR "need a track" OR "need music" OR "music supervisor") -is:retweet lang:en',
  '("sync brief" OR "sync licensing" OR "for sync" OR "needle drop") -is:retweet lang:en',
  '("open submissions" OR "unsigned artists" OR "indie artists" OR "A&R" label) (music OR artist) -is:retweet lang:en',
  '("playlist submissions" OR "submit your music" OR curator) -is:retweet lang:en',
];

type XTweet = {
  id: string;
  text: string;
  created_at?: string;
  author_id?: string;
};

export async function fetchXMarketPosts(opts?: {
  maxPerQuery?: number;
}): Promise<XTweet[]> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return [];

  const maxPer = Math.min(10, Math.max(5, opts?.maxPerQuery ?? 8));
  const byId = new Map<string, XTweet>();

  for (const q of X_QUERIES) {
    try {
      const url = new URL("https://api.x.com/2/tweets/search/recent");
      url.searchParams.set("query", q);
      url.searchParams.set("max_results", String(maxPer));
      url.searchParams.set("tweet.fields", "created_at,author_id,lang");

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "OmnivAgent/1.0",
        },
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[x-market]", res.status, text.slice(0, 240));
        continue;
      }

      const json = (await res.json()) as { data?: XTweet[] };
      for (const t of json.data || []) {
        if (t?.id && t?.text) byId.set(t.id, t);
      }
    } catch (e) {
      console.error("[x-market] query failed", e);
    }
  }

  return Array.from(byId.values()).slice(0, 12);
}

function dayStamp(iso?: string): string {
  const d = iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10);
  return d.replace(/-/g, "");
}

function inferAction(text: string): AgentProposal["action"] {
  const hay = text.toLowerCase();

  if (
    /label|a&r|signing|unsigned|independent|indie artist|open submission|roster|demo/.test(
      hay
    )
  ) {
    return {
      type: "OPEN_LABEL",
      label: "Open Label · shortlist",
      payload: {
        q: `Public X signal about labels / A&R / submissions:\n${text}\n\nUsing my Artist Brain + catalogue, how should I respond? Draft a short professional reply or intro.`,
      },
    };
  }

  if (
    /sync|supervisor|soundtrack|licensing|placement|needle drop|trailer|commercial|need (a )?track|looking for music|need music/.test(
      hay
    )
  ) {
    return {
      type: "OPEN_ZIKI",
      label: "Draft pitch in Ziki",
      payload: {
        q: `Public opportunity post on X:\n${text}\n\nPick the best track from my catalogue and draft a short pitch (subject + 4 sentences). Note what to attach.`,
      },
    };
  }

  if (/playlist|curator|submit your music|editorial/.test(hay)) {
    return {
      type: "DRAFT_OUTREACH",
      label: "Draft playlist note",
      payload: {
        topic: text.slice(0, 80),
        q: `Draft a short playlist/curator note based on this public post:\n${text}`,
      },
    };
  }

  return {
    type: "OPEN_ZIKI",
    label: "Review in Ziki",
    payload: {
      q: `Music-industry signal from X:\n${text}\nOne clear next move for me?`,
    },
  };
}

export function xPostsToProposals(
  posts: XTweet[],
  now = Date.now()
): AgentProposal[] {
  return posts.map((t, i) => {
    const text = t.text.replace(/\s+/g, " ").trim();
    const title =
      text.length > 88 ? `${text.slice(0, 85)}…` : text || "X market signal";
    const url = `https://x.com/i/status/${t.id}`;
    const body = [
      "Public post — opportunity may be open to independents globally.",
      `Source: X · ${url}`,
    ].join("\n");

    return {
      id: `x-${dayStamp(t.created_at)}-${t.id}`,
      title,
      body: body.slice(0, 400),
      urgency: i < 3 ? ("today" as const) : ("this_week" as const),
      impact: /sync|supervisor|label|a&r|looking for music|need a track|unsigned|playlist/i.test(
        text
      )
        ? ("high" as const)
        : ("medium" as const),
      source: "webhook" as const,
      action: inferAction(text),
      status: "pending" as const,
      createdAt: now - i * 1000,
    };
  });
}

export async function loadXMarketProposals(): Promise<AgentProposal[]> {
  const posts = await fetchXMarketPosts();
  return xPostsToProposals(posts);
}
