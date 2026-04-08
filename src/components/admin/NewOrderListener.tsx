"use client";

// ─── VanJet · New Order Listener Component ────────────────────
// Polls for new orders and shows toast + plays sound
// Uses polling instead of SSE for serverless compatibility

import { useEffect, useRef, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Box, Flex, Text, Button, Badge } from "@chakra-ui/react";
import { Bell, X, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

// Polling interval in milliseconds (10 seconds)
const POLL_INTERVAL = 10000;

interface OrderEvent {
  orderId?: string;
  orderNumber?: string;
  serviceType?: string;
  pickup?: string;
  delivery?: string;
  price?: number;
  createdAt?: string;
}

interface NewOrderNotification {
  id: string;
  orderNumber: string;
  serviceType: string;
  pickup: string;
  delivery: string;
  price: number;
  createdAt: string;
}

export function NewOrderListener() {
  const t = useTranslations("admin.notifications.newOrder");
  
  const [notifications, setNotifications] = useState<NewOrderNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connected, setConnected] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCheckedRef = useRef<string>(new Date().toISOString());
  const seenOrdersRef = useRef<Set<string>>(new Set());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/new-order.mp3");
    audioRef.current.volume = 0.7;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Browser may block autoplay - user needs to interact first
        console.log("[NewOrderListener] Sound blocked by browser policy");
      });
    }
  }, [soundEnabled]);

  // Handle new order event
  const handleNewOrder = useCallback(
    (event: OrderEvent) => {
      if (!event.orderNumber) return;
      
      // Skip if we've already seen this order
      if (seenOrdersRef.current.has(event.orderNumber)) return;
      seenOrdersRef.current.add(event.orderNumber);

      const notification: NewOrderNotification = {
        id: event.orderId || crypto.randomUUID(),
        orderNumber: event.orderNumber,
        serviceType: event.serviceType || "unknown",
        pickup: event.pickup || "",
        delivery: event.delivery || "",
        price: event.price || 0,
        createdAt: event.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
      playSound();
    },
    [playSound]
  );

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Poll for new orders
  const pollForOrders = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/orders/poll?since=${encodeURIComponent(lastCheckedRef.current)}`
      );
      
      if (!response.ok) {
        setConnected(false);
        return;
      }
      
      setConnected(true);
      const data = await response.json();
      
      // Update last checked timestamp
      if (data.timestamp) {
        lastCheckedRef.current = data.timestamp;
      }
      
      // Process new orders
      if (data.orders && Array.isArray(data.orders)) {
        for (const order of data.orders) {
          handleNewOrder(order);
        }
      }
    } catch (error) {
      console.error("[NewOrderListener] Poll error:", error);
      setConnected(false);
    }
  }, [handleNewOrder]);

  // Setup polling
  useEffect(() => {
    // Initial poll
    pollForOrders();
    
    // Start polling interval
    pollIntervalRef.current = setInterval(pollForOrders, POLL_INTERVAL);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollForOrders]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
    
    // Try to play a silent sound to enable audio context
    if (!soundEnabled && audioRef.current) {
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        if (audioRef.current) audioRef.current.volume = 0.7;
      }).catch(() => {});
    }
  }, [soundEnabled]);

  return (
    <>
      {/* Sound Toggle Button - Fixed position */}
      <Box position="fixed" bottom={4} left={4} zIndex="1000">
        <Button
          size="sm"
          variant={soundEnabled ? "solid" : "outline"}
          colorPalette={soundEnabled ? "green" : "gray"}
          onClick={toggleSound}
          title={soundEnabled ? "Sound enabled" : "Sound disabled"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </Button>
      </Box>

      {/* Notifications - Fixed position, top right */}
      <Box
        position="fixed"
        top={20}
        right={4}
        zIndex="1100"
        maxW="360px"
        w="full"
      >
        {notifications.map((notification, idx) => (
          <Box
            key={notification.id}
            bg="white"
            borderRadius="lg"
            boxShadow="lg"
            borderWidth="1px"
            borderColor="blue.200"
            overflow="hidden"
            mb={2}
            animation={`slideIn 0.3s ease ${idx * 0.05}s`}
            css={{
              "@keyframes slideIn": {
                from: { transform: "translateX(100%)", opacity: 0 },
                to: { transform: "translateX(0)", opacity: 1 },
              },
            }}
          >
            {/* Header */}
            <Flex
              align="center"
              justify="space-between"
              bg="blue.500"
              color="white"
              px={3}
              py={2}
            >
              <Flex align="center" gap={2}>
                <Bell size={16} />
                <Text fontWeight="600" fontSize="sm">
                  {t("title")}
                </Text>
              </Flex>
              <Button
                size="xs"
                variant="ghost"
                color="white"
                p={0}
                minW="auto"
                h="auto"
                onClick={() => dismissNotification(notification.id)}
                _hover={{ bg: "blue.600" }}
              >
                <X size={16} />
              </Button>
            </Flex>

            {/* Content */}
            <Box p={3}>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontWeight="700" fontFamily="mono">
                  #{notification.orderNumber}
                </Text>
                <Badge colorPalette="blue" textTransform="capitalize">
                  {notification.serviceType}
                </Badge>
              </Flex>

              <Text fontSize="sm" color="gray.600" mb={1}>
                📍 {notification.pickup} → {notification.delivery}
              </Text>

              <Flex justify="space-between" align="center" mt={3}>
                <Text fontWeight="600" color="green.600">
                  £{notification.price.toFixed(2)}
                </Text>
                <Link href={`/admin/bookings`}>
                  <Button size="xs" colorPalette="blue">
                    {t("viewDetails")}
                  </Button>
                </Link>
              </Flex>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Connection indicator - small dot */}
      <Box
        position="fixed"
        bottom={4}
        left={14}
        w={2}
        h={2}
        borderRadius="full"
        bg={connected ? "green.400" : "red.400"}
        title={connected ? "Connected" : "Disconnected"}
      />
    </>
  );
}
