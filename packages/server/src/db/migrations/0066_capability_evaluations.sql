CREATE TABLE IF NOT EXISTS "capability_evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"overall_score" integer NOT NULL,
	"dimensions" jsonb NOT NULL,
	"observation_count" integer DEFAULT 0 NOT NULL,
	"memory_count" integer DEFAULT 0 NOT NULL,
	"evaluated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "capability_evaluations" ADD CONSTRAINT "capability_evaluations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "capability_evaluations" ADD CONSTRAINT "capability_evaluations_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "idx_capability_evaluations_agent" ON "capability_evaluations" USING btree ("company_id","agent_id","evaluated_at");
