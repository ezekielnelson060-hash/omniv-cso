/**
 * Ziki model gateway: Claude first (when configured), Gemini fallback.
 * Multimodal audio/image/video analysis is Gemini-only (inline base64).
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

/** Client-sent multimodal parts (base64, no data: prefix). */
export type ZikiAttachment = {
  name: string;
  mimeType: string;
  /** Raw base64 payload */
  data: string;
};

const DEFAULT_SYSTEM = `You are Ziki, Virtual Chief Strategy Officer and Artist Manager inside Omniv.

You operate at music-industry level: managers, labels, independent operators. You are not a tip blog and not a generic chatbot.

Voice and structure:
- Write like a sharp manager who has roster skin in the game. Opinionated when evidence supports it.
- Prefer one hard call over five soft options. "Do not release yet" is allowed.
- Use thick section labels when they fit (The Play, The Ziki Verdict, Next Move, Tactical Advice, The Gap, Timeline). Do not force every label every time.
- Prefer concrete numbers, cities, rooms, windows, and formats over vague advice.
- Personalise hard to the artist context block (name, genre, stage, goals, platforms, scores). Never invent a different artist identity.
- Never use demo names (Nova Hex, Legacy Build) unless that is the user's real stage name.
- Full answers. Do not truncate mid-thought. Cover the decision, the why, and the next move.
- When the user asks casually, answer as a normal high-end strategist chat, not only a six-heading template.
- When they need a plan, go deep: timing, platforms, creative, risk, monetisation.
- If live market data is unavailable, say what is inferred vs confirmed and what to verify in Spotify for Artists / platform analytics.

When the user attaches AUDIO (demo, single, mix):
- Listen as A&R + manager. Assess arrangement, hook strength, energy arc, commercial window, and risk for THIS artist's stage and genre.
- Align every recommendation to the Artist Brain (genre, goals, stage). Do not invent stream counts.
- Call out the single highest-impact change before release when relevant.
- Soft estimates only for BPM/key/loudness unless exact numbers are provided in the prompt.
- Structure useful answers with The Play / Verdict / Next Move when strategy is the ask.

When they attach images or video:
- Treat as cover art, content frames, or campaign assets and judge fit for platforms and brand voice.

Forbidden:
- Generic hustle slogans
- Invented stream counts presented as fact
- Empty cheerleading

Always end with a clear Next Move when strategy is involved.`;

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
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-20250514";

/** Gemini supports these audio MIME types for understanding. */
const AUDIO_MIME = new Set([
  "audio/wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/aiff",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "audio/m4a",
  "audio/mp4",
  "audio/x-m4a",
  "audio/webm",
]);

const IMAGE_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

const VIDEO_MIME = new Set([
  "video/mp4",
  "video/mpeg",
  "video/mov",
  "video/quicktime",
  "video/webm",
  "video/avi",
]);

function normalizeMime(mime: string, name: string): string {
  const m = (mime || "").toLowerCase().trim();
  if (m && m !== "application/octet-stream") return m;
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    mp3: "audio/mp3",
    wav: "audio/wav",
    flac: "audio/flac",
    m4a: "audio/mp4",
    aac: "audio/aac",
    ogg: "audio/ogg",
    aiff: "audio/aiff",
    aif: "audio/aiff",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
  };
  return map[ext] || "application/octet-stream";
}

function isMultimodalMime(mime: string): boolean {
  return (
    AUDIO_MIME.has(mime) ||
    IMAGE_MIME.has(mime) ||
    VIDEO_MIME.has(mime) ||
    mime.startsWith("audio/") ||
    mime.startsWith("image/") ||
    mime.startsWith("video/")
  );
}

function hasMultimodal(attachments?: ZikiAttachment[]): boolean {
  return Boolean(
    attachments?.some((a) => isMultimodalMime(normalizeMime(a.mimeType, a.name)))
  );
}

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
      max_tokens: 4096,
      temperature: 0.7,
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

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

async function callGemini(
  key: string,
  model: string,
  system: string,
  userMessage: string,
  attachments?: ZikiAttachment[]
): Promise<
  | { ok: true; text: string; model: string }
  | { ok: false; status: number; body: string; model: string }
> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const parts: GeminiPart[] = [{ text: userMessage }];

  if (attachments?.length) {
    let audioUsed = false;
    for (const a of attachments) {
      if (!a.data) continue;
      const mime = normalizeMime(a.mimeType, a.name);
      if (!isMultimodalMime(mime)) continue;
      if (AUDIO_MIME.has(mime) || mime.startsWith("audio/")) {
        if (audioUsed) continue;
        audioUsed = true;
      }
      parts.push({
        inlineData: {
          mimeType: mime === "audio/mpeg" ? "audio/mp3" : mime,
          data: a.data,
        },
      });
    }
  }

  async function once(withSearch: boolean) {
    const body: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    };
    if (withSearch && !hasMultimodal(attachments)) {
      body.tools = [{ google_search: {} }];
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res;
  }

  let res = await once(true);
  if (!res.ok) {
    res = await once(false);
  }
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
  userMessage: string,
  attachments?: ZikiAttachment[]
): Promise<{ text: string; model: string } | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  let lastStatus = 0;
  let lastBody = "";
  for (const model of GEMINI_CANDIDATES) {
    try {
      const result = await callGemini(key, model, system, userMessage, attachments);
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
  systemContext?: string,
  attachments?: ZikiAttachment[]
): Promise<{ text: string; source: ZikiSource; model?: string }> {
  const system = systemContext ?? DEFAULT_SYSTEM;
  const mode = providerMode();
  const multimodal = hasMultimodal(attachments);

  if (multimodal) {
    const gemini = await tryGemini(system, userMessage, attachments);
    if (gemini) {
      return { text: gemini.text, source: "gemini", model: gemini.model };
    }
    if (!isGeminiConfigured()) {
      return {
        text: `**Audio analysis needs Gemini**\n\nAttach demos and covers after **GEMINI_API_KEY** is set in Vercel (Production) and redeployed.\n\nClaude handles text strategy; listening to tracks uses Gemini multimodal.`,
        source: "local",
      };
    }
    return {
      text: `**Could not analyse the attachment**\n\nGemini did not return a response. Check file size (keep under ~12 MB inline), format (MP3, WAV, FLAC, M4A, AAC, PNG, JPEG, MP4), and Vercel logs.`,
      source: "local",
    };
  }

  const wantClaude = mode === "auto" || mode === "claude";
  const wantGemini = mode === "auto" || mode === "gemini";
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
      text: `**Model offline**\n\nAdd **ANTHROPIC_API_KEY** (Claude) and/or **GEMINI_API_KEY** in Vercel → Settings → Environment Variables (Production), then **Redeploy**.\n\nClaude: [console.anthropic.com](https://console.anthropic.com/)\nGemini: [Google AI Studio](https://aistudio.google.com/apikey)\n\nOptional: **ZIKI_PROVIDER**=auto|claude|gemini · **CLAUDE_MODEL**=claude-sonnet-4-20250514`,
      source: "local",
    };
  }

  return {
    text: `**Provider error**\n\nConfigured keys did not return a response. Check Vercel logs.\n\n- Claude: ANTHROPIC_API_KEY + CLAUDE_MODEL\n- Gemini: GEMINI_API_KEY + GEMINI_MODEL=gemini-2.5-flash\n- ZIKI_PROVIDER=auto tries Claude first, then Gemini`,
    source: "local",
  };
}
