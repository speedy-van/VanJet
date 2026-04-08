"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Input, Button, Flex } from "@chakra-ui/react";

interface SearchBarProps {
  currentQuery: string;
}

export function SearchBar({ currentQuery }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.delete("page"); // Reset to page 1 when searching
    
    router.push(`/admin/jobs?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`/admin/jobs?${params.toString()}`);
  };

  return (
    <Box as="form" onSubmit={handleSearch}>
      <Flex gap={2}>
        <Input
          placeholder="Search by reference number (e.g., VJ-1234)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          bg="white"
          borderColor="gray.200"
          _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #7C3AED" }}
          fontSize="sm"
        />
        <Button
          type="submit"
          bg="#7C3AED"
          color="white"
          fontWeight="600"
          _hover={{ bg: "#6D28D9" }}
          px={6}
        >
          Search
        </Button>
        {query && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            fontWeight="600"
            color="gray.600"
          >
            Clear
          </Button>
        )}
      </Flex>
    </Box>
  );
}
