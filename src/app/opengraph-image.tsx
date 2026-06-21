import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #333 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 60,
          fontWeight: 700,
        }}
      >
        Next Boilerplate
        <div style={{ fontSize: 28, opacity: 0.7, marginTop: 16 }}>
          Ship your SaaS in minutes
        </div>
      </div>
    ),
    { ...size },
  );
}
