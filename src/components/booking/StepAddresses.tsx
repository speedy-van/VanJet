"use client";

import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Flex,
  Stack,
} from "@chakra-ui/react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import type { BookingForm } from "./types";

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
            </Field>

            <Stack direction={{ base: "column", sm: "row" }} gap={4}>
              <Field label="Floor level">
                <Input
                  type="number"
                  min={0}
                  defaultValue={0}
                  {...register("pickup.floor", { valueAsNumber: true })}
                  bg="white"
                />
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
            </Field>

            <Stack direction={{ base: "column", sm: "row" }} gap={4}>
              <Field label="Floor level">
                <Input
                  type="number"
                  min={0}
                  defaultValue={0}
                  {...register("dropoff.floor", { valueAsNumber: true })}
                  bg="white"
                />
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

        <Button
          colorPalette="blue"
          size="lg"
          fontWeight="700"
          w={{ base: "full", md: "auto" }}
          alignSelf={{ md: "flex-end" }}
          onClick={handleNext}
        >
          Next: Items →
        </Button>
      </VStack>
    </Box>
  );
}
