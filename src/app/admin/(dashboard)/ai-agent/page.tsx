"use client";

// ─── VanJet · Zyphon Agent Page ───────────────────────────────
// Chat interface for Zyphon — the admin AI agent

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Textarea,
  Badge,
} from "@chakra-ui/react";
import Image from "next/image";
import { Send, Trash2, User, Loader2, Zap, RotateCcw } from "lucide-react";
import { toaster } from "@/components/ui/toaster";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { labelKey: "chipOrders", prompt: "شلون الطلبات اليوم؟" },
  { labelKey: "chipDrivers", prompt: "وريني تقرير السائقين" },
  { labelKey: "chipVisitors", prompt: "شكو بالزوار اليوم؟" },
  { labelKey: "chipRevenue", prompt: "شلون الإيرادات هالشهر؟" },
];

export default function AdminAIAgentPage() {
  const t = useTranslations("admin.zyphon");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bootedRef = useRef(false);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Boot trigger — load persistent memory or get greeting
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/admin/ai-agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boot: true }),
        });
        if (!res.ok) return;
        const data = await res.json();

        if (data.history && data.history.length > 0) {
          setMessages(data.history);
        } else if (data.greeting) {
          setMessages([{ role: "assistant", content: data.greeting }]);
        }
      } catch {
        // Silent boot failure
      }
    })();
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setStreamingContent("");
    setCurrentTool(null);

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/admin/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to get response");
      }

      // Handle streaming response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            // Add complete assistant message
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: fullContent },
            ]);
            setStreamingContent("");
            break;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            }
            if (parsed.tool) {
              setCurrentTool(parsed.tool);
            }
            // Detect action plan from tool results and dispatch to cursor
            if (parsed.actionPlan) {
              window.dispatchEvent(
                new CustomEvent("zyphon:execute-plan", {
                  detail: { actions: parsed.actionPlan },
                })
              );
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;

      toaster.create({
        title: t("error"),
        type: "error",
      });
      
      console.error("[AI Agent] Error:", error);
    } finally {
      setLoading(false);
      setCurrentTool(null);
    }
  }, [input, loading, messages, t]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleClear = useCallback(async () => {
    setMessages([]);
    setStreamingContent("");
    setCurrentTool(null);
    // Reset conversation on server
    try {
      await fetch("/api/admin/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
    } catch {
      // Silent — local state already cleared
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <Flex direction="column" h="calc(100vh - 140px)" minH="500px">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <HStack gap={3}>
          <Box title={t("identityHint")} flexShrink={0}>
            <Image
              src="/images/zyphon-logo.svg"
              alt="Zyphon"
              width={40}
              height={40}
            />
          </Box>
          <Box>
            <HStack gap={2} align="center">
              <Text fontSize="xl" fontWeight="700" color="gray.800">
                {t("title")}
              </Text>
              <Badge colorPalette="purple" size="sm" variant="subtle">
                {t("byCreator")}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              {t("tagline")}
            </Text>
          </Box>
        </HStack>
        
        <HStack gap={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            disabled={loading || messages.length === 0}
          >
            <RotateCcw size={16} />
            <Box as="span" ms={2}>
              {t("resetBtn")}
            </Box>
          </Button>
        </HStack>
      </Flex>

      {/* Messages Area */}
      <Box
        flex="1"
        bg="white"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
        overflowY="auto"
        p={4}
        mb={4}
      >
        <VStack gap={4} align="stretch">
          {messages.length === 0 && !streamingContent && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={12}
              color="gray.400"
            >
              <Image
                src="/images/zyphon-logo.svg"
                alt="Zyphon"
                width={88}
                height={88}
              />
              <Text mt={4} textAlign="center" fontWeight="600" color="gray.600">
                Zyphon
              </Text>
              <Text mt={1} textAlign="center" fontSize="sm">
                {t("emptyState")}
              </Text>
              <HStack mt={4} gap={2} flexWrap="wrap" justify="center">
                {QUICK_ACTIONS.map((action) => (
                  <Button
                    key={action.labelKey}
                    size="sm"
                    variant="outline"
                    colorPalette="purple"
                    onClick={() => {
                      setInput(action.prompt);
                    }}
                  >
                    {t(action.labelKey)}
                  </Button>
                ))}
              </HStack>
            </Flex>
          )}

          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}

          {streamingContent && (
            <MessageBubble
              message={{ role: "assistant", content: streamingContent }}
              isStreaming
            />
          )}

          {currentTool && (
            <Flex justify="center">
              <Badge colorPalette="blue" px={3} py={1}>
                <Loader2 size={14} className="animate-spin" />
                <Text as="span" ms={2}>
                  {t("executing")}: {currentTool}
                </Text>
              </Badge>
            </Flex>
          )}

          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Input Area */}
      <Flex gap={3}>
        <Textarea
          flex="1"
          placeholder={t("placeholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          resize="none"
          rows={2}
          bg="white"
        />
        <Button
          colorPalette="blue"
          onClick={handleSend}
          loading={loading}
          disabled={loading || !input.trim()}
          px={6}
        >
          <Send size={18} />
        </Button>
      </Flex>
    </Flex>
  );
}

function MessageBubble({
  message,
  isStreaming = false,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <Flex justify={isUser ? "flex-end" : "flex-start"}>
      <HStack
        maxW="80%"
        bg={isUser ? "blue.500" : "gray.100"}
        color={isUser ? "white" : "gray.800"}
        px={4}
        py={3}
        borderRadius="lg"
        borderBottomRightRadius={isUser ? 0 : "lg"}
        borderBottomLeftRadius={isUser ? "lg" : 0}
        gap={2}
      >
        <Box flexShrink={0} alignSelf="flex-start" mt={0.5}>
          {isUser ? <User size={16} /> : <Zap size={16} />}
        </Box>
        <Text
          fontSize="sm"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
        >
          {message.content}
          {isStreaming && (
            <Box
              as="span"
              display="inline-block"
              w={2}
              h={4}
              bg="gray.400"
              ms={1}
              animation="blink 1s infinite"
              css={{
                "@keyframes blink": {
                  "0%, 50%": { opacity: 1 },
                  "51%, 100%": { opacity: 0 },
                },
              }}
            />
          )}
        </Text>
      </HStack>
    </Flex>
  );
}
