"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number; // ms
  suffix?: string;
  prefix?: string;
  decimals?: number;
  separator?: string;
}

export function useCountUp({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
  separator = ",",
}: CountUpProps) {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);
  const ref = useRef<HTMLElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();

    function animate() {
      const start = performance.now();

      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * end;

        const formatted = formatNumber(current, decimals, separator);
        setDisplay(`${prefix}${formatted}${suffix}`);

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    }
  }, [end, duration, suffix, prefix, decimals, separator]);

  return { display, ref };
}

function formatNumber(
  value: number,
  decimals: number,
  separator: string
): string {
  const fixed = value.toFixed(decimals);
  const [whole, frac] = fixed.split(".");
  const withSep = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return frac !== undefined ? `${withSep}.${frac}` : withSep;
}
