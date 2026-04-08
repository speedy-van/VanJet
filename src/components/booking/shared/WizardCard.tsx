"use client";

// ─── VanJet · Wizard Card Wrapper ─────────────────────────────
// Themed card for wizard steps with consistent padding, radius, and elevation.
// Dark-mode aware, forwards refs, typed children prop.

import { forwardRef, type ReactNode } from "react";
import { Card, type CardRootProps } from "@chakra-ui/react";
import { wizardTokens } from "./tokens";

export type WizardCardAccent = "primary" | "success" | "warning" | "danger";

const accentBorderColors: Record<WizardCardAccent, string> = {
  primary: "purple.500",
  success: "green.500",
  warning: "amber.500",
  danger: "red.500",
};

export interface WizardCardProps extends Omit<CardRootProps, "children"> {
  children: ReactNode;
  /** Removes shadow on mobile for a flatter look */
  flatOnMobile?: boolean;
  /** Adds a colored top border accent */
  accent?: WizardCardAccent;
  /** Enables hover lift and focus ring for interactive cards */
  interactive?: boolean;
}

export const WizardCard = forwardRef<HTMLDivElement, WizardCardProps>(
  function WizardCard({ children, flatOnMobile = true, accent, interactive, ...props }, ref) {
    return (
      <Card.Root
        ref={ref}
        bg="white"
        borderRadius={wizardTokens.stepRadius}
        shadow={flatOnMobile ? { base: "none", md: wizardTokens.cardShadow.md } : wizardTokens.cardShadow.md}
        borderWidth={{ base: flatOnMobile ? "1px" : "0", md: "0" }}
        borderColor="gray.100"
        borderTopWidth={accent ? "2px" : undefined}
        borderTopColor={accent ? accentBorderColors[accent] : undefined}
        overflow="hidden"
        transition={interactive ? "all 0.2s ease-out" : undefined}
        cursor={interactive ? "pointer" : undefined}
        _hover={interactive ? {
          shadow: wizardTokens.wizardShadow.hover,
          transform: "translateY(-2px)",
        } : undefined}
        _focusVisible={interactive ? {
          outline: "2px solid",
          outlineColor: "purple.500",
          outlineOffset: "2px",
        } : undefined}
        _dark={{
          bg: "gray.900",
          borderColor: "gray.800",
        }}
        {...props}
      >
        <Card.Body
          px={wizardTokens.stepPaddingX}
          py={wizardTokens.stepPaddingY}
        >
          {children}
        </Card.Body>
      </Card.Root>
    );
  }
);

WizardCard.displayName = "WizardCard";
