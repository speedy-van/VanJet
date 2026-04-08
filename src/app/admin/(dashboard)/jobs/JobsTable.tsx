"use client";

// ─── VanJet · Admin Jobs Table with Selection ─────────────────
import { useState, useCallback } from "react";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { X, Check, Minus } from "lucide-react";
import Link from "next/link";
import { formatGBP } from "@/lib/money/format";

interface Job {
  id: string;
  referenceNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  jobType: string;
  estimatedPrice: string | null;
  moveDate: Date;
  contactName: string | null;
  quoteCount: number;
}

interface JobsTableProps {
  jobs: Job[];
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "yellow.100", color: "yellow.800" },
  quoted: { bg: "blue.100", color: "blue.800" },
  accepted: { bg: "cyan.100", color: "cyan.800" },
  in_progress: { bg: "purple.100", color: "purple.800" },
  completed: { bg: "green.100", color: "green.800" },
  cancelled: { bg: "red.100", color: "red.800" },
};

// Custom checkbox component for Chakra v3 compatibility
function SelectBox({ 
  checked, 
  indeterminate, 
  onChange, 
  label 
}: { 
  checked: boolean; 
  indeterminate?: boolean;
  onChange: () => void; 
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "4px",
        border: `2px solid ${checked || indeterminate ? "#3182CE" : "#CBD5E0"}`,
        backgroundColor: checked || indeterminate ? "#3182CE" : "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.15s",
        padding: 0,
      }}
      aria-label={label}
      aria-checked={indeterminate ? "mixed" : checked}
      role="checkbox"
    >
      {indeterminate ? (
        <Minus size={12} color="white" strokeWidth={3} />
      ) : checked ? (
        <Check size={12} color="white" strokeWidth={3} />
      ) : null}
    </button>
  );
}

export function JobsTable({ jobs }: JobsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === jobs.length) {
        return new Set();
      }
      return new Set(jobs.map((j) => j.id));
    });
  }, [jobs]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const allSelected = jobs.length > 0 && selectedIds.size === jobs.length;
  const someSelected = selectedIds.size > 0;
  const indeterminate = someSelected && !allSelected;

  return (
    <Box>
      {/* Selection Actions Bar */}
      {someSelected && (
        <Flex
          align="center"
          justify="space-between"
          bg="blue.50"
          borderWidth="1px"
          borderColor="blue.200"
          borderRadius="lg"
          px={4}
          py={3}
          mb={4}
        >
          <Text fontSize="sm" fontWeight="600" color="blue.700">
            {selectedIds.size} job{selectedIds.size !== 1 ? "s" : ""} selected
          </Text>
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={clearSelection}
          >
            <X size={16} />
            <Text ml={1}>Clear Selection</Text>
          </Button>
        </Flex>
      )}

      {/* Table */}
      <Box bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.100" overflowX="auto">
        <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#F7FAFC" }}>
            <tr>
              <th style={{ textAlign: "center", padding: "12px 8px", width: "40px" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <SelectBox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    onChange={toggleSelectAll}
                    label="Select all jobs"
                  />
                </div>
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Reference
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Contact
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Type
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Pickup
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Delivery
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Status
              </th>
              <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Quotes
              </th>
              <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Price
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Move Date
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#718096" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: "32px", textAlign: "center", color: "#A0AEC0" }}>
                  No jobs found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const isSelected = selectedIds.has(job.id);
                const statusColor = STATUS_COLORS[job.status] ?? { bg: "gray.100", color: "gray.800" };
                
                return (
                  <tr
                    key={job.id}
                    style={{
                      borderTop: "1px solid #EDF2F7",
                      backgroundColor: isSelected ? "#EBF8FF" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "#F7FAFC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected ? "#EBF8FF" : "";
                    }}
                  >
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <SelectBox
                          checked={isSelected}
                          onChange={() => toggleSelection(job.id)}
                          label={`Select job ${job.referenceNumber}`}
                        />
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontFamily: "monospace", fontSize: "12px", color: "#3182CE" }}>
                      {job.referenceNumber}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                      {job.contactName || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", textTransform: "capitalize" }}>
                      {job.jobType.replace("_", " ")}
                    </td>
                    <td style={{ padding: "12px 16px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {job.pickupAddress}
                    </td>
                    <td style={{ padding: "12px 16px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {job.deliveryAddress}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Flex
                        display="inline-flex"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        bg={statusColor.bg}
                        color={statusColor.color}
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="capitalize"
                      >
                        {job.status.replace("_", " ")}
                      </Flex>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: job.quoteCount > 0 ? "#38A169" : "#A0AEC0" }}>
                      {job.quoteCount}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 500 }}>
                      {job.estimatedPrice ? formatGBP(Number(job.estimatedPrice)) : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#718096", whiteSpace: "nowrap" }}>
                      {new Date(job.moveDate).toLocaleDateString("en-GB")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/admin/jobs/${job.id}`}>
                        <Text
                          color="blue.500"
                          fontWeight="500"
                          fontSize="sm"
                          _hover={{ textDecoration: "underline" }}
                        >
                          View
                        </Text>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}
