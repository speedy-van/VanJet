"use client";

// ─── VanJet · Customer Login Page ──────────────────────────────
// Sign in for customers. Prevents double submit via loading state.

import { useState, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Input,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/my-bookings");
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  }, [email, password, router]);

  return (
    <Box bg="gray.50" minH="100dvh" py={{ base: 8, md: 16 }}>
      <Container maxW="420px">
        <VStack gap={6} alignItems="stretch">
          <Box textAlign="center">
            <Link href="/">
              <Text
                fontSize="2xl"
                fontWeight="800"
                color="#1D4ED8"
                letterSpacing="-0.5px"
              >
                VanJet
              </Text>
            </Link>
            <Heading
              as="h1"
              size={{ base: "lg", md: "xl" }}
              color="#111827"
              fontWeight="800"
              mt={4}
            >
              Sign in
            </Heading>
            <Text color="#6B7280" mt={1} fontSize="sm">
              View your bookings and track your moves.
            </Text>
          </Box>

          <Box
            bg="white"
            borderRadius="xl"
            p={{ base: 6, md: 8 }}
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <VStack gap={4} alignItems="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                  Email
                </Text>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
                  disabled={loading}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                  Password
                </Text>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
                  disabled={loading}
                />
              </Box>

              {error && (
                <Box
                  bg="#FEF2F2"
                  borderWidth="1px"
                  borderColor="#FECACA"
                  borderRadius="8px"
                  px={4}
                  py={3}
                >
                  <Text color="#DC2626" fontSize="sm" fontWeight="500">
                    {error}
                  </Text>
                </Box>
              )}

              <Button
                bg="#1D4ED8"
                color="white"
                size="lg"
                fontWeight="700"
                borderRadius="8px"
                h="48px"
                w="full"
                _hover={{ bg: "#1840B8" }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <Text textAlign="center" fontSize="sm" color="#6B7280">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  style={{ color: "#1D4ED8", fontWeight: 600 }}
                >
                  Register
                </Link>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
