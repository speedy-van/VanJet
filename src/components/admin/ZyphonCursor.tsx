"use client";

// ─── VanJet · Zyphon Cursor Overlay ───────────────────────────
// Animated virtual cursor that moves to targets during UI automation

import { useState, useCallback, useEffect, useRef } from "react";
import { Box, Text } from "@chakra-ui/react";

interface CursorPosition {
  x: number;
  y: number;
  visible: boolean;
  label?: string;
}

// Resolve target registry keys to CSS selectors
const TARGET_REGISTRY: Record<string, string> = {
  "nav.dashboard": 'a[href="/admin"]',
  "nav.jobs": 'a[href="/admin/jobs"]',
  "nav.bookings": 'a[href="/admin/bookings"]',
  "nav.quotes": 'a[href="/admin/quotes"]',
  "nav.applications": 'a[href="/admin/applications"]',
  "nav.drivers": 'a[href="/admin/drivers"]',
  "nav.users": 'a[href="/admin/users"]',
  "nav.chat": 'a[href="/admin/chat"]',
  "nav.visitors": 'a[href="/admin/visitors"]',
  "nav.zyphon": 'a[href="/admin/ai-agent"]',
  "nav.auditLog": 'a[href="/admin/audit-log"]',
  "button.refresh": "button:has(svg)",
  "table.firstRow": "table tbody tr:first-child",
  "select.dateRange": "select",
};

function resolveSelector(target: string): string {
  return TARGET_REGISTRY[target] || target;
}

interface UIAction {
  id: string;
  type: "click" | "navigate" | "scroll" | "type" | "highlight" | "wait";
  target: string;
  value?: string;
  description: string;
}

/**
 * Execute a single UI action with the virtual cursor
 */
async function executeAction(
  action: UIAction,
  setCursor: (pos: CursorPosition) => void
): Promise<boolean> {
  const selector = resolveSelector(action.target);

  switch (action.type) {
    case "navigate": {
      const href = action.value || action.target.replace("nav.", "/admin/");
      setCursor({ x: window.innerWidth / 2, y: 60, visible: true, label: action.description });
      await delay(400);
      window.location.href = href.startsWith("/") ? href : `/admin/${href}`;
      return true;
    }
    case "click": {
      const el = document.querySelector(selector) as HTMLElement;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      setCursor({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        visible: true,
        label: action.description,
      });
      await delay(600);
      el.click();
      await delay(200);
      setCursor({ x: 0, y: 0, visible: false });
      return true;
    }
    case "scroll": {
      const el = document.querySelector(selector) as HTMLElement;
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const rect = el.getBoundingClientRect();
      setCursor({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        visible: true,
        label: action.description,
      });
      await delay(600);
      setCursor({ x: 0, y: 0, visible: false });
      return true;
    }
    case "type": {
      const el = document.querySelector(selector) as HTMLInputElement;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      setCursor({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        visible: true,
        label: action.description,
      });
      await delay(400);
      el.focus();
      if (action.value) {
        // Simulate natural typing
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(el, action.value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      await delay(300);
      setCursor({ x: 0, y: 0, visible: false });
      return true;
    }
    case "highlight": {
      const el = document.querySelector(selector) as HTMLElement;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      setCursor({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        visible: true,
        label: action.description,
      });
      // Flash effect
      const orig = el.style.outline;
      el.style.outline = "3px solid #805AD5";
      el.style.outlineOffset = "2px";
      await delay(1000);
      el.style.outline = orig;
      el.style.outlineOffset = "";
      setCursor({ x: 0, y: 0, visible: false });
      return true;
    }
    case "wait": {
      const ms = parseInt(action.value || "1000", 10);
      setCursor({ x: window.innerWidth / 2, y: window.innerHeight / 2, visible: true, label: action.description });
      await delay(Math.min(ms, 5000));
      setCursor({ x: 0, y: 0, visible: false });
      return true;
    }
    default:
      return false;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * ZyphonCursor — overlay component mounted in admin layout.
 * Listens for custom events dispatched from the Zyphon chat to execute UI plans.
 */
export function ZyphonCursor() {
  const [cursor, setCursor] = useState<CursorPosition>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [executing, setExecuting] = useState(false);
  const busyRef = useRef(false);

  const executePlan = useCallback(async (actions: UIAction[]) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setExecuting(true);

    for (const action of actions) {
      await executeAction(action, setCursor);
      await delay(300); // Small gap between actions
    }

    setCursor({ x: 0, y: 0, visible: false });
    setExecuting(false);
    busyRef.current = false;
  }, []);

  // Listen for events from the Zyphon chat
  useEffect(() => {
    function handlePlan(e: CustomEvent<{ actions: UIAction[] }>) {
      executePlan(e.detail.actions);
    }

    window.addEventListener(
      "zyphon:execute-plan" as string,
      handlePlan as EventListener
    );
    return () => {
      window.removeEventListener(
        "zyphon:execute-plan" as string,
        handlePlan as EventListener
      );
    };
  }, [executePlan]);

  if (!cursor.visible) return null;

  return (
    <>
      {/* Virtual cursor */}
      <Box
        position="fixed"
        left={`${cursor.x}px`}
        top={`${cursor.y}px`}
        w={6}
        h={6}
        borderRadius="full"
        bg="purple.500"
        opacity={0.8}
        boxShadow="0 0 12px rgba(128,90,213,0.6)"
        transform="translate(-50%, -50%)"
        transition="all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        zIndex="9999"
        pointerEvents="none"
      />

      {/* Action label */}
      {cursor.label && (
        <Box
          position="fixed"
          left={`${cursor.x}px`}
          top={`${cursor.y + 20}px`}
          transform="translateX(-50%)"
          bg="purple.600"
          color="white"
          px={3}
          py={1}
          borderRadius="md"
          fontSize="xs"
          fontWeight="600"
          zIndex="9999"
          pointerEvents="none"
          whiteSpace="nowrap"
          transition="all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        >
          {cursor.label}
        </Box>
      )}

      {/* Pulsing ring */}
      <Box
        position="fixed"
        left={`${cursor.x}px`}
        top={`${cursor.y}px`}
        w={10}
        h={10}
        borderRadius="full"
        border="2px solid"
        borderColor="purple.300"
        transform="translate(-50%, -50%)"
        zIndex="9998"
        pointerEvents="none"
        animation="zyphonPulse 1.5s ease infinite"
        css={{
          "@keyframes zyphonPulse": {
            "0%": { transform: "translate(-50%, -50%) scale(1)", opacity: 0.6 },
            "100%": { transform: "translate(-50%, -50%) scale(2)", opacity: 0 },
          },
        }}
      />
    </>
  );
}
