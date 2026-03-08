-- Story 19-1: Add companyId to conversation_participants and messages for tenant isolation
-- Also add indexes for conversations table

-- Add companyId to conversation_participants
ALTER TABLE "conversation_participants" ADD COLUMN "company_id" uuid;--> statement-breakpoint

-- Backfill companyId from conversations table
UPDATE "conversation_participants" cp
SET "company_id" = c."company_id"
FROM "conversations" c
WHERE cp."conversation_id" = c."id";--> statement-breakpoint

-- Make companyId NOT NULL after backfill
ALTER TABLE "conversation_participants" ALTER COLUMN "company_id" SET NOT NULL;--> statement-breakpoint

-- Add FK constraint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Add companyId to messages
ALTER TABLE "messages" ADD COLUMN "company_id" uuid;--> statement-breakpoint

-- Backfill companyId from conversations table
UPDATE "messages" m
SET "company_id" = c."company_id"
FROM "conversations" c
WHERE m."conversation_id" = c."id";--> statement-breakpoint

-- Make companyId NOT NULL after backfill
ALTER TABLE "messages" ALTER COLUMN "company_id" SET NOT NULL;--> statement-breakpoint

-- Add FK constraint
ALTER TABLE "messages" ADD CONSTRAINT "messages_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Add indexes for conversations
CREATE INDEX IF NOT EXISTS "conversations_company_idx" ON "conversations" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_company_active_idx" ON "conversations" USING btree ("company_id","is_active");--> statement-breakpoint

-- Add indexes for conversation_participants
CREATE INDEX IF NOT EXISTS "conv_participants_company_user_idx" ON "conversation_participants" USING btree ("company_id","user_id");--> statement-breakpoint

-- Add index for messages
CREATE INDEX IF NOT EXISTS "messages_company_idx" ON "messages" USING btree ("company_id");
