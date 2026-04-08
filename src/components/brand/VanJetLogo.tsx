"use client";

// ─── VanJet · Brand Logo Component ────────────────────────────
// Single source of truth for all VanJet logo rendering.
// Variants: lockup (mark+wordmark), mark (icon only), mono (currentColor)

import Image from "next/image";
import { Box } from "@chakra-ui/react";

export interface VanJetLogoProps {
  variant?: "lockup" | "mark" | "mono";
  width?: number;
  height?: number;
  priority?: boolean;
  alt?: string;
  className?: string;
}

const VARIANT_CONFIG = {
  lockup: { src: "/brand/vanjet-lockup.svg", width: 160, height: 52 },
  mark:   { src: "/brand/vanjet-mark.svg",   width: 40,  height: 34 },
  mono:   { src: "/brand/vanjet-mark-mono.svg", width: 40, height: 34 },
} as const;

export function VanJetLogo({
  variant = "lockup",
  width,
  height,
  priority = false,
  alt = "VanJet",
  className,
}: VanJetLogoProps) {
  const config = VARIANT_CONFIG[variant];
  const w = width ?? config.width;
  const h = height ?? config.height;

  const img = (
    <Image
      src={config.src}
      alt={alt}
      width={w}
      height={h}
      priority={priority}
      className={className}
      style={{ width: w, height: h, objectFit: "contain" }}
    />
  );

  // Mono variant: wrap so currentColor from parent propagates into the SVG
  if (variant === "mono") {
    return (
      <Box as="span" display="inline-flex" color="inherit">
        {img}
      </Box>
    );
  }

  return img;
}
