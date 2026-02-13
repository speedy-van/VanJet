"use client";

import { useState, useRef, useCallback } from "react";
import { Box, Input, VStack, Text } from "@chakra-ui/react";
import { publicEnv } from "@/lib/env";

interface Suggestion {
  placeName: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: { address: string; lat: number; lng: number }) => void;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing an address...",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const token = publicEnv.MAPBOX_TOKEN;
    if (!token) return;

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?country=GB&limit=5&types=address,place,postcode&access_token=${token}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const results: Suggestion[] = (data.features ?? []).map(
        (f: { place_name: string; center: [number, number] }) => ({
          placeName: f.place_name,
          lat: f.center[1],
          lng: f.center[0],
        })
      );
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch {
      /* silent */
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (s: Suggestion) => {
    onChange(s.placeName);
    onSelect({ address: s.placeName, lat: s.lat, lng: s.lng });
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <Box position="relative" w="100%">
      <Input
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        autoComplete="off"
        bg="white"
      />
      {open && suggestions.length > 0 && (
        <VStack
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          bg="white"
          shadow="lg"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.200"
          zIndex={100}
          p={1}
          gap={0}
          maxH="220px"
          overflowY="auto"
        >
          {suggestions.map((s, i) => (
            <Box
              key={i}
              w="100%"
              px={3}
              py={2}
              cursor="pointer"
              borderRadius="md"
              _hover={{ bg: "blue.50" }}
              onMouseDown={() => handleSelect(s)}
            >
              <Text fontSize="sm" color="gray.700">
                {s.placeName}
              </Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
