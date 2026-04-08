"use client";

// ─── VanJet · Notification Bell Component ─────────────────────
// Shows unread count badge and dropdown with recent notifications

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Box, Flex, Text, Badge, VStack, IconButton } from "@chakra-ui/react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  severity: string;
  title: string;
  body: string | null;
  linkHref: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const t = useTranslations("admin.notificationCenter");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {
      // Silent
    }
  }, []);

  // Poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markRead = useCallback(
    async (id: string) => {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    },
    []
  );

  const markAllRead = useCallback(async () => {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  const severityColor: Record<string, string> = {
    info: "purple",
    success: "green",
    warning: "orange",
    error: "red",
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("justNow");
    if (mins < 60) return `${mins}${t("minsAgo")}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}${t("hoursAgo")}`;
    return `${Math.floor(hours / 24)}${t("daysAgo")}`;
  };

  return (
    <Box ref={bellRef} position="relative">
      <IconButton
        aria-label="Notifications"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((p) => !p)}
        position="relative"
      >
        <Bell size={20} />
        {unread > 0 && (
          <Badge
            colorPalette="red"
            position="absolute"
            top="-1"
            right="-1"
            fontSize="xs"
            borderRadius="full"
            minW={5}
            h={5}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {unread > 9 ? "9+" : unread}
          </Badge>
        )}
      </IconButton>

      {open && (
        <Box
          position="absolute"
          top="100%"
          right={0}
          mt={2}
          w="360px"
          maxH="400px"
          overflowY="auto"
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          borderWidth="1px"
          borderColor="gray.200"
          zIndex="1200"
        >
          {/* Header */}
          <Flex
            justify="space-between"
            align="center"
            px={4}
            py={3}
            borderBottomWidth="1px"
          >
            <Text fontWeight="600" fontSize="sm">
              {t("title")}
            </Text>
            {unread > 0 && (
              <Text
                fontSize="xs"
                color="purple.500"
                cursor="pointer"
                onClick={markAllRead}
                _hover={{ textDecoration: "underline" }}
              >
                <CheckCheck size={14} style={{ display: "inline", marginRight: 4 }} />
                {t("markAllRead")}
              </Text>
            )}
          </Flex>

          {/* Notification list */}
          <VStack gap={0} align="stretch">
            {notifications.length === 0 && (
              <Text py={6} textAlign="center" fontSize="sm" color="gray.400">
                {t("empty")}
              </Text>
            )}
            {notifications.slice(0, 10).map((n) => (
              <Flex
                key={n.id}
                px={4}
                py={3}
                gap={3}
                align="flex-start"
                bg={n.read ? "white" : "purple.50"}
                borderBottomWidth="1px"
                borderColor="gray.100"
                cursor="pointer"
                _hover={{ bg: n.read ? "gray.50" : "purple.100" }}
                onClick={() => {
                  if (!n.read) markRead(n.id);
                }}
              >
                <Box
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={
                    n.read
                      ? "transparent"
                      : `${severityColor[n.severity] || "purple"}.400`
                  }
                  mt={2}
                  flexShrink={0}
                />
                <Box flex="1" minW={0}>
                  <Text fontSize="sm" fontWeight={n.read ? "400" : "600"} lineClamp={1}>
                    {n.title}
                  </Text>
                  {n.body && (
                    <Text fontSize="xs" color="gray.500" lineClamp={2}>
                      {n.body}
                    </Text>
                  )}
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    {timeAgo(n.createdAt)}
                  </Text>
                </Box>
                {n.linkHref && (
                  <Link href={n.linkHref}>
                    <ExternalLink size={14} color="gray" />
                  </Link>
                )}
              </Flex>
            ))}
          </VStack>

          {/* Footer */}
          {notifications.length > 0 && (
            <Flex justify="center" py={2} borderTopWidth="1px">
              <Link href="/admin/notifications">
                <Text fontSize="xs" color="purple.500" _hover={{ textDecoration: "underline" }}>
                  {t("viewAll")}
                </Text>
              </Link>
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
}
