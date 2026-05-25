import Image from "next/image";

interface BrandLogoProps {
  /** Use the white-on-dark variant — for dark backgrounds. Default is the black logo. */
  variant?: "black" | "white";
  /** Rendered pixel height. Width is derived from the source aspect ratio. */
  height?: number;
  /** Optional className passed through to the <Image>. */
  className?: string;
}

// Source PNG dimensions — the filename still says "square" but the asset
// is actually a horizontal lockup. Width derives from this ratio.
const NATURAL_W = 1400;
const NATURAL_H = 754;

/**
 * Site-wide brand mark. Renders the source PNG at the height you ask for
 * and lets the width follow naturally from the source aspect ratio
 * (≈1.857 : 1) — no squishing, no manual width math at each call site.
 *
 * Wraps next/image so the asset is served as WebP/AVIF at the right
 * pixel density per device.
 */
export function BrandLogo({
  variant = "black",
  height = 40,
  className = ""
}: BrandLogoProps) {
  const src =
    variant === "white"
      ? "/uploads/freedom_hustle_square_white.png"
      : "/uploads/freedom_hustle_square_black.png";

  return (
    <Image
      src={src}
      alt="Freedom Hustle"
      width={NATURAL_W}
      height={NATURAL_H}
      priority
      sizes={`${Math.round(height * (NATURAL_W / NATURAL_H))}px`}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
