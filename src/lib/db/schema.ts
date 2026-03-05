// ─── VanJet · Drizzle Schema ──────────────────────────────────
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ── Timestamps helper ───────────────────────────────────────────
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

/** Soft-delete column. If non-null, the record is considered deleted. */
const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

// ── Users ───────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  role: varchar("role", { length: 20 }).notNull().default("customer"), // customer | driver | admin
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").notNull().default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  
  ...timestamps,
});

// ── Driver Profiles ─────────────────────────────────────────────
export const driverProfiles = pgTable(
  "driver_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
      
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyName: varchar("company_name", { length: 255 }),
    vanSize: varchar("van_size", { length: 50 }), // e.g. "Luton", "LWB", "Transit"
    maxWeightKg: integer("max_weight_kg"),
    coverageRadius: integer("coverage_radius_km"), // stored in miles (column name kept for migration safety)
    baseLat: numeric("base_lat", { precision: 10, scale: 7 }),
    baseLng: numeric("base_lng", { precision: 10, scale: 7 }),
    stripeAccountId: varchar("stripe_account_id", { length: 255 }),
    stripeOnboarded: boolean("stripe_onboarded").notNull().default(false),
    rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
    totalJobs: integer("total_jobs").notNull().default(0),
    bio: text("bio"),
    verified: boolean("verified").notNull().default(false),
    // Application tracking
    applicationStatus: varchar("application_status", { length: 20 })
      .notNull()
      .default("pending"), // pending | approved | rejected
    rejectionReason: text("rejection_reason"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: varchar("reviewed_by", { length: 255 }),
    ...timestamps,
  },
  (table) => [
    index("driver_profiles_user_id_idx").on(table.userId),
    index("driver_profiles_status_idx").on(table.applicationStatus),
    index("driver_profiles_stripe_idx").on(table.stripeAccountId),
  ]
);

// ── Jobs ────────────────────────────────────────────────────────
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referenceNumber: varchar("reference_number", { length: 10 }).notNull().unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobType: varchar("job_type", { length: 50 }).notNull(), // "house_move", "office_move", "single_item", "storage", etc.
    status: varchar("status", { length: 30 }).notNull().default("pending"), // pending | quoted | accepted | in_progress | completed | cancelled
    pickupAddress: text("pickup_address").notNull(),
    pickupLat: numeric("pickup_lat", { precision: 10, scale: 7 }),
    pickupLng: numeric("pickup_lng", { precision: 10, scale: 7 }),
    deliveryAddress: text("delivery_address").notNull(),
    deliveryLat: numeric("delivery_lat", { precision: 10, scale: 7 }),
    deliveryLng: numeric("delivery_lng", { precision: 10, scale: 7 }),
    distanceMiles: numeric("distance_miles", { precision: 8, scale: 2 }), // driving distance in miles (from Mapbox)
    durationMinutes: integer("duration_minutes"), // estimated travel time
    moveDate: timestamp("move_date", { withTimezone: true }).notNull(),
    description: text("description"),
    estimatedPrice: numeric("estimated_price", { precision: 10, scale: 2 }),
    finalPrice: numeric("final_price", { precision: 10, scale: 2 }),
    floorLevel: integer("floor_level"),
    hasLift: boolean("has_lift").default(false),
    needsPacking: boolean("needs_packing").default(false),
    // Pickup details
    pickupFloor: integer("pickup_floor"),
    pickupFlat: varchar("pickup_flat", { length: 50 }),
    pickupHasLift: boolean("pickup_has_lift"),
    pickupNotes: text("pickup_notes"),
    // Delivery details
    deliveryFloor: integer("delivery_floor"),
    deliveryFlat: varchar("delivery_flat", { length: 50 }),
    deliveryHasLift: boolean("delivery_has_lift"),
    deliveryNotes: text("delivery_notes"),
    // Schedule
    preferredTimeWindow: varchar("preferred_time_window", { length: 20 }),
    flexibleDates: boolean("flexible_dates").default(false),
    // Contact
    contactName: varchar("contact_name", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 30 }),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    index("jobs_customer_id_idx").on(table.customerId),
    uniqueIndex("jobs_reference_number_idx").on(table.referenceNumber),
    index("jobs_status_idx").on(table.status),
    index("jobs_move_date_idx").on(table.moveDate),
    index("jobs_status_date_idx").on(table.status, table.moveDate),
  ]
);

// ── Job Items ───────────────────────────────────────────────────
export const jobItems = pgTable("job_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  quantity: integer("quantity").notNull().default(1),
  weightKg: numeric("weight_kg", { precision: 8, scale: 2 }),
  volumeM3: numeric("volume_m3", { precision: 8, scale: 4 }),
  requiresDismantling: boolean("requires_dismantling").default(false),
  fragile: boolean("fragile").default(false),
  notes: text("notes"),
  specialHandling: text("special_handling"),
  ...timestamps,
});

// ── Quotes ──────────────────────────────────────────────────────
export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    message: text("message"),
    estimatedDuration: varchar("estimated_duration", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | accepted | rejected | expired
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("quotes_job_id_idx").on(table.jobId),
    index("quotes_driver_id_idx").on(table.driverId),
    index("quotes_status_idx").on(table.status),
    index("quotes_expires_at_idx").on(table.expiresAt),
  ]
);

// ── Bookings ────────────────────────────────────────────────────
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    quoteId: uuid("quote_id")
      .references(() => quotes.id),
    driverId: uuid("driver_id")
      .references(() => users.id),
    finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull(),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", {
      length: 255,
    }),
    paymentStatus: varchar("payment_status", { length: 30 })
      .notNull()
      .default("unpaid"), // unpaid | paid | refunded
    status: varchar("status", { length: 30 }).notNull().default("confirmed"), // confirmed | in_progress | completed | cancelled
    // Admin cancellation fields
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledReason: text("cancelled_reason"),
    // Repricing fields
    priceBreakdown: text("price_breakdown"), // JSON string of PricingBreakdown
    repricedAt: timestamp("repriced_at", { withTimezone: true }),
    repricedBy: varchar("repriced_by", { length: 255 }),
    // Live tracking
    trackingToken: text("tracking_token").unique(),
    trackingEnabled: boolean("tracking_enabled").notNull().default(true),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    trackingExpiresAt: timestamp("tracking_expires_at", { withTimezone: true }),
    // Human-friendly order number (VJ-0042)
    orderNumber: varchar("order_number", { length: 10 }).unique(),
    ...timestamps,
  },
  (table) => [
    index("bookings_job_id_idx").on(table.jobId),
    index("bookings_driver_id_idx").on(table.driverId),
    index("bookings_payment_status_idx").on(table.paymentStatus),
    index("bookings_status_idx").on(table.status),
    index("bookings_stripe_pi_idx").on(table.stripePaymentIntentId),
    uniqueIndex("bookings_tracking_token_idx").on(table.trackingToken),
    uniqueIndex("bookings_order_number_idx").on(table.orderNumber),
  ]
);

// ── Admin Audit Logs ────────────────────────────────────────────
export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    adminUserId: varchar("admin_user_id", { length: 255 }).notNull(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 20 }).notNull(), // EDIT | REPRICE | CANCEL
    diffJson: text("diff_json"), // JSON diff of changes
    note: text("note"),
  },
  (table) => [index("audit_logs_booking_id_idx").on(table.bookingId)]
);

// ── Booking Tracking Events ─────────────────────────────────────
export const bookingTrackingEvents = pgTable(
  "booking_tracking_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    driverId: uuid("driver_id").references(() => driverProfiles.id),
    lat: numeric("lat", { precision: 10, scale: 7 }).notNull(),
    lng: numeric("lng", { precision: 10, scale: 7 }).notNull(),
    heading: integer("heading"),
    speedKph: numeric("speed_kph", { precision: 6, scale: 2 }),
    accuracyM: integer("accuracy_m"),
    status: varchar("status", { length: 32 }).notNull().default("on_the_way"), // on_the_way | arrived | loading | in_transit | delivered
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("tracking_events_booking_recorded_idx").on(
      table.bookingId,
      table.recordedAt
    ),
  ]
);

// ── Reviews ─────────────────────────────────────────────────────
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => users.id),
    revieweeId: uuid("reviewee_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(), // 1-5
    comment: text("comment"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("reviews_booking_reviewer_idx").on(table.bookingId, table.reviewerId),
    index("reviews_reviewee_id_idx").on(table.revieweeId),
  ]
);

// ── Change Log (General Audit Trail) ────────────────────────────
export const changeLogs = pgTable(
  "change_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    userId: uuid("user_id").references(() => users.id), // who made the change
    tableName: varchar("table_name", { length: 50 }).notNull(), // jobs, bookings, quotes, etc.
    recordId: uuid("record_id").notNull(), // PK of the changed record
    action: varchar("action", { length: 20 }).notNull(), // CREATE | UPDATE | DELETE | SOFT_DELETE
    previousValues: text("previous_values"), // JSON of old values
    newValues: text("new_values"), // JSON of new values
    changeReason: text("change_reason"), // optional human-readable reason
  },
  (table) => [
    index("change_logs_table_record_idx").on(table.tableName, table.recordId),
    index("change_logs_user_idx").on(table.userId),
    index("change_logs_created_at_idx").on(table.createdAt),
  ]
);
