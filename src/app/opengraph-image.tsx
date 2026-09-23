import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Omniv — Discovery network for the real world";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#D4AF37",
          }}
        />
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#D4AF37",
          }}
        >
          OMNIV
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            fontWeight: 600,
            color: "#ffffff",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Discovery network for the real world
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 24,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Publish. Discover. Intent. Connect.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#D4AF37",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
