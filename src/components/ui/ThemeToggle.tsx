"use client";

// ─── VanJet · Theme Toggle Button ─────────────────────────────
// Dark/Light mode toggle using next-themes

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { IconButton } from "@chakra-ui/react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  // Render placeholder to prevent layout shift before mount
  if (!mounted) {
    return (
      <IconButton
        aria-label="Toggle theme"
        variant="ghost"
        size="sm"
        opacity={0}
        pointerEvents="none"
      >
        <Moon size={18} />
      </IconButton>
    );
  }

  return (
    <IconButton
      aria-label={label}
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={label}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </IconButton>
  );
}
