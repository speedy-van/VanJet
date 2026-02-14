"use client";

// ─── VanJet · Driver Auto-Tracking Component ──────────────────
// Uses navigator.geolocation.watchPosition to auto-send driver
// location to /api/tracking/update every 10 seconds.

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Flex,
} from "@chakra-ui/react";
import {
  TRACKING_STATUSES,
  STATUS_LABELS,
  STATUS_ICONS,
  type TrackingStatus,
} from "@/lib/tracking/statuses";

interface DriverAutoTrackingProps {
  bookingId: string;
  orderNumber?: string;
  initialStatus?: TrackingStatus;
  onStatusChange?: (status: TrackingStatus) => void;
}

// Throttle interval for sending updates (ms)
const SEND_INTERVAL_MS = 10_000;

export function DriverAutoTracking({
  bookingId,
  orderNumber,
  initialStatus = "on_the_way",
  onStatusChange,
}: DriverAutoTrackingProps) {
  const [tracking, setTracking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<TrackingStatus>(initialStatus);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendCount, setSendCount] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const lastSendTimeRef = useRef(0);
  const currentStatusRef = useRef(currentStatus);
  const pendingCoordsRef = useRef<GeolocationPosition | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep ref in sync
  useEffect(() => {
    currentStatusRef.current = currentStatus;
  }, [currentStatus]);

  // ── Send location update to API ─────────────────────────────
  const sendUpdate = useCallback(
    async (lat: number, lng: number, heading: number | null, speed: number | null, accuracy: number | null) => {
      try {
        const res = await fetch("/api/tracking/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            lat,
            lng,
            heading,
            speedKph: speed != null ? Math.round(speed * 3.6) : undefined, // m/s → kph
            accuracyM: accuracy != null ? Math.round(accuracy) : undefined,
            status: currentStatusRef.current,
          }),
        });

        if (res.ok) {
          setLastSent(new Date().toLocaleTimeString("en-GB"));
          setSendCount((c) => c + 1);
          setError(null);
          lastSendTimeRef.current = Date.now();
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error || `Error ${res.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      }
    },
    [bookingId]
  );

  // ── Throttled sender (runs every SEND_INTERVAL_MS) ──────────
  const startThrottledSender = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const pos = pendingCoordsRef.current;
      if (!pos) return;

      const { latitude, longitude, heading, speed, accuracy } = pos.coords;
      sendUpdate(latitude, longitude, heading, speed, accuracy);
    }, SEND_INTERVAL_MS);
  }, [sendUpdate]);

  // ── Start tracking ──────────────────────────────────────────
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device.");
      return;
    }

    setError(null);
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLastCoords({
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
        });
        pendingCoordsRef.current = pos;

        // Send immediately on first position
        if (lastSendTimeRef.current === 0) {
          const { latitude, longitude, heading, speed, accuracy } = pos.coords;
          sendUpdate(latitude, longitude, heading, speed, accuracy);
        }
      },
      (err) => {
        setError(`GPS error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    startThrottledSender();
  }, [sendUpdate, startThrottledSender]);

  // ── Stop tracking ───────────────────────────────────────────
  const stopTracking = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pendingCoordsRef.current = null;
    setTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ── Change delivery status ──────────────────────────────────
  const changeStatus = useCallback(
    (newStatus: TrackingStatus) => {
      setCurrentStatus(newStatus);
      onStatusChange?.(newStatus);

      // If delivered, send one last update then stop tracking
      if (newStatus === "delivered") {
        const pos = pendingCoordsRef.current;
        if (pos) {
          const { latitude, longitude, heading, speed, accuracy } = pos.coords;
          // Override status ref immediately
          currentStatusRef.current = "delivered";
          sendUpdate(latitude, longitude, heading, speed, accuracy).then(() => {
            stopTracking();
          });
        } else {
          stopTracking();
        }
      }
    },
    [onStatusChange, sendUpdate, stopTracking]
  );

  // ── Determine next status ───────────────────────────────────
  const statusIdx = TRACKING_STATUSES.indexOf(currentStatus);
  const nextStatus = statusIdx < TRACKING_STATUSES.length - 1 ? TRACKING_STATUSES[statusIdx + 1] : null;

  // ── Render ──────────────────────────────────────────────────
  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={{ base: 4, md: 5 }}
      boxShadow="sm"
      borderWidth="1px"
      borderColor={tracking ? "green.300" : "gray.200"}
      borderLeftWidth="4px"
      borderLeftColor={tracking ? "#059669" : "#1D4ED8"}
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <HStack gap={2}>
            <Text fontWeight="700" fontSize="md" color="#111827">
              Auto-Tracking
            </Text>
            {orderNumber && (
              <Badge colorPalette="blue" variant="subtle" fontSize="xs">
                {orderNumber}
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color="#9CA3AF">
            GPS location sent every 10 seconds
          </Text>
        </Box>
        <Badge
          colorPalette={tracking ? "green" : "gray"}
          variant="subtle"
          fontSize="xs"
        >
          {tracking ? "Active" : "Inactive"}
        </Badge>
      </Flex>

      {/* Status Timeline */}
      <HStack gap={1} mb={4} flexWrap="wrap">
        {TRACKING_STATUSES.map((s, i) => {
          const isActive = s === currentStatus;
          const isDone = i < statusIdx;
          return (
            <Flex
              key={s}
              align="center"
              gap={1}
              px={2}
              py={1}
              borderRadius="md"
              bg={isActive ? "blue.50" : isDone ? "green.50" : "gray.50"}
              borderWidth="1px"
              borderColor={isActive ? "blue.300" : isDone ? "green.300" : "gray.200"}
            >
              <Text fontSize="sm">{STATUS_ICONS[s]}</Text>
              <Text
                fontSize="xs"
                fontWeight={isActive ? "700" : "500"}
                color={isActive ? "blue.700" : isDone ? "green.700" : "gray.500"}
                display={{ base: "none", md: "block" }}
              >
                {STATUS_LABELS[s]}
              </Text>
            </Flex>
          );
        })}
      </HStack>

      {/* Coordinates + Stats */}
      {lastCoords && (
        <HStack gap={4} mb={3} flexWrap="wrap">
          <Box>
            <Text fontSize="xs" color="#9CA3AF" fontWeight="600">
              Position
            </Text>
            <Text fontSize="sm" fontWeight="600" color="#374151" fontFamily="mono">
              {lastCoords.lat}, {lastCoords.lng}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="#9CA3AF" fontWeight="600">
              Last Sent
            </Text>
            <Text fontSize="sm" fontWeight="600" color="#374151">
              {lastSent ?? "—"}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="#9CA3AF" fontWeight="600">
              Updates Sent
            </Text>
            <Text fontSize="sm" fontWeight="600" color="#374151">
              {sendCount}
            </Text>
          </Box>
        </HStack>
      )}

      {/* Error */}
      {error && (
        <Box bg="red.50" px={3} py={2} borderRadius="md" mb={3}>
          <Text fontSize="xs" color="red.600" fontWeight="600">
            {error}
          </Text>
        </Box>
      )}

      {/* Control Buttons */}
      <VStack gap={2} alignItems="stretch">
        {/* Start / Stop */}
        {currentStatus !== "delivered" && (
          <Button
            w="full"
            bg={tracking ? "#EF4444" : "#059669"}
            color="white"
            fontWeight="700"
            size="md"
            borderRadius="8px"
            _hover={{ opacity: 0.9 }}
            onClick={tracking ? stopTracking : startTracking}
          >
            {tracking ? "Stop Tracking" : "Start Tracking"}
          </Button>
        )}

        {/* Next Status */}
        {nextStatus && tracking && (
          <Button
            w="full"
            bg="#1D4ED8"
            color="white"
            fontWeight="700"
            size="md"
            borderRadius="8px"
            _hover={{ bg: "#1840B8" }}
            onClick={() => changeStatus(nextStatus)}
          >
            {STATUS_ICONS[nextStatus]} Mark as {STATUS_LABELS[nextStatus]}
          </Button>
        )}

        {/* Delivered state */}
        {currentStatus === "delivered" && (
          <Box bg="green.50" px={4} py={3} borderRadius="md" textAlign="center">
            <Text color="green.700" fontWeight="700" fontSize="sm">
              Delivery completed. Tracking stopped automatically.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
