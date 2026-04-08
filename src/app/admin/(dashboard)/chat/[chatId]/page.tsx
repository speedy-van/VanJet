"use client";

// ─── VanJet · Admin Chat Room ─────────────────────────────────
// Dynamic page for /admin/chat/[chatId] — real-time group messaging UI

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Badge,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { ArrowLeft, Send, Users } from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { useSession } from "next-auth/react";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string | null;
}

interface ChatInfo {
  id: string;
  name: string | null;
  chatType: string;
  memberCount: number;
  members: {
    userId: string;
    isAdmin: boolean;
    name: string;
    role: string;
    avatarUrl: string | null;
  }[];
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("admin.chat");
  const { data: session } = useSession();
  const chatId = params.chatId as string;

  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch chat info
  useEffect(() => {
    async function fetchChat() {
      try {
        const res = await fetch(`/api/admin/chat/${chatId}`);
        if (!res.ok) {
          toaster.create({ title: t("group.openError"), type: "error" });
          router.push("/admin/chat");
          return;
        }
        const data = await res.json();
        setChatInfo(data.chat);
      } catch {
        router.push("/admin/chat");
      }
    }
    fetchChat();
  }, [chatId, router, t]);

  // Fetch messages + polling
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/chat/${chatId}/messages?limit=100`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      // silent
    }
  }, [chatId]);

  useEffect(() => {
    fetchMessages().then(() => {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    });

    // Poll every 5 seconds for new messages
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages, scrollToBottom]);

  // Send message
  const handleSend = useCallback(async () => {
    const text = newMessage.trim();
    if (!text || sending) return;

    setSending(true);
    setNewMessage("");

    try {
      const res = await fetch(`/api/admin/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        toaster.create({ title: t("group.openError"), type: "error" });
        setNewMessage(text); // restore
        return;
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setTimeout(scrollToBottom, 50);
    } catch {
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, chatId, t, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentUserId = session?.user?.id;

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="lg" colorPalette="blue" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="calc(100vh - 100px)" maxH="calc(100vh - 100px)">
      {/* ── Header ──────────────────────────────────────────── */}
      <Flex
        align="center"
        gap={3}
        px={4}
        py={3}
        bg="white"
        borderBottomWidth="1px"
        borderColor="gray.100"
        borderTopRadius="lg"
        flexShrink={0}
      >
        <IconButton
          aria-label="Back"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/chat")}
        >
          <ArrowLeft size={18} />
        </IconButton>

        <Box flex="1">
          <Text fontWeight="700" fontSize="md" color="gray.800">
            {chatInfo?.name ?? t("group.driversGroup")}
          </Text>
          <HStack gap={1}>
            <Users size={12} />
            <Text fontSize="xs" color="gray.500">
              {chatInfo?.memberCount ?? 0} members
            </Text>
          </HStack>
        </Box>
      </Flex>

      {/* ── Messages Area ───────────────────────────────────── */}
      <Box
        flex="1"
        overflowY="auto"
        p={4}
        bg="gray.50"
        css={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "var(--chakra-colors-gray-300)",
            borderRadius: "3px",
          },
        }}
      >
        {messages.length === 0 ? (
          <Flex justify="center" align="center" h="100%">
            <Text color="gray.400" fontSize="sm">
              {t("noMessages")}
            </Text>
          </Flex>
        ) : (
          <VStack gap={3} align="stretch">
            {messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <Flex
                  key={msg.id}
                  justify={isOwn ? "flex-end" : "flex-start"}
                >
                  <Box
                    maxW="75%"
                    bg={isOwn ? "blue.500" : "white"}
                    color={isOwn ? "white" : "gray.800"}
                    borderRadius="xl"
                    px={4}
                    py={2}
                    borderWidth={isOwn ? "0" : "1px"}
                    borderColor="gray.100"
                    shadow="sm"
                  >
                    {!isOwn && (
                      <HStack gap={1} mb={1}>
                        <Text
                          fontSize="xs"
                          fontWeight="600"
                          color={isOwn ? "blue.100" : "blue.600"}
                        >
                          {msg.senderName}
                        </Text>
                        {msg.senderRole === "admin" && (
                          <Badge
                            colorPalette="purple"
                            size="sm"
                            fontSize="2xs"
                          >
                            Admin
                          </Badge>
                        )}
                      </HStack>
                    )}
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {msg.content}
                    </Text>
                    <Text
                      fontSize="2xs"
                      color={isOwn ? "blue.100" : "gray.400"}
                      textAlign="end"
                      mt={1}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* ── Input Area ──────────────────────────────────────── */}
      <Flex
        gap={2}
        px={4}
        py={3}
        bg="white"
        borderTopWidth="1px"
        borderColor="gray.100"
        borderBottomRadius="lg"
        flexShrink={0}
      >
        <Input
          flex="1"
          placeholder={t("typeMessage")}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          size="md"
        />
        <Button
          colorPalette="blue"
          onClick={handleSend}
          loading={sending}
          disabled={!newMessage.trim() || sending}
          size="md"
        >
          <Send size={16} />
          <Box as="span" ms={1} display={{ base: "none", md: "inline" }}>
            {t("sendMessage")}
          </Box>
        </Button>
      </Flex>
    </Flex>
  );
}
