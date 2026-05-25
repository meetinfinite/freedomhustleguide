import Image from "next/image";

interface BrandLogoProps {
  /** Use the white-on-dark variant — for dark backgrounds. Default is the black logo. */
  variant?: "black" | "white";
  /** Rendered pixel size (square). Defaults to 32. */
  size?: number;
  /** Optional className passed to the wrapper for layout tweaks. */
  className?: string;
}

/**
 * Site-wide brand mark. Wraps the square PNG in next/image so it's
 * served as WebP/AVIF at the right pixel density per device.
 *
 * We pass `width`/`height` at 2× the rendered size so Retina screens
 * get the sharp version without manually authoring an @2x asset.
 */
export function BrandLogo({
  variant = "black",
  size = 32,
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
      width={size * 2}
      height={size * 2}
      priority
      sizes={`${size}px`}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
