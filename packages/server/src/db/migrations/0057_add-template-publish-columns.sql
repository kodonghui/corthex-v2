-- Add missing is_published, published_at, download_count, tier, allowed_tools to soul_templates
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "download_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "tier" varchar(20);--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "allowed_tools" jsonb;--> statement-breakpoint

-- Add missing is_published, published_at, download_count, tags to org_templates
ALTER TABLE "org_templates" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "org_templates" ADD COLUMN IF NOT EXISTS "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "org_templates" ADD COLUMN IF NOT EXISTS "download_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "org_templates" ADD COLUMN IF NOT EXISTS "tags" jsonb;--> statement-breakpoint

-- Add indexes for is_published
CREATE INDEX IF NOT EXISTS "soul_templates_published_idx" ON "soul_templates" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_templates_published_idx" ON "org_templates" USING btree ("is_published");
