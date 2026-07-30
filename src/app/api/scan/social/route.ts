import { NextResponse } from "next/server";
import { zikiComplete } from "@/lib/gemini";

/**
 * Social / catalogue intelligence without OAuth.
 * User pastes public profile URLs (+ optional notes).
 * Gemini produces an executive scan briefing.
 * No upfront platform developer apps required.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      urls?: string[];
      notes?: string;
      artistName?: string;
    };

    const urls = (body.urls || []).map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0 && !body.notes?.trim()) {
      return NextResponse.json(
        { error: "Provide at least one profile URL or notes" },
        { status: 400 }
      );
    }

    const prompt = `You are scanning an independent artist's public surfaces for career strategy.

Artist: ${body.artistName || "Unknown"}
Profile / catalogue URLs:
${urls.map((u) => `- ${u}`).join("\n") || "(none)"}

Artist notes / pasted bio or stats:
${body.notes || "(none)"}

Produce an executive intelligence briefing with:
1. Surface assessment (what each link implies)
2. Likely audience & positioning
3. Strengths visible from public footprint
4. Gaps / risks
5. Top 3 highest-impact next moves (what / why / when / how / expected outcome)
6. Confidence % and what data would increase confidence

Be concrete. Do not invent exact follower counts you cannot see. State assumptions clearly.`;

    const result = await zikiComplete(prompt);
    return NextResponse.json({
      briefing: result.text,
      source: result.source,
      scannedUrls: urls,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
