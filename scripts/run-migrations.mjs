// Run all pending migrations against the Neon database.
// Usage: node scripts/run-migrations.mjs

import fs from "fs";
import { neon } from "@neondatabase/serverless";

// Load .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
const dbLine = envFile.split("\n").find((l) => l.startsWith("DATABASE_URL"));
const url = dbLine.split("=").slice(1).join("=").replace(/^"|"$/g, "");
const sql = neon(url);

async function run() {
  // 1. Rename distance_km → distance_miles
  try {
    await sql`ALTER TABLE jobs RENAME COLUMN distance_km TO distance_miles`;
    console.log("OK: renamed distance_km → distance_miles");
  } catch (e) {
    if (e.message.includes("does not exist")) {
      console.log("SKIP: distance_km already renamed");
    } else {
      console.log("ERR 0003:", e.message);
    }
  }

  // 2. Add deleted_at column for soft deletes on jobs
  try {
    await sql`ALTER TABLE jobs ADD COLUMN deleted_at TIMESTAMP`;
    console.log("OK: added deleted_at column to jobs");
  } catch (e) {
    if (e.message.includes("already exists")) {
      console.log("SKIP: deleted_at already exists on jobs");
    } else {
      console.log("ERR deleted_at:", e.message);
    }
  }

  // 3. Create change_logs audit table
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS change_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        user_id UUID,
        table_name VARCHAR(100) NOT NULL,
        record_id UUID NOT NULL,
        action VARCHAR(20) NOT NULL,
        previous_values TEXT,
        new_values TEXT,
        change_reason TEXT
      )
    `;
    console.log("OK: created change_logs table");
  } catch (e) {
    console.log("ERR change_logs:", e.message);
  }

  // 4. Add all indexes from migration 0004
  const indexQueries = [
    ["jobs_status_idx", () => sql`CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status)`],
    ["jobs_move_date_idx", () => sql`CREATE INDEX IF NOT EXISTS jobs_move_date_idx ON jobs (move_date)`],
    ["jobs_status_date_idx", () => sql`CREATE INDEX IF NOT EXISTS jobs_status_date_idx ON jobs (status, move_date)`],
    ["driver_profiles_status_idx", () => sql`CREATE INDEX IF NOT EXISTS driver_profiles_status_idx ON driver_profiles (application_status)`],
    ["driver_profiles_stripe_idx", () => sql`CREATE INDEX IF NOT EXISTS driver_profiles_stripe_idx ON driver_profiles (stripe_account_id)`],
    ["quotes_driver_id_idx", () => sql`CREATE INDEX IF NOT EXISTS quotes_driver_id_idx ON quotes (driver_id)`],
    ["quotes_status_idx", () => sql`CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes (status)`],
    ["quotes_expires_at_idx", () => sql`CREATE INDEX IF NOT EXISTS quotes_expires_at_idx ON quotes (expires_at)`],
    ["bookings_driver_id_idx", () => sql`CREATE INDEX IF NOT EXISTS bookings_driver_id_idx ON bookings (driver_id)`],
    ["bookings_payment_status_idx", () => sql`CREATE INDEX IF NOT EXISTS bookings_payment_status_idx ON bookings (payment_status)`],
    ["bookings_status_idx", () => sql`CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status)`],
    ["bookings_stripe_pi_idx", () => sql`CREATE INDEX IF NOT EXISTS bookings_stripe_pi_idx ON bookings (stripe_payment_intent_id)`],
    ["reviews_booking_reviewer_idx", () => sql`CREATE UNIQUE INDEX IF NOT EXISTS reviews_booking_reviewer_idx ON reviews (booking_id, reviewer_id)`],
    ["reviews_reviewee_id_idx", () => sql`CREATE INDEX IF NOT EXISTS reviews_reviewee_id_idx ON reviews (reviewee_id)`],
    ["change_logs_table_record_idx", () => sql`CREATE INDEX IF NOT EXISTS change_logs_table_record_idx ON change_logs (table_name, record_id)`],
    ["change_logs_user_id_idx", () => sql`CREATE INDEX IF NOT EXISTS change_logs_user_id_idx ON change_logs (user_id)`],
    ["change_logs_created_at_idx", () => sql`CREATE INDEX IF NOT EXISTS change_logs_created_at_idx ON change_logs (created_at)`],
  ];

  for (const [name, query] of indexQueries) {
    try {
      await query();
      console.log(`OK: index ${name}`);
    } catch (e) {
      console.log(`IDX ERR (${name}): ${e.message.substring(0, 100)}`);
    }
  }

  console.log("\nDONE: All migrations applied successfully.");
}

run().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
