import { ImageResponse } from "next/og";

export const alt = "Tikpie - Vidéos courtes verticales";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "4px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </div>
          <span style={{ fontSize: 56, fontWeight: 700, color: "white" }}>
            Tikpie
          </span>
          <span style={{ fontSize: 24, color: "#a1a1aa" }}>
            Vidéos courtes verticales
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
