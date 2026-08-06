/**
 * Ziki model gateway.
 * Multimodal audio/image/video analysis is Gemini-only.
 *
 * Env:
 *   GROQ_API_KEY       – free fast text (recommended no-cash path)
 *   GROQ_MODEL         – default llama-3.3-70b-versatile
 *   GEMINI_API_KEY     – Gemini (text + audio; free quota limited)
 *   GEMINI_MODEL       – optional pin
 *   ANTHROPIC_API_KEY  – Claude (paid credits)
 *   CLAUDE_MODEL       – preferred Claude model
 *   ZIKI_PROVIDER      – auto | groq | gemini | claude  (default auto)
 *
 * No cash: ZIKI_PROVIDER=groq + GROQ_API_KEY from console.groq.com
 */

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function isZikiModelConfigured(): boolean {
  return isClaudeConfigured() || isGeminiConfigured() || isGroqConfigured();
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

type Provider = "auto" | "claude" | "gemini" | "groq";

function providerMode(): Provider {
  const p = (process.env.ZIKI_PROVIDER || "auto").trim().toLowerCase();
  if (p === "claude" || p === "gemini" || p === "groq") return p;
  return "auto";
}

const GROQ_CANDIDATES = [
  process.env.GROQ_MODEL?.trim(),
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

const GEMINI_CANDIDATES = [
  process.env.GEMINI_MODEL?.trim(),
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
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

async function tryGroq(
  system: string,
  userMessage: string
): Promise<{ text: string; model: string } | null> {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;
  for (const model of GROQ_CANDIDATES) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          max_tokens: 4096,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMessage },
          ],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        lastProviderDetail = `Groq ${model} → HTTP ${res.status}: ${body.slice(0, 280)}`;
        console.error("Groq error", model, res.status, body.slice(0, 300));
        if (res.status === 401 || res.status === 403) break;
        if (res.status === 404 || res.status === 429) continue;
        break;
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      if (text) return { text, model };
      lastProviderDetail = `Groq ${model} → empty content`;
    } catch (e) {
      lastProviderDetail = `Groq exception: ${e instanceof Error ? e.message : String(e)}`;
      console.error("Groq exception", e);
    }
  }
  return null;
}

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
        lastProviderDetail = "Anthropic has no credits. Using Gemini/Groq if configured.";
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
      if (result.status === 404 || result.status === 429) continue;
      break;
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

export type ZikiSource = "claude" | "gemini" | "groq" | "local";

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
        text: `**Audio analysis needs Gemini**\n\nText chat can use Groq (free). For demos, set **GEMINI_API_KEY** when quota resets.`,
        source: "local",
      };
    }
    return {
      text: `**Could not analyse the attachment**\n\nGemini may be rate-limited. Text chat still works with Groq.`,
      source: "local",
    };
  }

  if (mode === "groq") {
    if (!isGroqConfigured()) {
      return {
        text: `**Groq not configured**\n\n1. Free key: console.groq.com\n2. Vercel Production: **GROQ_API_KEY**=gsk_...\n3. **ZIKI_PROVIDER**=groq\n4. Redeploy`,
        source: "local",
      };
    }
    const groq = await tryGroq(system, userMessage);
    if (groq) return { text: groq.text, source: "groq", model: groq.model };
    const detail = lastProviderDetail
      ? `\n\nDetail: ${lastProviderDetail.slice(0, 400)}`
      : "";
    return {
      text: `**Groq rejected the request**${detail}\n\nCheck GROQ_API_KEY and Redeploy Production.`,
      source: "local",
    };
  }

  if (mode === "gemini") {
    if (!isGeminiConfigured()) {
      return {
        text: `**Gemini not configured**\n\nSet **GEMINI_API_KEY** or switch to **ZIKI_PROVIDER**=groq for free text.`,
        source: "local",
      };
    }
    const gemini = await tryGemini(system, userMessage);
    if (gemini) return { text: gemini.text, source: "gemini", model: gemini.model };
    const groq = await tryGroq(system, userMessage);
    if (groq) return { text: groq.text, source: "groq", model: groq.model };
    const detail = lastProviderDetail
      ? `\n\nDetail: ${lastProviderDetail.slice(0, 400)}`
      : "";
    if (/429|quota/i.test(lastProviderDetail + detail)) {
      return {
        text: `**Gemini quota used (429)**\n\nSet **ZIKI_PROVIDER**=groq + **GROQ_API_KEY** (free at console.groq.com), then Redeploy.`,
        source: "local",
      };
    }
    return {
      text: `**Gemini rejected the request**${detail}`,
      source: "local",
    };
  }

  if (mode === "auto") {
    const groq = await tryGroq(system, userMessage);
    if (groq) return { text: groq.text, source: "groq", model: groq.model };
    const gemini = await tryGemini(system, userMessage);
    if (gemini) return { text: gemini.text, source: "gemini", model: gemini.model };
    const claude = await tryClaude(system, userMessage);
    if (claude) return { text: claude.text, source: "claude", model: claude.model };
  }

  if (mode === "claude") {
    const claude = await tryClaude(system, userMessage);
    if (claude) return { text: claude.text, source: "claude", model: claude.model };
    const groq = await tryGroq(system, userMessage);
    if (groq) return { text: groq.text, source: "groq", model: groq.model };
    const gemini = await tryGemini(system, userMessage);
    if (gemini) return { text: gemini.text, source: "gemini", model: gemini.model };
  }

  if (!isZikiModelConfigured()) {
    return {
      text: `**Model offline**\n\nNo cash path: **GROQ_API_KEY** from console.groq.com + **ZIKI_PROVIDER**=groq → Redeploy Production.`,
      source: "local",
    };
  }

  const detail = lastProviderDetail
    ? `\n\nDetail: ${lastProviderDetail.slice(0, 400)}`
    : "";
  return {
    text: `**Provider error**${detail}\n\nTry **ZIKI_PROVIDER**=groq + **GROQ_API_KEY** (free), then Redeploy.`,
    source: "local",
  };
}
