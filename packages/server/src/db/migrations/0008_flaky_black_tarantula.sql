ALTER TABLE "agents" ADD COLUMN "admin_soul" text;--> statement-breakpoint
UPDATE "agents" SET "admin_soul" = "soul" WHERE "admin_soul" IS NULL AND "soul" IS NOT NULL;