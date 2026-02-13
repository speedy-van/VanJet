"use client";

// ─── VanJet · Driver Verify / Unverify Toggle ────────────────
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@chakra-ui/react";

export function DriverVerifyToggle({
  driverProfileId,
  verified,
}: {
  driverProfileId: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await fetch("/api/admin/drivers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        driverProfileId,
        verified: !verified,
      }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      size="xs"
      variant="outline"
      colorPalette={verified ? "red" : "green"}
      onClick={handleToggle}
      loading={loading}
    >
      {verified ? "Unverify" : "Verify"}
    </Button>
  );
}
