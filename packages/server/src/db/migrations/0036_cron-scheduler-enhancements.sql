-- Story 14-1: Cron Scheduler Service CRUD API
-- Adds name, lastRunAt to nightJobSchedules; creates cronRuns table

DO $$ BEGIN
  CREATE TYPE "public"."cron_run_status" AS ENUM('running', 'success', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "night_job_schedules" ADD COLUMN IF NOT EXISTS "name" varchar(200) NOT NULL DEFAULT 'Unnamed Schedule';
ALTER TABLE "night_job_schedules" ADD COLUMN IF NOT EXISTS "last_run_at" timestamp;

CREATE TABLE IF NOT EXISTS "cron_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "cron_job_id" uuid NOT NULL,
  "status" "cron_run_status" DEFAULT 'running' NOT NULL,
  "command_text" text NOT NULL,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "result" text,
  "error" text,
  "duration_ms" integer,
  "tokens_used" integer,
  "cost_micro" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "cron_runs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action,
  CONSTRAINT "cron_runs_cron_job_id_night_job_schedules_id_fk" FOREIGN KEY ("cron_job_id") REFERENCES "public"."night_job_schedules"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "cron_runs_company_idx" ON "cron_runs" USING btree ("company_id");
CREATE INDEX IF NOT EXISTS "cron_runs_cron_job_idx" ON "cron_runs" USING btree ("cron_job_id");
CREATE INDEX IF NOT EXISTS "cron_runs_status_idx" ON "cron_runs" USING btree ("status");
