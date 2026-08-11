import { NextResponse } from "next/server";

/**
 * Placeholder for X OAuth redirect registered in the developer console.
 * App-only Bearer search does not need user OAuth; this avoids a dead callback URL.
 */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  return NextResponse.redirect(new URL("/settings", base));
}
