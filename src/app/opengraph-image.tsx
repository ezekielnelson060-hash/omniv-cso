import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Omniv — Publish what matters. Discover what moves next.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Twitter / Open Graph card — mirrors the Omniv landing headline */
export default function OgImage() {
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
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: "#F5B800",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 5,
            background: "#F5B800",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#0a0a0a",
              border: "2px solid #F5B800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: "#F5B800",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 4,
              color: "#F5B800",
            }}
          >
            OMNIV
          </div>
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 5,
            color: "#F5B800",
            textTransform: "uppercase",
          }}
        >
          Discovery Network
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 54,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.12,
            maxWidth: 1000,
          }}
        >
          Publish what matters.
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 54,
            fontWeight: 700,
            color: "#a1a1aa",
            lineHeight: 1.12,
            maxWidth: 1000,
          }}
        >
          Discover what moves next.
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            color: "#71717a",
            maxWidth: 900,
            lineHeight: 1.45,
          }}
        >
          Articles, research, music, products, events, and opportunities — from
          people, companies, and brands putting real work into the world.
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            color: "#52525b",
          }}
        >
          omniv.media
        </div>
      </div>
    ),
    { ...size }
  );
}
