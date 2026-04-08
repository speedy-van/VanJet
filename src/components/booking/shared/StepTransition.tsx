"use client";

// ─── VanJet · Step Transition Wrapper ─────────────────────────
// Wraps step content with fade + Y-translate animation on enter.
// Uses framer-motion (already in package.json).
// Respects prefers-reduced-motion via useReducedMotion hook.

import { type ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Transition } from "framer-motion";

export interface StepTransitionProps {
  /** Unique key that triggers re-animation when changed */
  stepKey: string | number;
  children: ReactNode;
}

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const reducedVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
};

const normalTransition: Transition = { duration: 0.3, ease: "easeOut" };
const instantTransition: Transition = { duration: 0 };

export function StepTransition({ stepKey, children }: StepTransitionProps) {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — render without animation on server
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const useVariants = prefersReduced ? reducedVariants : variants;
  const transition = prefersReduced ? instantTransition : normalTransition;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepKey}
        variants={useVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
