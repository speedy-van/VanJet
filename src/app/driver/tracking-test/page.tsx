"use client";

// ─── VanJet · Driver Tracking Test Page (DEV ONLY) ────────────
import { useState, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
  Badge,
  Button,
} from "@chakra-ui/react";
import {
  TRACKING_STATUSES,
  STATUS_LABELS,
  type TrackingStatus,
} from "@/lib/tracking/statuses";

export default function DriverTrackingTestPage() {
  const [bookingId, setBookingId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [heading, setHeading] = useState("");
  const [speed, setSpeed] = useState("");
  const [status, setStatus] = useState<TrackingStatus>("on_the_way");
  const [devKey, setDevKey] = useState("");
  const [result, setResult] = useState("");
  const [sending, setSending] = useState(false);

  // Use device GPS
  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setResult("Geolocation not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
        if (pos.coords.heading != null) setHeading(String(Math.round(pos.coords.heading)));
        if (pos.coords.speed != null) setSpeed(String(Math.round(pos.coords.speed * 2.237))); // m/s -> mph
        setResult("Location acquired from GPS.");
      },
      (err) => {
        setResult(`GPS error: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Send update
  const sendUpdate = useCallback(async () => {
    if (!bookingId || !lat || !lng) {
      setResult("Fill in booking ID, lat, and lng.");
      return;
    }

    setSending(true);
    setResult("Sending...");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (devKey) headers["x-dev-driver-key"] = devKey;

      const res = await fetch("/api/tracking/update", {
        method: "POST",
        headers,
        body: JSON.stringify({
          bookingId,
          lat: Number(lat),
          lng: Number(lng),
          heading: heading ? Number(heading) : undefined,
          speedKph: speed ? Number(speed) : undefined,
          status,
        }),
      });

      const data = await res.json();
      setResult(
        res.ok
          ? `Success! ${JSON.stringify(data)}`
          : `Error ${res.status}: ${data.error || JSON.stringify(data)}`
      );
    } catch (err) {
      setResult(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSending(false);
    }
  }, [bookingId, lat, lng, heading, speed, status, devKey]);

  return (
    <Box bg="gray.50" minH="100dvh" py={8}>
      <Container maxW="container.sm">
        <VStack gap={6} alignItems="stretch">
          <Box>
            <Heading size="lg" color="blue.700" mb={1}>
              Driver Tracking Test
            </Heading>
            <Badge colorPalette="orange" variant="subtle">
              DEV ONLY
            </Badge>
          </Box>

          {/* Dev Key */}
          <Box>
            <Text fontSize="sm" fontWeight="600" mb={1}>
              Dev Driver Key
            </Text>
            <Input
              placeholder="DEV_DRIVER_KEY from .env.local"
              value={devKey}
              onChange={(e) => setDevKey(e.target.value)}
              size="sm"
            />
          </Box>

          {/* Booking ID */}
          <Box>
            <Text fontSize="sm" fontWeight="600" mb={1}>
              Booking ID
            </Text>
            <Input
              placeholder="UUID of the booking"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              size="sm"
            />
          </Box>

          {/* Coordinates */}
          <HStack gap={3}>
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="600" mb={1}>
                Latitude
              </Text>
              <Input
                placeholder="51.5074"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                size="sm"
              />
            </Box>
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="600" mb={1}>
                Longitude
              </Text>
              <Input
                placeholder="-0.1278"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                size="sm"
              />
            </Box>
          </HStack>

          {/* Heading + Speed */}
          <HStack gap={3}>
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="600" mb={1}>
                Heading (0-360)
              </Text>
              <Input
                placeholder="0"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                size="sm"
              />
            </Box>
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="600" mb={1}>
                Speed (mph)
              </Text>
              <Input
                placeholder="40"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                size="sm"
              />
            </Box>
          </HStack>

          {/* Status */}
          <Box>
            <Text fontSize="sm" fontWeight="600" mb={2}>
              Status
            </Text>
            <HStack gap={2} flexWrap="wrap">
              {TRACKING_STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  bg={status === s ? "#1D4ED8" : "white"}
                  color={status === s ? "white" : "#374151"}
                  borderWidth="1px"
                  borderColor={status === s ? "#1D4ED8" : "#D1D5DB"}
                  fontWeight="600"
                  onClick={() => setStatus(s)}
                >
                  {STATUS_LABELS[s]}
                </Button>
              ))}
            </HStack>
          </Box>

          {/* Use My Location */}
          <Button
            bg="white"
            color="#059669"
            borderWidth="1px"
            borderColor="#059669"
            fontWeight="700"
            onClick={useMyLocation}
            width="full"
            _hover={{ bg: "#ECFDF5" }}
          >
            Use My Location (GPS)
          </Button>

          {/* Send Update */}
          <Button
            bg="#1D4ED8"
            color="white"
            onClick={sendUpdate}
            disabled={sending}
            width="full"
            size="lg"
            fontWeight="700"
          >
            {sending ? "Sending..." : "Send Location Update"}
          </Button>

          {/* Result */}
          {result && (
            <Textarea
              value={result}
              readOnly
              size="sm"
              minH="60px"
              fontFamily="mono"
              fontSize="xs"
            />
          )}
        </VStack>
      </Container>
    </Box>
  );
}
