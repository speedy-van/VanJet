"use client";

// ─── VanJet · Admin Login Page ────────────────────────────────
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
} from "@chakra-ui/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/admin");
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        bg="white"
        borderRadius="xl"
        shadow="lg"
        p={{ base: 6, md: 10 }}
        w={{ base: "90%", sm: "420px" }}
      >
        <VStack gap={1} mb={6}>
          <Text fontSize="2xl" fontWeight="800" color="brand.500">
            Van<Text as="span" color="gray.800">Jet</Text>
          </Text>
          <Text fontSize="lg" fontWeight="600" color="gray.700">
            Admin Sign In
          </Text>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
            <Box w="full">
              <Text fontSize="sm" fontWeight="500" mb={1} color="gray.600">
                Email
              </Text>
              <Input
                type="email"
                placeholder="admin@vanjet.co.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
              />
            </Box>

            <Box w="full">
              <Text fontSize="sm" fontWeight="500" mb={1} color="gray.600">
                Password
              </Text>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="lg"
              />
            </Box>

            {error && (
              <Box
                w="full"
                bg="red.50"
                borderWidth="1px"
                borderColor="red.200"
                borderRadius="md"
                px={3}
                py={2}
              >
                <Text fontSize="sm" color="red.600">
                  {error}
                </Text>
              </Box>
            )}

            <Button
              type="submit"
              colorPalette="blue"
              size="lg"
              w="full"
              loading={loading}
              loadingText="Signing in…"
            >
              Sign In
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}
