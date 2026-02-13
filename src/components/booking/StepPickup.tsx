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

interface StepPickupProps {
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

export function StepPickup({ form, onNext }: StepPickupProps) {
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

    if (!vals.contactName?.trim()) {
      setError("contactName", { message: "Contact name is required." });
      valid = false;
    } else {
      clearErrors("contactName");
    }

    if (!vals.contactEmail?.trim()) {
      setError("contactEmail", { message: "Email address is required." });
      valid = false;
    } else {
      clearErrors("contactEmail");
    }

    if (!vals.contactPhone?.trim()) {
      setError("contactPhone", { message: "Phone number is required." });
      valid = false;
    } else {
      clearErrors("contactPhone");
    }

    if (valid) onNext();
  };

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={{ base: 5, md: 8 }}>
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            Pickup details
          </Text>
          <Text fontSize="sm" color="gray.500">
            Where should we collect your items?
          </Text>
        </Box>

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
            style={{ width: 18, height: 18, accentColor: "#0070f3" }}
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

        <Box borderTopWidth="1px" borderColor="gray.100" pt={5} mt={2}>
          <Text fontSize="lg" fontWeight="700" color="gray.800" mb={4}>
            Contact information
          </Text>
          <VStack gap={4}>
            <Field
              label="Full name"
              error={errors.contactName?.message as string}
            >
              <Input
                {...register("contactName")}
                placeholder="John Smith"
                bg="white"
              />
            </Field>
            <Field
              label="Email address"
              error={errors.contactEmail?.message as string}
            >
              <Input
                type="email"
                {...register("contactEmail")}
                placeholder="john@example.com"
                bg="white"
              />
            </Field>
            <Field
              label="Phone number"
              error={errors.contactPhone?.message as string}
            >
              <Input
                type="tel"
                {...register("contactPhone")}
                placeholder="07700 900000"
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
          Next: Drop-off
        </Button>
      </VStack>
    </Box>
  );
}
