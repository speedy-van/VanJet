"use client";

// ─── VanJet · Customer Registration Page ───────────────────────
// Create a customer account. Prevents double submit via loading state.

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
import { useRouter } from "next/navigation";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  }, [name, email, password, phone, router]);

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
              Create account
            </Heading>
            <Text color="#6B7280" mt={1} fontSize="sm">
              Register to book moves and see your bookings in one place.
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
                  Full name
                </Text>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleRegister()}
                  disabled={loading}
                />
              </Box>

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
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleRegister()}
                  disabled={loading}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                  Password
                </Text>
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleRegister()}
                  disabled={loading}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                  Phone <Text as="span" color="gray.400">(optional)</Text>
                </Text>
                <Input
                  type="tel"
                  placeholder="01202 129746"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleRegister()}
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
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <Text textAlign="center" fontSize="sm" color="#6B7280">
                Already have an account?{" "}
                <Link
                  href="/login"
                  style={{ color: "#1D4ED8", fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
