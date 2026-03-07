-- Agent Organization: add tier, nameEn, modelName, reportTo columns
DO $$ BEGIN
  CREATE TYPE "public"."agent_tier" AS ENUM('manager', 'specialist', 'worker');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "tier" "public"."agent_tier" NOT NULL DEFAULT 'specialist';
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "name_en" varchar(100);
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "model_name" varchar(100) NOT NULL DEFAULT 'claude-haiku-4-5';
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "report_to" uuid;
