CREATE TABLE "agent_delegation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"source_agent_id" uuid NOT NULL,
	"target_agent_id" uuid NOT NULL,
	"condition" jsonb NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "delegation_rules_company_idx" ON "agent_delegation_rules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "delegation_rules_source_idx" ON "agent_delegation_rules" USING btree ("company_id","source_agent_id");--> statement-breakpoint
ALTER TABLE "agent_delegation_rules" ADD CONSTRAINT "agent_delegation_rules_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_delegation_rules" ADD CONSTRAINT "agent_delegation_rules_source_agent_id_agents_id_fk" FOREIGN KEY ("source_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_delegation_rules" ADD CONSTRAINT "agent_delegation_rules_target_agent_id_agents_id_fk" FOREIGN KEY ("target_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;
