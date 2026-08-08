import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ArtistBrain } from "@/types";
import { zikiComplete, isGeminiConfigured } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      opportunity?: string;
      target?: string;
    };
    const opportunity = (body.opportunity || "General press").slice(0, 200);
    const target = body.target || "blog";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, artist_brain, platforms, social_links")
      .eq("id", user.id)
      .maybeSingle();

    const brain = (profile?.artist_brain as ArtistBrain) || null;
    const name =
      brain?.stageName || brain?.name || profile?.full_name || "Artist";
    const genre =
      brain?.genre?.filter((g) => g && g !== "TBD").join(", ") || "Independent";
    const dream = brain?.bigDream || brain?.goals?.[0] || "";
    const style = brain?.musicStyle || "";
    const links = (profile?.social_links || {}) as Record<string, string>;

    let bodyMd = "";

    if (isGeminiConfigured()) {
      const prompt = `Write a professional one-sheet / EPK section in markdown for ${name}.
Target: ${target}. Opportunity: ${opportunity}.
Genre: ${genre}. Style: ${style}. Big dream: ${dream}.
Platforms: ${JSON.stringify(links)}.
Include: Bio (120 words), Sound, Notable facts, Current ask, Contact line.
No # headings larger than ##. No hype fluff. Manager-grade.`;
      const result = await zikiComplete(prompt);
      bodyMd = result.text || "";
    }

    if (!bodyMd || bodyMd.length < 80) {
      bodyMd = `## ${name} — One-sheet

**Genre:** ${genre}
**Stage:** ${brain?.careerStage || "emerging"}

### Bio
${name} is an independent artist working ${genre.toLowerCase()}. ${
        style ? `Sound: ${style.slice(0, 180)}.` : ""
      } ${dream ? `Direction: ${dream.slice(0, 120)}.` : ""}

### Current ask
${opportunity}

### Links
${
        Object.entries(links)
          .filter(([, v]) => v)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join("\n") || "- Add links in Settings"
      }

### Contact
Via Omniv artist desk — reply to this kit.
`;
    }

    try {
      await supabase.from("press_kits").insert({
        user_id: user.id,
        title: `${name} — ${opportunity}`.slice(0, 120),
        opportunity,
        body_md: bodyMd,
      });
    } catch {
      /* table optional until SQL run */
    }

    return NextResponse.json({ ok: true, markdown: bodyMd, title: name });
  } catch (e) {
    console.error("press-kit", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
