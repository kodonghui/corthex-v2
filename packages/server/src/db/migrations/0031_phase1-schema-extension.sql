-- Phase 1 Schema Extension (Epic 1 Story 1)
-- New enums, new tables, agents table extension

-- New enums
DO $$ BEGIN
  CREATE TYPE "public"."command_type" AS ENUM('direct', 'mention', 'slash', 'preset', 'batch', 'all', 'sequential', 'deepwork');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."orchestration_task_status" AS ENUM('pending', 'running', 'completed', 'failed', 'timeout');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."quality_result" AS ENUM('pass', 'fail');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Extend agents table
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "is_system" boolean NOT NULL DEFAULT false;
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "allowed_tools" jsonb DEFAULT '[]'::jsonb;

-- commands table
CREATE TABLE IF NOT EXISTS "commands" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "type" "command_type" NOT NULL DEFAULT 'direct',
  "text" text NOT NULL,
  "target_agent_id" uuid,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "result" text,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp
);

ALTER TABLE "commands" ADD CONSTRAINT "commands_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "commands" ADD CONSTRAINT "commands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "commands" ADD CONSTRAINT "commands_target_agent_id_agents_id_fk" FOREIGN KEY ("target_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "commands_company_idx" ON "commands" USING btree ("company_id");
CREATE INDEX IF NOT EXISTS "commands_company_user_idx" ON "commands" USING btree ("company_id","user_id");
CREATE INDEX IF NOT EXISTS "commands_company_created_idx" ON "commands" USING btree ("company_id","created_at");

-- orchestration_tasks table
CREATE TABLE IF NOT EXISTS "orchestration_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "command_id" uuid NOT NULL,
  "agent_id" uuid NOT NULL,
  "parent_task_id" uuid,
  "type" varchar(30) NOT NULL,
  "input" text,
  "output" text,
  "status" "orchestration_task_status" NOT NULL DEFAULT 'pending',
  "started_at" timestamp,
  "completed_at" timestamp,
  "duration_ms" integer,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "orchestration_tasks" ADD CONSTRAINT "orch_tasks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orchestration_tasks" ADD CONSTRAINT "orch_tasks_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orchestration_tasks" ADD CONSTRAINT "orch_tasks_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orchestration_tasks" ADD CONSTRAINT "orch_tasks_parent_task_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."orchestration_tasks"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "orch_tasks_company_idx" ON "orchestration_tasks" USING btree ("company_id");
CREATE INDEX IF NOT EXISTS "orch_tasks_company_command_idx" ON "orchestration_tasks" USING btree ("company_id","command_id");
CREATE INDEX IF NOT EXISTS "orch_tasks_company_agent_idx" ON "orchestration_tasks" USING btree ("company_id","agent_id");

-- quality_reviews table
CREATE TABLE IF NOT EXISTS "quality_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "command_id" uuid NOT NULL,
  "task_id" uuid,
  "reviewer_agent_id" uuid NOT NULL,
  "conclusion" "quality_result" NOT NULL,
  "scores" jsonb NOT NULL,
  "feedback" text,
  "attempt_number" integer NOT NULL DEFAULT 1,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "quality_reviews" ADD CONSTRAINT "quality_reviews_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quality_reviews" ADD CONSTRAINT "quality_reviews_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quality_reviews" ADD CONSTRAINT "quality_reviews_task_id_orch_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."orchestration_tasks"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quality_reviews" ADD CONSTRAINT "quality_reviews_reviewer_agent_id_agents_id_fk" FOREIGN KEY ("reviewer_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "quality_reviews_company_idx" ON "quality_reviews" USING btree ("company_id");
CREATE INDEX IF NOT EXISTS "quality_reviews_company_command_idx" ON "quality_reviews" USING btree ("company_id","command_id");

-- presets table
CREATE TABLE IF NOT EXISTS "presets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "command" text NOT NULL,
  "category" varchar(50),
  "is_global" boolean NOT NULL DEFAULT false,
  "sort_order" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "presets" ADD CONSTRAINT "presets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "presets" ADD CONSTRAINT "presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "presets_company_idx" ON "presets" USING btree ("company_id");
CREATE INDEX IF NOT EXISTS "presets_company_user_idx" ON "presets" USING btree ("company_id","user_id");

-- org_templates table
CREATE TABLE IF NOT EXISTS "org_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid,
  "name" varchar(100) NOT NULL,
  "description" text,
  "template_data" jsonb NOT NULL,
  "is_builtin" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_by" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "org_templates" ADD CONSTRAINT "org_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "org_templates" ADD CONSTRAINT "org_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "org_templates_company_idx" ON "org_templates" USING btree ("company_id");

-- audit_logs table (INSERT ONLY - no updatedAt)
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "actor_type" varchar(20) NOT NULL,
  "actor_id" uuid NOT NULL,
  "action" varchar(100) NOT NULL,
  "target_type" varchar(50),
  "target_id" uuid,
  "before" jsonb,
  "after" jsonb,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "audit_logs_company_idx" ON "audit_logs" USING btree ("company_id");
CREATE INDEX IF NOT EXISTS "audit_logs_company_action_idx" ON "audit_logs" USING btree ("company_id","action");
CREATE INDEX IF NOT EXISTS "audit_logs_company_created_idx" ON "audit_logs" USING btree ("company_id","created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_company_target_idx" ON "audit_logs" USING btree ("company_id","target_type","target_id");
