"use client";

// ─── VanJet · Admin Shell (Sidebar + Topbar) ──────────────────
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Button,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Jobs", href: "/admin/jobs", icon: "📦" },
  { label: "Bookings", href: "/admin/bookings", icon: "📋" },
  { label: "Quotes", href: "/admin/quotes", icon: "💬" },
  { label: "Drivers", href: "/admin/drivers", icon: "🚚" },
  { label: "Users", href: "/admin/users", icon: "👥" },
];

interface AdminShellProps {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <VStack gap={1} align="stretch" flex="1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link key={item.href} href={item.href} onClick={onNavigate}>
            <Box
              px={3}
              py={2}
              borderRadius="md"
              bg={isActive ? "blue.50" : "transparent"}
              color={isActive ? "blue.700" : "gray.700"}
              fontWeight={isActive ? "600" : "400"}
              fontSize="sm"
              _hover={{ bg: isActive ? "blue.50" : "gray.100" }}
              transition="all 0.15s"
            >
              {item.icon}  {item.label}
            </Box>
          </Link>
        );
      })}
    </VStack>
  );
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <Box
        as="aside"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        w="240px"
        bg="white"
        borderRightWidth="1px"
        borderColor="gray.200"
        position="fixed"
        top="0"
        left="0"
        bottom="0"
        zIndex="100"
        p={4}
      >
        <Link href="/admin">
          <Text fontSize="xl" fontWeight="800" color="brand.500" mb={6}>
            Van<Text as="span" color="gray.800">Jet</Text>
          </Text>
        </Link>

        <SidebarContent pathname={pathname} />

        <Box pt={4} borderTopWidth="1px" borderColor="gray.200" mt={4}>
          <Text fontSize="xs" color="gray.500" mb={1} truncate>
            {user.email}
          </Text>
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            w="full"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Sign Out
          </Button>
        </Box>
      </Box>

      {/* ── Mobile Overlay ──────────────────────────────── */}
      {mobileOpen && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          inset="0"
          bg="blackAlpha.500"
          zIndex="199"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar Drawer ───────────────────────── */}
      <Box
        display={{ base: mobileOpen ? "flex" : "none", md: "none" }}
        flexDirection="column"
        position="fixed"
        top="0"
        left="0"
        bottom="0"
        w="260px"
        bg="white"
        zIndex="200"
        p={4}
        shadow="xl"
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="xl" fontWeight="800" color="brand.500">
            Van<Text as="span" color="gray.800">Jet</Text>
          </Text>
          <IconButton
            aria-label="Close menu"
            size="sm"
            variant="ghost"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </IconButton>
        </Flex>

        <SidebarContent
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />

        <Box pt={4} borderTopWidth="1px" borderColor="gray.200" mt={4}>
          <Text fontSize="xs" color="gray.500" mb={1} truncate>
            {user.email}
          </Text>
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            w="full"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Sign Out
          </Button>
        </Box>
      </Box>

      {/* ── Main Content Area ───────────────────────────── */}
      <Box
        flex="1"
        ml={{ base: 0, md: "240px" }}
        minH="100vh"
      >
        {/* Topbar */}
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="50"
          bg="white"
          borderBottomWidth="1px"
          borderColor="gray.200"
          px={{ base: 4, md: 6 }}
          py={3}
          align="center"
          justify="space-between"
        >
          <HStack gap={3}>
            {/* Mobile hamburger */}
            <IconButton
              aria-label="Open menu"
              display={{ base: "flex", md: "none" }}
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </IconButton>
            <Text fontWeight="600" fontSize="lg" color="gray.800">
              {NAV_ITEMS.find((n) =>
                n.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(n.href)
              )?.label ?? "Admin"}
            </Text>
          </HStack>

          <HStack gap={2} display={{ base: "none", md: "flex" }}>
            <Text fontSize="sm" color="gray.500">
              {user.name}
            </Text>
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box p={{ base: 4, md: 6 }}>{children}</Box>
      </Box>
    </Flex>
  );
}
