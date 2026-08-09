/**
 * xAI Grok client for Ziki text chat.
 * Env: XAI_API_KEY, XAI_MODEL (default grok-4.5)
 *
 * grok-2-* and many grok-3 IDs were retired. Prefer current aliases.
 * Docs: https://docs.x.ai/docs/models
 */

const XAI_CANDIDATES = [
  process.env.XAI_MODEL?.trim(),
  "grok-4.5",
  "grok-4.3",
  "grok-4.3-latest",
  "grok-4.20-non-reasoning",
  "grok-4.20-0309-non-reasoning",
  "grok-3-mini",
  "grok-3",
].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

export function isXaiConfigured(): boolean {
  return Boolean(process.env.XAI_API_KEY?.trim());
}

export async function tryXai(
  system: string,
  userMessage: string
): Promise<{ text: string; model: string; detail?: string } | null> {
  const key = process.env.XAI_API_KEY?.trim();
  if (!key) return null;
  let lastDetail = "";
  for (const model of XAI_CANDIDATES) {
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.55,
          max_tokens: 4096,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMessage },
          ],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        lastDetail = `xAI ${model} → HTTP ${res.status}: ${body.slice(0, 280)}`;
        console.error("xAI error", model, res.status, body.slice(0, 300));
        if (res.status === 401 || res.status === 403) break;
        // Invalid / retired model → try next candidate
        if (
          res.status === 400 ||
          res.status === 404 ||
          res.status === 422 ||
          res.status === 429
        ) {
          continue;
        }
        break;
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      if (text) return { text, model };
      lastDetail = `xAI ${model} → empty content`;
    } catch (e) {
      lastDetail = `xAI exception: ${e instanceof Error ? e.message : String(e)}`;
      console.error("xAI exception", e);
    }
  }
  return lastDetail ? { text: "", model: "", detail: lastDetail } : null;
}
