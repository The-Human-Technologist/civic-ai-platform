import { ImageResponse } from "next/og";
import { PLATFORM_NAME } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${PLATFORM_NAME} — civic intelligence dashboard`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            🛡️
          </div>
          <span style={{ fontSize: 22, opacity: 0.85 }}>Open Source · Privacy-first</span>
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>
          AI Civic Operations &amp; Road Safety Intelligence
        </div>
        <div style={{ fontSize: 26, marginTop: 20, opacity: 0.9, maxWidth: 800 }}>
          Human-reviewed alerts from existing CCTV — not surveillance
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            opacity: 0.7,
            display: "flex",
            gap: 24,
          }}
        >
          <span>Municipal dashboard</span>
          <span>·</span>
          <span>Mock MVP demo</span>
          <span>·</span>
          <span>AGPL-3.0</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
