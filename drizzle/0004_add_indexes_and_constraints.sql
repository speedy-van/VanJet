-- Add missing indexes and constraints for performance and data integrity.

-- Jobs: index on status, move_date, and composite
CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs" ("status");
CREATE INDEX IF NOT EXISTS "jobs_move_date_idx" ON "jobs" ("move_date");
CREATE INDEX IF NOT EXISTS "jobs_status_date_idx" ON "jobs" ("status", "move_date");

-- Driver profiles: index on application_status and stripe_account_id
CREATE INDEX IF NOT EXISTS "driver_profiles_status_idx" ON "driver_profiles" ("application_status");
CREATE INDEX IF NOT EXISTS "driver_profiles_stripe_idx" ON "driver_profiles" ("stripe_account_id");

-- Quotes: indexes on driver_id, status, expires_at
CREATE INDEX IF NOT EXISTS "quotes_driver_id_idx" ON "quotes" ("driver_id");
CREATE INDEX IF NOT EXISTS "quotes_status_idx" ON "quotes" ("status");
CREATE INDEX IF NOT EXISTS "quotes_expires_at_idx" ON "quotes" ("expires_at");

-- Bookings: indexes on driver_id, payment_status, status, stripe PI
CREATE INDEX IF NOT EXISTS "bookings_driver_id_idx" ON "bookings" ("driver_id");
CREATE INDEX IF NOT EXISTS "bookings_payment_status_idx" ON "bookings" ("payment_status");
CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings" ("status");
CREATE INDEX IF NOT EXISTS "bookings_stripe_pi_idx" ON "bookings" ("stripe_payment_intent_id");

-- Reviews: unique constraint per booking+reviewer, index on reviewee
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_booking_reviewer_idx" ON "reviews" ("booking_id", "reviewer_id");
CREATE INDEX IF NOT EXISTS "reviews_reviewee_id_idx" ON "reviews" ("reviewee_id");
