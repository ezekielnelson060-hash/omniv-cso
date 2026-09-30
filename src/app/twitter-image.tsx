import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Omniv — Publish what matters. Discover what moves next.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#050505",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#F5B800",
          }}
        />
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 6,
            color: "#F5B800",
            textTransform: "uppercase",
          }}
        >
          Discovery Network
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          Publish what matters.
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 56,
            fontWeight: 700,
            color: "#a1a1aa",
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          Discover what moves next.
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 24,
            color: "#71717a",
            maxWidth: 860,
            lineHeight: 1.45,
          }}
        >
          Articles, research, music, products, events, and opportunities — from
          people, companies, and brands putting real work into the world.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 80,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 3,
            color: "#F5B800",
          }}
        >
          OMNIV
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#F5B800",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
