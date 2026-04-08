-- Create admin_notifications table for admin panel notifications

CREATE TABLE IF NOT EXISTS "admin_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(30) NOT NULL,
	"severity" varchar(10) DEFAULT 'info' NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text,
	"link_href" varchar(500),
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS "admin_notif_read_idx" ON "admin_notifications" ("read", "created_at");
CREATE INDEX IF NOT EXISTS "admin_notif_type_idx" ON "admin_notifications" ("type");
CREATE INDEX IF NOT EXISTS "admin_notif_created_idx" ON "admin_notifications" ("created_at");
