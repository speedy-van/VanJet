"use client";

// ─── VanJet · Admin Booking Management (Client) ──────────────
// Action bar + Edit modal + Cancel modal + Reprice confirm + Audit log display.

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text, SimpleGrid, Button } from "@chakra-ui/react";

// ── Serialized types ───────────────────────────────────────────

interface SerializedBooking {
  id: string;
  jobId: string;
  quoteId: string | null;
  driverId: string | null;
  finalPrice: string;
  stripePaymentIntentId: string | null;
  paymentStatus: string;
  status: string;
  cancelledAt: string | null;
  cancelledReason: string | null;
  priceBreakdown: string | null;
  repricedAt: string | null;
  repricedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SerializedJob {
  id: string;
  customerId: string;
  jobType: string;
  status: string;
  pickupAddress: string;
  pickupLat: string | null;
  pickupLng: string | null;
  deliveryAddress: string;
  deliveryLat: string | null;
  deliveryLng: string | null;
  distanceKm: string | null;
  moveDate: string;
  description: string | null;
  estimatedPrice: string | null;
  finalPrice: string | null;
  pickupFloor: number | null;
  pickupFlat: string | null;
  pickupHasLift: boolean | null;
  pickupNotes: string | null;
  deliveryFloor: number | null;
  deliveryFlat: string | null;
  deliveryHasLift: boolean | null;
  deliveryNotes: string | null;
  preferredTimeWindow: string | null;
  flexibleDates: boolean | null;
  contactName: string | null;
  contactPhone: string | null;
  createdAt: string;
}

interface SerializedItem {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  weightKg: string | null;
  volumeM3: string | null;
  requiresDismantling: boolean | null;
  fragile: boolean | null;
  notes: string | null;
}

interface AuditLogEntry {
  id: string;
  createdAt: string;
  adminUserId: string;
  action: string;
  diffJson: string | null;
  note: string | null;
}

interface JobTypeOption {
  value: string;
  label: string;
}

interface Props {
  booking: SerializedBooking;
  job: SerializedJob;
  items: SerializedItem[];
  auditLogs: AuditLogEntry[];
  jobTypeOptions: JobTypeOption[];
}

// ── Shared styles ──────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #E5E7EB",
  fontSize: "14px",
  color: "#111827",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#6B7280",
  marginBottom: "4px",
};

// ── Main component ─────────────────────────────────────────────

export function BookingManagement({
  booking: initialBooking,
  job: initialJob,
  items: initialItems,
  auditLogs,
  jobTypeOptions,
}: Props) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [job, setJob] = useState(initialJob);
  const [items, setItems] = useState(initialItems);

  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [repriceOpen, setRepriceOpen] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const isCancelled = booking.status === "cancelled";

  const showMessage = useCallback(
    (text: string, type: "success" | "error") => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null), 5000);
    },
    []
  );

  return (
    <Box>
      {/* ── Action Bar ──────────────────────────── */}
      <Flex
        gap={3}
        mb={5}
        p={4}
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.100"
        flexWrap="wrap"
        align="center"
      >
        <Text fontWeight="600" fontSize="sm" color="gray.600" mr={2}>
          Actions:
        </Text>
        <Button
          size="sm"
          colorPalette="blue"
          onClick={() => setEditOpen(true)}
          disabled={isCancelled}
        >
          Edit Booking
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorPalette="blue"
          onClick={() => setRepriceOpen(true)}
          disabled={isCancelled}
        >
          Recalculate Price
        </Button>
        <Button
          size="sm"
          colorPalette="red"
          onClick={() => setCancelOpen(true)}
          disabled={isCancelled}
        >
          Cancel Booking
        </Button>

        {isCancelled && (
          <Text fontSize="xs" color="red.500" fontWeight="500">
            This booking has been cancelled.
          </Text>
        )}
      </Flex>

      {/* ── Status message ──────────────────────── */}
      {message && (
        <Box
          mb={4}
          p={3}
          borderRadius="lg"
          bg={message.type === "success" ? "green.50" : "red.50"}
          color={message.type === "success" ? "green.700" : "red.700"}
          fontSize="sm"
          fontWeight="500"
        >
          {message.text}
        </Box>
      )}

      {/* ── Price + Booking Info ─────────────────── */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5} mb={5}>
        <Box
          bg="white"
          borderRadius="xl"
          p={5}
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Pricing
          </Text>
          <Flex justify="space-between" py={1.5} borderBottomWidth="1px" borderColor="gray.50">
            <Text fontSize="sm" color="gray.500">Final Price</Text>
            <Text fontSize="lg" fontWeight="700" color="#1D4ED8">
              £{Number(booking.finalPrice).toFixed(2)}
            </Text>
          </Flex>
          <Flex justify="space-between" py={1.5} borderBottomWidth="1px" borderColor="gray.50">
            <Text fontSize="sm" color="gray.500">Platform Fee (15%)</Text>
            <Text fontSize="sm" fontWeight="500" color="green.600">
              £{(Number(booking.finalPrice) * 0.15).toFixed(2)}
            </Text>
          </Flex>
          <Flex justify="space-between" py={1.5} borderBottomWidth="1px" borderColor="gray.50">
            <Text fontSize="sm" color="gray.500">Booking ID</Text>
            <Text fontSize="xs" color="gray.400">{booking.id}</Text>
          </Flex>
          <Flex justify="space-between" py={1.5} borderBottomWidth="1px" borderColor="gray.50">
            <Text fontSize="sm" color="gray.500">Created</Text>
            <Text fontSize="sm">{new Date(booking.createdAt).toLocaleDateString("en-GB")}</Text>
          </Flex>
          {booking.repricedAt && (
            <Flex justify="space-between" py={1.5} borderBottomWidth="1px" borderColor="gray.50">
              <Text fontSize="sm" color="gray.500">Last Repriced</Text>
              <Text fontSize="sm">{new Date(booking.repricedAt).toLocaleString("en-GB")}</Text>
            </Flex>
          )}
          {booking.cancelledAt && (
            <>
              <Flex justify="space-between" py={1.5} borderBottomWidth="1px" borderColor="gray.50">
                <Text fontSize="sm" color="gray.500">Cancelled At</Text>
                <Text fontSize="sm" color="red.600">
                  {new Date(booking.cancelledAt).toLocaleString("en-GB")}
                </Text>
              </Flex>
              {booking.cancelledReason && (
                <Box py={1.5}>
                  <Text fontSize="sm" color="gray.500" mb={1}>Cancellation Reason</Text>
                  <Text fontSize="sm" color="red.600">{booking.cancelledReason}</Text>
                </Box>
              )}
            </>
          )}

          {/* Price Breakdown (if available) */}
          {booking.priceBreakdown && (
            <Box mt={3} pt={3} borderTopWidth="1px" borderColor="gray.100">
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb={2}>
                Price Breakdown
              </Text>
              {(() => {
                try {
                  const bd = JSON.parse(booking.priceBreakdown) as {
                    breakdown?: Array<{ label: string; amount: number }>;
                  };
                  return (bd.breakdown ?? []).map(
                    (line: { label: string; amount: number }, idx: number) => (
                      <Flex
                        key={idx}
                        justify="space-between"
                        py={0.5}
                        fontSize="xs"
                      >
                        <Text color="gray.500">{line.label}</Text>
                        <Text fontWeight="500">£{line.amount.toFixed(2)}</Text>
                      </Flex>
                    )
                  );
                } catch {
                  return null;
                }
              })()}
            </Box>
          )}
        </Box>

        {/* ── Job Details ───────────────────────── */}
        <Box
          bg="white"
          borderRadius="xl"
          p={5}
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Job Details
          </Text>
          <InfoRow
            label="Type"
            value={
              jobTypeOptions.find((o) => o.value === job.jobType)?.label ??
              job.jobType.replace("_", " ")
            }
          />
          <InfoRow
            label="Move Date"
            value={new Date(job.moveDate).toLocaleDateString("en-GB")}
          />
          <InfoRow label="Time Window" value={job.preferredTimeWindow || "—"} />
          <InfoRow
            label="Distance"
            value={
              job.distanceKm
                ? `${Number(job.distanceKm).toFixed(1)} km`
                : "—"
            }
          />
          <Box mt={3}>
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
              Pickup
            </Text>
            <Text fontSize="sm" mb={0.5}>
              {job.pickupAddress}
            </Text>
            <Text fontSize="xs" color="gray.400" mb={3}>
              Floor: {job.pickupFloor ?? "—"} | Flat:{" "}
              {job.pickupFlat || "—"} | Lift:{" "}
              {job.pickupHasLift ? "Yes" : "No"}
            </Text>

            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
              Delivery
            </Text>
            <Text fontSize="sm" mb={0.5}>
              {job.deliveryAddress}
            </Text>
            <Text fontSize="xs" color="gray.400">
              Floor: {job.deliveryFloor ?? "—"} | Flat:{" "}
              {job.deliveryFlat || "—"} | Lift:{" "}
              {job.deliveryHasLift ? "Yes" : "No"}
            </Text>
          </Box>
          {job.description && (
            <Box mt={3}>
              <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
                Notes
              </Text>
              <Text fontSize="sm">{job.description}</Text>
            </Box>
          )}
        </Box>
      </SimpleGrid>

      {/* ── Items Table ─────────────────────────── */}
      {items.length > 0 && (
        <Box mb={5}>
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Items ({items.length})
          </Text>
          <Box
            bg="white"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.100"
            overflowX="auto"
          >
            <Box as="table" w="full" fontSize="sm">
              <Box as="thead" bg="gray.50">
                <Box as="tr">
                  <Th>Item</Th>
                  <Th>Category</Th>
                  <Th align="center">Qty</Th>
                  <Th align="right">Weight</Th>
                  <Th align="center">Fragile</Th>
                </Box>
              </Box>
              <Box as="tbody">
                {items.map((item) => (
                  <Box
                    as="tr"
                    key={item.id}
                    borderTopWidth="1px"
                    borderColor="gray.100"
                  >
                    <Box as="td" px={4} py={3}>
                      {item.name}
                    </Box>
                    <Box as="td" px={4} py={3} color="gray.500">
                      {item.category || "—"}
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="center">
                      {item.quantity}
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="right">
                      {item.weightKg ? `${item.weightKg} kg` : "—"}
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="center">
                      {item.fragile ? "Yes" : "No"}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Audit Log ───────────────────────────── */}
      {auditLogs.length > 0 && (
        <Box mb={5}>
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Audit History ({auditLogs.length})
          </Text>
          <Box
            bg="white"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.100"
            overflowX="auto"
          >
            <Box as="table" w="full" fontSize="sm">
              <Box as="thead" bg="gray.50">
                <Box as="tr">
                  <Th>Date</Th>
                  <Th>Action</Th>
                  <Th>Admin</Th>
                  <Th>Details</Th>
                </Box>
              </Box>
              <Box as="tbody">
                {auditLogs.map((log) => (
                  <Box
                    as="tr"
                    key={log.id}
                    borderTopWidth="1px"
                    borderColor="gray.100"
                  >
                    <Box as="td" px={4} py={3} whiteSpace="nowrap" color="gray.500">
                      {new Date(log.createdAt).toLocaleString("en-GB")}
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <ActionBadge action={log.action} />
                    </Box>
                    <Box as="td" px={4} py={3} fontSize="xs" color="gray.400">
                      {log.adminUserId.slice(0, 8)}…
                    </Box>
                    <Box as="td" px={4} py={3} maxW="300px">
                      {log.note && (
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          {log.note}
                        </Text>
                      )}
                      {log.diffJson && (
                        <Text fontSize="xs" color="gray.400" lineClamp={2}>
                          {summariseDiff(log.diffJson)}
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Modals ──────────────────────────────── */}
      {editOpen && (
        <EditModal
          job={job}
          items={items}
          bookingId={booking.id}
          jobTypeOptions={jobTypeOptions}
          onClose={() => setEditOpen(false)}
          onSuccess={(updatedJob, updatedItems) => {
            setJob(updatedJob);
            setItems(updatedItems);
            setEditOpen(false);
            showMessage("Booking updated successfully.", "success");
            router.refresh();
          }}
          onError={(err) => showMessage(err, "error")}
        />
      )}

      {cancelOpen && (
        <CancelModal
          bookingId={booking.id}
          onClose={() => setCancelOpen(false)}
          onSuccess={() => {
            setBooking((b) => ({ ...b, status: "cancelled" }));
            setCancelOpen(false);
            showMessage("Booking cancelled.", "success");
            router.refresh();
          }}
          onError={(err) => showMessage(err, "error")}
        />
      )}

      {repriceOpen && (
        <RepriceModal
          bookingId={booking.id}
          currentPrice={Number(booking.finalPrice)}
          onClose={() => setRepriceOpen(false)}
          onSuccess={(newPrice, breakdownJson) => {
            setBooking((b) => ({
              ...b,
              finalPrice: String(newPrice),
              priceBreakdown: breakdownJson,
              repricedAt: new Date().toISOString(),
            }));
            setRepriceOpen(false);
            showMessage(
              `Price recalculated: £${newPrice.toFixed(2)}`,
              "success"
            );
            router.refresh();
          }}
          onError={(err) => showMessage(err, "error")}
        />
      )}
    </Box>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────

interface EditItemState {
  name: string;
  category: string;
  quantity: number;
  weightKg: string;
  volumeM3: string;
}

function EditModal({
  job,
  items,
  bookingId,
  jobTypeOptions,
  onClose,
  onSuccess,
  onError,
}: {
  job: SerializedJob;
  items: SerializedItem[];
  bookingId: string;
  jobTypeOptions: JobTypeOption[];
  onClose: () => void;
  onSuccess: (job: SerializedJob, items: SerializedItem[]) => void;
  onError: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  // Form state
  const [pickupAddress, setPickupAddress] = useState(job.pickupAddress);
  const [deliveryAddress, setDeliveryAddress] = useState(job.deliveryAddress);
  const [moveDate, setMoveDate] = useState(
    new Date(job.moveDate).toISOString().slice(0, 16)
  );
  const [jobType, setJobType] = useState(job.jobType);
  const [preferredTimeWindow, setPreferredTimeWindow] = useState(
    job.preferredTimeWindow || ""
  );
  const [pickupFloor, setPickupFloor] = useState(
    String(job.pickupFloor ?? 0)
  );
  const [pickupFlat, setPickupFlat] = useState(job.pickupFlat || "");
  const [pickupHasLift, setPickupHasLift] = useState(
    job.pickupHasLift ?? false
  );
  const [pickupNotes, setPickupNotes] = useState(job.pickupNotes || "");
  const [deliveryFloor, setDeliveryFloor] = useState(
    String(job.deliveryFloor ?? 0)
  );
  const [deliveryFlat, setDeliveryFlat] = useState(job.deliveryFlat || "");
  const [deliveryHasLift, setDeliveryHasLift] = useState(
    job.deliveryHasLift ?? false
  );
  const [deliveryNotes, setDeliveryNotes] = useState(
    job.deliveryNotes || ""
  );
  const [description, setDescription] = useState(job.description || "");
  const [contactName, setContactName] = useState(job.contactName || "");
  const [contactPhone, setContactPhone] = useState(job.contactPhone || "");

  // Items state
  const [editItems, setEditItems] = useState<EditItemState[]>(
    items.map((i) => ({
      name: i.name,
      category: i.category || "",
      quantity: i.quantity,
      weightKg: i.weightKg || "",
      volumeM3: i.volumeM3 || "",
    }))
  );

  function addItem() {
    setEditItems((prev) => [
      ...prev,
      { name: "", category: "", quantity: 1, weightKg: "", volumeM3: "" },
    ]);
  }

  function removeItem(idx: number) {
    setEditItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof EditItemState, value: string | number) {
    setEditItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  async function handleSave() {
    setLoading(true);
    try {
      const body: Record<string, unknown> = {};

      // Only send changed fields
      if (pickupAddress !== job.pickupAddress) body.pickupAddress = pickupAddress;
      if (deliveryAddress !== job.deliveryAddress) body.deliveryAddress = deliveryAddress;
      if (moveDate !== new Date(job.moveDate).toISOString().slice(0, 16))
        body.moveDate = new Date(moveDate).toISOString();
      if (jobType !== job.jobType) body.jobType = jobType;
      if (preferredTimeWindow !== (job.preferredTimeWindow || ""))
        body.preferredTimeWindow = preferredTimeWindow;
      if (Number(pickupFloor) !== (job.pickupFloor ?? 0))
        body.pickupFloor = Number(pickupFloor);
      if (pickupFlat !== (job.pickupFlat || "")) body.pickupFlat = pickupFlat;
      if (pickupHasLift !== (job.pickupHasLift ?? false))
        body.pickupHasLift = pickupHasLift;
      if (pickupNotes !== (job.pickupNotes || "")) body.pickupNotes = pickupNotes;
      if (Number(deliveryFloor) !== (job.deliveryFloor ?? 0))
        body.deliveryFloor = Number(deliveryFloor);
      if (deliveryFlat !== (job.deliveryFlat || ""))
        body.deliveryFlat = deliveryFlat;
      if (deliveryHasLift !== (job.deliveryHasLift ?? false))
        body.deliveryHasLift = deliveryHasLift;
      if (deliveryNotes !== (job.deliveryNotes || ""))
        body.deliveryNotes = deliveryNotes;
      if (description !== (job.description || ""))
        body.description = description;
      if (contactName !== (job.contactName || ""))
        body.contactName = contactName;
      if (contactPhone !== (job.contactPhone || ""))
        body.contactPhone = contactPhone;

      // Always send items (replace strategy)
      body.items = editItems
        .filter((i) => i.name.trim())
        .map((i) => ({
          name: i.name.trim(),
          category: i.category || undefined,
          quantity: Math.max(1, i.quantity),
          weightKg: i.weightKg ? Number(i.weightKg) : undefined,
          volumeM3: i.volumeM3 ? Number(i.volumeM3) : undefined,
        }));

      const res = await fetch(`/api/admin/bookings/${bookingId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Update failed." }));
        onError((data as { error?: string }).error || "Update failed.");
        return;
      }

      const data = await res.json() as {
        job: SerializedJob;
        items: SerializedItem[];
      };
      onSuccess(data.job, data.items);
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <Box maxW="700px" w="full">
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontWeight="700" fontSize="lg" color="gray.800">
            Edit Booking
          </Text>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#6B7280",
            }}
          >
            ✕
          </button>
        </Flex>

        <Box maxH="70vh" overflowY="auto" pr={2}>
          {/* Service Type */}
          <Box mb={4}>
            <label style={labelStyle}>Service Type</label>
            <select
              style={inputStyle}
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              {jobTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Box>

          {/* Schedule */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={4}>
            <Box>
              <label style={labelStyle}>Move Date & Time</label>
              <input
                type="datetime-local"
                style={inputStyle}
                value={moveDate}
                onChange={(e) => setMoveDate(e.target.value)}
              />
            </Box>
            <Box>
              <label style={labelStyle}>Time Window</label>
              <select
                style={inputStyle}
                value={preferredTimeWindow}
                onChange={(e) => setPreferredTimeWindow(e.target.value)}
              >
                <option value="">Any time</option>
                <option value="morning">Morning (8am-12pm)</option>
                <option value="afternoon">Afternoon (12pm-5pm)</option>
                <option value="evening">Evening (5pm-9pm)</option>
              </select>
            </Box>
          </SimpleGrid>

          {/* Pickup */}
          <Text fontWeight="600" fontSize="sm" color="gray.700" mb={2}>
            Pickup Details
          </Text>
          <Box mb={3}>
            <label style={labelStyle}>Pickup Address</label>
            <input
              type="text"
              style={inputStyle}
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            />
          </Box>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mb={3}>
            <Box>
              <label style={labelStyle}>Floor</label>
              <input
                type="number"
                style={inputStyle}
                value={pickupFloor}
                onChange={(e) => setPickupFloor(e.target.value)}
                min={0}
              />
            </Box>
            <Box>
              <label style={labelStyle}>Flat/Unit</label>
              <input
                type="text"
                style={inputStyle}
                value={pickupFlat}
                onChange={(e) => setPickupFlat(e.target.value)}
              />
            </Box>
            <Box>
              <label style={labelStyle}>Has Lift</label>
              <select
                style={inputStyle}
                value={pickupHasLift ? "yes" : "no"}
                onChange={(e) => setPickupHasLift(e.target.value === "yes")}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </Box>
          </SimpleGrid>
          <Box mb={4}>
            <label style={labelStyle}>Pickup Notes</label>
            <textarea
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
            />
          </Box>

          {/* Delivery */}
          <Text fontWeight="600" fontSize="sm" color="gray.700" mb={2}>
            Delivery Details
          </Text>
          <Box mb={3}>
            <label style={labelStyle}>Delivery Address</label>
            <input
              type="text"
              style={inputStyle}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </Box>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={3} mb={3}>
            <Box>
              <label style={labelStyle}>Floor</label>
              <input
                type="number"
                style={inputStyle}
                value={deliveryFloor}
                onChange={(e) => setDeliveryFloor(e.target.value)}
                min={0}
              />
            </Box>
            <Box>
              <label style={labelStyle}>Flat/Unit</label>
              <input
                type="text"
                style={inputStyle}
                value={deliveryFlat}
                onChange={(e) => setDeliveryFlat(e.target.value)}
              />
            </Box>
            <Box>
              <label style={labelStyle}>Has Lift</label>
              <select
                style={inputStyle}
                value={deliveryHasLift ? "yes" : "no"}
                onChange={(e) => setDeliveryHasLift(e.target.value === "yes")}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </Box>
          </SimpleGrid>
          <Box mb={4}>
            <label style={labelStyle}>Delivery Notes</label>
            <textarea
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
            />
          </Box>

          {/* Contact */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={4}>
            <Box>
              <label style={labelStyle}>Contact Name</label>
              <input
                type="text"
                style={inputStyle}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </Box>
            <Box>
              <label style={labelStyle}>Contact Phone</label>
              <input
                type="tel"
                style={inputStyle}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </Box>
          </SimpleGrid>

          {/* Description */}
          <Box mb={4}>
            <label style={labelStyle}>Description / Notes</label>
            <textarea
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>

          {/* Items Editor */}
          <Box mb={4}>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontWeight="600" fontSize="sm" color="gray.700">
                Items
              </Text>
              <button
                onClick={addItem}
                style={{
                  padding: "4px 12px",
                  borderRadius: "8px",
                  border: "1px solid #1D4ED8",
                  background: "#EBF1FF",
                  color: "#1D4ED8",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Add Item
              </button>
            </Flex>

            {editItems.map((item, idx) => (
              <Flex
                key={idx}
                gap={2}
                mb={2}
                align="flex-end"
                flexWrap="wrap"
              >
                <Box flex="1" minW="120px">
                  {idx === 0 && (
                    <label style={{ ...labelStyle, fontSize: "11px" }}>
                      Name
                    </label>
                  )}
                  <input
                    type="text"
                    style={{ ...inputStyle, fontSize: "13px" }}
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    placeholder="Item name"
                  />
                </Box>
                <Box w="90px">
                  {idx === 0 && (
                    <label style={{ ...labelStyle, fontSize: "11px" }}>
                      Category
                    </label>
                  )}
                  <input
                    type="text"
                    style={{ ...inputStyle, fontSize: "13px" }}
                    value={item.category}
                    onChange={(e) =>
                      updateItem(idx, "category", e.target.value)
                    }
                    placeholder="Category"
                  />
                </Box>
                <Box w="60px">
                  {idx === 0 && (
                    <label style={{ ...labelStyle, fontSize: "11px" }}>
                      Qty
                    </label>
                  )}
                  <input
                    type="number"
                    style={{
                      ...inputStyle,
                      fontSize: "13px",
                      textAlign: "center",
                    }}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", Number(e.target.value) || 1)
                    }
                    min={1}
                  />
                </Box>
                <Box w="80px">
                  {idx === 0 && (
                    <label style={{ ...labelStyle, fontSize: "11px" }}>
                      Weight (kg)
                    </label>
                  )}
                  <input
                    type="number"
                    style={{ ...inputStyle, fontSize: "13px" }}
                    value={item.weightKg}
                    onChange={(e) =>
                      updateItem(idx, "weightKg", e.target.value)
                    }
                    placeholder="0"
                    step="0.1"
                  />
                </Box>
                <button
                  onClick={() => removeItem(idx)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    color: "#DC2626",
                    fontSize: "14px",
                    cursor: "pointer",
                    lineHeight: 1,
                    marginBottom: idx === 0 ? 0 : undefined,
                  }}
                  title="Remove item"
                >
                  ✕
                </button>
              </Flex>
            ))}

            {editItems.length === 0 && (
              <Text fontSize="sm" color="gray.400" py={2}>
                No items. Click &quot;+ Add Item&quot; to add.
              </Text>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Flex
          justify="flex-end"
          gap={3}
          pt={4}
          borderTopWidth="1px"
          borderColor="gray.100"
        >
          <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            colorPalette="blue"
            onClick={handleSave}
            loading={loading}
          >
            Save Changes
          </Button>
        </Flex>
      </Box>
    </ModalOverlay>
  );
}

// ── Cancel Modal ───────────────────────────────────────────────

function CancelModal({
  bookingId,
  onClose,
  onSuccess,
  onError,
}: {
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (reason.trim().length < 3) {
      onError("Cancellation reason must be at least 3 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Cancel failed." }));
        onError((data as { error?: string }).error || "Cancel failed.");
        return;
      }

      onSuccess();
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <Box maxW="480px" w="full">
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontWeight="700" fontSize="lg" color="red.600">
            Cancel Booking
          </Text>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#6B7280",
            }}
          >
            ✕
          </button>
        </Flex>

        <Text fontSize="sm" color="gray.600" mb={4}>
          This action will cancel the booking and update its status. The booking
          record will be preserved. This cannot be undone.
        </Text>

        <Box mb={4}>
          <label style={labelStyle}>
            Cancellation Reason <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for cancellation..."
          />
        </Box>

        <Flex justify="flex-end" gap={3}>
          <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>
            Keep Booking
          </Button>
          <Button
            size="sm"
            colorPalette="red"
            onClick={handleCancel}
            loading={loading}
            disabled={reason.trim().length < 3}
          >
            Confirm Cancellation
          </Button>
        </Flex>
      </Box>
    </ModalOverlay>
  );
}

// ── Reprice Modal ──────────────────────────────────────────────

function RepriceModal({
  bookingId,
  currentPrice,
  onClose,
  onSuccess,
  onError,
}: {
  bookingId: string;
  currentPrice: number;
  onClose: () => void;
  onSuccess: (newPrice: number, breakdownJson: string) => void;
  onError: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    oldPrice: number;
    newPrice: number;
    breakdown: Record<string, unknown>;
  } | null>(null);

  async function handleReprice() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/reprice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Reprice failed." }));
        onError((data as { error?: string }).error || "Reprice failed.");
        return;
      }

      const data = (await res.json()) as {
        oldPrice: number;
        newPrice: number;
        breakdown: Record<string, unknown>;
      };
      setResult(data);
    } catch {
      onError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAccept() {
    if (result) {
      onSuccess(result.newPrice, JSON.stringify(result.breakdown));
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <Box maxW="480px" w="full">
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontWeight="700" fontSize="lg" color="gray.800">
            Recalculate Price
          </Text>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#6B7280",
            }}
          >
            ✕
          </button>
        </Flex>

        {!result ? (
          <>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Current price:{" "}
              <strong style={{ color: "#1D4ED8" }}>
                £{currentPrice.toFixed(2)}
              </strong>
            </Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
              This will recalculate the booking price using the current pricing
              engine with the job&apos;s stored data (distance, items, dates).
              The new price will replace the current one.
            </Text>

            <Flex justify="flex-end" gap={3}>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                colorPalette="blue"
                onClick={handleReprice}
                loading={loading}
              >
                Recalculate Now
              </Button>
            </Flex>
          </>
        ) : (
          <>
            <Box
              p={4}
              borderRadius="lg"
              bg="blue.50"
              mb={4}
            >
              <Flex justify="space-between" mb={2}>
                <Text fontSize="sm" color="gray.500">
                  Old Price
                </Text>
                <Text fontSize="sm" fontWeight="500" textDecoration="line-through" color="gray.400">
                  £{result.oldPrice.toFixed(2)}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="600">
                  New Price
                </Text>
                <Text fontSize="xl" fontWeight="700" color="#1D4ED8">
                  £{result.newPrice.toFixed(2)}
                </Text>
              </Flex>
              {result.newPrice !== result.oldPrice && (
                <Text
                  fontSize="xs"
                  mt={1}
                  textAlign="right"
                  color={
                    result.newPrice > result.oldPrice
                      ? "red.500"
                      : "green.600"
                  }
                >
                  {result.newPrice > result.oldPrice ? "+" : ""}
                  {(
                    ((result.newPrice - result.oldPrice) / result.oldPrice) *
                    100
                  ).toFixed(1)}
                  % change
                </Text>
              )}
            </Box>

            <Flex justify="flex-end" gap={3}>
              <Button size="sm" variant="outline" onClick={onClose}>
                Discard
              </Button>
              <Button
                size="sm"
                colorPalette="green"
                onClick={handleAccept}
              >
                Accept New Price
              </Button>
            </Flex>
          </>
        )}
      </Box>
    </ModalOverlay>
  );
}

// ── Shared UI helpers ──────────────────────────────────────────

function ModalOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={50}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        onClick={onClose}
      />
      <Box
        position="relative"
        bg="white"
        borderRadius="xl"
        p={6}
        mx={4}
        maxH="90vh"
        overflowY="auto"
        w="full"
      >
        {children}
      </Box>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex
      justify="space-between"
      py={1.5}
      borderBottomWidth="1px"
      borderColor="gray.50"
    >
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="500" textTransform="capitalize">
        {value}
      </Text>
    </Flex>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <Box
      as="th"
      textAlign={align}
      px={4}
      py={3}
      fontWeight="600"
      color="gray.600"
    >
      {children}
    </Box>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    EDIT: { bg: "blue.50", color: "blue.700" },
    REPRICE: { bg: "purple.50", color: "purple.700" },
    CANCEL: { bg: "red.50", color: "red.700" },
  };
  const s = styles[action] ?? { bg: "gray.100", color: "gray.700" };
  return (
    <Box
      display="inline-flex"
      px={2}
      py={0.5}
      borderRadius="full"
      bg={s.bg}
      color={s.color}
      fontSize="xs"
      fontWeight="600"
    >
      {action}
    </Box>
  );
}

function summariseDiff(diffJson: string): string {
  try {
    const diff = JSON.parse(diffJson) as Record<
      string,
      { old?: unknown; new?: unknown }
    >;
    const keys = Object.keys(diff);
    if (keys.length === 0) return "No changes recorded.";

    return keys
      .map((k) => {
        const d = diff[k];
        if (k === "items") return "Items updated";
        if (k === "finalPrice") {
          return `Price: £${Number(d.old).toFixed(2)} → £${Number(d.new).toFixed(2)}`;
        }
        if (k === "status") {
          return `Status: ${String(d.old)} → ${String(d.new)}`;
        }
        if (k === "breakdown") return "Price breakdown updated";
        return `${k.replace(/([A-Z])/g, " $1").trim()}: changed`;
      })
      .join(" · ");
  } catch {
    return "—";
  }
}
