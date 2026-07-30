/**
 * Ziki via Google Gemini. Never falls back to Nova Hex demo copy.
 */

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function zikiComplete(
  userMessage: string,
  systemContext?: string
): Promise<{ text: string; source: "gemini" | "local" }> {
  const key = process.env.GEMINI_API_KEY;
  const system =
    systemContext ??
    `You are Ziki, the AI Chief Strategy Officer inside Omniv.
Never invent demo artists (no Nova Hex). Use only the artist context provided.
Answer as an executive briefing with bold headings:
**What to do**
**Why this matters**
**When**
**How**
**Priority**
**Expected outcome**
Be concise and actionable.`;

  if (!key) {
    return {
      text: `**Model offline**\n\nGemini is not configured. Add **GEMINI_API_KEY** in Vercel, redeploy, then ask again.\n\n**What to do:** Settings → Surface scan still works once the key is live.`,
      source: "local",
    };
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 1200,
        },
      }),
    });

    if (!res.ok) {
      console.error("Gemini error", res.status, await res.text());
      return {
        text: `**Briefing unavailable**\n\nThe model returned an error. Verify **GEMINI_API_KEY** and **GEMINI_MODEL**, then retry.`,
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
        text: `**Empty response**\n\nTry a more specific question (release, content, opportunities).`,
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
