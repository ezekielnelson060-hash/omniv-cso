/**
 * Ziki via Google Gemini (AI Studio / generativelanguage API).
 * Models: prefer live 2.5 / 3.x IDs — gemini-2.0-flash and 1.5 are retired/shutdown.
 */

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

const DEFAULT_SYSTEM = `You are Ziki, the AI Chief Strategy Officer inside Omniv.

Your job is not entertainment chat. Your job is to tell this artist, manager, or label the highest-impact next move and how to execute it.

Rules:
- Never invent demo artists (no Nova Hex, no Legacy Build unless that is the user's real stage name).
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

/** Live model IDs (2026). Old 1.5 / 2.0 aliases often 404. */
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL?.trim(),
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

async function callGemini(
  key: string,
  model: string,
  system: string,
  userMessage: string
): Promise<
  { ok: true; text: string; model: string } | { ok: false; status: number; body: string; model: string }
> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
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
    return { ok: false, status: res.status, body, model };
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();

  if (!text) {
    return { ok: false, status: 204, body: "empty candidates", model };
  }
  return { ok: true, text, model };
}

export async function zikiComplete(
  userMessage: string,
  systemContext?: string
): Promise<{ text: string; source: "gemini" | "local"; model?: string }> {
  const key = process.env.GEMINI_API_KEY?.trim();
  const system = systemContext ?? DEFAULT_SYSTEM;

  if (!key) {
    return {
      text: `**Model offline**\n\nAdd **GEMINI_API_KEY** in Vercel → Settings → Environment Variables (Production), then **Redeploy**.\n\nKey from [Google AI Studio](https://aistudio.google.com/apikey).`,
      source: "local",
    };
  }

  try {
    let lastStatus = 0;
    let lastBody = "";
    let lastModel = "";

    for (const model of MODEL_CANDIDATES) {
      const result = await callGemini(key, model, system, userMessage);
      if (result.ok) {
        return { text: result.text, source: "gemini", model: result.model };
      }
      lastStatus = result.status;
      lastBody = result.body;
      lastModel = result.model;
      console.error("Gemini error", model, result.status, result.body.slice(0, 300));
      // Try next model on 404 only
      if (result.status !== 404) break;
    }

    let hint = "Check GEMINI_API_KEY and GEMINI_MODEL on Vercel, then redeploy.";
    if (lastStatus === 400)
      hint =
        "Bad request — set GEMINI_MODEL=gemini-2.5-flash and redeploy.";
    if (lastStatus === 404)
      hint =
        "All candidate models returned 404. Set **GEMINI_MODEL=gemini-2.5-flash** (or gemini-3.6-flash) in Vercel Production env, then Redeploy. Do not use retired gemini-1.5-* or shut-down gemini-2.0-flash alone.";
    if (lastStatus === 403 || lastStatus === 401)
      hint =
        "Invalid API key. Create a new key at aistudio.google.com/apikey — not a Google Cloud service-account key.";
    if (lastStatus === 429)
      hint = "Rate limit — wait ~60s (free tier) and retry.";

    return {
      text: `**Briefing unavailable** (${lastStatus})\n\nLast model tried: \`${lastModel}\`\n\n${hint}\n\nDetail: ${lastBody.slice(0, 200)}`,
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
