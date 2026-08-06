/**
 * Ziki model gateway: Claude first (when configured), Gemini fallback.
 * Multimodal audio/image/video analysis is Gemini-only.
 *
 * Env:
 *   ANTHROPIC_API_KEY  – Claude (needs paid credits)
 *   CLAUDE_MODEL       – preferred model
 *   GEMINI_API_KEY     – Gemini (free-tier friendly)
 *   GEMINI_MODEL       – optional pin
 *   ZIKI_PROVIDER      – auto | claude | gemini  (default auto)
 *
 * No cash: set ZIKI_PROVIDER=gemini and GEMINI_API_KEY only. Redeploy required.
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

export type ZikiAttachment = {
  name: string;
  mimeType: string;
  data?: string;
  fileUri?: string;
};

const DEFAULT_SYSTEM = `You are Ziki, Virtual Chief Strategy Officer and Artist Manager inside Omniv.

You operate at music-industry level: managers, labels, independent operators. You are not a tip blog and not a generic chatbot.

Voice and structure:
- Write like a sharp manager who has roster skin in the game. Opinionated when evidence supports it.
- Prefer one hard call over five soft options. "Do not release yet" is allowed.
- Default to natural conversation like a senior manager on Slack or Claude: clear paragraphs, no forced briefing template.
- Only use section labels (The Play, Verdict, Next Move) when the user asks for a plan, stress-test, or briefing. Casual and market questions get direct answers.
- Prefer concrete numbers, cities, rooms, windows, and formats over vague advice.
- Personalise hard to the artist context block (name, genre, stage, Big Dream, goals, platforms, scores). Never invent a different artist identity.
- When a Big Dream is present, treat it as the north star. Weekly moves must compound toward it. Call out work that is busy but off-dream.
- Never use demo names (Nova Hex, Legacy Build) unless that is the user's real stage name.
- Full answers. Do not truncate mid-thought. Cover the decision, the why, and the next move when strategy is the ask.
- When the user asks casually, answer as a normal high-end strategist chat, not only a six-heading template.
- When they need a plan, go deep: timing, platforms, creative, risk, monetisation.
- If live market data is unavailable, say what is inferred vs confirmed and what to verify in Spotify for Artists / platform analytics.

When the user attaches AUDIO (demo, single, mix):
- Listen as A&R + manager. Assess arrangement, hook strength, energy arc, commercial window, and risk for THIS artist's stage and genre.
- Align every recommendation to the Artist Brain (genre, goals, stage). Do not invent stream counts.
- Call out the single highest-impact change before release when relevant.
- If a TRACK PASSPORT block is present (BPM, peak/RMS, duration), treat those as measured client estimates and use them in The Play / Tactical Advice. Still listen to the audio for structure and commercial feel.

When they attach images or video:
- Treat as cover art, content frames, or campaign assets and judge fit for platforms and brand voice.

Forbidden:
- Generic hustle slogans
- Invented stream counts presented as fact
- Empty cheerleading
- Forced briefing headings on casual questions

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

const CLAUDE_CANDIDATES = [
  process.env.CLAUDE_MODEL?.trim(),
  "claude-sonnet-4-6",
  "claude-sonnet-4-20250514",
  "claude-3-5-sonnet-latest",
  "claude-3-5-sonnet-20241022",
].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

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
    attachments?.some(
      (a) =>
        (a.data || a.fileUri) &&
        isMultimodalMime(normalizeMime(a.mimeType, a.name))
    )
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
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { fileUri: string; mimeType: string } };

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
      if (!a.data && !a.fileUri) continue;
      const mime = normalizeMime(a.mimeType, a.name);
      if (!isMultimodalMime(mime)) continue;
      if (AUDIO_MIME.has(mime) || mime.startsWith("audio/")) {
        if (audioUsed) continue;
        audioUsed = true;
      }
      const mimeOut = mime === "audio/mpeg" ? "audio/mp3" : mime;
      if (a.fileUri) {
        parts.push({ fileData: { fileUri: a.fileUri, mimeType: mimeOut } });
      } else if (a.data) {
        parts.push({ inlineData: { mimeType: mimeOut, data: a.data } });
      }
    }
  }

  async function once(withSearch: boolean) {
    const body: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    };
    if (withSearch && !hasMultimodal(attachments)) {
      body.tools = [{ google_search: {} }];
    }
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  let res = await once(true);
  if (!res.ok) res = await once(false);
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

let lastProviderDetail = "";

async function tryClaude(
  system: string,
  userMessage: string
): Promise<{ text: string; model: string } | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  for (const model of CLAUDE_CANDIDATES) {
    try {
      const result = await callClaude(key, model, system, userMessage);
      if (result.ok) return { text: result.text, model: result.model };
      const snippet = result.body.slice(0, 280);
      lastProviderDetail = `Claude ${model} → HTTP ${result.status}: ${snippet}`;
      console.error("Claude error", model, result.status, snippet);
      if (result.status === 401 || result.status === 403) break;
      if (
        result.status === 400 &&
        /credit balance|billing|purchase credits|too low/i.test(snippet)
      ) {
        lastProviderDetail =
          "Anthropic has no credits. Using Gemini if configured.";
        break;
      }
      if (result.status !== 404 && result.status !== 400) break;
    } catch (e) {
      lastProviderDetail = `Claude exception: ${e instanceof Error ? e.message : String(e)}`;
      console.error("Claude exception", e);
    }
  }
  return null;
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
    lastProviderDetail =
      lastProviderDetail ||
      `Gemini → HTTP ${lastStatus}: ${lastBody.slice(0, 200)}`;
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
  lastProviderDetail = "";

  if (multimodal) {
    const gemini = await tryGemini(system, userMessage, attachments);
    if (gemini) return { text: gemini.text, source: "gemini", model: gemini.model };
    if (!isGeminiConfigured()) {
      return {
        text: `**Audio analysis needs Gemini**\n\nSet **GEMINI_API_KEY** in Vercel Production and redeploy.`,
        source: "local",
      };
    }
    return {
      text: `**Could not analyse the attachment**\n\nCheck size, format, and Vercel logs.`,
      source: "local",
    };
  }

  // Pure Gemini: never call Anthropic (no credit noise)
  if (mode === "gemini") {
    if (!isGeminiConfigured()) {
      return {
        text: `**Gemini not configured**\n\nZIKI_PROVIDER is gemini but **GEMINI_API_KEY** is missing in Vercel Production.\n\n1. Add GEMINI_API_KEY from aistudio.google.com/apikey\n2. Confirm scope = Production\n3. Redeploy (required after env changes)`,
        source: "local",
      };
    }
    const gemini = await tryGemini(system, userMessage);
    if (gemini) return { text: gemini.text, source: "gemini", model: gemini.model };
    const detail = lastProviderDetail
      ? `\n\nDetail: ${lastProviderDetail.slice(0, 400)}`
      : "";
    return {
      text: `**Gemini rejected the request**${detail}\n\nCheck the key is valid, not restricted, and Production was redeployed.`,
      source: "local",
    };
  }

  const wantClaude = mode === "auto" || mode === "claude";

  if (wantClaude) {
    const claude = await tryClaude(system, userMessage);
    if (claude) return { text: claude.text, source: "claude", model: claude.model };
  }

  const gemini = await tryGemini(system, userMessage);
  if (gemini) return { text: gemini.text, source: "gemini", model: gemini.model };

  if (!isClaudeConfigured() && !isGeminiConfigured()) {
    return {
      text: `**Model offline**\n\nNo cash path: set **GEMINI_API_KEY** + **ZIKI_PROVIDER**=gemini in Vercel Production, then Redeploy.`,
      source: "local",
    };
  }

  if (!isGeminiConfigured()) {
    return {
      text: `**Need Gemini for free path**\n\nClaude failed or has no credits. Add **GEMINI_API_KEY** and set **ZIKI_PROVIDER**=gemini, then Redeploy Production.`,
      source: "local",
    };
  }

  const detail = lastProviderDetail
    ? `\n\nDetail: ${lastProviderDetail.slice(0, 400)}`
    : "";
  return {
    text: `**Provider error**${detail}\n\nBoth Claude and Gemini failed. Verify GEMINI_API_KEY in Production and Redeploy.`,
    source: "local",
  };
}
