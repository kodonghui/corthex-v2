-- Epic 16 Story 1: Knowledge Base & Agent Memory Schema

-- Memory type enum
DO $$ BEGIN
  CREATE TYPE "memory_type" AS ENUM('learning', 'insight', 'preference', 'fact');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Knowledge folders (nested structure)
CREATE TABLE IF NOT EXISTS "knowledge_folders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "name" varchar(200) NOT NULL,
  "description" text,
  "parent_id" uuid,
  "department_id" uuid REFERENCES "departments"("id"),
  "created_by" uuid NOT NULL REFERENCES "users"("id"),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Self-reference FK (after table creation)
DO $$ BEGIN
  ALTER TABLE "knowledge_folders" ADD CONSTRAINT "knowledge_folders_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "knowledge_folders"("id");
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "knowledge_folders_company_idx" ON "knowledge_folders" ("company_id");
CREATE INDEX IF NOT EXISTS "knowledge_folders_parent_idx" ON "knowledge_folders" ("parent_id");
CREATE INDEX IF NOT EXISTS "knowledge_folders_department_idx" ON "knowledge_folders" ("department_id");

-- Unique folder name per level (companyId + name + parentId)
DO $$ BEGIN
  ALTER TABLE "knowledge_folders" ADD CONSTRAINT "knowledge_folders_name_level_uniq"
    UNIQUE ("company_id", "name", "parent_id");
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Knowledge documents
CREATE TABLE IF NOT EXISTS "knowledge_docs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "folder_id" uuid REFERENCES "knowledge_folders"("id"),
  "title" varchar(500) NOT NULL,
  "content" text,
  "content_type" varchar(50) NOT NULL DEFAULT 'markdown',
  "file_url" text,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "created_by" uuid NOT NULL REFERENCES "users"("id"),
  "updated_by" uuid REFERENCES "users"("id"),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "knowledge_docs_company_idx" ON "knowledge_docs" ("company_id");
CREATE INDEX IF NOT EXISTS "knowledge_docs_folder_idx" ON "knowledge_docs" ("folder_id");
CREATE INDEX IF NOT EXISTS "knowledge_docs_created_by_idx" ON "knowledge_docs" ("created_by");

-- Agent memories (enhanced)
CREATE TABLE IF NOT EXISTS "agent_memories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "agent_id" uuid NOT NULL REFERENCES "agents"("id"),
  "memory_type" "memory_type" NOT NULL DEFAULT 'learning',
  "key" varchar(200) NOT NULL,
  "content" text NOT NULL,
  "context" text,
  "source" varchar(50) NOT NULL DEFAULT 'manual',
  "confidence" integer NOT NULL DEFAULT 50,
  "usage_count" integer NOT NULL DEFAULT 0,
  "last_used_at" timestamp,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "agent_memories_company_idx" ON "agent_memories" ("company_id");
CREATE INDEX IF NOT EXISTS "agent_memories_agent_idx" ON "agent_memories" ("agent_id");
CREATE INDEX IF NOT EXISTS "agent_memories_type_idx" ON "agent_memories" ("memory_type");
