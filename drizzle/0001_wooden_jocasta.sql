ALTER TABLE "bookings" ALTER COLUMN "quote_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "driver_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "job_items" ADD COLUMN "fragile" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "job_items" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "pickup_floor" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "pickup_flat" varchar(50);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "pickup_has_lift" boolean;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "pickup_notes" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "delivery_floor" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "delivery_flat" varchar(50);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "delivery_has_lift" boolean;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "delivery_notes" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "preferred_time_window" varchar(20);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "flexible_dates" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "contact_name" varchar(255);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "contact_phone" varchar(30);