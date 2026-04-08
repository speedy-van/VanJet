"use client";

// ─── VanJet · Wizard Button ───────────────────────────────────
// Premium button for wizard actions with gradient and press feedback.

import { forwardRef } from "react";
import { Button, type ButtonProps } from "@chakra-ui/react";
import { wizardTokens } from "./tokens";

export interface WizardButtonProps extends ButtonProps {
  /** Apply premium gradient background */
  gradient?: boolean;
  /** Full width on all breakpoints */
  fullWidth?: boolean;
}

export const WizardButton = forwardRef<HTMLButtonElement, WizardButtonProps>(
  function WizardButton({ gradient, fullWidth, children, ...props }, ref) {
    const gradientStyles = gradient
      ? {
          bg: wizardTokens.ctaGradient,
          color: "white",
          _hover: {
            bg: wizardTokens.ctaGradientHover,
            boxShadow: wizardTokens.wizardShadow.hover,
            transform: "translateY(-1px)",
          },
          _active: {
            transform: "scale(0.97)",
          },
        }
      : {};

    return (
      <Button
        ref={ref}
        minH={{ base: wizardTokens.buttonMinHeight, md: "52px" }}
        w={fullWidth ? "100%" : undefined}
        px={6}
        fontSize={{ base: "md", md: "lg" }}
        fontWeight="700"
        borderRadius={wizardTokens.wizardInputRadius}
        colorPalette="purple"
        transition="all 0.2s ease-out"
        className="wizard-pressable"
        {...gradientStyles}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

WizardButton.displayName = "WizardButton";
