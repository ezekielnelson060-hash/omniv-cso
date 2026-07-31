/**
 * Ziki via Google Gemini.
 * Strategy OS voice — never demo artists, always user-benefit outcomes.
 */

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

const DEFAULT_SYSTEM = `You are Ziki, the AI Chief Strategy Officer inside Omniv.

Your job is not entertainment chat. Your job is to tell this artist, manager, or label the highest-impact next move and how to execute it.

Rules:
- Never invent demo artists (no Nova Hex or similar).
- Use ONLY the artist context provided (genre, stage, goals, platforms, scores, opportunities).
- Lead with user benefit: what they gain if they act (streams, clarity, revenue path, time saved).
- Prefer concrete actions over theory.
- If data is thin, say what to capture next — do not fabricate metrics.

Always structure answers as an executive briefing with bold headings:
**What to do**
**Why this matters for you**
**When**
**How**
**Priority**
**Expected outcome**

Optional when useful:
**Risk if you skip this**
**Alternative**

Be concise. Sound like a senior strategist, not a chatbot.`;

export async function zikiComplete(
  userMessage: string,
  systemContext?: string
): Promise<{ text: string; source: "gemini" | "local" }> {
  const key = process.env.GEMINI_API_KEY;
  const system = systemContext ?? DEFAULT_SYSTEM;

  if (!key) {
    return {
      text: `**Model offline**\n\nAdd **GEMINI_API_KEY** in Vercel → Project → Settings → Environment Variables, then **Redeploy**.\n\nGet a free key at [Google AI Studio](https://aistudio.google.com/apikey) (not App Hub).`,
      source: "local",
    };
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 1400,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Gemini error", res.status, errBody);
      let hint = "Check the key is valid and the model name is correct.";
      if (res.status === 400)
        hint =
          "Bad request — try GEMINI_MODEL=gemini-2.0-flash or gemini-2.5-flash.";
      if (res.status === 403 || res.status === 401)
        hint =
          "Invalid or restricted key. Create a new key at aistudio.google.com/apikey.";
      if (res.status === 429)
        hint = "Rate limit hit — wait a minute and retry (free tier).";
      return {
        text: `**Briefing unavailable** (${res.status})\n\n${hint}\n\nVercel env: **GEMINI_API_KEY** + optional **GEMINI_MODEL**. Redeploy after changing env.`,
        source: "local",
      };
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();

    if (!text) {
      return {
        text: `**Empty response**\n\nAsk something specific: release window, this week's content, or top opportunity.`,
        source: "local",
      };
    }
    return { text, source: "gemini" };
  } catch (e) {
    console.error("Gemini fetch failed", e);
    return {
      text: `**Network error**\n\nCould not reach Gemini. Try again in a moment.`,
      source: "local",
    };
  }
}
