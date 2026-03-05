CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"storage_path" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "night_job_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"instruction" text NOT NULL,
	"cron_expression" varchar(100) NOT NULL,
	"next_run_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "night_job_triggers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"instruction" text NOT NULL,
	"trigger_type" varchar(50) NOT NULL,
	"condition" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_triggered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delegations" ADD COLUMN "parent_delegation_id" uuid;--> statement-breakpoint
ALTER TABLE "delegations" ADD COLUMN "depth" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "night_jobs" ADD COLUMN "schedule_id" uuid;--> statement-breakpoint
ALTER TABLE "night_jobs" ADD COLUMN "trigger_id" uuid;--> statement-breakpoint
ALTER TABLE "night_jobs" ADD COLUMN "result_data" jsonb;--> statement-breakpoint
ALTER TABLE "tool_definitions" ADD COLUMN "category" varchar(50);--> statement-breakpoint
ALTER TABLE "tool_definitions" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "tool_definitions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_job_schedules" ADD CONSTRAINT "night_job_schedules_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_job_schedules" ADD CONSTRAINT "night_job_schedules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_job_schedules" ADD CONSTRAINT "night_job_schedules_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_job_triggers" ADD CONSTRAINT "night_job_triggers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_job_triggers" ADD CONSTRAINT "night_job_triggers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_job_triggers" ADD CONSTRAINT "night_job_triggers_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "files_company_idx" ON "files" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "night_schedules_company_idx" ON "night_job_schedules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "night_triggers_company_idx" ON "night_job_triggers" USING btree ("company_id");