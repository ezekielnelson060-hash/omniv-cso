/**
 * Ziki model gateway: Claude first (when configured), Gemini fallback.
 *
 * Env:
 *   ANTHROPIC_API_KEY  – Claude
 *   CLAUDE_MODEL       – default claude-sonnet-4-20250514
 *   GEMINI_API_KEY     – Gemini (fallback / primary if no Anthropic)
 *   GEMINI_MODEL       – optional pin
 *   ZIKI_PROVIDER      – auto | claude | gemini  (default auto)
 *
 * Billing: Claude and Gemini both charge per token on the API.
 * Plan gates (messages/day) live in ziki-usage + billing limits, not in this file.
 */

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function isZikiModelConfigured(): boolean {
  return isClaudeConfigured() || isGeminiConfigured();
}

const DEFAULT_SYSTEM = `You are Ziki, the AI Chief Strategy Officer inside Omniv.

Your job is not entertainment chat. Your job is to tell this artist, manager, or label the highest-impact next move and how to execute it.

Rules:
- Never invent demo artists (no Nova Hex, no Legacy Build unless that is the user's real stage name).
- Use ONLY the artist context provided (genre, stage, goals, platforms, scores, opportunities).
- Lead with user benefit: what they gain if they act (streams, clarity, revenue path, time saved).
- Prefer concrete actions over theory.
- If data is thin, say what to capture next. Do not fabricate metrics.

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

type Provider = "auto" | "claude" | "gemini";

function providerMode(): Provider {
  const p = (process.env.ZIKI_PROVIDER || "auto").trim().toLowerCase();
  if (p === "claude" || p === "gemini") return p;
  return "auto";
}

const GEMINI_CANDIDATES = [
  process.env.GEMINI_MODEL?.trim(),
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-20250514";

async function callClaude(
  key: string,
  model: string,
  system: string,
  userMessage: string
): Promise<
  | { ok: true; text: string; model: string }
  | { ok: false; status: number; body: string; model: string }
> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1400,
      temperature: 0.55,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, status: res.status, body, model };
  }

  const data = (await res.json()) as {
    content?: { type?: string; text?: string }[];
  };
  const text = (data.content || [])
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text || "")
    .join("")
    .trim();

  if (!text) {
    return { ok: false, status: 204, body: "empty content", model };
  }
  return { ok: true, text, model };
}

async function callGemini(
  key: string,
  model: string,
  system: string,
  userMessage: string
): Promise<
  | { ok: true; text: string; model: string }
  | { ok: false; status: number; body: string; model: string }
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

async function tryClaude(
  system: string,
  userMessage: string
): Promise<{ text: string; model: string } | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  try {
    const result = await callClaude(key, CLAUDE_MODEL, system, userMessage);
    if (result.ok) return { text: result.text, model: result.model };
    console.error("Claude error", result.model, result.status, result.body.slice(0, 300));
    return null;
  } catch (e) {
    console.error("Claude exception", e);
    return null;
  }
}

async function tryGemini(
  system: string,
  userMessage: string
): Promise<{ text: string; model: string } | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  let lastStatus = 0;
  let lastBody = "";
  for (const model of GEMINI_CANDIDATES) {
    try {
      const result = await callGemini(key, model, system, userMessage);
      if (result.ok) return { text: result.text, model: result.model };
      lastStatus = result.status;
      lastBody = result.body;
      console.error("Gemini error", model, result.status, result.body.slice(0, 300));
      if (result.status !== 404) break;
    } catch (e) {
      console.error("Gemini exception", model, e);
    }
  }
  if (lastStatus) {
    console.error("Gemini exhausted", lastStatus, lastBody.slice(0, 200));
  }
  return null;
}

export type ZikiSource = "claude" | "gemini" | "local";

export async function zikiComplete(
  userMessage: string,
  systemContext?: string
): Promise<{ text: string; source: ZikiSource; model?: string }> {
  const system = systemContext ?? DEFAULT_SYSTEM;
  const mode = providerMode();

  const wantClaude = mode === "auto" || mode === "claude";
  const wantGemini = mode === "auto" || mode === "gemini";
  // Always allow Gemini as soft fallback when Claude was preferred but failed
  const allowGeminiFallback = mode === "auto" || mode === "claude";

  if (wantClaude) {
    const claude = await tryClaude(system, userMessage);
    if (claude) {
      return { text: claude.text, source: "claude", model: claude.model };
    }
  }

  if (wantGemini || allowGeminiFallback) {
    const gemini = await tryGemini(system, userMessage);
    if (gemini) {
      return { text: gemini.text, source: "gemini", model: gemini.model };
    }
  }

  if (!isClaudeConfigured() && !isGeminiConfigured()) {
    return {
      text: `**Model offline**

Add **ANTHROPIC_API_KEY** (Claude) and/or **GEMINI_API_KEY** in Vercel → Settings → Environment Variables (Production), then **Redeploy**.

Claude: [console.anthropic.com](https://console.anthropic.com/)
Gemini: [Google AI Studio](https://aistudio.google.com/apikey)

Optional: **ZIKI_PROVIDER**=auto|claude|gemini · **CLAUDE_MODEL**=claude-sonnet-4-20250514`,
      source: "local",
    };
  }

  return {
    text: `**Provider error**

Configured keys did not return a response. Check Vercel logs.

- Claude: ANTHROPIC_API_KEY + CLAUDE_MODEL
- Gemini: GEMINI_API_KEY + GEMINI_MODEL=gemini-2.5-flash
- ZIKI_PROVIDER=auto tries Claude first, then Gemini`,
    source: "local",
  };
}
