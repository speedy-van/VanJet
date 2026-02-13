"use client";

// ─── VanJet · Reusable Animation Primitives ──────────────────
// Framer Motion wrappers tuned for a premium logistics platform.
// All scroll-triggered animations fire once and use GPU-friendly transforms.

import { motion, type Variants } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

/* ── Easing ──────────────────────────────────────────────────── */
const EASE_PREMIUM: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── Fade + Slide Up ─────────────────────────────────────────── */
export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  y = 40,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── Blur → Focus reveal ─────────────────────────────────────── */
export function BlurIn({
  children,
  delay = 0,
  duration = 0.8,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── Scale up from nothing ────────────────────────────────────── */
export function ScaleIn({
  children,
  delay = 0,
  duration = 0.6,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger container + child ────────────────────────────────── */
const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_PREMIUM },
  },
};

export function StaggerParent({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div variants={staggerChild} className={className} style={style}>
      {children}
    </motion.div>
  );
}

/* ── Spring hover button wrapper ──────────────────────────────── */
export function SpringHover({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── Slide in from left/right ─────────────────────────────────── */
export function SlideIn({
  children,
  from = "left",
  delay = 0,
  duration = 0.7,
  className,
  style,
}: {
  children: ReactNode;
  from?: "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const x = from === "left" ? -60 : 60;
  return (
    <motion.div
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
