"use client";

// ─── VanJet · Driver Login Page ───────────────────────────────
import { useState } from "react";
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

export default function DriverLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return setError("Email is required.");
    if (!password) return setError("Password is required.");

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
        return;
      }

      router.push("/driver/dashboard");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="gray.50" minH="100dvh" py={{ base: 8, md: 16 }}>
      <Container maxW="420px">
        <VStack gap={6} alignItems="stretch">
          {/* Header */}
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
              Driver Login
            </Heading>
            <Text color="#6B7280" mt={1} fontSize="sm">
              Sign in to manage your jobs and earnings.
            </Text>
          </Box>

          {/* Form Card */}
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
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <Text textAlign="center" fontSize="sm" color="#6B7280">
                Don&apos;t have an account?{" "}
                <Link
                  href="/driver/register"
                  style={{ color: "#1D4ED8", fontWeight: 600 }}
                >
                  Register here
                </Link>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
