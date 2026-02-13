"use client";

import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Flex,
  Stack,
  HStack,
} from "@chakra-ui/react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import type { BookingForm } from "./types";

interface StepDropoffProps {
  form: BookingForm;
  onNext: () => void;
  onBack: () => void;
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

export function StepDropoff({ form, onNext, onBack }: StepDropoffProps) {
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
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            Drop-off details
          </Text>
          <Text fontSize="sm" color="gray.500">
            Where should we deliver your items?
          </Text>
        </Box>

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
            style={{ width: 18, height: 18, accentColor: "#0070f3" }}
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

        <HStack justify="space-between" pt={4}>
          <Button variant="ghost" onClick={onBack} fontWeight="600">
            Back
          </Button>
          <Button
            colorPalette="blue"
            size="lg"
            fontWeight="700"
            onClick={handleNext}
          >
            Next: Items
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
