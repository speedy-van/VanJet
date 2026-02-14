"use client";

import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface NeonCardProps {
  children: ReactNode;
  variant?: "default" | "premium" | "subtle";
  hoverGlow?: boolean;
  accentColor?: string;
  padding?: any;
  minHeight?: string;
  [key: string]: any;
}

const NEON_VARIANTS = {
  default: {
    border: "1px solid rgba(59, 130, 246, 0.35)",
    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.35), 0 0 30px rgba(59, 130, 246, 0.18)",
    hoverShadow: "0 0 0 1px rgba(59, 130, 246, 0.5), 0 0 50px rgba(59, 130, 246, 0.3), 0 20px 40px rgba(0, 0, 0, 0.25)",
  },
  premium: {
    border: "1px solid rgba(59, 130, 246, 0.4)",
    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.22)",
    hoverShadow: "0 0 0 1px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.35), 0 24px 48px rgba(0, 0, 0, 0.3)",
  },
  subtle: {
    border: "1px solid rgba(59, 130, 246, 0.25)",
    boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.25), 0 0 20px rgba(59, 130, 246, 0.12)",
    hoverShadow: "0 0 0 1px rgba(59, 130, 246, 0.4), 0 0 35px rgba(59, 130, 246, 0.25), 0 16px 32px rgba(0, 0, 0, 0.2)",
  },
};

export function NeonCard({
  children,
  variant = "default",
  hoverGlow = true,
  accentColor,
  padding = { base: 5, md: 6 },
  minHeight,
  ...props
}: NeonCardProps) {
  const neon = NEON_VARIANTS[variant];

  return (
    <Box
      position="relative"
      borderRadius="xl"
      border={neon.border}
      boxShadow={neon.boxShadow}
      p={padding}
      bg="white"
      transition="all 0.25s ease"
      minH={minHeight}
      _hover={
        hoverGlow
          ? {
              transform: "translateY(-4px)",
              boxShadow: neon.hoverShadow,
            }
          : undefined
      }
      {...props}
    >
      {/* Top accent bar */}
      {accentColor && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          borderTopRadius="xl"
          bg={accentColor}
          bgGradient={`linear(to-r, ${accentColor}, ${accentColor}99)`}
        />
      )}
      {children}
    </Box>
  );
}
