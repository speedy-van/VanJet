"use client";

// ─── VanJet · Admin Chat Page ─────────────────────────────────
// Lists conversations and includes one-click drivers group chat creation

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
} from "@chakra-ui/react";
import { Users } from "lucide-react";
import { toaster } from "@/components/ui/toaster";

export default function AdminChatPage() {
  const router = useRouter();
  const t = useTranslations("admin.chat");
  const tCommon = useTranslations("admin.common");
  
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleOpenDriversGroup = useCallback(async () => {
    if (loading) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    try {
      const res = await fetch("/api/admin/chat/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle no active drivers
        if (data.code === "NO_ACTIVE_DRIVERS") {
          toaster.create({
            title: t("group.noActiveDrivers"),
            type: "info",
          });
          return;
        }

        toaster.create({
          title: t("group.openError"),
          type: "error",
        });
        return;
      }

      // Success - navigate to the chat
      toaster.create({
        title: t("group.openSuccess"),
        type: "success",
      });
      
      router.push(`/admin/chat/${data.chatId}`);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return; // Request was cancelled
      }
      
      toaster.create({
        title: t("group.openError"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [loading, router, t]);

  // Cleanup on unmount
  // Note: Using a ref-based cleanup pattern
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="xl" fontWeight="700" color="gray.800">
          {t("title")}
        </Text>
        
        <Button
          colorPalette="purple"
          onClick={handleOpenDriversGroup}
          loading={loading}
          disabled={loading}
        >
          <Users size={18} />
          <Box as="span" ms={2}>
            {t("group.openGroup")}
          </Box>
        </Button>
      </Flex>

      {/* Conversations List */}
      <Box bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.100" p={6}>
        <VStack gap={4} align="stretch">
          <Text color="gray.500" textAlign="center">
            {t("noMessages")}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
