"use client";

// ─── VanJet · Driver Application Actions ─────────────────────
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text, Button } from "@chakra-ui/react";

interface Props {
  driverProfileId: string;
  currentStatus: string;
}

export function ApplicationActions({ driverProfileId, currentStatus }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "rejecting">("idle");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(action: "approve" | "reject") {
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/drivers/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        driverProfileId,
        action,
        rejectionReason: action === "reject" ? reason : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    setMode("idle");
    router.refresh();
  }

  if (currentStatus !== "pending") {
    return null;
  }

  if (mode === "rejecting") {
    return (
      <Box mt={3}>
        <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>
          Rejection reason (required):
        </Text>
        <textarea
          style={{
            width: "100%",
            fontSize: "0.875rem",
            padding: "0.5rem",
            border: "1px solid #e2e8f0",
            borderRadius: "0.375rem",
            resize: "vertical",
            outline: "none",
          }}
          rows={3}
          placeholder="Explain why this application is being rejected..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />
        {error && (
          <Text fontSize="xs" color="red.500" mt={1}>{error}</Text>
        )}
        <Flex gap={2} mt={2}>
          <Button
            size="xs"
            colorPalette="red"
            onClick={() => handleAction("reject")}
            disabled={loading || !reason.trim()}
          >
            {loading ? "Rejecting…" : "Confirm Reject"}
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => { setMode("idle"); setError(""); }}
            disabled={loading}
          >
            Cancel
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Text fontSize="xs" color="red.500" mb={2}>{error}</Text>
      )}
      <Flex gap={2}>
        <Button
          size="xs"
          colorPalette="green"
          onClick={() => handleAction("approve")}
          disabled={loading}
        >
          {loading ? "Approving…" : "✓ Approve"}
        </Button>
        <Button
          size="xs"
          colorPalette="red"
          variant="outline"
          onClick={() => setMode("rejecting")}
          disabled={loading}
        >
          ✕ Reject
        </Button>
      </Flex>
    </Box>
  );
}
