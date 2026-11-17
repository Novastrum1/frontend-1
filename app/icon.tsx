import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #080713 0%, #1c1935 100%)",
        color: "#ffffff",
        display: "flex",
        fontFamily: "sans-serif",
        fontSize: 300,
        fontWeight: 900,
        height: "100%",
        justifyContent: "center",
        letterSpacing: -35,
        width: "100%",
      }}
    >
      <span style={{ background: "linear-gradient(135deg, #a78bfa, #845ae8)", backgroundClip: "text", color: "transparent" }}>V</span>
    </div>,
    size,
  );
}
