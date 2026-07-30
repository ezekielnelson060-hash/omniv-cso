/**
 * Ziki via Google Gemini (free tier friendly).
 * Set GEMINI_API_KEY in Vercel. Model defaults to gemini-2.5-flash.
 */

import { simulateZikiReply } from "@/data/mock";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function zikiComplete(
  userMessage: string,
  systemContext?: string
): Promise<{ text: string; source: "gemini" | "mock" }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return { text: simulateZikiReply(userMessage), source: "mock" };
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const system =
    systemContext ??
    `You are Ziki, the AI Chief Strategy Officer inside Omniv — a strategy OS for independent artists, managers, and labels.
Answer ONLY as an executive briefing with clear sections:
- What to do
- Why this matters
- When
- How
- Priority (High / Medium / Low)
- Expected outcome
Be concise, confident, and actionable. No fluff. No chatbot tone.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!res.ok) {
      console.error("Gemini error", res.status, await res.text());
      return { text: simulateZikiReply(userMessage), source: "mock" };
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();

    if (!text) {
      return { text: simulateZikiReply(userMessage), source: "mock" };
    }
    return { text, source: "gemini" };
  } catch (e) {
    console.error("Gemini fetch failed", e);
    return { text: simulateZikiReply(userMessage), source: "mock" };
  }
}
