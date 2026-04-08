"use client";

// ─── VanJet · Admin Shell (Sidebar + Topbar) ──────────────────
// Supports Arabic (RTL) and English (LTR) localization
// Collapsible sidebar with smooth animation
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Box,
  Flex,
  Text,
  VStack,
  Button,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { VanJetLogo } from "@/components/brand/VanJetLogo";
import type { Locale } from "@/i18n/config";

interface NavItem {
  labelKey: string;
  href: string;
  icon: string | ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "dashboard", href: "/admin", icon: "📊" },
  { labelKey: "jobs", href: "/admin/jobs", icon: "📦" },
  { labelKey: "bookings", href: "/admin/bookings", icon: "📋" },
  { labelKey: "quotes", href: "/admin/quotes", icon: "💬" },
  { labelKey: "applications", href: "/admin/applications", icon: "📝" },
  { labelKey: "drivers", href: "/admin/drivers", icon: "🚚" },
  { labelKey: "users", href: "/admin/users", icon: "👥" },
  { labelKey: "chat", href: "/admin/chat", icon: "💬" },
  { labelKey: "visitors", href: "/admin/visitors", icon: "👁️" },
  { labelKey: "aiAgent", href: "/admin/ai-agent", icon: <Image src="/images/zyphon-logo.svg" alt="Zyphon" width={20} height={20} /> },
  { labelKey: "auditLog", href: "/admin/audit-log", icon: "📜" },
];

interface AdminShellProps {
  user: { name: string; email: string; role: string };
  locale: Locale;
  children: React.ReactNode;
}

function SidebarContent({
  pathname,
  onNavigate,
  t,
  collapsed = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  t: (key: string) => string;
  collapsed?: boolean;
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
            <HStack
              px={3}
              py={2}
              borderRadius="md"
              bg={isActive ? "purple.50" : "transparent"}
              color={isActive ? "purple.700" : "gray.700"}
              fontWeight={isActive ? "600" : "400"}
              fontSize="sm"
              _hover={{ bg: isActive ? "purple.50" : "gray.100" }}
              transition="all 0.15s"
              gap={2}
              justifyContent={collapsed ? "center" : "flex-start"}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <Box flexShrink={0}>{item.icon}</Box>
              {!collapsed && <Text>{t(item.labelKey)}</Text>}
            </HStack>
          </Link>
        );
      })}
    </VStack>
  );
}

export function AdminShell({ user, locale, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const t = useTranslations("admin.navigation");

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vanjet-sidebar-collapsed");
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  // Save collapsed state to localStorage
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("vanjet-sidebar-collapsed", String(next));
      return next;
    });
  };

  // Sidebar width based on collapsed state
  const sidebarWidth = sidebarCollapsed ? "64px" : "240px";

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentItem = NAV_ITEMS.find((n) =>
      n.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(n.href)
    );
    return currentItem ? t(currentItem.labelKey) : t("dashboard");
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <Box
        as="aside"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        w={sidebarWidth}
        bg="white"
        borderRightWidth="1px"
        borderColor="gray.200"
        position="fixed"
        top="0"
        left="0"
        bottom="0"
        zIndex="100"
        p={sidebarCollapsed ? 2 : 4}
        transition="all 0.2s ease-in-out"
        overflow="hidden"
      >
        {/* Logo */}
        <Link href="/admin">
          <Box mb={6} overflow="hidden">
            {sidebarCollapsed ? (
              <Box
                w="40px"
                h="40px"
                mx="auto"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VanJetLogo variant="mark" width={32} height={32} />
              </Box>
            ) : (
              <VanJetLogo variant="lockup" width={140} height={46} />
            )}
          </Box>
        </Link>

        <SidebarContent pathname={pathname} t={t} collapsed={sidebarCollapsed} />

        {/* Collapse Toggle Button */}
        <Box pt={3} borderTopWidth="1px" borderColor="gray.200" mt="auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            w="full"
            onClick={toggleSidebar}
            display="flex"
            justifyContent={sidebarCollapsed ? "center" : "flex-start"}
            gap={2}
            color="gray.500"
            _hover={{ bg: "gray.100", color: "gray.700" }}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <Text fontSize="xs">Collapse</Text>
              </>
            )}
          </Button>
        </Box>

        {/* User Info & Sign Out */}
        <Box pt={3} borderTopWidth="1px" borderColor="gray.200" mt={2}>
          {!sidebarCollapsed && (
            <Text fontSize="xs" color="gray.500" mb={1} truncate>
              {user.email}
            </Text>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            colorPalette="red"
            w="full"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            title={sidebarCollapsed ? t("signOut") : undefined}
          >
            {sidebarCollapsed ? "🚪" : t("signOut")}
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
          <VanJetLogo variant="lockup" width={140} height={46} />
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
          t={t}
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
            {t("signOut")}
          </Button>
        </Box>
      </Box>

      {/* ── Main Content Area ───────────────────────────── */}
      <Box
        flex="1"
        ml={{ base: 0, md: sidebarWidth }}
        minH="100vh"
        transition="margin-left 0.2s ease-in-out"
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
              {getCurrentPageTitle()}
            </Text>
          </HStack>

          <HStack gap={2}>
            <NotificationBell />
            <ThemeToggle />
            <LanguageSwitcher currentLocale={locale} />
            <Text fontSize="sm" color="gray.500" display={{ base: "none", md: "block" }}>
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
