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
- Never invent demo artists (no Nova Hex, no Legacy Build as a fake brand unless that is the user's real stage name).
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

/** Models to try in order when GEMINI_MODEL is unset or returns 404 */
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

async function callGemini(
  key: string,
  model: string,
  system: string,
  userMessage: string
): Promise<{ ok: true; text: string } | { ok: false; status: number; body: string }> {
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
    const body = await res.text();
    return { ok: false, status: res.status, body };
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();

  if (!text) {
    return { ok: false, status: 204, body: "empty candidates" };
  }
  return { ok: true, text };
}

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

  try {
    let lastStatus = 0;
    let lastBody = "";

    for (const model of MODEL_CANDIDATES) {
      const result = await callGemini(key, model, system, userMessage);
      if (result.ok) {
        return { text: result.text, source: "gemini" };
      }
      lastStatus = result.status;
      lastBody = result.body;
      console.error("Gemini error", model, result.status, result.body);
      // Only fall through on 404 (model not found). Other errors stop.
      if (result.status !== 404) break;
    }

    let hint = "Check the key is valid and the model name is correct.";
    if (lastStatus === 400)
      hint =
        "Bad request — set GEMINI_MODEL=gemini-1.5-flash in Vercel and redeploy.";
    if (lastStatus === 404)
      hint =
        "Model not found (404). In Vercel set **GEMINI_MODEL=gemini-1.5-flash** (or gemini-2.0-flash if your key supports it), then Redeploy. Key from aistudio.google.com/apikey.";
    if (lastStatus === 403 || lastStatus === 401)
      hint =
        "Invalid or restricted key. Create a new key at aistudio.google.com/apikey and update GEMINI_API_KEY.";
    if (lastStatus === 429)
      hint = "Rate limit hit — wait a minute and retry (free tier).";

    return {
      text: `**Briefing unavailable** (${lastStatus})\n\n${hint}\n\nDetail: ${lastBody.slice(0, 180)}`,
      source: "local",
    };
  } catch (e) {
    console.error("Gemini fetch failed", e);
    return {
      text: `**Network error**\n\nCould not reach Gemini. Try again in a moment.`,
      source: "local",
    };
  }
}
