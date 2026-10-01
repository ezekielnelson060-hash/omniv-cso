import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Omniv — Publish what matters. Discover what moves next.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

/** Serves the real landing card (public/og-card.jpg), not the text mock. */
export default async function TwitterImage() {
  const buf = await readFile(join(process.cwd(), "public", "og-card.jpg"));
  return new Response(buf, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
