/**
 * Gemini Files API — for demos larger than the inline ~12MB limit.
 * Upload → wait ACTIVE → return file URI for generateContent.
 */

const POLL_MS = 1500;
const POLL_MAX = 40; // ~60s

export type GeminiFileRef = {
  name: string;
  uri: string;
  mimeType: string;
  sizeBytes: number;
};

function apiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY missing");
  return key;
}

/** Poll until file is ACTIVE or FAILED. */
async function waitActive(fileName: string, key: string): Promise<string> {
  for (let i = 0; i < POLL_MAX; i++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${encodeURIComponent(key)}`
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini file status ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      name?: string;
      uri?: string;
      state?: string;
      error?: { message?: string };
    };
    if (data.state === "ACTIVE" && data.uri) return data.uri;
    if (data.state === "FAILED") {
      throw new Error(data.error?.message || "Gemini file processing failed");
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  throw new Error("Gemini file processing timed out");
}

/**
 * Upload raw bytes to Gemini Files API (multipart).
 * Suitable for audio/video under ~50–100MB.
 */
export async function uploadBytesToGeminiFiles(
  bytes: ArrayBuffer | Uint8Array | Buffer,
  mimeType: string,
  displayName: string
): Promise<GeminiFileRef> {
  const key = apiKey();
  const buf =
    bytes instanceof Buffer
      ? bytes
      : Buffer.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);

  const boundary = `omniv_${Date.now().toString(36)}`;
  const meta = JSON.stringify({
    file: { display_name: displayName.slice(0, 120) },
  });

  const preamble = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${meta}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`,
    "utf8"
  );
  const closing = Buffer.from(`\r\n--${boundary}--\r\n`, "utf8");
  const body = Buffer.concat([preamble, buf, closing]);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "X-Goog-Upload-Protocol": "multipart",
      },
      body,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini upload ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    file?: { name?: string; uri?: string; mimeType?: string; state?: string };
    name?: string;
    uri?: string;
    state?: string;
  };

  const fileName = data.file?.name || data.name;
  if (!fileName) {
    throw new Error("Gemini upload returned no file name");
  }

  let uri = data.file?.uri || data.uri;
  if (!uri || (data.file?.state && data.file.state !== "ACTIVE")) {
    uri = await waitActive(fileName, key);
  }

  return {
    name: fileName,
    uri,
    mimeType: data.file?.mimeType || mimeType,
    sizeBytes: buf.length,
  };
}

/** Best-effort delete after analysis (optional cleanup). */
export async function deleteGeminiFile(fileName: string): Promise<void> {
  try {
    const key = apiKey();
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${encodeURIComponent(key)}`,
      { method: "DELETE" }
    );
  } catch {
    /* soft */
  }
}
