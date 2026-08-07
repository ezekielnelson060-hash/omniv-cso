import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Omniv relevance audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadAudit(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await sb
    .from("public_audits")
    .select("artist_name, overall_score, payload")
    .eq("share_slug", slug)
    .maybeSingle();
  return data;
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolved = await Promise.resolve(params);
  const slug = resolved.id;
  const row = await loadAudit(slug);
  const name = (row?.artist_name as string) || "Artist";
  const score =
    (row?.overall_score as number) ??
    ((row?.payload as { overall?: number })?.overall ?? 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#F5C518",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Omniv · Relevance audit
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ color: "#f5f5f5", fontSize: 56, fontWeight: 600 }}>
            {name}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ color: "#F5C518", fontSize: 96, fontWeight: 700 }}>
              {score}
            </span>
            <span style={{ color: "#888", fontSize: 32 }}>/100</span>
          </div>
          <div style={{ color: "#a3a3a3", fontSize: 24 }}>
            Public signals. Where reach and revenue leak.
          </div>
        </div>
        <div style={{ color: "#666", fontSize: 20 }}>omniv.media/audit</div>
      </div>
    ),
    { ...size }
  );
}
