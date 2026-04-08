// ─── VanJet · Booking Wizard Design Tokens ───────────────────
// Shared tokens for consistent styling across all wizard steps.
// Uses Chakra semantic palette keys — NO raw hex values.

export const wizardTokens = {
  /** Layout */
  stepRadius: "xl" as const,
  stepPaddingX: { base: 5, md: 8 },
  stepPaddingY: { base: 5, md: 8 },
  stepGap: 6,

  /** Motion (CSS-based, respects prefers-reduced-motion) */
  motion: {
    stepEnter: {
      keyframes: `
        @keyframes wizardStepEnter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `,
      animation: "wizardStepEnter 0.3s ease-out forwards",
      reducedMotion: "none", // instant snap
    },
    shake: {
      keyframes: `
        @keyframes wizardFieldShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `,
      animation: "wizardFieldShake 0.3s ease-in-out",
    },
    pulse: {
      keyframes: `
        @keyframes wizardPulse {
          0% { box-shadow: 0 0 0 0 var(--pulse-color, rgba(124, 58, 237, 0.4)); }
          70% { box-shadow: 0 0 0 8px var(--pulse-color, rgba(124, 58, 237, 0)); }
          100% { box-shadow: 0 0 0 0 var(--pulse-color, rgba(124, 58, 237, 0)); }
        }
      `,
      animation: "wizardPulse 0.4s ease-out",
    },
  },

  /** Colors — semantic Chakra palette keys only */
  colors: {
    accent: "purple",
    success: "green",
    warning: "amber",
    danger: "red",
    info: "blue",
    muted: "gray",
  },

  /** Accent shade references */
  accentSolid: "purple.600",
  accentMuted: "purple.50",
  accentHover: "purple.700",
  accentText: "purple.700",

  /** Shadows */
  cardShadow: {
    base: "sm",
    md: "md",
  },

  /** Transition timing */
  transition: {
    fast: "0.15s ease-out",
    normal: "0.2s ease-out",
    slow: "0.3s ease-out",
  },

  /** Premium radius (px value for specific use cases) */
  wizardRadius: "20px",
  wizardInputRadius: "14px",

  /** Premium shadows */
  wizardShadow: {
    sm: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
    md: "0 10px 30px -12px rgba(15,23,42,0.15)",
    hover: "0 20px 40px -15px rgba(124,58,237,0.25)",
  },

  /** Motion duration (ms) */
  motionDuration: {
    fast: 150,
    base: 250,
    slow: 400,
  },

  /** Motion easing curves */
  motionEase: {
    out: "cubic-bezier(0.22,0.9,0.3,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
  },

  /** CTA gradient for premium buttons */
  ctaGradient: "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #7C3AED 100%)",
  ctaGradientHover: "linear-gradient(135deg, #6D28D9 0%, #9333EA 50%, #6D28D9 100%)",

  /** Field sizing */
  fieldMinHeight: "52px",
  buttonMinHeight: "56px",
} as const;

export type WizardTokens = typeof wizardTokens;
