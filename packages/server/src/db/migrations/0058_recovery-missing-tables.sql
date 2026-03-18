-- Recovery migration: recreate all tables/columns that failed to apply on production
-- All statements use IF NOT EXISTS for idempotent execution

-- === 1. tier_configs (from 0048) ===
CREATE TABLE IF NOT EXISTS "tier_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "tier_level" integer NOT NULL,
  "name" varchar(100) NOT NULL,
  "model_preference" varchar(100) NOT NULL DEFAULT 'claude-haiku-4-5',
  "max_tools" integer NOT NULL DEFAULT 10,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tier_configs_company_idx" ON "tier_configs" ("company_id");--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "tier_configs" ADD CONSTRAINT "tier_configs_company_level_unique" UNIQUE ("company_id", "tier_level");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

-- Add tier_level to agents if missing
ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "tier_level" integer DEFAULT 2;--> statement-breakpoint
UPDATE "agents" SET "tier_level" = CASE "tier"
  WHEN 'manager' THEN 1
  WHEN 'specialist' THEN 2
  WHEN 'worker' THEN 3
  ELSE 2
END WHERE "tier_level" IS NULL OR "tier_level" = 0;--> statement-breakpoint

-- Seed default tier configs for existing companies
INSERT INTO "tier_configs" ("company_id", "tier_level", "name", "model_preference", "max_tools", "description")
SELECT c."id", 1, 'Manager', 'claude-sonnet-4-6', 20, '관리자 계층'
FROM "companies" c
WHERE NOT EXISTS (SELECT 1 FROM "tier_configs" tc WHERE tc."company_id" = c."id" AND tc."tier_level" = 1);--> statement-breakpoint
INSERT INTO "tier_configs" ("company_id", "tier_level", "name", "model_preference", "max_tools", "description")
SELECT c."id", 2, 'Specialist', 'claude-sonnet-4-6', 15, '전문가 계층'
FROM "companies" c
WHERE NOT EXISTS (SELECT 1 FROM "tier_configs" tc WHERE tc."company_id" = c."id" AND tc."tier_level" = 2);--> statement-breakpoint
INSERT INTO "tier_configs" ("company_id", "tier_level", "name", "model_preference", "max_tools", "description")
SELECT c."id", 3, 'Worker', 'claude-haiku-4-5', 10, '실무자 계층'
FROM "companies" c
WHERE NOT EXISTS (SELECT 1 FROM "tier_configs" tc WHERE tc."company_id" = c."id" AND tc."tier_level" = 3);--> statement-breakpoint

-- === 2. credentials (from 0052) ===
CREATE TABLE IF NOT EXISTS "credentials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "key_name" text NOT NULL,
  "encrypted_value" text NOT NULL,
  "created_by_user_id" text,
  "updated_by_user_id" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credentials_company_idx" ON "credentials"("company_id");--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "credentials" ADD CONSTRAINT "credentials_company_key_uniq" UNIQUE ("company_id", "key_name");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

-- === 3. agent_reports (from 0053) ===
CREATE TABLE IF NOT EXISTS "agent_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "agent_id" uuid REFERENCES "agents"("id"),
  "run_id" text NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "type" text,
  "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "distribution_results" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_reports_company_date" ON "agent_reports"("company_id", "created_at" DESC);--> statement-breakpoint

-- === 4. mcp_server_configs + agent_mcp_access + mcp_lifecycle_events (from 0055) ===
CREATE TABLE IF NOT EXISTS "mcp_server_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "display_name" text NOT NULL,
  "transport" text NOT NULL,
  "command" text,
  "args" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "env" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mcp_server_configs_company_idx" ON "mcp_server_configs"("company_id");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "agent_mcp_access" (
  "agent_id" uuid NOT NULL REFERENCES "agents"("id") ON DELETE CASCADE,
  "mcp_server_id" uuid NOT NULL REFERENCES "mcp_server_configs"("id") ON DELETE CASCADE,
  "granted_at" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("agent_id", "mcp_server_id")
);--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "mcp_lifecycle_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "mcp_server_id" uuid REFERENCES "mcp_server_configs"("id"),
  "session_id" text NOT NULL,
  "event" text NOT NULL,
  "latency_ms" integer,
  "error_code" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mle_company_mcp" ON "mcp_lifecycle_events"("company_id", "mcp_server_id", "created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mle_session" ON "mcp_lifecycle_events"("session_id");--> statement-breakpoint

-- === 5. company_api_keys (public API keys) ===
CREATE TABLE IF NOT EXISTS "company_api_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "name" varchar(100) NOT NULL,
  "key_prefix" varchar(20) NOT NULL,
  "key_hash" varchar(64) NOT NULL,
  "last_used_at" timestamp,
  "expires_at" timestamp,
  "is_active" boolean NOT NULL DEFAULT true,
  "scopes" jsonb NOT NULL DEFAULT '["read"]'::jsonb,
  "rate_limit_per_min" integer NOT NULL DEFAULT 60,
  "created_by" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_api_keys_company_idx" ON "company_api_keys"("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "company_api_keys_key_hash_idx" ON "company_api_keys"("key_hash");--> statement-breakpoint

-- === 6. Template publish columns (from 0057) ===
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "download_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "tier" varchar(20);--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN IF NOT EXISTS "allowed_tools" jsonb;--> statement-breakpoint
ALTER TABLE "org_templates" ADD COLUMN IF NOT EXISTS "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "org_templates" ADD COLUMN IF NOT EXISTS "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "org_templates" ADD COLUMN IF NOT EXISTS "download_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "org_templates" ADD COLUMN IF NOT EXISTS "tags" jsonb;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "soul_templates_published_idx" ON "soul_templates" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_templates_published_idx" ON "org_templates" USING btree ("is_published");
