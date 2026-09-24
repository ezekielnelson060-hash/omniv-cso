import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/aac",
  "audio/ogg",
  "application/pdf",
]);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Max 25MB" }, { status: 400 });
    }

    const type = file.type || "application/octet-stream";
    const name = file.name.toLowerCase();
    const okExt =
      name.endsWith(".mp3") ||
      name.endsWith(".wav") ||
      name.endsWith(".m4a") ||
      name.endsWith(".aac") ||
      name.endsWith(".ogg") ||
      name.endsWith(".pdf");

    if (!ALLOWED.has(type) && !okExt) {
      return NextResponse.json(
        { error: "Use MP3, WAV, M4A, OGG, or PDF" },
        { status: 400 }
      );
    }

    const ext = name.includes(".")
      ? name.split(".").pop()!.slice(0, 5)
      : type.includes("pdf")
        ? "pdf"
        : "mp3";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("discovery-media")
      .upload(path, buffer, {
        contentType: type,
        upsert: false,
      });

    if (error) {
      console.error("media upload", error);
      return NextResponse.json(
        {
          error:
            error.message.includes("Bucket") ||
            error.message.includes("not found")
              ? "Run migration 034 (discovery-media bucket) in Supabase"
              : error.message,
        },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("discovery-media").getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, path, contentType: type });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
