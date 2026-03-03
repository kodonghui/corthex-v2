CREATE TYPE "public"."delegation_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "delegations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"secretary_agent_id" uuid NOT NULL,
	"target_agent_id" uuid NOT NULL,
	"user_message" text NOT NULL,
	"delegation_prompt" text NOT NULL,
	"agent_response" text,
	"status" "delegation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "is_secretary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_secretary_agent_id_agents_id_fk" FOREIGN KEY ("secretary_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_target_agent_id_agents_id_fk" FOREIGN KEY ("target_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;