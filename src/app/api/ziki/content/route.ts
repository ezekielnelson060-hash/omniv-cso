import { NextResponse } from "next/server";
import { zikiComplete } from "@/lib/gemini";

const CONTENT_TYPES = [
  "instagram_caption",
  "tiktok_script",
  "email_subject",
  "email_body",
  "bio_cta",
  "release_announcement",
  "story_sequence",
] as const;

type ContentType = (typeof CONTENT_TYPES)[number];

/**
 * Ziki AI content generation — structured marketing copy from artist context.
 * POST { type, brief?, context? }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      type?: string;
      brief?: string;
      context?: string;
      artistName?: string;
      tone?: string;
    };

    const type = (body.type || "instagram_caption") as ContentType;
    if (!CONTENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${CONTENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const name = body.artistName || "the artist";
    const tone = body.tone || "confident, clear, premium";
    const brief = body.brief?.trim() || "Next release / growth push";

    const system = `You are Ziki, Omniv CSO, writing marketing content for ${name}.
Tone: ${tone}. Never invent fake metrics or demo artists.
Return ONLY the content requested — no preamble.
Use bold **headings** only when multiple variants are useful.
Artist context:\n${body.context || "(minimal context — stay general but useful)"}`;

    const prompts: Record<ContentType, string> = {
      instagram_caption: `Write 3 Instagram caption options for ${name} about: ${brief}.
Each: hook line + body + CTA. Max 120 words each. Label **Option A/B/C**.`,
      tiktok_script: `Write a 20–30 second TikTok/Reels script for ${name} about: ${brief}.
Include on-screen text cues and spoken lines. Structure: Hook / Body / CTA.`,
      email_subject: `Write 5 email subject lines for ${name} about: ${brief}. Numbered list. Max 8 words each.`,
      email_body: `Write one short email (under 150 words) for ${name} about: ${brief}.
Include subject suggestion, greeting, body, CTA, sign-off.`,
      bio_cta: `Write 3 Instagram/TikTok bio CTA lines driving to a fan gate for ${name}. Topic: ${brief}.`,
      release_announcement: `Write a multi-platform release announcement pack for ${name}: ${brief}.
Sections: **Instagram**, **TikTok**, **Email**, **Stories**.`,
      story_sequence: `Write a 4-frame Stories sequence for ${name} about: ${brief}.
Frame 1–4: visual direction + text overlay + optional sticker.`,
    };

    const result = await zikiComplete(prompts[type], system);
    return NextResponse.json({
      text: result.text,
      source: result.source,
      type,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Content generation failed" }, { status: 500 });
  }
}
