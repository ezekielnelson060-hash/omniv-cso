import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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
      return NextResponse.json({ error: "Max 5MB" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Use JPEG, PNG, WebP, or GIF" },
        { status: 400 }
      );
    }

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "image/gif"
            ? "gif"
            : "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("discovery-covers")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("cover upload", error);
      return NextResponse.json(
        {
          error:
            error.message.includes("Bucket") || error.message.includes("not found")
              ? "Run migration 032 (discovery-covers bucket) in Supabase"
              : error.message,
        },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("discovery-covers").getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, path });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
