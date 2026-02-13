"use client";

// ─── VanJet · Quote Accept / Reject Actions ──────────────────
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HStack, Button } from "@chakra-ui/react";

export function QuoteActions({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: "accepted" | "rejected") {
    setLoading(action);
    await fetch("/api/admin/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId, status: action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <HStack gap={1}>
      <Button
        size="xs"
        colorPalette="green"
        variant="outline"
        onClick={() => handleAction("accepted")}
        loading={loading === "accepted"}
      >
        Accept
      </Button>
      <Button
        size="xs"
        colorPalette="red"
        variant="outline"
        onClick={() => handleAction("rejected")}
        loading={loading === "rejected"}
      >
        Reject
      </Button>
    </HStack>
  );
}
