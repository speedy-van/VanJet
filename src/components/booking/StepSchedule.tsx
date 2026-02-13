"use client";

import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { TIME_WINDOWS } from "./types";
import type { BookingForm } from "./types";

interface StepScheduleProps {
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

export function StepSchedule({
  form,
  onNext,
  onBack,
}: StepScheduleProps) {
  const {
    watch,
    setValue,
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const selectedWindow = watch("schedule.timeWindow");

  const handleNext = () => {
    let valid = true;
    const vals = form.getValues();

    if (!vals.schedule.preferredDate) {
      setError("schedule.preferredDate", {
        message: "Please select a date.",
      });
      valid = false;
    } else {
      clearErrors("schedule.preferredDate");
    }

    if (!vals.schedule.timeWindow) {
      setError("schedule.timeWindow", {
        message: "Please select a time window.",
      });
      valid = false;
    } else {
      clearErrors("schedule.timeWindow");
    }

    if (valid) onNext();
  };

  // Minimum date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={{ base: 5, md: 8 }}>
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            When do you want to move?
          </Text>
          <Text fontSize="sm" color="gray.500">
            Choose your preferred date and time window.
          </Text>
        </Box>

        <Field
          label="Preferred date"
          error={
            (errors.schedule as Record<string, { message?: string }> | undefined)
              ?.preferredDate?.message
          }
        >
          <Input
            type="date"
            min={minDateStr}
            {...register("schedule.preferredDate")}
            bg="white"
          />
        </Field>

        <Field
          label="Time window"
          error={
            (errors.schedule as Record<string, { message?: string }> | undefined)
              ?.timeWindow?.message
          }
        >
          <Flex wrap="wrap" gap={2}>
            {TIME_WINDOWS.map((tw) => (
              <Button
                key={tw.value}
                size="sm"
                variant={
                  selectedWindow === tw.value ? "solid" : "outline"
                }
                colorPalette={
                  selectedWindow === tw.value ? "blue" : "gray"
                }
                onClick={() => {
                  setValue("schedule.timeWindow", tw.value);
                  clearErrors("schedule.timeWindow");
                }}
              >
                {tw.label}
              </Button>
            ))}
          </Flex>
        </Field>

        <Flex as="label" align="center" gap={2} cursor="pointer">
          <input
            type="checkbox"
            checked={watch("schedule.flexibleDates")}
            onChange={(e) =>
              setValue("schedule.flexibleDates", e.target.checked)
            }
            style={{ width: 18, height: 18, accentColor: "#0070f3" }}
          />
          <Text fontSize="sm" color="gray.700">
            My dates are flexible (±2 days)
          </Text>
        </Flex>

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
            Next: Review
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
