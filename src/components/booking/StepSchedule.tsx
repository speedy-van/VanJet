"use client";

import { useState } from "react";
import {
  Box,
  VStack,
  Text,
  Button,
  Flex,
  HStack,
  SimpleGrid,
  Textarea,
} from "@chakra-ui/react";
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

// Native Calendar Component
function Calendar({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const startPadding = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const monthName = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isWeekend = (dayNum: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  const isPast = (dayNum: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isTooFar = (dayNum: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
    return date > maxDate;
  };

  const formatDateString = (dayNum: number): string => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const day = String(dayNum).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const days = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(<Box key={`pad-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateString(d);
    const isSelected = selectedDate === dateStr;
    const isDisabled = isPast(d) || isTooFar(d);
    const weekend = isWeekend(d);

    days.push(
      <Flex
        key={d}
        align="center"
        justify="center"
        h="40px"
        borderRadius="md"
        cursor={isDisabled ? "not-allowed" : "pointer"}
        bg={
          isSelected
            ? "#1D4ED8"
            : weekend && !isDisabled
            ? "#FEF3C7"
            : "transparent"
        }
        color={isSelected ? "white" : isDisabled ? "#D1D5DB" : "#111827"}
        fontWeight={isSelected ? "700" : "500"}
        fontSize="sm"
        opacity={isDisabled ? 0.4 : 1}
        _hover={
          isDisabled
            ? {}
            : {
                bg: isSelected ? "#1E40AF" : weekend ? "#FDE68A" : "#F3F4F6",
              }
        }
        transition="all 0.15s"
        onClick={() => !isDisabled && onSelectDate(dateStr)}
        title={
          weekend && !isDisabled
            ? "Weekend — higher demand, prices may be slightly higher"
            : undefined
        }
      >
        {d}
      </Flex>
    );
  }

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={4}
      bg="white"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={3}>
        <Button size="sm" variant="ghost" onClick={prevMonth}>
          ←
        </Button>
        <Text fontSize="md" fontWeight="700" color="gray.800">
          {monthName}
        </Text>
        <Button size="sm" variant="ghost" onClick={nextMonth}>
          →
        </Button>
      </Flex>

      {/* Day labels */}
      <SimpleGrid columns={7} gap={1} mb={2}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Text
            key={day}
            fontSize="xs"
            fontWeight="600"
            color="gray.500"
            textAlign="center"
          >
            {day}
          </Text>
        ))}
      </SimpleGrid>

      {/* Days grid */}
      <SimpleGrid columns={7} gap={1}>
        {days}
      </SimpleGrid>

      {/* Legend */}
      <HStack gap={4} mt={3} fontSize="xs" color="gray.600">
        <HStack gap={1}>
          <Box w="12px" h="12px" bg="#FEF3C7" borderRadius="sm" />
          <Text>Weekend</Text>
        </HStack>
        <HStack gap={1}>
          <Box w="12px" h="12px" bg="#1D4ED8" borderRadius="sm" />
          <Text>Selected</Text>
        </HStack>
      </HStack>
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
  } = form;

  const [error, setError] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const selectedDate = watch("schedule.preferredDate");
  const selectedTime = watch("schedule.timeWindow");
  const flexible = watch("schedule.flexibleDates");

  const timeOptions = [
    {
      value: "morning",
      emoji: "🌅",
      label: "Morning",
      time: "7am-12pm",
      badge: "Most popular",
    },
    {
      value: "afternoon",
      emoji: "☀️",
      label: "Afternoon",
      time: "12pm-5pm",
      badge: null,
    },
    {
      value: "evening",
      emoji: "🌆",
      label: "Evening",
      time: "5pm-8pm",
      badge: "Limited availability",
    },
  ];

  const handleNext = () => {
    if (!selectedDate) {
      setError("Please select a date from the calendar.");
      return;
    }
    if (!selectedTime) {
      setError("Please select a time preference.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={{ base: 5, md: 8 }}>
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            When do you want to move?
          </Text>
          <Text fontSize="sm" color="gray.500">
            Choose your preferred date and time window.
          </Text>
        </Box>

        {error && (
          <Text fontSize="sm" color="red.500" fontWeight="600">
            {error}
          </Text>
        )}

        {/* ── Calendar ───────────────────────────────── */}
        <Field label="Select date">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setValue("schedule.preferredDate", d);
              setError("");
            }}
          />
        </Field>

        {/* ── Time preference ────────────────────────── */}
        <Field label="Time preference">
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3}>
            {timeOptions.map((opt) => (
              <Box
                key={opt.value}
                borderWidth="2px"
                borderColor={
                  selectedTime === opt.value ? "#1D4ED8" : "#E5E7EB"
                }
                borderRadius="lg"
                p={4}
                cursor="pointer"
                bg={selectedTime === opt.value ? "#EFF6FF" : "white"}
                _hover={{
                  shadow: "md",
                  borderColor: selectedTime === opt.value ? "#1E40AF" : "#D1D5DB",
                }}
                transition="all 0.15s"
                onClick={() => {
                  setValue("schedule.timeWindow", opt.value);
                  setError("");
                }}
                position="relative"
              >
                {opt.badge && (
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    fontSize="2xs"
                    fontWeight="600"
                    color={
                      opt.badge === "Most popular" ? "#059669" : "#D97706"
                    }
                    bg={
                      opt.badge === "Most popular" ? "#D1FAE5" : "#FEF3C7"
                    }
                    px={2}
                    py={0.5}
                    borderRadius="md"
                  >
                    {opt.badge}
                  </Box>
                )}
                <VStack align="start" gap={1}>
                  <Text fontSize="2xl">{opt.emoji}</Text>
                  <Text fontSize="md" fontWeight="700" color="gray.800">
                    {opt.label}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {opt.time}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Field>

        {/* ── Flexibility toggle ─────────────────────── */}
        <Box>
          <Flex as="label" align="center" gap={2} cursor="pointer">
            <input
              type="checkbox"
              checked={flexible}
              onChange={(e) =>
                setValue("schedule.flexibleDates", e.target.checked)
              }
              style={{ width: 18, height: 18, accentColor: "#1D4ED8" }}
            />
            <Text fontSize="sm" color="gray.700" fontWeight="600">
              My dates are flexible (±2 days)
            </Text>
          </Flex>
          {flexible && (
            <Text fontSize="sm" color="green.600" fontWeight="600" mt={2}>
              ✅ Flexible dates can reduce price by up to 15%
            </Text>
          )}
        </Box>

        {/* ── Special instructions ───────────────────── */}
        <Field label="Special instructions (optional)">
          <Textarea
            value={specialInstructions}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setSpecialInstructions(e.target.value);
              }
            }}
            placeholder="Anything the driver should know? e.g. narrow road, parking restrictions, fragile items..."
            rows={4}
            bg="white"
            maxLength={500}
          />
          <Text fontSize="xs" color="gray.400" mt={1} textAlign="right">
            {specialInstructions.length} / 500
          </Text>
        </Field>

        {/* ── Navigation ─────────────────────────────── */}
        <HStack justify="space-between" pt={4} borderTop="1px solid" borderColor="gray.200">
          <Button variant="ghost" onClick={onBack} fontWeight="600">
            ← Back
          </Button>
          <Button
            colorPalette="blue"
            size="lg"
            fontWeight="700"
            onClick={handleNext}
            disabled={!selectedDate || !selectedTime}
            opacity={selectedDate && selectedTime ? 1 : 0.5}
            cursor={selectedDate && selectedTime ? "pointer" : "not-allowed"}
          >
            Next: Review →
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
