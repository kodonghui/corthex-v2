-- Story 8.1: tier_configs table + agents.tier_level migration (enum→integer)
-- Additive-only migration: adds new columns/tables without removing existing enum

-- 1. Create tier_configs table
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

-- 2. Indexes for tier_configs
CREATE INDEX IF NOT EXISTS "tier_configs_company_idx" ON "tier_configs" ("company_id");--> statement-breakpoint
ALTER TABLE "tier_configs" ADD CONSTRAINT "tier_configs_company_level_unique" UNIQUE ("company_id", "tier_level");--> statement-breakpoint

-- 3. Add tier_level column to agents (nullable first)
ALTER TABLE "agents" ADD COLUMN "tier_level" integer;--> statement-breakpoint

-- 4. Migrate existing tier enum values to tier_level integers
UPDATE "agents" SET "tier_level" = CASE "tier"
  WHEN 'manager' THEN 1
  WHEN 'specialist' THEN 2
  WHEN 'worker' THEN 3
  ELSE 2
END;--> statement-breakpoint

-- 5. Set tier_level NOT NULL + default
ALTER TABLE "agents" ALTER COLUMN "tier_level" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "tier_level" SET DEFAULT 2;--> statement-breakpoint

-- 6. Seed default 3-tier configs for each existing company
INSERT INTO "tier_configs" ("company_id", "tier_level", "name", "model_preference", "max_tools", "description")
SELECT c."id", 1, 'Manager', 'claude-sonnet-4-6', 20, '관리자 계층 — 고성능 모델, 전체 도구 접근'
FROM "companies" c
WHERE NOT EXISTS (SELECT 1 FROM "tier_configs" tc WHERE tc."company_id" = c."id" AND tc."tier_level" = 1);--> statement-breakpoint

INSERT INTO "tier_configs" ("company_id", "tier_level", "name", "model_preference", "max_tools", "description")
SELECT c."id", 2, 'Specialist', 'claude-sonnet-4-6', 15, '전문가 계층 — 균형 모델, 부서 도구 접근'
FROM "companies" c
WHERE NOT EXISTS (SELECT 1 FROM "tier_configs" tc WHERE tc."company_id" = c."id" AND tc."tier_level" = 2);--> statement-breakpoint

INSERT INTO "tier_configs" ("company_id", "tier_level", "name", "model_preference", "max_tools", "description")
SELECT c."id", 3, 'Worker', 'claude-haiku-4-5', 10, '실무자 계층 — 효율 모델, 기본 도구 접근'
FROM "companies" c
WHERE NOT EXISTS (SELECT 1 FROM "tier_configs" tc WHERE tc."company_id" = c."id" AND tc."tier_level" = 3);
