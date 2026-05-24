import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Freedom Hustle — Real guides for working abroad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic Open Graph image rendered at the edge. Used by Twitter/X, LinkedIn,
 * Facebook, WhatsApp, iMessage etc. when someone shares the homepage URL.
 *
 * Layout: dark ink-900 canvas, terracotta accent corner glow, three-line
 * editorial typography. Uses Georgia (system serif) as a Fraunces stand-in.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0f0e0a",
          color: "#fbf8f1",
          fontFamily: "Georgia, serif",
          position: "relative"
        }}
      >
        {/* Top-left brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "14px",
              background: "#c2562b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontStyle: "italic",
              fontWeight: 700,
              color: "#fbf8f1",
              lineHeight: 1
            }}
          >
            F
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 500,
              letterSpacing: "-0.01em"
            }}
          >
            Freedom Hustle
          </span>
        </div>

        {/* Center title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "900px"
          }}
        >
          <div
            style={{
              fontSize: "20px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#dd8e63",
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif"
            }}
          >
            Digital nomad starter guides
          </div>
          <div
            style={{
              fontSize: "96px",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              display: "flex",
              flexWrap: "wrap"
            }}
          >
            <span>Real guides for&nbsp;</span>
            <span style={{ color: "#dd8e63" }}>working abroad.</span>
          </div>
        </div>

        {/* Footer URL */}
        <div
          style={{
            fontSize: "24px",
            color: "#8a8170",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.02em"
          }}
        >
          freedomhustleguide.com
        </div>

        {/* Soft terracotta corner glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(194,86,43,0.35) 0%, rgba(194,86,43,0) 70%)"
          }}
        />
      </div>
    ),
    { ...size }
  );
}
