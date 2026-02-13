"use client";

// ─── VanJet · Job Status Update Form ─────────────────────────
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@chakra-ui/react";

const STATUSES = [
  "pending",
  "quoted",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
];

export function JobStatusForm({
  jobId,
  currentStatus,
}: {
  jobId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpdate() {
    if (status === currentStatus) return;
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, status }),
    });

    setLoading(false);

    if (res.ok) {
      setMessage("Status updated.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.error || "Failed to update status.");
    }
  }

  return (
    <Box>
      <select
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid #e2e8f0',
          fontSize: '0.875rem',
          marginBottom: '0.75rem',
        }}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ").toUpperCase()}
          </option>
        ))}
      </select>

      <Button
        size="sm"
        colorPalette="blue"
        onClick={handleUpdate}
        loading={loading}
        disabled={status === currentStatus}
      >
        Update Status
      </Button>

      {message && (
        <Text fontSize="sm" mt={2} color={message.includes("Failed") ? "red.500" : "green.600"}>
          {message}
        </Text>
      )}
    </Box>
  );
}
