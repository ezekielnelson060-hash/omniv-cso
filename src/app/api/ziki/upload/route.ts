import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadBytesToGeminiFiles } from "@/lib/gemini-files";
import { isGeminiConfigured } from "@/lib/gemini";

/** Cap large demos so we don't blow memory on the serverless function. */
const MAX_BYTES = 50 * 1024 * 1024; // 50MB
const MIN_LARGE = 12 * 1024 * 1024; // prefer Files API above this

export const runtime = "nodejs";
export const maxDuration = 60;

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
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };
  return map[ext] || "application/octet-stream";
}

export async function POST(req: Request) {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY required for large file analysis" },
        { status: 503 }
      );
    }

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 });
      }
    } catch {
      /* if supabase misconfigured, still allow upload in dev */
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error: "file_too_large",
          message: `Max ${Math.round(MAX_BYTES / (1024 * 1024))}MB per demo for analysis.`,
        },
        { status: 413 }
      );
    }

    const mimeType = normalizeMime(file.type || "", file.name);
    const bytes = Buffer.from(await file.arrayBuffer());

    const ref = await uploadBytesToGeminiFiles(bytes, mimeType, file.name);

    return NextResponse.json({
      name: file.name,
      mimeType: ref.mimeType,
      fileUri: ref.uri,
      geminiName: ref.name,
      sizeBytes: ref.sizeBytes,
      via: "gemini_files",
      note:
        file.size >= MIN_LARGE
          ? "Uploaded via Gemini Files API (large demo)."
          : "Uploaded via Gemini Files API.",
    });
  } catch (e) {
    console.error("ziki upload", e);
    return NextResponse.json(
      {
        error: "upload_failed",
        message: e instanceof Error ? e.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
