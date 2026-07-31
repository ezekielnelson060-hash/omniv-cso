import { NextResponse } from "next/server";

/**
 * Safe diagnostics — never returns secret values, only present/missing.
 * GET /api/health
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const gemini = process.env.GEMINI_API_KEY || "";
  const geminiModel = process.env.GEMINI_MODEL || "";
  const flwPub = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "";
  const flwSec = process.env.FLW_SECRET_KEY || "";

  const refMatch = supabaseUrl.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  const projectRef = refMatch?.[1] || null;

  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(supabaseUrl),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(anon),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(service),
      GEMINI_API_KEY: Boolean(gemini),
      GEMINI_MODEL: geminiModel || null,
      NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY: Boolean(flwPub),
      FLW_SECRET_KEY: Boolean(flwSec),
    },
    hints: {
      supabaseProjectRef: projectRef,
      geminiKeyLooksLikeAiStudio:
        gemini.startsWith("AIza") || gemini.length > 20,
      serviceRoleLooksLong: service.length > 40,
      recommendedGeminiModel: "gemini-2.5-flash",
    },
  });
}
