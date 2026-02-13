// ─── VanJet · Tracking Status Definitions ─────────────────────

export const TRACKING_STATUSES = [
  "on_the_way",
  "arrived",
  "loading",
  "in_transit",
  "delivered",
] as const;

export type TrackingStatus = (typeof TRACKING_STATUSES)[number];

export const STATUS_LABELS: Record<TrackingStatus, string> = {
  on_the_way: "On the Way",
  arrived: "Arrived",
  loading: "Loading",
  in_transit: "In Transit",
  delivered: "Delivered",
};

export const STATUS_ICONS: Record<TrackingStatus, string> = {
  on_the_way: "🚐",
  arrived: "📍",
  loading: "📦",
  in_transit: "🛣️",
  delivered: "✅",
};
