"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Flex,
  Stack,
} from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AddressAutocomplete } from "./AddressAutocomplete";
import type { BookingForm } from "./types";
import { publicEnv } from "@/lib/env";

interface StepAddressesProps {
  form: BookingForm;
  onNext: () => void;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <Box w="100%">
      <Text fontSize="sm" fontWeight="600" mb={1} color="gray.700">
        {label}
      </Text>
      {children}
      {error && (
        <Text fontSize="xs" color="red.500" mt={1}>
          {error}
        </Text>
      )}
    </Box>
  );
}

export function StepAddresses({ form, onNext }: StepAddressesProps) {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
    setError,
    clearErrors,
  } = form;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const pickupLat = watch("pickup.lat");
  const pickupLng = watch("pickup.lng");
  const pickupAddress = watch("pickup.address");
  const dropoffLat = watch("dropoff.lat");
  const dropoffLng = watch("dropoff.lng");
  const dropoffAddress = watch("dropoff.address");

  const bothAddressesValid =
    pickupLat && pickupLng && dropoffLat && dropoffLng;

  // Initialize map when both addresses are filled
  useEffect(() => {
    if (!bothAddressesValid || !mapContainerRef.current) {
      return;
    }

    const token = publicEnv.MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    // Destroy previous map if exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Calculate bounds
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([pickupLng, pickupLat]);
    bounds.extend([dropoffLng, dropoffLat]);

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      bounds,
      fitBoundsOptions: { padding: 50 },
    });

    // Add markers
    new mapboxgl.Marker({ color: "#059669" })
      .setLngLat([pickupLng, pickupLat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          `<strong>Pickup</strong><br/><small>${pickupAddress}</small>`
        )
      )
      .addTo(map);

    new mapboxgl.Marker({ color: "#DC2626" })
      .setLngLat([dropoffLng, dropoffLat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          `<strong>Delivery</strong><br/><small>${dropoffAddress}</small>`
        )
      )
      .addTo(map);

    // Fetch route
    const fetchRoute = async () => {
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?geometries=geojson&access_token=${token}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = (route.distance / 1000).toFixed(1);
          setDistance(parseFloat(distanceKm));

          // Draw route line
          map.on("load", () => {
            if (map.getSource("route")) return;
            map.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: route.geometry,
              },
            });
            map.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#1D4ED8",
                "line-width": 4,
              },
            });
          });
        }
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };

    fetchRoute();
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    bothAddressesValid,
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    pickupAddress,
    dropoffAddress,
  ]);

  const handleNext = () => {
    let valid = true;
    const vals = form.getValues();

    // Validate pickup
    if (!vals.pickup.address) {
      setError("pickup.address", { message: "Pickup address is required." });
      valid = false;
    } else {
      clearErrors("pickup.address");
    }

    if (!vals.pickup.lat || !vals.pickup.lng) {
      setError("pickup.address", {
        message: "Please select an address from the suggestions.",
      });
      valid = false;
    }

    // Validate drop-off
    if (!vals.dropoff.address) {
      setError("dropoff.address", {
        message: "Delivery address is required.",
      });
      valid = false;
    } else {
      clearErrors("dropoff.address");
    }

    if (!vals.dropoff.lat || !vals.dropoff.lng) {
      setError("dropoff.address", {
        message: "Please select an address from the suggestions.",
      });
      valid = false;
    }

    if (valid) onNext();
  };

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={{ base: 5, md: 8 }}>
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            Pickup &amp; Drop-off
          </Text>
          <Text fontSize="sm" color="gray.500">
            Where should we collect and deliver your items?
          </Text>
        </Box>

        {/* ── Pickup Section ─────────────────────────────── */}
        <Box
          borderWidth="1px"
          borderColor="blue.100"
          borderRadius="lg"
          p={{ base: 4, md: 5 }}
          bg="blue.50"
        >
          <Text fontSize="md" fontWeight="700" color="gray.800" mb={3}>
            📍 Pickup details
          </Text>
          <VStack gap={4} align="stretch">
            <Field
              label="Pickup address"
              error={errors.pickup?.address?.message as string}
            >
              <AddressAutocomplete
                value={watch("pickup.address")}
                onChange={(v) => setValue("pickup.address", v)}
                onSelect={(r) => {
                  setValue("pickup.address", r.address);
                  setValue("pickup.lat", r.lat);
                  setValue("pickup.lng", r.lng);
                  clearErrors("pickup.address");
                }}
                placeholder="Postcode or address"
              />
              {pickupLat && pickupLng && (
                <Text fontSize="sm" color="green.600" mt={2} fontWeight="600">
                  ✓ {pickupAddress}
                </Text>
              )}
            </Field>

            <Stack direction={{ base: "column", sm: "row" }} gap={4}>
              <Field label="Floor level">
                <select
                  {...register("pickup.floor", { valueAsNumber: true })}
                  defaultValue={0}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value={0}>Ground</option>
                  <option value={1}>1st Floor</option>
                  <option value={2}>2nd Floor</option>
                  <option value={3}>3rd Floor</option>
                  <option value={4}>4th Floor</option>
                  <option value={5}>5th+ Floor</option>
                </select>
              </Field>
              <Field label="Flat / unit number">
                <Input
                  {...register("pickup.flat")}
                  placeholder="e.g. Flat 3B"
                  bg="white"
                />
              </Field>
            </Stack>

            <Flex as="label" align="center" gap={2} cursor="pointer">
              <input
                type="checkbox"
                checked={watch("pickup.hasLift")}
                onChange={(e) => setValue("pickup.hasLift", e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#1D4ED8" }}
              />
              <Text fontSize="sm" color="gray.700">
                Building has a lift
              </Text>
            </Flex>

            <Field label="Pickup notes (optional)">
              <Input
                {...register("pickup.notes")}
                placeholder="Parking, access instructions..."
                bg="white"
              />
            </Field>
          </VStack>
        </Box>

        {/* ── Drop-off Section ───────────────────────────── */}
        <Box
          borderWidth="1px"
          borderColor="green.100"
          borderRadius="lg"
          p={{ base: 4, md: 5 }}
          bg="green.50"
        >
          <Text fontSize="md" fontWeight="700" color="gray.800" mb={3}>
            📦 Drop-off details
          </Text>
          <VStack gap={4} align="stretch">
            <Field
              label="Delivery address"
              error={errors.dropoff?.address?.message as string}
            >
              <AddressAutocomplete
                value={watch("dropoff.address")}
                onChange={(v) => setValue("dropoff.address", v)}
                onSelect={(r) => {
                  setValue("dropoff.address", r.address);
                  setValue("dropoff.lat", r.lat);
                  setValue("dropoff.lng", r.lng);
                  clearErrors("dropoff.address");
                }}
                placeholder="Postcode or address"
              />
              {dropoffLat && dropoffLng && (
                <Text fontSize="sm" color="green.600" mt={2} fontWeight="600">
                  ✓ {dropoffAddress}
                </Text>
              )}
            </Field>

            <Stack direction={{ base: "column", sm: "row" }} gap={4}>
              <Field label="Floor level">
                <select
                  {...register("dropoff.floor", { valueAsNumber: true })}
                  defaultValue={0}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value={0}>Ground</option>
                  <option value={1}>1st Floor</option>
                  <option value={2}>2nd Floor</option>
                  <option value={3}>3rd Floor</option>
                  <option value={4}>4th Floor</option>
                  <option value={5}>5th+ Floor</option>
                </select>
              </Field>
              <Field label="Flat / unit number">
                <Input
                  {...register("dropoff.flat")}
                  placeholder="e.g. Flat 3B"
                  bg="white"
                />
              </Field>
            </Stack>

            <Flex as="label" align="center" gap={2} cursor="pointer">
              <input
                type="checkbox"
                checked={watch("dropoff.hasLift")}
                onChange={(e) => setValue("dropoff.hasLift", e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#1D4ED8" }}
              />
              <Text fontSize="sm" color="gray.700">
                Building has a lift
              </Text>
            </Flex>

            <Field label="Delivery notes (optional)">
              <Input
                {...register("dropoff.notes")}
                placeholder="Parking, access instructions..."
                bg="white"
              />
            </Field>
          </VStack>
        </Box>

        {/* ── Map Preview ────────────────────────────────── */}
        {bothAddressesValid && (
          <Box
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            overflow="hidden"
            bg="gray.50"
          >
            <Box
              ref={mapContainerRef}
              h="300px"
              w="100%"
              borderRadius="lg"
            />
            {distance !== null && (
              <Flex
                p={3}
                bg="white"
                borderTop="1px solid"
                borderColor="gray.200"
                align="center"
                gap={2}
              >
                <Text fontSize="sm" fontWeight="600" color="gray.700">
                  📏 Estimated distance: {distance} km
                </Text>
              </Flex>
            )}
          </Box>
        )}

        <Button
          colorPalette="blue"
          size="lg"
          fontWeight="700"
          w={{ base: "full", md: "auto" }}
          alignSelf={{ md: "flex-end" }}
          onClick={handleNext}
          disabled={!bothAddressesValid}
          opacity={bothAddressesValid ? 1 : 0.5}
          cursor={bothAddressesValid ? "pointer" : "not-allowed"}
        >
          Next: Items →
        </Button>
      </VStack>
    </Box>
  );
}
