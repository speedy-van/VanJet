"use client";

// ─── VanJet · LiveTracking Component ──────────────────────────
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  Link as ChakraLink,
} from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { publicEnv } from "@/lib/env";
import {
  TRACKING_STATUSES,
  STATUS_LABELS,
  STATUS_ICONS,
  type TrackingStatus,
} from "@/lib/tracking/statuses";

// ── Types ─────────────────────────────────────────────────────
interface LocationPoint {
  address: string;
  lat: number | null;
  lng: number | null;
}

interface TrackingData {
  token: string;
  bookingStatus: string;
  orderNumber?: string;
  pickup: LocationPoint;
  delivery: LocationPoint;
  moveDate: string;
  jobType: string;
}

interface LocationEvent {
  lat: number;
  lng: number;
  heading: number | null;
  speedKph: number | null;
  accuracyM: number | null;
  status: TrackingStatus;
  recordedAt: string;
}

interface ETAInfo {
  distanceMiles: number;
  durationMinutes: number;
}

// ── Component ─────────────────────────────────────────────────
export function LiveTracking({ data }: { data: TrackingData }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [driverLocation, setDriverLocation] = useState<LocationEvent | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "reconnecting" | "polling">("connecting");
  const [eta, setEta] = useState<ETAInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const currentStatus = driverLocation?.status ?? "on_the_way";

  // ── Initialise map ──────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!publicEnv.MAPBOX_TOKEN) return;

    mapboxgl.accessToken = publicEnv.MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-1.5, 53.0],
      zoom: 5.5,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    // Add pickup marker
    if (data.pickup.lat && data.pickup.lng) {
      new mapboxgl.Marker({ color: "#1D4ED8" })
        .setLngLat([data.pickup.lng, data.pickup.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<b>Pickup</b><br/>" + escapeHtml(data.pickup.address)))
        .addTo(map);
    }

    // Add delivery marker
    if (data.delivery.lat && data.delivery.lng) {
      new mapboxgl.Marker({ color: "#059669" })
        .setLngLat([data.delivery.lng, data.delivery.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<b>Delivery</b><br/>" + escapeHtml(data.delivery.address)))
        .addTo(map);
    }

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds();
    if (data.pickup.lat && data.pickup.lng) bounds.extend([data.pickup.lng, data.pickup.lat]);
    if (data.delivery.lat && data.delivery.lng) bounds.extend([data.delivery.lng, data.delivery.lat]);
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 13 });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update driver marker on map ─────────────────────────────
  const updateDriverMarker = useCallback(
    (loc: LocationEvent) => {
      const map = mapRef.current;
      if (!map) return;

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLngLat([loc.lng, loc.lat]);
      } else {
        // Create driver marker with van icon
        const el = document.createElement("div");
        el.innerHTML = "🚐";
        el.style.fontSize = "32px";
        el.style.cursor = "pointer";
        el.style.transition = "transform 0.3s ease";
        if (loc.heading != null) {
          el.style.transform = `rotate(${loc.heading}deg)`;
        }
        driverMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([loc.lng, loc.lat])
          .addTo(map);
      }

      // Rotate marker if heading available
      if (loc.heading != null && driverMarkerRef.current) {
        const el = driverMarkerRef.current.getElement();
        el.style.transform = `rotate(${loc.heading}deg)`;
      }

      // Fit all markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([loc.lng, loc.lat]);
      if (data.pickup.lat && data.pickup.lng) bounds.extend([data.pickup.lng, data.pickup.lat]);
      if (data.delivery.lat && data.delivery.lng) bounds.extend([data.delivery.lng, data.delivery.lat]);
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });
    },
    [data.pickup, data.delivery]
  );

  // ── Fetch ETA from Mapbox Directions ────────────────────────
  const fetchETA = useCallback(
    async (driverLat: number, driverLng: number) => {
      if (!publicEnv.MAPBOX_TOKEN) return;

      // ETA to delivery if in_transit, else to pickup
      const dest =
        currentStatus === "in_transit" || currentStatus === "delivered"
          ? data.delivery
          : data.pickup;

      if (!dest.lat || !dest.lng) return;

      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLng},${driverLat};${dest.lng},${dest.lat}?access_token=${publicEnv.MAPBOX_TOKEN}&overview=false`
        );
        const json = await res.json();
        if (json.routes?.[0]) {
          setEta({
            distanceMiles: Math.round((json.routes[0].distance / 1609.344) * 10) / 10,
            durationMinutes: Math.round(json.routes[0].duration / 60),
          });
        }
      } catch {
        // ETA fetch failed silently
      }
    },
    [currentStatus, data.pickup, data.delivery]
  );

  // ── Handle incoming location event ──────────────────────────
  const handleLocationEvent = useCallback(
    (event: LocationEvent) => {
      setDriverLocation(event);
      setLastUpdated(new Date(event.recordedAt).toLocaleTimeString("en-GB"));
      updateDriverMarker(event);
      fetchETA(event.lat, event.lng);
    },
    [updateDriverMarker, fetchETA]
  );

  // ── SSE subscription with polling fallback ──────────────────
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const startSSE = () => {
      if (cancelled) return;
      setConnectionStatus("connecting");

      eventSource = new EventSource(`/api/tracking/subscribe?token=${data.token}`);

      eventSource.addEventListener("location", (e) => {
        setConnectionStatus("connected");
        try {
          const payload = JSON.parse(e.data) as LocationEvent;
          handleLocationEvent(payload);
        } catch {
          // Bad data ignore
        }
      });

      eventSource.addEventListener("ping", () => {
        setConnectionStatus("connected");
      });

      eventSource.onerror = () => {
        setConnectionStatus("reconnecting");
        eventSource?.close();
        eventSource = null;

        // Try reconnecting after 3s, fallback to polling after 3 failures
        reconnectTimer = setTimeout(() => {
          if (!cancelled) startPolling();
        }, 3000);
      };
    };

    const startPolling = () => {
      if (cancelled) return;
      setConnectionStatus("polling");

      const poll = async () => {
        try {
          const res = await fetch(`/api/tracking/latest?token=${data.token}`);
          if (res.ok) {
            const json = await res.json();
            if (json.latestEvent) {
              handleLocationEvent(json.latestEvent);
            }
          }
        } catch {
          // Polling failed silently
        }
      };

      poll();
      pollTimer = setInterval(poll, 5000);

      // Try SSE again after 30s
      reconnectTimer = setTimeout(() => {
        if (pollTimer) clearInterval(pollTimer);
        if (!cancelled) startSSE();
      }, 30000);
    };

    startSSE();

    return () => {
      cancelled = true;
      eventSource?.close();
      if (pollTimer) clearInterval(pollTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [data.token, handleLocationEvent]);

  // ── Google Maps deep links ──────────────────────────────────
  const pickupMapsUrl =
    data.pickup.lat && data.pickup.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${data.pickup.lat},${data.pickup.lng}`
      : null;

  const deliveryMapsUrl =
    data.delivery.lat && data.delivery.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${data.delivery.lat},${data.delivery.lng}`
      : null;

  // ── Render ──────────────────────────────────────────────────
  return (
    <Box bg="gray.50" minH="100dvh" pb={8}>
      <Container maxW="container.md" pt={4} px={{ base: 3, md: 6 }}>
        {/* Header */}
        <VStack gap={1} mb={4}>
          <Heading as="h1" size={{ base: "lg", md: "xl" }} color="blue.700" textAlign="center">
            Live Tracking
          </Heading>
          {data.orderNumber && (
            <Text fontSize="sm" fontWeight="700" color="gray.600" fontFamily="mono">
              Order {data.orderNumber}
            </Text>
          )}
          <HStack gap={2} flexWrap="wrap" justifyContent="center">
            <ConnectionBadge status={connectionStatus} />
            {lastUpdated && (
              <Text fontSize="xs" color="gray.500">
                Last update: {lastUpdated}
              </Text>
            )}
          </HStack>
        </VStack>

        {/* Map */}
        <Box
          ref={mapContainer}
          borderRadius="xl"
          overflow="hidden"
          height={{ base: "260px", md: "380px" }}
          width="100%"
          borderWidth="2px"
          borderColor="blue.500"
          boxShadow="0 0 20px rgba(29, 78, 216, 0.15)"
          mb={4}
        />

        {/* ETA Card */}
        {eta && currentStatus !== "delivered" && (
          <Box
            bg="white"
            borderRadius="xl"
            p={4}
            mb={4}
            borderWidth="1px"
            borderColor="blue.200"
            boxShadow="sm"
          >
            <HStack justifyContent="space-between" flexWrap="wrap" gap={2}>
              <VStack alignItems="flex-start" gap={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">
                  Estimated Arrival
                </Text>
                <Text fontSize="2xl" fontWeight="800" color="blue.700">
                  {eta.durationMinutes} min
                </Text>
              </VStack>
              <VStack alignItems="flex-end" gap={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">
                  Distance
                </Text>
                <Text fontSize="2xl" fontWeight="800" color="blue.700">
                  {eta.distanceMiles} mi
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Status Timeline */}
        <Box
          bg="white"
          borderRadius="xl"
          p={4}
          mb={4}
          borderWidth="1px"
          borderColor="gray.200"
          boxShadow="sm"
        >
          <Text fontSize="sm" fontWeight="700" color="gray.600" mb={3}>
            Delivery Progress
          </Text>
          <VStack gap={0} alignItems="stretch">
            {TRACKING_STATUSES.map((s, i) => {
              const statusIdx = TRACKING_STATUSES.indexOf(currentStatus as TrackingStatus);
              const isActive = s === currentStatus;
              const isDone = i < statusIdx;
              const isPending = i > statusIdx;

              return (
                <HStack
                  key={s}
                  gap={3}
                  py={2}
                  px={2}
                  borderRadius="md"
                  bg={isActive ? "blue.50" : "transparent"}
                >
                  <Box
                    w="32px"
                    h="32px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="lg"
                    bg={isDone ? "green.100" : isActive ? "blue.100" : "gray.100"}
                    borderWidth="2px"
                    borderColor={isDone ? "green.400" : isActive ? "blue.500" : "gray.300"}
                    flexShrink={0}
                  >
                    {STATUS_ICONS[s]}
                  </Box>
                  <Text
                    fontWeight={isActive ? "700" : isDone ? "600" : "400"}
                    color={isPending ? "gray.400" : isActive ? "blue.700" : "gray.700"}
                    fontSize="sm"
                  >
                    {STATUS_LABELS[s]}
                  </Text>
                  {isActive && (
                    <Spinner size="xs" color="blue.500" ml="auto" />
                  )}
                  {isDone && (
                    <Text ml="auto" color="green.500" fontSize="xs" fontWeight="600">
                      Done
                    </Text>
                  )}
                </HStack>
              );
            })}
          </VStack>
        </Box>

        {/* Locations Card */}
        <Box
          bg="white"
          borderRadius="xl"
          p={4}
          mb={4}
          borderWidth="1px"
          borderColor="gray.200"
          boxShadow="sm"
        >
          <VStack gap={4} alignItems="stretch">
            {/* Pickup */}
            <Box>
              <HStack gap={2} mb={1}>
                <Box w="10px" h="10px" borderRadius="full" bg="blue.600" flexShrink={0} />
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                  Pickup
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.700" ml={5}>
                {data.pickup.address}
              </Text>
              {pickupMapsUrl && (
                <ChakraLink
                  href={pickupMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  fontSize="xs"
                  color="blue.500"
                  fontWeight="600"
                  ml={5}
                  mt={1}
                  display="inline-block"
                >
                  Open in Google Maps &rarr;
                </ChakraLink>
              )}
            </Box>

            {/* Divider line */}
            <Box borderLeft="2px dashed" borderColor="gray.300" h="16px" ml="4px" />

            {/* Delivery */}
            <Box>
              <HStack gap={2} mb={1}>
                <Box w="10px" h="10px" borderRadius="full" bg="green.600" flexShrink={0} />
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                  Delivery
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.700" ml={5}>
                {data.delivery.address}
              </Text>
              {deliveryMapsUrl && (
                <ChakraLink
                  href={deliveryMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  fontSize="xs"
                  color="blue.500"
                  fontWeight="600"
                  ml={5}
                  mt={1}
                  display="inline-block"
                >
                  Open in Google Maps &rarr;
                </ChakraLink>
              )}
            </Box>
          </VStack>
        </Box>

        {/* No updates yet */}
        {!driverLocation && (
          <Box textAlign="center" py={6}>
            <Text color="gray.500" fontSize="sm">
              Waiting for driver location updates...
            </Text>
            <Spinner size="sm" color="blue.500" mt={2} />
          </Box>
        )}
      </Container>
    </Box>
  );
}

// ── Sub-components ────────────────────────────────────────────
function ConnectionBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    connecting: { label: "Connecting...", color: "yellow" },
    connected: { label: "Live", color: "green" },
    reconnecting: { label: "Reconnecting...", color: "orange" },
    polling: { label: "Polling", color: "blue" },
  };

  const { label, color } = config[status] ?? config.connecting;

  return (
    <Badge colorPalette={color} variant="subtle" fontSize="xs">
      {label}
    </Badge>
  );
}

// ── Helpers ───────────────────────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
