-- Migration: 0025 messenger reactions + threads
-- Story 16-3: Message reaction + thread support

-- Add parentMessageId to messenger_messages for thread support
ALTER TABLE "messenger_messages" ADD COLUMN "parent_message_id" uuid;--> statement-breakpoint

-- Create messenger_reactions table
CREATE TABLE IF NOT EXISTS "messenger_reactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "message_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "emoji" varchar(20) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Add foreign keys
ALTER TABLE "messenger_reactions" ADD CONSTRAINT "messenger_reactions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messenger_reactions" ADD CONSTRAINT "messenger_reactions_message_id_messenger_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messenger_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messenger_reactions" ADD CONSTRAINT "messenger_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Unique constraint: same user can't react with same emoji on same message twice
ALTER TABLE "messenger_reactions" ADD CONSTRAINT "messenger_reactions_unique" UNIQUE("message_id", "user_id", "emoji");
