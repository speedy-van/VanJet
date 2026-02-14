"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Text, VStack, Flex, Portal } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

/** Status messages shown sequentially during the calculation theater */
const STATUS_LINES = [
  "Analyzing your move details…",
  "Estimating distance & travel time…",
  "Matching vehicle & manpower…",
  "Comparing market demand…",
  "Finalizing your price range…",
];

/** Interval between status line appearances (ms) */
const STATUS_INTERVAL_MS = 800;

/** Target counter value */
const COUNTER_TARGET = 2847;

interface PriceCalculationOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** Progress value 0-100 */
  progress: number;
  /** Current status line index (0-4) */
  statusIndex: number;
  /** Counter value for "scenarios analyzed" */
  counterValue: number;
}

/**
 * PriceCalculationOverlay - A theatrical loading overlay for pricing calculations.
 * Shows animated icon, progress bar, status lines, and scenario counter.
 */
export function PriceCalculationOverlay({
  isOpen,
  progress,
  statusIndex,
  counterValue,
}: PriceCalculationOverlayProps) {
  const currentStatus = STATUS_LINES[Math.min(statusIndex, STATUS_LINES.length - 1)];

  // TEMP DEBUG: Log when isOpen changes
  useEffect(() => {
    console.log("[Theater] isOpen changed to:", isOpen);
    if (isOpen) {
      console.log("[Theater] Overlay MOUNTED");
    }
    return () => {
      if (isOpen) {
        console.log("[Theater] Overlay UNMOUNTING");
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.85)",
              zIndex: 20000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onAnimationStart={() => console.log("[Theater] Animation START")}
            onAnimationComplete={() => console.log("[Theater] Animation COMPLETE")}
          >
            <VStack gap={8} maxW="400px" px={6} textAlign="center">
              {/* Animated Calculator Icon */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="4"
                    y="2"
                    width="16"
                    height="20"
                    rx="2"
                    stroke="#60A5FA"
                    strokeWidth="1.5"
                    fill="rgba(96, 165, 250, 0.1)"
                  />
                  <rect x="6" y="4" width="12" height="4" rx="1" fill="#60A5FA" />
                  <circle cx="8" cy="11" r="1" fill="#60A5FA" />
                  <circle cx="12" cy="11" r="1" fill="#60A5FA" />
                  <circle cx="16" cy="11" r="1" fill="#60A5FA" />
                  <circle cx="8" cy="15" r="1" fill="#60A5FA" />
                  <circle cx="12" cy="15" r="1" fill="#60A5FA" />
                  <circle cx="16" cy="15" r="1" fill="#60A5FA" />
                  <circle cx="8" cy="19" r="1" fill="#60A5FA" />
                  <rect x="11" y="18" width="6" height="2" rx="0.5" fill="#60A5FA" />
                </svg>
              </motion.div>

              {/* Status Line with aria-live for accessibility */}
              <Box minH="28px" aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusIndex}
                    style={{
                      color: "white",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      margin: 0,
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStatus}
                  </motion.p>
                </AnimatePresence>
              </Box>

              {/* Progress Bar */}
              <Box w="full" bg="gray.700" borderRadius="full" h="8px" overflow="hidden">
                <motion.div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
                    borderRadius: "9999px",
                  }}
                  initial={{ width: "5%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </Box>

              {/* Scenario Counter */}
              <Flex align="center" gap={2}>
                <Text color="gray.400" fontSize="sm">
                  Analyzed
                </Text>
                <Text
                  color="#60A5FA"
                  fontSize="lg"
                  fontWeight="700"
                  fontFamily="mono"
                >
                  {counterValue.toLocaleString()}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  pricing scenarios
                </Text>
              </Flex>

              {/* Subtle hint */}
              <Text color="gray.500" fontSize="xs" mt={2}>
                This only takes a moment...
              </Text>
            </VStack>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

/** Minimum theater duration in milliseconds */
export const MIN_THEATER_MS = 4200;

/** Hook to manage the price calculation theater state */
export function usePriceTheater() {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(5);
  const [statusIndex, setStatusIndex] = useState(0);
  const [counterValue, setCounterValue] = useState(0);
  
  const theaterStartRef = useRef<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const counterIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /** Clean up all intervals */
  const cleanup = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    if (counterIntervalRef.current) clearInterval(counterIntervalRef.current);
    progressIntervalRef.current = null;
    statusIntervalRef.current = null;
    counterIntervalRef.current = null;
  };

  /** Start the theater */
  const start = () => {
    cleanup();
    setIsOpen(true);
    setProgress(5);
    setStatusIndex(0);
    setCounterValue(0);
    theaterStartRef.current = Date.now();

    // Progress: 5% → 90% over ~4s (update every 50ms)
    const progressSteps = 80; // steps to go from 5 to 90
    const progressDuration = MIN_THEATER_MS - 200; // leave 200ms for final 100%
    const progressIncrement = 85 / progressSteps;
    let currentProgress = 5;
    
    progressIntervalRef.current = setInterval(() => {
      currentProgress = Math.min(currentProgress + progressIncrement, 90);
      setProgress(currentProgress);
    }, progressDuration / progressSteps);

    // Status lines: one every STATUS_INTERVAL_MS
    let currentStatus = 0;
    statusIntervalRef.current = setInterval(() => {
      if (currentStatus < STATUS_LINES.length - 1) {
        currentStatus++;
        setStatusIndex(currentStatus);
      }
    }, STATUS_INTERVAL_MS);

    // Counter: 0 → 2847 with varying increments for a "working" feel
    const counterDuration = MIN_THEATER_MS - 300;
    const counterUpdates = 60;
    const counterInterval = counterDuration / counterUpdates;
    let currentCounter = 0;
    
    counterIntervalRef.current = setInterval(() => {
      // Variable increments for natural look
      const remaining = COUNTER_TARGET - currentCounter;
      const increment = Math.ceil(remaining / (counterUpdates / 2) + Math.random() * 30);
      currentCounter = Math.min(currentCounter + increment, COUNTER_TARGET);
      setCounterValue(currentCounter);
      
      if (currentCounter >= COUNTER_TARGET) {
        if (counterIntervalRef.current) {
          clearInterval(counterIntervalRef.current);
          counterIntervalRef.current = null;
        }
      }
    }, counterInterval);
  };

  /** Finish the theater (call when API completes + min duration met) */
  const finish = (): Promise<void> => {
    return new Promise((resolve) => {
      cleanup();
      setProgress(100);
      setStatusIndex(STATUS_LINES.length - 1);
      setCounterValue(COUNTER_TARGET);
      
      // Brief pause at 100%, then close
      setTimeout(() => {
        setIsOpen(false);
        resolve();
      }, 300);
    });
  };

  /** Get remaining time until min duration is met */
  const getRemainingTime = () => {
    const elapsed = Date.now() - theaterStartRef.current;
    return Math.max(0, MIN_THEATER_MS - elapsed);
  };

  /** Close immediately (for errors) */
  const closeImmediate = () => {
    cleanup();
    setIsOpen(false);
    setProgress(5);
    setStatusIndex(0);
    setCounterValue(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return {
    isOpen,
    progress,
    statusIndex,
    counterValue,
    start,
    finish,
    getRemainingTime,
    closeImmediate,
  };
}
