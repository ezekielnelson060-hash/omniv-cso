import { NextResponse } from "next/server";
import { zikiComplete } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      mode?: "content" | "release";
      fileName?: string;
      fileType?: string;
      notes?: string;
      artistName?: string;
      platform?: string;
    };

    const mode = body.mode || "content";
    const fileName = body.fileName || "untitled";
    const artist = body.artistName || "this artist";

    const prompt =
      mode === "release"
        ? `You are Ziki, Omniv CSO. Simulate a release strategy for an unreleased track/video.

File: ${fileName} (${body.fileType || "unknown"})
Artist context: ${artist}
Notes: ${body.notes || "none"}

Return a structured executive briefing with:
1. Commercial potential 0-100 (estimate + rationale)
2. Viral potential 0-100
3. Playlist potential 0-100
4. Risk score 0-100
5. Best release window (date range + why)
6. Competition / timing risks
7. 5-step marketing plan
8. What extra data would raise confidence

Be specific to the filename/notes. No generic demo artist names.`
        : `You are Ziki, Omniv CSO. Analyse content for ${artist}.

File: ${fileName} (${body.fileType || "unknown"})
Platform target: ${body.platform || "TikTok"}
Notes: ${body.notes || "none"}

Return:
1. Overall score 0-100
2. Hook / retention / editing / emotion scores 0-100
3. Viral probability assessment
4. Why it may or may not travel
5. Risks
6. Concrete improvement list (max 5)
7. Platform-native caption + hook ideas for ${body.platform || "TikTok"}

Personalize to the file name and notes. Never use sample/demo catalogue names.`;

    const result = await zikiComplete(prompt);
    return NextResponse.json({
      text: result.text,
      source: result.source,
      fileName,
      mode,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
