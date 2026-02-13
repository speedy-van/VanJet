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
    coverageRadius: integer("coverage_radius_km"),
    stripeAccountId: varchar("stripe_account_id", { length: 255 }),
    stripeOnboarded: boolean("stripe_onboarded").notNull().default(false),
    rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
    totalJobs: integer("total_jobs").notNull().default(0),
    bio: text("bio"),
    verified: boolean("verified").notNull().default(false),
    ...timestamps,
  },
  (table) => [index("driver_profiles_user_id_idx").on(table.userId)]
);

// ── Jobs ────────────────────────────────────────────────────────
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
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
    distanceKm: numeric("distance_km", { precision: 8, scale: 2 }),
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
  },
  (table) => [index("jobs_customer_id_idx").on(table.customerId)]
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
  (table) => [index("quotes_job_id_idx").on(table.jobId)]
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
    ...timestamps,
  },
  (table) => [index("bookings_job_id_idx").on(table.jobId)]
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

// ── Reviews ─────────────────────────────────────────────────────
export const reviews = pgTable("reviews", {
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
});
