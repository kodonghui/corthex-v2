ALTER TABLE "departments" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;