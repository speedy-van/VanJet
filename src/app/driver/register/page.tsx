"use client";

// ─── VanJet · Driver Registration Page ────────────────────────
import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
  Flex,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VAN_SIZES = [
  "Small Van",
  "SWB",
  "MWB",
  "LWB",
  "XLWB",
  "Luton",
  "Luton Tail Lift",
];

const COVERAGE_OPTIONS = [
  { value: 15, label: "15 mi" },
  { value: 30, label: "30 mi" },
  { value: 60, label: "60 mi" },
  { value: 100, label: "100 mi" },
  { value: 150, label: "150+ mi" },
];

export default function DriverRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    vanSize: "",
    coverageRadius: 50,
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!form.name.trim()) return setError("Full name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!form.phone.trim()) return setError("Phone number is required.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!form.vanSize) return setError("Please select your van size.");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          companyName: form.companyName || undefined,
          vanSize: form.vanSize,
          coverageRadius: form.coverageRadius,
          bio: form.bio || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ───────────────────────────────────────────
  if (success) {
    return (
      <Box bg="gray.50" minH="100dvh" py={{ base: 8, md: 16 }}>
        <Container maxW="container.sm">
          <Box
            bg="white"
            borderRadius="xl"
            p={{ base: 6, md: 10 }}
            boxShadow="sm"
            textAlign="center"
          >
            <VStack gap={6}>
              <Flex
                w="80px"
                h="80px"
                borderRadius="full"
                bg="#ECFDF5"
                color="#059669"
                align="center"
                justify="center"
                fontSize="3xl"
                fontWeight="800"
              >
                ✓
              </Flex>
              <Heading size="lg" color="#111827">
                Registration Successful!
              </Heading>
              <Text color="#4B5563" maxW="400px" lineHeight="1.7">
                Your driver account has been created. Our team will review and
                verify your profile shortly. You will receive a confirmation
                email once approved.
              </Text>
              <Link href="/driver/login">
                <Button
                  bg="#1D4ED8"
                  color="white"
                  size="lg"
                  fontWeight="700"
                  borderRadius="8px"
                  h="48px"
                  _hover={{ bg: "#1840B8" }}
                >
                  Go to Driver Login
                </Button>
              </Link>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  // ── Registration form ───────────────────────────────────────
  return (
    <Box bg="gray.50" minH="100dvh" py={{ base: 8, md: 16 }}>
      <Container maxW="container.sm">
        <VStack gap={6} alignItems="stretch">
          {/* Header */}
          <Box textAlign="center" mb={2}>
            <Heading
              as="h1"
              size={{ base: "xl", md: "2xl" }}
              color="#111827"
              fontWeight="800"
            >
              Become a VanJet Driver
            </Heading>
            <Text color="#6B7280" mt={2} fontSize="md">
              Join our network of verified removal professionals across the UK.
            </Text>
          </Box>

          {/* Form Card */}
          <Box
            bg="white"
            borderRadius="xl"
            p={{ base: 5, md: 8 }}
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <VStack gap={5} alignItems="stretch">
              {/* Personal info */}
              <Text fontWeight="700" color="#111827" fontSize="md">
                Personal Information
              </Text>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                  Full Name *
                </Text>
                <Input
                  placeholder="John Smith"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                  Email Address *
                </Text>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                  Phone Number *
                </Text>
                <Input
                  type="tel"
                  placeholder="07700 900000"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </Box>

              <HStack gap={4}>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                    Password *
                  </Text>
                  <Input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                  />
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                    Confirm Password *
                  </Text>
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                  />
                </Box>
              </HStack>

              {/* Divider */}
              <Box borderTopWidth="1px" borderColor="gray.200" pt={4} mt={1}>
                <Text fontWeight="700" color="#111827" fontSize="md">
                  Vehicle &amp; Service Details
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                  Company Name (optional)
                </Text>
                <Input
                  placeholder="Your removal company name"
                  value={form.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={2}>
                  Van Size *
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {VAN_SIZES.map((size) => (
                    <Button
                      key={size}
                      size="sm"
                      bg={form.vanSize === size ? "#1D4ED8" : "white"}
                      color={form.vanSize === size ? "white" : "#374151"}
                      borderWidth="1px"
                      borderColor={form.vanSize === size ? "#1D4ED8" : "#D1D5DB"}
                      fontWeight="600"
                      borderRadius="8px"
                      onClick={() => updateField("vanSize", size)}
                      _hover={{
                        bg: form.vanSize === size ? "#1840B8" : "#F9FAFB",
                      }}
                    >
                      {size}
                    </Button>
                  ))}
                </Flex>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={2}>
                  Coverage Radius
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {COVERAGE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      bg={form.coverageRadius === opt.value ? "#1D4ED8" : "white"}
                      color={form.coverageRadius === opt.value ? "white" : "#374151"}
                      borderWidth="1px"
                      borderColor={
                        form.coverageRadius === opt.value ? "#1D4ED8" : "#D1D5DB"
                      }
                      fontWeight="600"
                      borderRadius="8px"
                      onClick={() => updateField("coverageRadius", opt.value)}
                      _hover={{
                        bg:
                          form.coverageRadius === opt.value
                            ? "#1840B8"
                            : "#F9FAFB",
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </Flex>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color="#374151" mb={1}>
                  About You (optional)
                </Text>
                <Textarea
                  placeholder="Tell customers about your experience, specialities, and what makes your service great..."
                  value={form.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={3}
                />
              </Box>

              {/* Error */}
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

              {/* Submit */}
              <Button
                bg="#1D4ED8"
                color="white"
                size="lg"
                fontWeight="700"
                borderRadius="8px"
                h="52px"
                w="full"
                _hover={{ bg: "#1840B8" }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Driver Account"}
              </Button>

              {/* Login link */}
              <Text textAlign="center" fontSize="sm" color="#6B7280">
                Already have an account?{" "}
                <Link
                  href="/driver/login"
                  style={{ color: "#1D4ED8", fontWeight: 600 }}
                >
                  Sign in here
                </Link>
              </Text>
            </VStack>
          </Box>

          {/* Benefits */}
          <Box
            bg="white"
            borderRadius="xl"
            p={{ base: 5, md: 8 }}
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Text fontWeight="700" color="#111827" fontSize="md" mb={4}>
              Why Join VanJet?
            </Text>
            <VStack gap={3} alignItems="stretch">
              {[
                { icon: "💷", text: "Keep 100% of every job — zero platform fees" },
                { icon: "📱", text: "Get job alerts in your coverage area" },
                { icon: "🔒", text: "Secure payments via Stripe" },
                { icon: "⭐", text: "Build your reputation with customer reviews" },
                { icon: "🚐", text: "Flexible schedule — work when you want" },
                { icon: "📍", text: "Live GPS tracking for customer confidence" },
              ].map((item) => (
                <HStack key={item.text} gap={3}>
                  <Text fontSize="xl">{item.icon}</Text>
                  <Text fontSize="sm" color="#374151">
                    {item.text}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
