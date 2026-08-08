/**
 * Ziki model gateway.
 * Multimodal audio/image/video analysis is Gemini-only.
 *
 * Env:
 *   GROQ_API_KEY, GROQ_MODEL
 *   GEMINI_API_KEY, GEMINI_MODEL
 *   ANTHROPIC_API_KEY, CLAUDE_MODEL
 *   XAI_API_KEY, XAI_MODEL (default grok-2-latest)
 *   ZIKI_PROVIDER = auto | xai | groq | gemini | claude
 *
 * Grok: ZIKI_PROVIDER=xai + XAI_API_KEY → Redeploy
 * No cash: ZIKI_PROVIDER=groq + GROQ_API_KEY
 */

import { isXaiConfigured, tryXai as tryXaiCall } from "@/lib/xai";

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
  return (
    isXaiConfigured() ||
    isClaudeConfigured() ||
    isGeminiConfigured() ||
    isGroqConfigured()
  );
}

export type ZikiAttachment = {
  name: string;
  mimeType: string;
  data?: string;
  fileUri?: string;
};

const DEFAULT_SYSTEM = `You are Ziki — the strategist inside Omniv for independent artists, managers, and labels.

Talk like a sharp manager on WhatsApp: direct, specific, human. No corporate titles. Never say "as your CSO", "as an AI", or "Chief Strategy Officer".

You know this product and you route people to the right place:
- Command Center (/crm): fan list, cities, rooms, tips, gatherings
- Moves (/opportunities): ranked next actions tied to their Big Dream
- Catalogue: upload tracks so Omniv can rank real inventory
- Release: stress-test timing before a drop
- Content: brief and ship creative
- Progress (/analytics): whether they are moving toward the dream
- Agent (/notifications): daily proposals to confirm
- Discover: A&R view of rising artists (labels/managers)
- Settings: profile, links, billing, team, Big Dream / Artist Brain

When they ask what to do, prefer one concrete move and name the Omniv screen if it helps. When they chat casually, answer casually — no forced briefing template.

Rules:
- Use Artist Brain (genre, stage, Big Dream, links) when present. Never invent stream counts or demo artists.
- Prefer exact posts, hooks, shot lists, email openers when content is the ask.
- If market data is missing, say what is inferred vs what they should verify in Spotify for Artists.
- Audio attachments: A&R read — arrangement, hook, energy, commercial window for THIS artist.
- End strategy answers with one clear Next Move.

Forbidden: generic hustle slogans, invented metrics as fact, empty cheerleading, repeating CSO framing.`;

type Provider = "auto" | "claude" | "gemini" | "groq" | "xai";

function providerMode(): Provider {
  const p = (process.env.ZIKI_PROVIDER || "auto").trim().toLowerCase();
  if (p === "claude" || p === "gemini" || p === "groq" || p === "xai") return p;
  if (p === "grok") return "xai";
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

async function tryXai(
  system: string,
  userMessage: string
): Promise<{ text: string; model: string } | null> {
  const r = await tryXaiCall(system, userMessage);
  if (!r) return null;
  if (!r.text) {
    if (r.detail) lastProviderDetail = r.detail;
    return null;
  }
  return { text: r.text, model: r.model };
}

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
        lastProviderDetail =
          "Anthropic has no credits. Using Gemini/Groq if configured.";
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
      const result = await callGemini(
        key,
        model,
        system,
        userMessage,
        attachments
      );
      if (result.ok) return { text: result.text, model: result.model };
      lastStatus = result.status;
      lastBody = result.body;
      console.error(
        "Gemini error",
        model,
        result.status,
        result.body.slice(0, 300)
      );
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

export type ZikiSource = "claude" | "gemini" | "groq" | "xai" | "local";

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
    if (gemini)
      return { text: gemini.text, source: "gemini", model: gemini.model };
    if (!isGeminiConfigured()) {
      return {
        text: `**Audio analysis needs Gemini**\n\nText chat can use Groq or xAI. Set **GEMINI_API_KEY** for demos.`,
        source: "local",
      };
    }
    return {
      text: `**Could not analyse the attachment**\n\nGemini may be rate-limited. Text chat still works with xAI/Groq.`,
      source: "local",
    };
  }

  if (mode === "xai") {
    if (!isXaiConfigured()) {
      return {
        text: `**xAI not configured**\n\n1. Key from console.x.ai\n2. Vercel: **XAI_API_KEY**\n3. **XAI_MODEL**=grok-2-latest\n4. **ZIKI_PROVIDER**=xai\n5. Redeploy Production`,
        source: "local",
      };
    }
    const xai = await tryXai(system, userMessage);
    if (xai) return { text: xai.text, source: "xai", model: xai.model };
    const detail = lastProviderDetail
      ? `\n\nDetail: ${lastProviderDetail.slice(0, 400)}`
      : "";
    return { text: `**xAI failed**${detail}`, source: "local" };
  }

  if (mode === "groq") {
    if (!isGroqConfigured()) {
      return {
        text: `**Groq not configured**\n\n1. Free key: console.groq.com\n2. Vercel: **GROQ_API_KEY**\n3. **ZIKI_PROVIDER**=groq\n4. Redeploy`,
        source: "local",
      };
    }
    const groq = await tryGroq(system, userMessage);
    if (groq) return { text: groq.text, source: "groq", model: groq.model };
    const detail = lastProviderDetail
      ? `\n\nDetail: ${lastProviderDetail.slice(0, 400)}`
      : "";
    return {
      text: `**Groq rejected the request**${detail}`,
      source: "local",
    };
  }

  if (mode === "gemini") {
    if (!isGeminiConfigured()) {
      return {
        text: `**Gemini not configured**\n\nSet **GEMINI_API_KEY** or **ZIKI_PROVIDER**=xai / groq.`,
        source: "local",
      };
    }
    const gemini = await tryGemini(system, userMessage);
    if (gemini)
      return { text: gemini.text, source: "gemini", model: gemini.model };
    const xai = await tryXai(system, userMessage);
    if (xai) return { text: xai.text, source: "xai", model: xai.model };
    const groq = await tryGroq(system, userMessage);
    if (groq) return { text: groq.text, source: "groq", model: groq.model };
    const detail = lastProviderDetail
      ? `\n\nDetail: ${lastProviderDetail.slice(0, 400)}`
      : "";
    return { text: `**Gemini rejected the request**${detail}`, source: "local" };
  }

  if (mode === "auto") {
    const xai = await tryXai(system, userMessage);
    if (xai) return { text: xai.text, source: "xai", model: xai.model };
    const groq = await tryGroq(system, userMessage);
    if (groq) return { text: groq.text, source: "groq", model: groq.model };
    const gemini = await tryGemini(system, userMessage);
    if (gemini)
      return { text: gemini.text, source: "gemini", model: gemini.model };
    const claude = await tryClaude(system, userMessage);
    if (claude)
      return { text: claude.text, source: "claude", model: claude.model };
  }

  if (mode === "claude") {
    const claude = await tryClaude(system, userMessage);
    if (claude)
      return { text: claude.text, source: "claude", model: claude.model };
    const xai = await tryXai(system, userMessage);
    if (xai) return { text: xai.text, source: "xai", model: xai.model };
    const groq = await tryGroq(system, userMessage);
    if (groq) return { text: groq.text, source: "groq", model: groq.model };
    const gemini = await tryGemini(system, userMessage);
    if (gemini)
      return { text: gemini.text, source: "gemini", model: gemini.model };
  }

  if (!isZikiModelConfigured()) {
    return {
      text: `**Model offline**\n\nSet **XAI_API_KEY** + **ZIKI_PROVIDER**=xai, or **GROQ_API_KEY** + **ZIKI_PROVIDER**=groq → Redeploy.`,
      source: "local",
    };
  }

  const detail = lastProviderDetail
    ? `\n\nDetail: ${lastProviderDetail.slice(0, 400)}`
    : "";
  return {
    text: `**Provider error**${detail}\n\nTry **ZIKI_PROVIDER**=xai or groq, then Redeploy.`,
    source: "local",
  };
}
