/**
 * OpenAI wiring for Ziki.
 *
 * COST: Yes — OpenAI charges per token when OPENAI_API_KEY is set.
 * Recommended: gpt-4o-mini (~$0.15 / 1M input, ~$0.60 / 1M output).
 * Without OPENAI_API_KEY, Ziki uses the free local simulator.
 */

import { simulateZikiReply } from "@/data/mock";

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function zikiComplete(
  userMessage: string,
  systemContext?: string
): Promise<{ text: string; source: "openai" | "mock" }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { text: simulateZikiReply(userMessage), source: "mock" };
  }

  const system =
    systemContext ??
    `You are Ziki, the AI Chief Strategy Officer inside Omniv.
Answer as an executive briefing: what to do, why, when, how, priority, expected outcome.
Be concise, confident, and actionable.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI error", res.status, await res.text());
      return { text: simulateZikiReply(userMessage), source: "mock" };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { text: simulateZikiReply(userMessage), source: "mock" };
    }
    return { text, source: "openai" };
  } catch (e) {
    console.error("OpenAI fetch failed", e);
    return { text: simulateZikiReply(userMessage), source: "mock" };
  }
}
